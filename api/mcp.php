<?php
// POST /api/mcp.php -> BrainRush Trivia, a connector for Claude (Chat, Cowork, desktop, mobile).
// A remote MCP server over Streamable HTTP: stateless, every request a POST answered with plain
// JSON, no sign-in (the questions are already public). Its one MCP App is a multiple-choice
// trivia card (mcp/trivia-card.html) drawn from the Streak Challenge batch (streak_batch() in
// questions.php). How to add it to Claude: docs/claude-connector.md.
//
// Tools:
//   show_brainrush_trivia       for the model: opens the card. Returns no questions, so the
//                               model reads no answers and spends no tokens on them.
//   brainrush_trivia_questions  for the card only (_meta.ui.visibility ["app"]):
//                               { exclude?: [id, ...] } -> structuredContent { questions: [...] },
//                               up to STREAK_BATCH, [] once nothing is left
// Resource: ui://brainrush/trivia-card (text/html;profile=mcp-app).
const QUESTIONS_INCLUDE_ONLY = true; // questions.php: define its functions, handle no request
require_once __DIR__ . '/questions.php';

const MCP_SITE = 'https://brainrush.integration.ninja'; // where the card loads its script and pictures
const MCP_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26'];
const MCP_DEFAULT_PROTOCOL = '2025-06-18';
const MCP_CARD_URI = 'ui://brainrush/trivia-card';
const MCP_CARD_MIME = 'text/html;profile=mcp-app';
const MCP_CARD_FILE = __DIR__ . '/../mcp/trivia-card.html';
const MCP_EXCLUDE_MAX = BOARD_MAX_SEEN;

// JSON-RPC error codes (JSON-RPC 2.0; -32002 is MCP's "resource not found").
const RPC_PARSE_ERROR = -32700;
const RPC_INVALID_REQUEST = -32600;
const RPC_METHOD_NOT_FOUND = -32601;
const RPC_INVALID_PARAMS = -32602;
const RPC_INTERNAL_ERROR = -32603;
const RPC_RESOURCE_NOT_FOUND = -32002;

/** Send one JSON-RPC message, or an empty body when $message is null, and stop. */
function rpc_send(?array $message, int $code = 200): void
{
    if (!headers_sent()) {
        http_response_code($code);
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        if ($message !== null) {
            header('Content-Type: application/json; charset=utf-8');
        }
    }
    if ($message !== null) {
        echo json_encode($message, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    }
    exit;
}

/** @param array|stdClass $result */
function rpc_result($id, $result): void
{
    rpc_send(['jsonrpc' => '2.0', 'id' => $id, 'result' => $result]);
}

function rpc_error($id, int $code, string $message, int $httpCode = 200): void
{
    rpc_send(['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => $code, 'message' => $message]], $httpCode);
}

/** A tool result: one text block for the model, and structured data for the card when given. */
function tool_result(string $text, ?array $structured = null, bool $isError = false): array
{
    $result = ['content' => [['type' => 'text', 'text' => $text]]];
    if ($structured !== null) {
        $result['structuredContent'] = $structured;
    }
    if ($isError) {
        $result['isError'] = true;
    }
    return $result;
}

const READ_ONLY_TOOL = [
    'readOnlyHint'    => true,
    'destructiveHint' => false,
    'idempotentHint'  => false, // every call draws new random questions
    'openWorldHint'   => false,
];

function tool_list(): array
{
    return [
        [
            'name'        => 'show_brainrush_trivia',
            'title'       => 'Play BrainRush trivia',
            'description' => 'Opens an interactive BrainRush trivia card in the conversation: multiple-choice '
                . 'questions with 3 answers each, some with pictures, on geography, science, history, sports, '
                . 'movies, flags, landmarks and more. Use it when the user asks for trivia, a quiz, BrainRush, '
                . 'or something to play while they wait. The user plays in the card. Its questions and answers '
                . 'are not returned to you, so do not ask or answer trivia questions yourself.',
            'inputSchema' => ['type' => 'object', 'properties' => new stdClass(), 'additionalProperties' => false],
            'annotations' => ['title' => 'Play BrainRush trivia'] + READ_ONLY_TOOL,
            '_meta'       => ['ui' => ['resourceUri' => MCP_CARD_URI], 'ui/resourceUri' => MCP_CARD_URI],
        ],
        [
            'name'        => 'brainrush_trivia_questions',
            'title'       => 'BrainRush trivia questions',
            'description' => 'Loads the next questions for the BrainRush trivia card. Used by the card itself.',
            'inputSchema' => [
                'type'                 => 'object',
                'properties'           => [
                    'exclude' => [
                        'type'        => 'array',
                        'items'       => ['type' => 'integer'],
                        'maxItems'    => MCP_EXCLUDE_MAX,
                        'description' => 'Ids of the questions this card already showed.',
                    ],
                ],
                'additionalProperties' => false,
            ],
            'annotations' => ['title' => 'BrainRush trivia questions'] + READ_ONLY_TOOL,
            '_meta'       => ['ui' => ['visibility' => ['app']]],
        ],
    ];
}

/** The ids in $value that are whole numbers, at most MCP_EXCLUDE_MAX; null when it is no list. */
function exclude_ids($value): ?array
{
    if ($value === null) {
        return [];
    }
    if (!is_array($value)) {
        return null;
    }
    $ids = [];
    foreach ($value as $item) {
        $id = parse_int($item);
        if ($id !== null && $id > 0) {
            $ids[] = $id;
        }
    }
    return array_slice($ids, -MCP_EXCLUDE_MAX);
}

/** A streak question as the card needs it: no Arabic, no answer text apart from the choices. */
function card_question(array $q): array
{
    return [
        'id'           => $q['id'],
        'category'     => $q['category_name'],
        'points'       => $q['points'],
        'question'     => $q['question'],
        'image'        => $q['image'],
        'image_credit' => $q['image_credit'],
        'choices'      => array_map(fn(array $c): string => $c['text'], $q['choices']),
        'correct'      => $q['correct'],
    ];
}

function call_tool(string $name, array $args): ?array
{
    switch ($name) {
        case 'show_brainrush_trivia':
            return tool_result('The BrainRush trivia card is open in the conversation. The user plays it there; there is nothing else for you to do.');

        case 'brainrush_trivia_questions':
            $exclude = exclude_ids($args['exclude'] ?? null);
            if ($exclude === null) {
                return tool_result('exclude must be a list of question ids.', null, true);
            }
            $questions = array_map('card_question', streak_batch(db(), $exclude, []));
            return tool_result(count($questions) . ' BrainRush questions for the card.', ['questions' => $questions]);
    }
    return null;
}

function card_resource(): array
{
    $html = file_get_contents(MCP_CARD_FILE);
    return [
        'uri'      => MCP_CARD_URI,
        'mimeType' => MCP_CARD_MIME,
        'text'     => str_replace('{{SITE}}', MCP_SITE, $html),
        '_meta'    => ['ui' => ['csp' => ['resourceDomains' => [MCP_SITE]], 'prefersBorder' => true]],
    ];
}

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

// Errors become a JSON-RPC error, not db.php's { error } shape. Message + location only, as db.php logs.
$rpcId = null;
set_exception_handler(function (Throwable $e) use (&$rpcId): void {
    error_log(sprintf('BrainRush MCP error: %s in %s:%d', $e->getMessage(), $e->getFile(), $e->getLine()));
    rpc_error($rpcId, RPC_INTERNAL_ERROR, 'Internal error', 500);
});

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    // Stateless: no server-to-client stream (GET) and no session to end (DELETE).
    header('Allow: POST');
    rpc_error(null, -32000, 'Method not allowed.', 405);
}

$raw = file_get_contents('php://input');
$raw = $raw === false ? '' : $raw;
$decoded = json_decode($raw, false);
if (json_last_error() !== JSON_ERROR_NONE) {
    rpc_error(null, RPC_PARSE_ERROR, 'Parse error', 400);
}
if (!($decoded instanceof stdClass)) {
    rpc_error(null, RPC_INVALID_REQUEST, 'Invalid request: one JSON-RPC message per POST', 400);
}
$message = json_decode($raw, true);

$isRequest = array_key_exists('id', $message);
$rpcId = $isRequest && (is_string($message['id']) || is_int($message['id'])) ? $message['id'] : null;
if (($message['jsonrpc'] ?? null) !== '2.0' || !is_string($message['method'] ?? null)) {
    // A client's reply to a server request (we send none) is accepted and ignored.
    if (!$isRequest || array_key_exists('result', $message) || array_key_exists('error', $message)) {
        rpc_send(null, 202);
    }
    rpc_error($rpcId, RPC_INVALID_REQUEST, 'Invalid request', 400);
}
if (!$isRequest) {
    rpc_send(null, 202); // a notification (notifications/initialized, cancelled, ...): nothing to answer
}

$method = $message['method'];
$params = is_array($message['params'] ?? null) ? $message['params'] : [];

switch ($method) {
    case 'initialize':
        $asked = $params['protocolVersion'] ?? null;
        rpc_result($rpcId, [
            'protocolVersion' => in_array($asked, MCP_PROTOCOL_VERSIONS, true) ? $asked : MCP_DEFAULT_PROTOCOL,
            'capabilities'    => [
                'tools'     => ['listChanged' => false],
                'resources' => ['subscribe' => false, 'listChanged' => false],
            ],
            'serverInfo'      => [
                'name'        => 'brainrush-trivia',
                'title'       => 'BrainRush Trivia',
                'version'     => '1.0.0',
                'description' => 'BrainRush trivia in a multiple-choice card: tap an answer, see right or wrong, keep score.',
                'websiteUrl'  => MCP_SITE,
                // The app icon in clients that show one (ChatGPT's chip falls back to /favicon.ico without it).
                'icons'       => [
                    ['src' => MCP_SITE . '/img/icon-512.png', 'mimeType' => 'image/png', 'sizes' => ['512x512']],
                    ['src' => MCP_SITE . '/img/icon-192.png', 'mimeType' => 'image/png', 'sizes' => ['192x192']],
                    ['src' => MCP_SITE . '/img/logo.svg', 'mimeType' => 'image/svg+xml', 'sizes' => ['any']],
                ],
            ],
            'instructions'    => 'Call show_brainrush_trivia when the user wants trivia, a quiz or BrainRush. '
                . 'It opens a card the user plays on their own; it returns no questions or answers.',
        ]);
        break;

    case 'ping':
        rpc_result($rpcId, new stdClass());
        break;

    case 'tools/list':
        rpc_result($rpcId, ['tools' => tool_list()]);
        break;

    case 'tools/call':
        $name = $params['name'] ?? null;
        $args = is_array($params['arguments'] ?? null) ? $params['arguments'] : [];
        $result = is_string($name) ? call_tool($name, $args) : null;
        if ($result === null) {
            rpc_error($rpcId, RPC_INVALID_PARAMS, 'Unknown tool');
        }
        rpc_result($rpcId, $result);
        break;

    case 'resources/list':
        $card = card_resource();
        rpc_result($rpcId, ['resources' => [[
            'uri'         => MCP_CARD_URI,
            'name'        => 'brainrush-trivia-card',
            'title'       => 'BrainRush trivia card',
            'description' => 'Interactive multiple-choice trivia card for show_brainrush_trivia.',
            'mimeType'    => MCP_CARD_MIME,
            '_meta'       => $card['_meta'],
        ]]]);
        break;

    case 'resources/read':
        if (($params['uri'] ?? null) !== MCP_CARD_URI) {
            rpc_error($rpcId, RPC_RESOURCE_NOT_FOUND, 'Resource not found');
        }
        rpc_result($rpcId, ['contents' => [card_resource()]]);
        break;

    case 'resources/templates/list':
        rpc_result($rpcId, ['resourceTemplates' => []]);
        break;

    case 'prompts/list':
        rpc_result($rpcId, ['prompts' => []]);
        break;

    default:
        rpc_error($rpcId, RPC_METHOD_NOT_FOUND, 'Method not found');
}

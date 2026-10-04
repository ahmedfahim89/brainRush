<?php
// GET /api/auth.php -> 200 { ok: true } if this caller may change content (same rules as
// every write: require_admin), otherwise 401 (login needed, with a Basic challenge) or 403.
// admin.js calls it on load so the browser asks for the login before any edit.
require_once __DIR__ . '/db.php';

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        require_admin();
        json_response(['ok' => true]);
        break;

    default:
        method_not_allowed(['GET']);
}

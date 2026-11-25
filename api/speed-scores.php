<?php
// GET    /api/speed-scores.php              -> top 10 of all time [{name, streak, date: 'YYYY-MM-DD'}]
// GET    /api/speed-scores.php?period=week  -> top 10 of this week (Monday to Sunday, UTC as D-46), same shape
// GET    /api/speed-scores.php?period=all   -> the same as without period; any other period -> 400
// POST   /api/speed-scores.php              body { name, streak } -> 201 { rank, best, week_rank, week_best }
// GET    /api/speed-scores.php?all=1        -> every run [{id, name, streak, created_at}], newest first
// DELETE /api/speed-scores.php?id=<id>      -> 200 { deleted: id }
// Speed Round leaderboard (US-60, D-76, owner request 2026-11-25). `streak` is the run's number of
// correct answers (the Speed Round score); a run with 1 or more is stored, under the challenger name
// the player enters before the countdown. It is the Streak Challenge's leaderboard (api/streaks.php)
// on its own table (speed_scores): the best run per person (name compared case-insensitively), the
// earliest run on equal scores, the top 10 of all time or of the current game week (UTC, D-46) and
// the player's rank. The top 10 and the POST are public, the game uses them (read_json_body() forces
// a CORS preflight); the full list and DELETE are admin only (require_admin), so the admin can remove
// junk or offensive names. Accepted limitation (D-37): the answers are in the question payload and the
// POST is public, so a determined user can fake a score.
const STREAKS_INCLUDE_ONLY = true; // streaks.php: define its functions, handle no request
require_once __DIR__ . '/streaks.php';

const SPEED_SCORES = 'speed_scores';

// A missing table (sql/migrate-add-speed-scores.sql has not run) becomes a clear 503.
try {
    streak_board_request(SPEED_SCORES);
} catch (PDOException $e) {
    if (is_missing_table($e)) {
        error_log('BrainRush API: the speed_scores table is missing (run sql/migrate-add-speed-scores.sql).');
        json_response(['error' => 'The Speed Round leaderboard is not set up on this server yet.'], 503);
    }
    throw $e;
}

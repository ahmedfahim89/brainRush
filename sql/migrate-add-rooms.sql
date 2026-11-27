-- BrainRush migration: Phone buzzer rooms (US-52, D-80, phone Sprint 1)
--
-- Adds the tables of the "Phone buzzer" game control: players join the host's game from their own
-- phones and follow the board live (short HTTP polling, no WebSockets).
--   game_rooms   one row per hosted game in Phone buzzer mode: the room code typed or scanned by
--                the players, a SHA-256 hash of the host token (the token itself is never stored),
--                the board as the phones may see it (JSON built by the host, re-checked by
--                api/rooms.php: no questions, no answers, no hidden values), a version that goes
--                up on every change the phones must see, the time of the last request, and the
--                host_session of the one host tab allowed to change the room (newest tab wins).
--   room_players one row per claimed name (or team): the contestant's index in the host's list and
--                a SHA-256 hash of the phone's device token. One device per name and one name per
--                device (both unique per room). Deleting a room deletes its players.
-- Rooms with no request for 6 hours are deleted by api/rooms.php the next time any rooms request
-- comes in (no cron on shared hosting).
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include these tables.
-- Phone Sprint 2 adds room_answers and the open-question columns (US-64); phone Sprint 3 adds room_bets and
-- the bet-round columns (US-65); phone Sprint 4 adds room_helpers and the helper columns (US-66).
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-rooms.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (CREATE TABLE IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: api/rooms.php reads and writes these tables.

CREATE TABLE IF NOT EXISTS game_rooms (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code       CHAR(6)      NOT NULL,
  host_hash  CHAR(64)     NOT NULL,
  host_session CHAR(32)   NULL,
  names      TINYINT UNSIGNED NOT NULL,
  state      MEDIUMTEXT   NOT NULL,
  version    INT UNSIGNED NOT NULL DEFAULT 1,
  q_seq      INT UNSIGNED NOT NULL DEFAULT 0,
  q_open     TINYINT(1)   NOT NULL DEFAULT 0,
  q_opened_ms BIGINT UNSIGNED NOT NULL DEFAULT 0,
  question   MEDIUMTEXT   NULL,
  b_seq      INT UNSIGNED NOT NULL DEFAULT 0,
  b_open     TINYINT(1)   NOT NULL DEFAULT 0,
  b_revealed TINYINT(1)   NOT NULL DEFAULT 0,
  bet        MEDIUMTEXT   NULL,
  helpers    TINYINT(1)   NOT NULL DEFAULT 0,
  q_hint     TEXT         NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seen_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_game_rooms_code (code),
  KEY idx_game_rooms_seen (seen_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE IF NOT EXISTS room_players (
  room_id     INT UNSIGNED     NOT NULL,
  contestant  TINYINT UNSIGNED NOT NULL,
  device_hash CHAR(64)         NOT NULL,
  joined_at   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, contestant),
  UNIQUE KEY uq_room_players_device (room_id, device_hash),
  CONSTRAINT fk_room_players_room FOREIGN KEY (room_id) REFERENCES game_rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- Phone Sprint 2 (US-64): one typed answer per contestant per question number (seq). The room keeps
-- the open question for the phones (q_seq, q_open, q_opened_ms, question: never the answer); an answer
-- is accepted only while its seq is the open one. received_ms is server time in milliseconds.
CREATE TABLE IF NOT EXISTS room_answers (
  room_id     INT UNSIGNED     NOT NULL,
  seq         INT UNSIGNED     NOT NULL,
  contestant  TINYINT UNSIGNED NOT NULL,
  text        VARCHAR(200)     NOT NULL,
  received_ms BIGINT UNSIGNED  NOT NULL,
  PRIMARY KEY (room_id, seq, contestant),
  KEY idx_room_answers_order (room_id, seq, received_ms),
  CONSTRAINT fk_room_answers_room FOREIGN KEY (room_id) REFERENCES game_rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- Phone Sprint 3 (US-65): one Golden Goal bet per contestant per bet round (bet_seq), a whole number from
-- 0 to that contestant's limit (D-48), accepted only while the round is open. The room keeps the round:
-- b_seq (its number), b_open, b_revealed (the host asked for the amounts after marking) and bet (JSON:
-- the category, the Golden Goal round and each contestant's score and limit). Amounts go to the host
-- only after marking, and each phone sees only its own bet.
CREATE TABLE IF NOT EXISTS room_bets (
  room_id     INT UNSIGNED     NOT NULL,
  bet_seq     INT UNSIGNED     NOT NULL,
  contestant  TINYINT UNSIGNED NOT NULL,
  amount      INT UNSIGNED     NOT NULL,
  received_ms BIGINT UNSIGNED  NOT NULL,
  PRIMARY KEY (room_id, bet_seq, contestant),
  CONSTRAINT fk_room_bets_room FOREIGN KEY (room_id) REFERENCES game_rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- Phone Sprint 4 (US-66, D-81): the phone-only helpers. One row per contestant and kind (freeze, hint,
-- double), so each helper is used once per game (a room is one game). seq: the question it was used on;
-- for a double, NULL while armed, the question it applies to once opened, 0 when Golden Goal spent it.
-- target and until_ms: the frozen contestant and the server time (ms) the freeze ends (freeze only).
-- game_rooms.helpers is the Admin switch read when the room was made; game_rooms.q_hint holds the hint
-- patterns of the open question (first character and underscores only, never the answer).
CREATE TABLE IF NOT EXISTS room_helpers (
  room_id     INT UNSIGNED     NOT NULL,
  contestant  TINYINT UNSIGNED NOT NULL,
  kind        VARCHAR(8)       NOT NULL,
  seq         INT UNSIGNED     NULL,
  target      TINYINT UNSIGNED NULL,
  until_ms    BIGINT UNSIGNED  NULL,
  used_ms     BIGINT UNSIGNED  NOT NULL,
  PRIMARY KEY (room_id, contestant, kind),
  KEY idx_room_helpers_seq (room_id, seq, target),
  CONSTRAINT fk_room_helpers_room FOREIGN KEY (room_id) REFERENCES game_rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- Fix round 1 (BUG-52-02): a database that ran an earlier copy of this file gets the column too.
ALTER TABLE game_rooms ADD COLUMN IF NOT EXISTS host_session CHAR(32) NULL AFTER host_hash;

-- Phone Sprint 2 (US-64): a database that ran an earlier copy of this file gets the question columns.
ALTER TABLE game_rooms
  ADD COLUMN IF NOT EXISTS q_seq INT UNSIGNED NOT NULL DEFAULT 0 AFTER version,
  ADD COLUMN IF NOT EXISTS q_open TINYINT(1) NOT NULL DEFAULT 0 AFTER q_seq,
  ADD COLUMN IF NOT EXISTS q_opened_ms BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER q_open,
  ADD COLUMN IF NOT EXISTS question MEDIUMTEXT NULL AFTER q_opened_ms;

-- Phone Sprint 3 (US-65): a database that ran an earlier copy of this file gets the bet columns.
ALTER TABLE game_rooms
  ADD COLUMN IF NOT EXISTS b_seq INT UNSIGNED NOT NULL DEFAULT 0 AFTER question,
  ADD COLUMN IF NOT EXISTS b_open TINYINT(1) NOT NULL DEFAULT 0 AFTER b_seq,
  ADD COLUMN IF NOT EXISTS b_revealed TINYINT(1) NOT NULL DEFAULT 0 AFTER b_open,
  ADD COLUMN IF NOT EXISTS bet MEDIUMTEXT NULL AFTER b_revealed;

-- Phone Sprint 4 (US-66): a database that ran an earlier copy of this file gets the helper columns.
ALTER TABLE game_rooms
  ADD COLUMN IF NOT EXISTS helpers TINYINT(1) NOT NULL DEFAULT 0 AFTER bet,
  ADD COLUMN IF NOT EXISTS q_hint TEXT NULL AFTER helpers;

-- Owner 2026-11-27 (US-64): helpers in Phone buzzer games, off by default (Admin > Game settings).
INSERT IGNORE INTO settings (name, value) VALUES ('phone_helpers_enabled', '0');

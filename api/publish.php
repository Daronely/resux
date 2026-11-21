<?php
/**
 * Resux — Lightweight portfolio publish API
 * PHP 8 + SQLite3, no framework. Designed for shared cPanel hosting.
 *
 * POST api/publish.php   {data: JSON-string, key?: string, slug?: string}
 *   -> {ok: true, slug, key, url}
 * Rate limit: 10 publishes / hour / IP.
 */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

define('RESUX_DB', __DIR__ . '/../../resux_data/resux.sqlite');
define('MAX_JSON', 256 * 1024);          // 256 KB resume payload cap
define('RATE_LIMIT', 10);                 // publishes per hour per IP
define('RATE_WINDOW', 3600);
define('MAX_AGE_VISIT', 15552000);        // 6 months without a visit -> cleanup

function fail(int $code, string $msg): never {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function ip(): string {
    // behind LiteSpeed/Cloudflare proxies, real IP comes via headers
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'] as $h) {
        if (!empty($_SERVER[$h])) {
            $v = trim(explode(',', $_SERVER[$h])[0]);
            if (filter_var($v, FILTER_VALIDATE_IP)) return $v;
        }
    }
    return '0.0.0.0';
}

function db(): SQLite3 {
    static $db = null;
    if ($db instanceof SQLite3) return $db;
    $dir = dirname(RESUX_DB);
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    $db = new SQLite3(RESUX_DB);
    $db->busyTimeout(4000);
    $db->exec('PRAGMA journal_mode = WAL');
    $db->exec('PRAGMA foreign_keys = ON');
    $db->exec('CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        edit_key TEXT NOT NULL,
        data TEXT NOT NULL,
        views INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        last_visit INTEGER NOT NULL DEFAULT 0
    )');
    $db->exec('CREATE TABLE IF NOT EXISTS rate (
        ip TEXT NOT NULL,
        ts INTEGER NOT NULL
    )');
    $db->exec('CREATE INDEX IF NOT EXISTS idx_rate_ip ON rate(ip, ts)');
    return $db;
}

function genSlug(SQLite3 $db): string {
    // 6-char unambiguous alphabet (no 0/O, 1/I/l)
    $alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
    for ($try = 0; $try < 12; $try++) {
        $s = '';
        for ($i = 0; $i < 6; $i++) $s .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        $st = $db->prepare('SELECT 1 FROM resumes WHERE slug = ?');
        $st->bindValue(1, $s, SQLITE3_TEXT);
        if (!$st->execute()->fetchArray()) return $s;
    }
    fail(500, 'slug-exhausted');
}

function genKey(): string {
    // 12-char edit key, groups of 4 for readability
    $a = 'abcdefghjkmnpqrstuvwxyz23456789';
    $out = '';
    for ($i = 0; $i < 12; $i++) {
        if ($i > 0 && $i % 4 === 0) $out .= '-';
        $out .= $a[random_int(0, strlen($a) - 1)];
    }
    return $out;
}

function cleanup(SQLite3 $db): void {
    // remove portfolios not visited for 6 months; throttle to ~1/hour via file marker
    $marker = RESUX_DB . '.clean';
    if (is_file($marker) && time() - (int)filemtime($marker) < 3600) return;
    @touch($marker);
    $cutoff = time() - MAX_AGE_VISIT;
    // last_visit == 0 means never visited -> use created_at
    $db->exec("DELETE FROM resumes WHERE (last_visit > 0 AND last_visit < $cutoff) OR (last_visit = 0 AND created_at < $cutoff)");
    $db->exec('DELETE FROM rate WHERE ts < ' . (time() - RATE_WINDOW * 2));
}

/* ---------- main ---------- */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'method-not-allowed');
}

$raw = file_get_contents('php://input');
if (strlen($raw) > MAX_JSON + 8192) fail(413, 'payload-too-large');
$in = json_decode($raw, true);
if (!is_array($in) || !isset($in['data']) || !is_string($in['data'])) fail(400, 'bad-request');
if (strlen($in['data']) > MAX_JSON) fail(413, 'data-too-large');
$resume = json_decode($in['data'], true);
if (!is_array($resume) || !isset($resume['personal'], $resume['meta'])) fail(400, 'bad-resume-json');

$db = db();
cleanup($db);

/* rate limit */
$stmt = $db->prepare('SELECT COUNT(*) c FROM rate WHERE ip = ? AND ts > ?');
$stmt->bindValue(1, ip(), SQLITE3_TEXT);
$stmt->bindValue(2, time() - RATE_WINDOW, SQLITE3_INTEGER);
$row = $stmt->execute()->fetchArray(SQLITE3_NUM);
if ((int)$row[0] >= RATE_LIMIT) fail(429, 'rate-limited');
$db->exec('DELETE FROM rate WHERE ts < ' . (time() - RATE_WINDOW));
$ri = $db->prepare('INSERT INTO rate (ip, ts) VALUES (?, ?)');
$ri->bindValue(1, ip(), SQLITE3_TEXT);
$ri->bindValue(2, time(), SQLITE3_INTEGER);
$ri->execute();

$now = time();

/* update existing portfolio with valid key+slug */
if (!empty($in['slug']) && !empty($in['key']) && is_string($in['slug']) && is_string($in['key'])) {
    $slug = preg_replace('/[^a-z0-9]/i', '', $in['slug']);
    if (strlen($slug) !== 6) fail(400, 'bad-slug');
    $st = $db->prepare('SELECT id FROM resumes WHERE slug = ? AND edit_key = ?');
    $st->bindValue(1, $slug, SQLITE3_TEXT);
    $st->bindValue(2, $in['key'], SQLITE3_TEXT);
    if ($r = $st->execute()->fetchArray()) {
        $up = $db->prepare('UPDATE resumes SET data = ?, updated_at = ? WHERE id = ?');
        $up->bindValue(1, $in['data'], SQLITE3_TEXT);
        $up->bindValue(2, $now, SQLITE3_INTEGER);
        $up->bindValue(3, $r['id'], SQLITE3_INTEGER);
        $up->execute();
        echo json_encode(['ok' => true, 'slug' => $slug, 'key' => $in['key'], 'updated' => true], JSON_UNESCAPED_UNICODE);
        exit;
    }
    fail(403, 'invalid-key');
}

/* create new */
$slug = genSlug($db);
$key  = genKey();
$ins = $db->prepare('INSERT INTO resumes (slug, edit_key, data, views, created_at, updated_at, last_visit) VALUES (?, ?, ?, 0, ?, ?, 0)');
$ins->bindValue(1, $slug, SQLITE3_TEXT);
$ins->bindValue(2, $key, SQLITE3_TEXT);
$ins->bindValue(3, $in['data'], SQLITE3_TEXT);
$ins->bindValue(4, $now, SQLITE3_INTEGER);
$ins->bindValue(5, $now, SQLITE3_INTEGER);
$ins->execute();

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'resux.jx3.ir';
$url = $scheme . '://' . $host . '/u/' . $slug;

echo json_encode(['ok' => true, 'slug' => $slug, 'key' => $key, 'url' => $url], JSON_UNESCAPED_UNICODE);

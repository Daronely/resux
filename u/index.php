<?php
/**
 * Resux v2 — public portfolio viewer /u/{slug}
 * Renders a stored resume as an SEO-friendly page with any of the 10 templates.
 */

declare(strict_types=1);
define('RESUX_DB', __DIR__ . '/../../resux_data/resux.sqlite');

const RESUX_TEMPLATES = ['classic','modern','creative','compact','minimal','executive','elegant','timeline','bold','terminal'];

function fail404(): never {
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    $fa = <<<HTML
    <!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>پورتفولیو پیدا نشد — رساکس</title><meta name="robots" content="noindex"><link rel="stylesheet" href="/assets/css/main.css"><link rel="stylesheet" href="/assets/css/portfolio.css"></head><body class="pf-page"><main class="pf-404"><div class="box"><h1>این پورتفولیو پیدا نشد 😕</h1><p>لینک اشتباه است یا این رزومه مدت‌ها بازدید نشده و حذف شده است.<br>می‌توانید رزومه خودتان را رایگان بسازید:</p><a class="btn btn-primary" href="/">ساخت رزومه رایگان با رساکس</a></div></main></body></html>
    HTML;
    echo $fa;
    exit;
}

$uri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($uri, PHP_URL_PATH) ?: '';
$slug = '';
if (preg_match('#^/u/([a-z0-9]{6})/?$#i', $path, $m)) {
    $slug = strtolower($m[1]);
} else {
    fail404();
}

if (!is_file(RESUX_DB)) fail404();
$db = new SQLite3(RESUX_DB);
$db->busyTimeout(3000);
$st = $db->prepare('SELECT data FROM resumes WHERE slug = ? LIMIT 1');
$st->bindValue(1, $slug, SQLITE3_TEXT);
$r = $st->execute()->fetchArray(SQLITE3_ASSOC);
if (!$r) fail404();

$resume = json_decode($r['data'], true);
if (!is_array($resume)) fail404();

/* count the visit */
$db->exec('UPDATE resumes SET views = views + 1, last_visit = ' . time() . ' WHERE slug = ' . $db->escapeString($slug));

$lang     = ($resume['meta']['lang'] ?? 'fa') === 'en' ? 'en' : 'fa';
$template = in_array($resume['meta']['template'] ?? 'classic', RESUX_TEMPLATES, true)
    ? $resume['meta']['template'] : 'classic';
$name  = trim($resume['personal']['name'] ?? '');
$title = trim($resume['personal']['title'] ?? '');
$dir   = $lang === 'fa' ? 'rtl' : 'ltr';

$siteName = $lang === 'fa' ? 'رساکس' : 'Resux';
$pageTitle = ($name ?: ($lang === 'fa' ? 'رزومه' : 'Resume')) . ($title ? ' — ' . $title : '') . ' | ' . $siteName;
$desc = mb_substr(trim($resume['about'] ?? ($lang === 'fa' ? 'رزومه آنلاین' : 'Online resume')), 0, 150);
$base = 'https://resux.jx3.ir';
$canonical = $base . '/u/' . $slug;
?>
<!DOCTYPE html>
<html lang="<?= $lang ?>" dir="<?= $dir ?>">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
<meta name="description" content="<?= htmlspecialchars($desc, ENT_QUOTES, 'UTF-8') ?>">
<meta name="robots" content="index, follow">
<link rel="canonical" href="<?= $canonical ?>">
<meta name="theme-color" content="#0b0d12">
<link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="<?= $siteName ?>">
<meta property="og:locale" content="<?= $lang === 'fa' ? 'fa_IR' : 'en_US' ?>">
<meta property="og:title" content="<?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?>">
<meta property="og:description" content="<?= htmlspecialchars($desc, ENT_QUOTES, 'UTF-8') ?>">
<meta property="og:url" content="<?= $canonical ?>">
<meta property="og:image" content="<?= $base ?>/assets/img/og-cover.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/assets/fonts/<?= $lang === 'fa' ? 'Vazirmatn-VF.woff2' : 'SpaceGrotesk-VF.woff2' ?>" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<link rel="stylesheet" href="/assets/css/portfolio.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": <?= json_encode($name, JSON_UNESCAPED_UNICODE) ?>,
    <?= $title ? '"jobTitle": ' . json_encode($title, JSON_UNESCAPED_UNICODE) . ',' : '' ?>
    <?= !empty($resume['personal']['email']) ? '"email": ' . json_encode($resume['personal']['email'], JSON_UNESCAPED_UNICODE) . ',' : '' ?>
    <?= !empty($resume['personal']['location']) ? '"address": ' . json_encode($resume['personal']['location'], JSON_UNESCAPED_UNICODE) . ',' : '' ?>
    "url": <?= json_encode($canonical) ?>
  }
}
</script>
</head>
<body class="pf-page">

<div class="pf-wrap">
  <div class="pf-toolbar no-print">
    <button class="btn btn-primary" onclick="window.print()">📄 <?= $lang === 'fa' ? 'دانلود PDF' : 'Download PDF' ?></button>
    <a class="btn btn-ghost" href="/"><?= $lang === 'fa' ? 'ساخت رزومه مشابه' : 'Build a similar resume' ?></a>
  </div>

  <div id="printArea" class="a4-stage"></div>

  <div class="pf-powered no-print">
    <?= $lang === 'fa' ? 'ساخته‌شده با' : 'Built with' ?>
    <a href="/" rel="noopener"><strong>Resux</strong></a>
    —
    <a href="/"><?= $lang === 'fa' ? 'رزومه خودت را رایگان بساز' : 'Make your resume for free' ?></a>
    <span style="opacity:.5">·</span>
    <a href="https://jx3.ir/" target="_blank" rel="noopener"><?= $lang === 'fa' ? 'یک محصول جارویکس' : 'a Jarvixxx product' ?></a>
  </div>
</div>

<script src="/assets/js/qrcode.min.js"></script>
<script src="/assets/js/data.js"></script>
<script src="/assets/js/render.js"></script>
<script>
(function () {
  var resume = <?= json_encode($resume, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  var t = I18N[resume.meta.lang === "en" ? "en" : "fa"];
  var opts = { portfolioUrl: location.href };
  document.getElementById("printArea").innerHTML = renderResume(resume, t, opts);
  var sheet = document.querySelector("#printArea .sheet");
  var fit = function () {
    if (!sheet) return;
    var z = Math.min(1, Math.max(0.3, (document.documentElement.clientWidth - 40) / 794));
    sheet.style.transform = "scale(" + z + ")";
    sheet.style.transformOrigin = "top center";
    sheet.style.marginBottom = (sheet.scrollHeight * (z - 1)) + "px";
  };
  fit();
  window.addEventListener("resize", fit);
})();
</script>
</body>
</html>

<?php
/**
 * Resux — SEO landing pages generator for sample resumes.
 * /resume/index.php serves /resume/{job}.html via a query-param-free pretty URL
 * read from REQUEST_URI (works with .htaccess rewrite below).
 * Each landing page: full SEO meta + sample resume rendered inline + CTA to editor
 * pre-filled with that job's sample data (via editor.html?job=xxx).
 */

declare(strict_types=1);

/* job samples mirrored from assets/js/data.js (kept in sync for SSR landing pages) */
$JOB_SAMPLES = [
    'fa' => [
        'developer' => ['classic', 'امیرعلی رضایی', 'توسعه‌دهنده فرانت‌اند'],
        'designer' => ['creative', 'نگار محمدی', 'طراح گرافیک و رابط کاربری'],
        'accountant' => ['classic', 'سارا احمدی', 'کارشناس حسابداری'],
        'sales' => ['classic', 'محمد کریمی', 'کارشناس فروش سازمانی'],
        'intern' => ['compact', 'زهرا نوری', 'کارآموز توسعه وب'],
    ],
    'en' => [
        'developer' => ['modern', 'Amirali Rezaei', 'Frontend Developer'],
        'english' => ['modern', 'Amirali Rezaei', 'Frontend Developer'],
    ],
];

$jobs = [
    'developer' => [
        'fa', 'classic',
        'نمونه رزومه برنامه‌نویسی | قالب آماده رزومه توسعه‌دهنده — رساکس',
        'نمونه رزومه برنامه‌نویسی آماده با قالب استاندارد ATS-Friendly. رزومه توسعه‌دهنده وب را ببین، ویرایش کن و PDF بگیر — رایگان و بدون ثبت‌نام.',
        ['رزومه برنامه نویسی', 'نمونه رزومه توسعه دهنده', 'رزومه فنی', 'قالب رزومه برنامه نویسی'],
    ],
    'designer' => [
        'fa', 'creative',
        'نمونه رزومه طراح گرافیک و UI/UX | قالب رزومه خلاقانه — رساکس',
        'نمونه رزومه طراح گرافیک و رابط کاربری با قالب خلاقانه. رزومه طراحی را ببین، اطلاعات خودت را جایگزین کن و PDF برداری بگیر.',
        ['رزومه طراح گرافیک', 'رزومه ui ux', 'نمونه رزومه طراحی', 'رزومه خلاقانه'],
    ],
    'accountant' => [
        'fa', 'classic',
        'نمونه رزومه حسابداری | قالب آماده رزومه حسابدار — رساکس',
        'نمونه رزومه حسابداری آماده با قالب رسمی و اداری. مهارت‌ها، سوابق و تحصیلات حسابدار را ببین و رزومه خودت را در ۳ دقیقه بساز.',
        ['رزومه حسابداری', 'نمونه رزومه حسابدار', 'رزومه مالی', 'قالب رزومه حسابداری'],
    ],
    'sales' => [
        'fa', 'classic',
        'نمونه رزومه فروش و بازرگانی | قالب آماده رزومه فروشنده — رساکس',
        'نمونه رزومه کارشناس فروش و بازرگانی با قالب استاندارد. رزومه فروش را ویرایش کن، PDF بگیر و برای کارفرما بفرست.',
        ['رزومه فروش', 'نمونه رزومه فروشندگی', 'رزومه بازرگانی', 'رزومه کارشناس فروش'],
    ],
    'intern' => [
        'fa', 'compact',
        'نمونه رزومه کارآموزی | رزومه بدون سابقه کار دانشجویی — رساکس',
        'نمونه رزومه کارآموزی برای دانشجو و افراد بدون سابقه کار. با قالب تک‌صفحه‌ای فشرده، پروژه‌ها و مهارت‌هایت را برجسته کن.',
        ['رزومه کارآموزی', 'رزومه بدون سابقه', 'رزومه دانشجویی', 'نمونه رزومه کارآموز'],
    ],
    'english' => [
        'en', 'modern',
        'English Resume Template | نمونه رزومه انگلیسی حرفه‌ای — رساکس',
        'Free English resume template, ATS-friendly. Preview a full sample, edit it with your info and download a vector PDF in minutes.',
        ['english resume', 'resume template', 'رزومه انگلیسی', 'قالب رزومه انگلیسی'],
    ],
];

$uri  = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($uri, PHP_URL_PATH) ?: '';
$job  = '';
if (preg_match('#^/resume/([a-z]+)\.html$#i', $path, $m)) {
    $job = strtolower($m[1]);
} elseif (preg_match('#^/resume/?$#i', $path)) {
    $job = 'developer';
}
if ($job === '' || !isset($jobs[$job])) {
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>صفحه پیدا نشد — رساکس</title><meta http-equiv="refresh" content="0; url=/"></head><body></body></html>';
    exit;
}

[$lang, $tpl, $title, $desc, $keywords] = $jobs[$job];
/* base sample: the full resume JSON is injected client-side from data.js;
   SSR fallback uses a minimal stub so the page always renders */
$stubName  = $JOB_SAMPLES[$lang][$job][1] ?? 'رزومه';
$stubTitle = $JOB_SAMPLES[$lang][$job][2] ?? '';
$sample = [
    'meta' => ['lang' => $lang, 'template' => $tpl, 'showQr' => false, 'qrTarget' => 'auto'],
    'personal' => ['name' => $stubName, 'title' => $stubTitle, 'email' => '', 'phone' => '', 'location' => '', 'website' => '', 'github' => ''],
    'about' => '',
    'experience' => [], 'education' => [], 'skills' => [], 'languages' => [], 'custom' => [],
];
$jobKey = isset($JOB_SAMPLES[$lang][$job]) ? $job : (isset($JOB_SAMPLES['fa'][$job]) ? $job : 'developer');
$sampleLang = isset($JOB_SAMPLES[$lang][$job]) ? $lang : 'fa';

$isFa = $lang === 'fa';
$dir  = $isFa ? 'rtl' : 'ltr';
$base = 'https://resux.jx3.ir';
$canonical = $base . '/resume/' . $job . '.html';
$editorUrl = '/editor.html?job=' . $job;

$h1 = $isFa
    ? ['نمونه رزومه ' . ['developer' => 'برنامه‌نویسی', 'designer' => 'طراحی گرافیک', 'accountant' => 'حسابداری', 'sales' => 'فروش', 'intern' => 'کارآموزی', 'english' => 'انگلیسی'][$job] . ' — آماده و قابل ویرایش']
    : 'Professional English Resume — Ready to Edit';
$cta = $isFa ? 'این رزومه را ویرایش کن' : 'Edit this resume';
$cta2 = $isFa ? 'ساخت رزومه از صفر' : 'Build from scratch';
$lead = $isFa
    ? 'این نمونه رزومه با قالب ' . ['classic' => 'کلاسیک اداری', 'modern' => 'مدرن فنی', 'creative' => 'خلاقانه', 'compact' => 'تک‌صفحه‌ای فشرده'][$tpl] . ' ساخته شده. روی دکمه بزن تا همین نمونه با اطلاعاتش در ویرایشگر باز شود؛ فقط اسم‌ها و تجربه‌های خودت را جایگزین کن و PDF بگیر.'
    : 'This sample resume uses our Modern template. Click the button to open it in the editor pre-filled — replace the details with yours and download the PDF.';
?>
<!DOCTYPE html>
<html lang="<?= $lang ?>" dir="<?= $dir ?>">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></title>
<meta name="description" content="<?= htmlspecialchars($desc, ENT_QUOTES, 'UTF-8') ?>">
<meta name="keywords" content="<?= htmlspecialchars(implode(', ', $keywords), ENT_QUOTES, 'UTF-8') ?>">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="<?= $canonical ?>">
<meta name="theme-color" content="#4f46e5">
<link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="رساکس — رزومه‌ساز آنلاین">
<meta property="og:locale" content="<?= $isFa ? 'fa_IR' : 'en_US' ?>">
<meta property="og:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
<meta property="og:description" content="<?= htmlspecialchars($desc, ENT_QUOTES, 'UTF-8') ?>">
<meta property="og:url" content="<?= $canonical ?>">
<meta property="og:image" content="<?= $base ?>/assets/img/og-cover.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
<meta name="twitter:description" content="<?= htmlspecialchars($desc, ENT_QUOTES, 'UTF-8') ?>">
<meta name="twitter:image" content="<?= $base ?>/assets/img/og-cover.png">
<style>
@font-face { font-family: 'Vazirmatn'; src: url('/assets/fonts/Vazirmatn-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
@font-face { font-family: 'Vazirmatn'; src: url('/assets/fonts/Vazirmatn-Medium.woff2') format('woff2'); font-weight: 500; font-display: swap; }
@font-face { font-family: 'Vazirmatn'; src: url('/assets/fonts/Vazirmatn-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
@font-face { font-family: 'Inter'; src: url('/assets/fonts/Inter-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
@font-face { font-family: 'Inter'; src: url('/assets/fonts/Inter-SemiBold.woff2') format('woff2'); font-weight: 600; font-display: swap; }
@font-face { font-family: 'Inter'; src: url('/assets/fonts/Inter-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
</style>
<link rel="stylesheet" href="/assets/css/main.css">
<link rel="stylesheet" href="/assets/css/portfolio.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": <?= json_encode($title, JSON_UNESCAPED_UNICODE) ?>,
  "description": <?= json_encode($desc, JSON_UNESCAPED_UNICODE) ?>,
  "url": <?= json_encode($canonical) ?>,
  "isPartOf": { "@type": "WebSite", "url": <?= json_encode($base . '/') ?> }
}
</script>
</head>
<body class="pf-page">

<header class="topbar">
  <div class="container topbar-inner">
    <a class="logo" href="/">
      <span class="logo-mark">R</span>
      <span>Resu<em>x</em></span>
    </a>
    <nav class="topbar-actions">
      <a class="chip" href="/#templates"><?= $isFa ? 'قالب‌ها' : 'Templates' ?></a>
      <a class="btn btn-primary" href="<?= $editorUrl ?>"><?= $cta ?> ←</a>
    </nav>
  </div>
</header>

<main class="pf-wrap" style="max-width:1080px">
  <div style="text-align:center;padding:clamp(24px,5vw,48px) 16px clamp(8px,2vw,16px)">
    <h1 style="font-size:clamp(1.5rem,4vw,2.4rem);font-weight:900;line-height:1.35"><?= $h1 ?></h1>
    <p style="color:var(--muted);max-width:640px;margin:14px auto 0;font-size:clamp(.9rem,2vw,1.05rem)"><?= $lead ?></p>
    <div class="hero-cta" style="justify-content:center;margin-top:22px">
      <a class="btn btn-primary btn-lg" href="<?= $editorUrl ?>"><?= $cta ?> ←</a>
      <a class="btn btn-ghost btn-lg" href="/editor.html"><?= $cta2 ?></a>
    </div>
  </div>

  <div id="printArea" class="a4-stage"></div>

  <div class="pf-powered no-print" style="margin-top:40px">
    <?= $isFa ? 'ساخته‌شده با' : 'Built with' ?>
    <a href="/" rel="noopener"><strong>Resux</strong></a>
    —
    <a href="/"><?= $isFa ? 'رزومه خودت را رایگان بساز' : 'Make your resume for free' ?></a>
  </div>
</main>

<script src="/assets/js/qrcode.min.js"></script>
<script src="/assets/js/data.js"></script>
<script src="/assets/js/render.js"></script>
<script>
(function () {
  var jobKey = <?= json_encode($jobKey) ?>;
  var sampleLang = <?= json_encode($sampleLang) ?>;
  var bank = (typeof JOB_SAMPLES !== "undefined" && JOB_SAMPLES[sampleLang] && JOB_SAMPLES[sampleLang][jobKey]) || null;
  var sample = bank || <?= json_encode($sample, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  sample.meta.template = <?= json_encode($tpl) ?>;
  var t = I18N[sample.meta.lang === "en" ? "en" : "fa"];
  document.getElementById("printArea").innerHTML = renderResume(sample, t, {});
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

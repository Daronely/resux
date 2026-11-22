<?php
/**
 * Resux v2 — SEO landing pages for sample resumes.
 * /resume/{job}.html — full SEO meta + sample rendered client-side + CTA to editor.
 */

declare(strict_types=1);

/* stub identity per job+lang (full data comes from data.js client-side) */
$JOB_SAMPLES = [
    'fa' => [
        'developer' => ['classic', 'امیرعلی رضایی', 'توسعه‌دهنده فرانت‌اند'],
        'designer' => ['creative', 'نگار محمدی', 'طراح گرافیک و رابط کاربری'],
        'accountant' => ['executive', 'سارا احمدی', 'کارشناس حسابداری'],
        'sales' => ['bold', 'محمد کریمی', 'کارشناس فروش سازمانی'],
        'intern' => ['compact', 'زهرا نوری', 'کارآموز توسعه وب'],
        'manager' => ['executive', 'علی محمودی', 'مدیر عملیات'],
        'teacher' => ['elegant', 'مریم حسینی', 'مدرس ریاضیات'],
        'nurse' => ['timeline', 'فاطمه کریمی', 'پرستار بخش داخلی'],
        'marketer' => ['bold', 'رضا نادری', 'متخصص دیجیتال مارکتینگ'],
        'engineer' => ['minimal', 'حسین رستمی', 'مهندس عمران — سازه'],
        'english' => ['modern', 'Amirali Rezaei', 'Frontend Developer'],
    ],
    'en' => [
        'developer' => ['modern', 'Amirali Rezaei', 'Frontend Developer'],
        'english' => ['modern', 'Amirali Rezaei', 'Frontend Developer'],
    ],
];

$TPL_NAMES = [
    'fa' => ['classic' => 'کلاسیک اداری', 'modern' => 'مدرن فنی', 'creative' => 'خلاقانه', 'compact' => 'تک‌صفحه‌ای فشرده',
             'minimal' => 'مینیمال سوئیسی', 'executive' => 'مدیریتی بزرگ', 'elegant' => 'اشانتیون', 'timeline' => 'تایم‌لاین', 'bold' => 'بولد', 'terminal' => 'ترمینال'],
    'en' => ['classic' => 'Classic', 'modern' => 'Modern Tech', 'creative' => 'Creative', 'compact' => 'Compact One-Page',
             'minimal' => 'Swiss Minimal', 'executive' => 'Executive', 'elegant' => 'Élégant', 'timeline' => 'Timeline', 'bold' => 'Bold', 'terminal' => 'Terminal'],
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
        'fa', 'executive',
        'نمونه رزومه حسابداری | قالب آماده رزومه حسابدار — رساکس',
        'نمونه رزومه حسابداری آماده با قالب رسمی و اداری. مهارت‌ها، سوابق و تحصیلات حسابدار را ببین و رزومه خودت را در ۳ دقیقه بساز.',
        ['رزومه حسابداری', 'نمونه رزومه حسابدار', 'رزومه مالی', 'قالب رزومه حسابداری'],
    ],
    'sales' => [
        'fa', 'bold',
        'نمونه رزومه فروش و بازرگانی | قالب آماده رزومه فروشنده — رساکس',
        'نمونه رزومه کارشناس فروش و بازرگانی با قالب بولد و جسورانه. رزومه فروش را ویرایش کن، PDF بگیر و برای کارفرما بفرست.',
        ['رزومه فروش', 'نمونه رزومه فروشندگی', 'رزومه بازرگانی', 'رزومه کارشناس فروش'],
    ],
    'intern' => [
        'fa', 'compact',
        'نمونه رزومه کارآموزی | رزومه بدون سابقه کار دانشجویی — رساکس',
        'نمونه رزومه کارآموزی برای دانشجو و افراد بدون سابقه کار. با قالب تک‌صفحه‌ای فشرده، پروژه‌ها و مهارت‌هایت را برجسته کن.',
        ['رزومه کارآموزی', 'رزومه بدون سابقه', 'رزومه دانشجویی', 'نمونه رزومه کارآموز'],
    ],
    'manager' => [
        'fa', 'executive',
        'نمونه رزومه مدیریتی | قالب رزومه مدیر ارشد و سرپرست — رساکس',
        'نمونه رزومه مدیریتی آماده با قالب رسمی و بزرگ. سوابق رهبری تیم، دستاوردهای عددی و مهارت‌های مدیریتی را ببین و ویرایش کن.',
        ['رزومه مدیریتی', 'رزومه مدیر', 'رزومه سرپرست', 'قالب رزومه مدیر ارشد'],
    ],
    'teacher' => [
        'fa', 'elegant',
        'نمونه رزومه مدرس و معلم | قالب رزومه آموزشی — رساکس',
        'نمونه رزومه مدرس و معلم با قالب رسمی-زیبا. سوابق تدریس، مهارت‌های آموزشی و دوره‌های گذرانده را ببین و رزومه خودت را بساز.',
        ['رزومه مدرس', 'رزومه معلم', 'نمونه رزومه آموزش', 'قالب رزومه تدریس'],
    ],
    'nurse' => [
        'fa', 'timeline',
        'نمونه رزومه پرستاری | قالب رزومه کادر درمان — رساکس',
        'نمونه رزومه پرستار با قالب تایم‌لاین. سوابق بیمارستانی، مهارت‌های درمانی و گواهینامه‌ها را ببین و رزومه کادر درمان بساز.',
        ['رزومه پرستاری', 'رزومه پرستار', 'نمونه رزومه کادر درمان', 'قالب رزومه پزشکی'],
    ],
    'marketer' => [
        'fa', 'bold',
        'نمونه رزومه دیجیتال مارکتینگ | قالب رزومه متخصص سئو — رساکس',
        'نمونه رزومه دیجیتال مارکتینگ با قالب بولد. دستاوردهای عددی رشد ترافیک و نرخ تبدیل را ببین و رزومه مارکتینگ بساز.',
        ['رزومه دیجیتال مارکتینگ', 'رزومه سئو', 'رزومه متخصص بازاریابی', 'نمونه رزومه مارکتینگ'],
    ],
    'engineer' => [
        'fa', 'minimal',
        'نمونه رزومه مهندسی | قالب رزومه مهندس عمران و صنعت — رساکس',
        'نمونه رزومه مهندسی با قالب مینیمال سوئیسی. سوابق پروژه، نرم‌افزارهای مهندسی و استانداردها را ببین و ویرایش کن.',
        ['رزومه مهندسی', 'رزومه مهندس عمران', 'نمونه رزومه فنی', 'قالب رزومه مهندس'],
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
    header('Refresh: 0; url=/');
    echo '<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>صفحه پیدا نشد — رساکس</title></head><body></body></html>';
    exit;
}

[$lang, $tpl, $title, $desc, $keywords] = $jobs[$job];
$sampleLang = isset($JOB_SAMPLES[$lang][$job]) ? $lang : 'fa';
$stub = $JOB_SAMPLES[$sampleLang][$job] ?? ['classic', 'رزومه', ''];
$sample = [
    'meta' => ['lang' => $sampleLang, 'template' => $tpl, 'showQr' => false, 'qrTarget' => 'auto'],
    'personal' => ['name' => $stub[1], 'title' => $stub[2], 'email' => '', 'phone' => '', 'location' => '', 'website' => '', 'github' => ''],
    'about' => '', 'experience' => [], 'education' => [], 'skills' => [], 'languages' => [], 'custom' => [],
];

$isFa = $lang === 'fa';
$dir  = $sampleLang === 'fa' ? 'rtl' : 'ltr';
$base = 'https://resux.jx3.ir';
$canonical = $base . '/resume/' . $job . '.html';
$editorUrl = '/editor.html?job=' . $job;

$tplName = $TPL_NAMES[$sampleLang][$tpl] ?? 'Classic';
$jobNameFa = ['developer' => 'برنامه‌نویسی', 'designer' => 'طراحی گرافیک', 'accountant' => 'حسابداری', 'sales' => 'فروش',
              'intern' => 'کارآموزی', 'manager' => 'مدیریتی', 'teacher' => 'مدرسی', 'nurse' => 'پرستاری',
              'marketer' => 'دیجیتال مارکتینگ', 'engineer' => 'مهندسی', 'english' => 'انگلیسی'][$job] ?? '';
$h1 = $isFa ? 'نمونه رزومه ' . $jobNameFa . ' — آماده و قابل ویرایش' : 'Professional English Resume — Ready to Edit';
$cta = $isFa ? 'این رزومه را ویرایش کن' : 'Edit this resume';
$cta2 = $isFa ? 'ساخت رزومه از صفر' : 'Build from scratch';
$lead = $isFa
    ? 'این نمونه رزومه با قالب «' . $tplName . '» ساخته شده. روی دکمه بزن تا همین نمونه با اطلاعاتش در ویرایشگر باز شود؛ فقط اسم‌ها و تجربه‌های خودت را جایگزین کن و PDF بگیر.'
    : 'This sample uses our Modern template. Click the button to open it in the editor pre-filled — replace the details with yours and download the PDF.';
$navTemplates = $isFa ? 'قالب‌ها' : 'Templates';

$ld = [
  '@context' => 'https://schema.org',
  '@graph' => [
    ['@type' => 'WebPage', 'name' => $title, 'description' => $desc, 'url' => $canonical,
     'isPartOf' => ['@type' => 'WebSite', 'url' => $base . '/']],
    ['@type' => 'BreadcrumbList', 'itemListElement' => [
      ['@type' => 'ListItem', 'position' => 1, 'name' => $isFa ? 'رساکس' : 'Resux', 'item' => $base . '/'],
      ['@type' => 'ListItem', 'position' => 2, 'name' => $h1, 'item' => $canonical],
    ]],
  ],
];
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
<meta name="theme-color" content="#0b0d12">
<link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="<?= $isFa ? 'رساکس — رزومه‌ساز آنلاین' : 'Resux — Resume Builder' ?>">
<meta property="og:locale" content="<?= $isFa ? 'fa_IR' : 'en_US' ?>">
<meta property="og:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
<meta property="og:description" content="<?= htmlspecialchars($desc, ENT_QUOTES, 'UTF-8') ?>">
<meta property="og:url" content="<?= $canonical ?>">
<meta property="og:image" content="<?= $base ?>/assets/img/og-cover.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
<meta name="twitter:description" content="<?= htmlspecialchars($desc, ENT_QUOTES, 'UTF-8') ?>">
<meta name="twitter:image" content="<?= $base ?>/assets/img/og-cover.png">
<link rel="preload" href="/assets/fonts/<?= $sampleLang === 'fa' ? 'Vazirmatn-VF.woff2' : 'SpaceGrotesk-VF.woff2' ?>" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<link rel="stylesheet" href="/assets/css/portfolio.css">
<script type="application/ld+json"><?= json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?></script>
</head>
<body class="pf-page">

<header class="topbar no-print">
  <div class="container topbar-inner">
    <a class="logo" href="/">
      <span class="logo-mark">R</span>
      <span>Resu<em>x</em></span>
    </a>
    <nav class="topbar-actions">
      <a class="chip" href="/#templates"><?= $navTemplates ?></a>
      <a class="btn btn-primary" href="<?= $editorUrl ?>"><?= $cta ?> ←</a>
    </nav>
  </div>
</header>

<main class="pf-wrap">
  <div class="container">
    <div class="section-head center no-print" style="padding-block: clamp(28px, 5vw, 48px) 8px; margin-bottom: 18px">
      <span class="section-kicker">TEMPLATE · <?= htmlspecialchars(strtoupper($tpl), ENT_QUOTES, 'UTF-8') ?></span>
      <h1><?= $h1 ?></h1>
      <p style="color:var(--muted);line-height:1.9;max-width:44rem"><?= $lead ?></p>
      <div class="hero-cta" style="justify-content:center;margin-top:18px">
        <a class="btn btn-primary btn-lg" href="<?= $editorUrl ?>"><?= $cta ?> ←</a>
        <a class="btn btn-ghost btn-lg" href="/editor.html"><?= $cta2 ?></a>
      </div>
    </div>

    <div id="printArea" class="a4-stage"></div>

    <div class="cta-box no-print" style="margin-block: clamp(28px, 5vw, 48px)">
      <h2 style="font-family:var(--font-display);font-size:clamp(1.3rem,2.6vw,1.8rem);margin-bottom:10px">
        <?= $isFa ? 'رزومه خودت را همین حالا بساز' : 'Build your own resume now' ?>
      </h2>
      <p style="color:var(--muted);margin-bottom:22px">
        <?= $isFa ? 'رایگان، بدون ثبت‌نام، بدون واترمارک — با ۱۰ قالب حرفه‌ای.' : 'Free, no signup, no watermark — with 10 professional templates.' ?>
      </p>
      <a class="btn btn-primary btn-lg" href="<?= $editorUrl ?>"><?= $cta ?> ←</a>
    </div>
  </div>
</main>

<footer class="site-footer no-print">
  <div class="container footer-bottom" style="border:none;margin:0;padding:0">
    <span>© 2026 <?= $isFa ? 'رساکس — Resux' : 'Resux' ?></span>
    <a href="https://jx3.ir/" target="_blank" rel="noopener"><?= $isFa ? 'یک محصول جارویکس' : 'a Jarvixxx product' ?></a>
  </div>
</footer>

<script src="/assets/js/qrcode.min.js"></script>
<script src="/assets/js/data.js"></script>
<script src="/assets/js/render.js"></script>
<script>
(function () {
  var sample = <?= json_encode($sample, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
  var key = <?= json_encode($job) ?>;
  var pack = (JOB_SAMPLES["<?= $sampleLang ?>"] || {})[key];
  var resume = pack ? JSON.parse(JSON.stringify(pack)) : sample;
  resume.meta = resume.meta || {};
  resume.meta.template = <?= json_encode($tpl) ?>;
  var t = I18N[resume.meta.lang === "en" ? "en" : "fa"];
  document.getElementById("printArea").innerHTML = renderResume(resume, t, {});
  var sheet = document.querySelector("#printArea .sheet");
  var fit = function () {
    if (!sheet) return;
    var z = Math.min(1, Math.max(0.3, (Math.min(document.documentElement.clientWidth, 900) - 40) / 794));
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

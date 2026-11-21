<div align="center">

# 🚀 Resux — رزومه‌ساز آنلاین رساکس

**رزومه حرفه‌ای بساز، سریع بگیر، رایگان منتشر کن — در کمتر از ۳ دقیقه**

[![Live Demo](https://img.shields.io/badge/🟢_Live-resux.jx3.ir-4f46e5?style=for-the-badge)](https://resux.jx3.ir/)
[![License](https://img.shields.io/badge/License-MIT-16a34a?style=for-the-badge)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![No Framework](https://img.shields.io/badge/Framework-None_✨-f97316?style=for-the-badge)](#)

**[فارسی](#-رساکس--رزومه‌ساز-آنلاین) | [English](#-resux--online-resume-builder)**

</div>

---

## 🇮🇷 رساکس — رزومه‌ساز آنلاین

رزومه‌ساز فارسی/انگلیسی با معماری **بدون فریمورک** — طراحی‌شده برای هاست‌های اشتراکی cPanel سبک و ارزان.

### ✨ امکانات

| | قابلیت | توضیح |
|---|---|---|
| ⚡ | **پیش‌نمایش زنده Split-Screen** | هم‌زمان با تایپ، رزومه در قالب واقعی A4 رندر می‌شود |
| 📄 | **PDF برداری** | خروجی با `window.print()` و `@media print` — متن قابل انتخاب، فونت embed شده، حجم ~۶۰KB |
| 🎨 | **۴ قالب ATS-Friendly** | کلاسیک اداری، مدرن فنی (سایدبار)، خلاقانه، تک‌صفحه‌ای فشرده |
| 🌐 | **فارسی / انگلیسی آنی** | سوییچ RTL↔LTR با تغییر فونت (وزیرمتن ↔ Inter) و ترجمه تمام عنوان‌ها |
| 💾 | **ذخیره خودکار** | هر کلید در `localStorage` ذخیره می‌شود + پشتیبان‌گیری/بازگردانی JSON |
| 🚀 | **پورتفولیوی آنلاین** | لینک کوتاه `/u/xxxxxx` + کد ویرایش اختصاصی — بدون ثبت‌نام |
| ✨ | **جملات آماده هوشمند** | متن‌های حرفه‌ای آماده برای ۱۰+ شغل مختلف |
| 📱 | **QR کد روی رزومه** | لینک پورتفولیو/گیت‌هاب به QR برداری روی PDF |
| 🔍 | **سئوی کامل** | متاتگ‌ها، Open Graph، Twitter Card، JSON-LD (FAQ + SoftwareApp + ProfilePage)، sitemap، robots، ۶ صفحه فرود شغلی |

### 🏗 معماری

```
┌─────────────────────────────────────────────────────┐
│                    مرورگر کاربر                       │
│                                                      │
│  HTML/CSS/Vanilla JS ──► رندر رزومه (4 قالب)         │
│        │                        │                    │
│        │ localStorage           │ window.print()     │
│        ▼                        ▼                    │
│   Auto-save JSON          PDF برداری (~60KB)          │
└────────────────┬────────────────────────────────────┘
                 │ فقط برای انتشار پورتفولیو
                 ▼ (POST JSON)
┌─────────────────────────────────────────────────────┐
│              PHP 8 + SQLite (هاست اشتراکی)            │
│                                                      │
│  api/publish.php ──► ایجاد/ویرایش لینک /u/slug        │
│       ├── Rate limit: 10 req/hour/IP                 │
│       ├── کد ویرایش اختصاصی (Secret Edit Key)         │
│       └── Cleanup خودکار: حذف رزومه‌های ۶ ماه بازدید‌نشده │
│                                                      │
│  u/index.php ──► نمایش پورتفولیوی عمومی + شمارش بازدید │
│  resume/index.php ──► صفحات فرود سئو (SSR)           │
└─────────────────────────────────────────────────────┘
```

**چرا بدون فریمورک؟** هدف، سرعت نهایی روی هاست ارزان cPanel است: هیچ build-step‌ای وجود ندارد، هیچ npm‌ای لازم نیست، کل فرانت‌اند Vanilla JS خالص است و بک‌اند فقط دو فایل PHP با SQLite است. PDF در خود مرورگر کاربر تولید می‌شود (بدون Puppeteer و رم سنگین سرور).

### 📁 ساختار پروژه

```
├── index.html              # صفحه اصلی (لندینگ + FAQ + قالب‌ها)
├── editor.html             # ویرایشگر Split-Screen با پیش‌نمایش زنده
├── api/
│   └── publish.php         # انتشار/ویرایش پورتفولیو (SQLite + Rate limit)
├── u/
│   └── index.php           # نمایش پورتفولیوی عمومی /u/{slug}
├── resume/
│   └── index.php           # صفحات فرود سئو /resume/{job}.html
├── assets/
│   ├── css/main.css        # استایل اصلی + ۴ قالب + @media print
│   ├── css/portfolio.css   # استایل صفحه پورتفولیو
│   ├── js/data.js          # i18n (fa/en) + جملات آماده + نمونه‌ها
│   ├── js/render.js        # رندرر ۴ قالب رزومه
│   ├── js/editor.js        # موتور ادیتور (auto-save, bind, publish)
│   ├── js/qrcode.min.js    # کتابخانه QR (MIT)
│   ├── fonts/              # وزیرمتن + Inter (woff2 خودمیزبان)
│   └── img/                # favicon، آیکون‌ها، OG cover
├── .htaccess               # rewrite های سئو + امنیت + کش
├── robots.txt
└── sitemap.xml
```

### 🔧 اجرا روی هاست cPanel

1. محتوای پوشه `site/` را در `public_html` (یا پوشه ساب‌دامین) آپلود کنید
2. مطمئن شوید PHP 8+ با اکستنشن `sqlite3` فعال است (در cPanel → Select PHP Version)
3. پوشه `resux_data/` **خارج از webroot** یا محافظت‌شده باشد (فایل‌های `.sqlite` در `.htaccess` بلاک شده‌اند)
4. تمام! هیچ دیتابیسی نمی‌خواهد، هیچ تنظیماتی نیست

```bash
# توسعه محلی (نیازمند PHP CLI)
php -S localhost:8899 router.php
```

### 🔒 امنیت

- Rate limiting بر اساس IP (۱۰ انتشار در ساعت)
- کد ویرایش اختصاصی ۱۲ کاراکتری (`xxxx-xxxx-xxxx`) برای هر پورتفولیو
- اعتبارسنجی سخت‌گیرانه JSON (حداکثر ۲۵۶KB)
- بلاک دسترسی وب به فایل‌های SQLite و dotfiles
- هدرهای امنیتی: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- اسکیپ کامل HTML برای جلوگیری از XSS
- Cleanup خودکار دیتابیس (رزومه‌های ۶ ماه بازدید‌نشده)

---

## 🇬🇧 Resux — Online Resume Builder

A Persian/English resume builder with a **zero-framework architecture** — designed for cheap shared cPanel hosting.

### Features

- **Split-screen live preview** — real A4 rendering as you type
- **Vector PDF export** via `window.print()` + `@media print` (~60KB, embedded fonts, selectable text, Persian typography never breaks)
- **4 ATS-friendly templates**: Classic, Modern (sidebar), Creative, Compact one-page
- **Instant RTL/LTR toggle** — Persian (Vazirmatn) ↔ English (Inter) with full i18n
- **Auto-save** to localStorage + JSON backup/restore
- **Online portfolio** — short link `/u/xxxxxx` with a secret edit key, no signup
- **Smart snippets** — ready-made professional sentences for 10+ roles
- **QR code on resume** — vector QR linking to your portfolio/GitHub
- **Full SEO** — meta tags, OG, Twitter Cards, JSON-LD, sitemap, robots, 6 job landing pages

### Why no framework?

The goal is maximum performance on cheap cPanel hosting: no build step, no npm, pure vanilla JS frontend, and a backend of just two PHP files with SQLite. The PDF is generated in the user's own browser — no Puppeteer, no server RAM.

### Self-host on cPanel

1. Upload the `site/` folder contents to your `public_html`
2. Ensure PHP 8+ with the `sqlite3` extension (cPanel → Select PHP Version)
3. Keep `resux_data/` outside the webroot (`.sqlite` files are also blocked via `.htaccess`)
4. Done — no database, no config

```bash
# local development
php -S localhost:8899 router.php
```

### Tech stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla JS (ES6), CSS3 (no preprocessor), self-hosted woff2 fonts |
| Backend | PHP 8, SQLite3 (WAL mode) |
| PDF engine | Browser-native `window.print()` with A4 print CSS |
| QR | qrcode-generator (MIT) |
| Deploy | Any Apache/LiteSpeed shared host with `.htaccess` |

---

<div align="center">

**[🟢 سایت زنده را امتحان کن — resux.jx3.ir](https://resux.jx3.ir/)**

Made with ❤️ for the Iranian job market — MIT License

</div>

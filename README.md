# Resux — رزومه‌ساز رساکس 🚀

Free online resume builder — Persian & English — a [Jarvixxx](https://jx3.ir) product.

**Live:** [resux.jx3.ir](https://resux.jx3.ir) · English: [resux.jx3.ir/en.html](https://resux.jx3.ir/en.html)

## Features

- **10 professional templates** — Classic, Modern Tech, Creative, Compact One-Page, Swiss Minimal, Executive, Élégant, Timeline, Bold, Terminal — all ATS-friendly
- **Accent color picker** — 7 professional colors
- **Live A4 preview** — what you see is what prints
- **Vector PDF export** — selectable text, usually under 200 KB
- **Persian & English** — full site and editor UI in both languages
- **Online portfolio** — short link + secret edit key (`/u/{slug}`)
- **QR code** on the printed resume
- **Smart snippets** — ready-made professional sentences per job
- **Auto-save** (localStorage) + JSON backup/restore
- **11 SEO landing pages** with sample resumes per job

## Stack

Vanilla HTML/CSS/JS · PHP 8 · SQLite3 · qrcode.js — no framework, no build step.

## Install

Upload everything to a PHP host, point the domain at it, done. `resux_data/` (outside the web root) holds the SQLite DB. Rewrite rules in `.htaccess` (pretty URLs for `/resume/*.html` and `/u/*`).

## License

MIT

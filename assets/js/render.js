/* ============ Resux — Resume Renderer (4 templates) ============ */
"use strict";

/* level number (1..5) → dots or label */
function skillLevelDots(level) {
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += `<i style="display:inline-block;width:7px;height:7px;border-radius:50%;margin-inline-start:3px;background:${i <= level ? "#818cf8" : "rgba(255,255,255,.22)"}"></i>`;
  }
  return out;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function normalizeUrl(u) {
  if (!u) return "";
  u = String(u).trim();
  if (!u) return "";
  if (/^(https?:)?\/\//i.test(u)) return u;
  if (/^(mailto:|tel:)/i.test(u)) return u;
  return "https://" + u;
}

function displayUrl(u) {
  return String(u || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/* contact items builder */
function contactItems(d) {
  const p = d.personal || {};
  const items = [];
  if (p.email) items.push({ icon: "✉", text: p.email, href: "mailto:" + p.email });
  if (p.phone) items.push({ icon: "☎", text: p.phone, href: "tel:" + String(p.phone).replace(/[^+\d]/g, "") });
  if (p.location) items.push({ icon: "⌖", text: p.location, href: null });
  if (p.website) items.push({ icon: "🌐", text: displayUrl(p.website), href: normalizeUrl(p.website) });
  if (p.github) items.push({ icon: "⌥", text: displayUrl(p.github), href: normalizeUrl(p.github) });
  return items;
}

function qrSvgTag(text, size) {
  if (typeof qrcode === "undefined" || !text) return "";
  try {
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ cellSize: 2, margin: 0, scalable: true });
  } catch (e) { return ""; }
}

function resolveQrUrl(d, opts) {
  const t = (d.meta && d.meta.qrTarget) || "auto";
  if (t === "website" && d.personal.website) return normalizeUrl(d.personal.website);
  if (t === "github" && d.personal.github) return normalizeUrl(d.personal.github);
  if (t === "custom" && d.meta.qrCustom) return d.meta.qrCustom;
  if (t === "auto") {
    if (opts && opts.portfolioUrl) return opts.portfolioUrl;
    if (d.personal.website) return normalizeUrl(d.personal.website);
    if (d.personal.github) return normalizeUrl(d.personal.github);
  }
  return "";
}

function qrBlock(d, opts) {
  if (!d.meta || !d.meta.showQr) return "";
  const url = resolveQrUrl(d, opts);
  if (!url) return "";
  const svg = qrSvgTag(url);
  if (!svg) return "";
  return `<div class="qr-slot" title="${esc(url)}">${svg}</div>`;
}

/* ---------- shared: experience block ---------- */
function expItems(d, t, cls) {
  if (!d.experience || !d.experience.length) return "";
  return d.experience.map(x => `
    <div class="job">
      <div class="job-top">
        <div>
          <span class="job-title">${esc(x.role)}</span>
          ${x.company ? ` <span class="job-co">— ${esc(x.company)}</span>` : ""}
        </div>
        <span class="job-date">${esc(x.start || "")}${x.start && (x.end || x.current) ? " – " : ""}${x.current ? esc(t.rPresent) : esc(x.end || "")}</span>
      </div>
      ${x.desc ? `<div class="job-desc">${esc(x.desc)}</div>` : ""}
    </div>`).join("");
}

function eduItems(d) {
  if (!d.education || !d.education.length) return "";
  return d.education.map(x => `
    <div class="edu-line">
      <div>
        <span class="deg">${esc(x.degree)}</span>
        ${x.school ? ` <span class="sch">— ${esc(x.school)}</span>` : ""}
      </div>
      ${x.date ? `<span class="yr">${esc(x.date)}</span>` : ""}
    </div>`).join("");
}

function customSections(d, t) {
  if (!d.custom || !d.custom.length) return "";
  return d.custom.filter(s => (s.title && s.title.trim()) || (s.body && s.body.trim())).map(s => `
    <h3 class="sec"><span class="sq"></span>${esc(s.title || t.rCustom)}</h3>
    <div class="job-desc" style="white-space:pre-line">${esc(s.body || "")}</div>
  `).join("");
}

/* ============ Template 1: CLASSIC ============ */
function renderClassic(d, t, opts) {
  const c = contactItems(d);
  return `
  <div class="sheet tpl-classic">
    <div class="sheet-head">
      <div class="name-xl">${esc(d.personal.name)}</div>
      ${d.personal.title ? `<div class="role-line">${esc(d.personal.title)}</div>` : ""}
      <div class="contact-line">${c.map(i => i.href ? `<a href="${esc(i.href)}" target="_blank" rel="noopener">${i.icon} ${esc(i.text)}</a>` : `<span>${i.icon} ${esc(i.text)}</span>`).join("")}</div>
    </div>
    <div class="sheet-body">
      ${d.about ? `<h3 class="sec"><span class="sq"></span>${esc(t.rAbout)}</h3><div class="about-text">${esc(d.about)}</div>` : ""}
      ${d.experience && d.experience.length ? `<h3 class="sec"><span class="sq"></span>${esc(t.rExperience)}</h3>${expItems(d, t)}` : ""}
      ${d.education && d.education.length ? `<h3 class="sec"><span class="sq"></span>${esc(t.rEducation)}</h3>${eduItems(d)}` : ""}
      ${d.skills && d.skills.length ? `<h3 class="sec"><span class="sq"></span>${esc(t.rSkills)}</h3><div class="skill-row">${d.skills.map(s => `<span class="skill-tag">${esc(s.name)}</span>`).join("")}</div>` : ""}
      ${d.languages && d.languages.length ? `<h3 class="sec"><span class="sq"></span>${esc(t.rLanguages)}</h3><div class="skill-row">${d.languages.map(l => `<span class="skill-tag">${esc(l.name)}${l.level ? " · " + esc(l.level) : ""}</span>`).join("")}</div>` : ""}
      ${customSections(d, t)}
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ Template 2: MODERN (sidebar) ============ */
function renderModern(d, t, opts) {
  const p = d.personal;
  const initials = (p.name || "").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("");
  const sideContact = [
    p.email ? { k: "Email", v: p.email, h: "mailto:" + p.email } : null,
    p.phone ? { k: "Phone", v: p.phone, h: "tel:" + String(p.phone).replace(/[^+\d]/g, "") } : null,
    p.location ? { k: "City", v: p.location, h: null } : null,
    p.website ? { k: "Web", v: displayUrl(p.website), h: normalizeUrl(p.website) } : null,
    p.github ? { k: "GitHub", v: displayUrl(p.github), h: normalizeUrl(p.github) } : null,
  ].filter(Boolean);

  return `
  <div class="sheet tpl-modern">
    <div class="sheet-grid">
      <aside class="side">
        <div class="avatar">${esc(initials)}</div>
        ${sideContact.length ? `<h4>${esc(t.rContact)}</h4>${sideContact.map(i => `<div class="contact-item"><b>${esc(i.k)}:</b>${i.h ? `<a href="${esc(i.h)}" style="color:#c7cdf0" target="_blank" rel="noopener">${esc(i.v)}</a>` : esc(i.v)}</div>`).join("")}` : ""}
        ${d.skills && d.skills.length ? `<h4>${esc(t.rSkills)}</h4>${d.skills.map(s => `<div class="skill-line"><span>${esc(s.name)}</span><span class="bar"><i style="width:${(s.level || 3) * 20}%"></i></span></div>`).join("")}` : ""}
        ${d.languages && d.languages.length ? `<h4>${esc(t.rLanguages)}</h4>${d.languages.map(l => `<div class="lang-line"><span>${esc(l.name)}</span><span>${esc(l.level || "")}</span></div>`).join("")}` : ""}
      </aside>
      <div class="main">
        <div class="name-xl">${esc(p.name)}</div>
        ${p.title ? `<div class="role-line">${esc(p.title)}</div>` : ""}
        ${d.about ? `<div class="about-text">${esc(d.about)}</div>` : ""}
        ${d.experience && d.experience.length ? `<h3 class="sec">${esc(t.rExperience)}</h3>${expItems(d, t)}` : ""}
        ${d.education && d.education.length ? `<h3 class="sec">${esc(t.rEducation)}</h3>${eduItems(d)}` : ""}
        ${customSections(d, t).replace(/<span class="sq"><\/span>/g, "")}
      </div>
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ Template 3: CREATIVE ============ */
function renderCreative(d, t, opts) {
  const c = contactItems(d);
  return `
  <div class="sheet tpl-creative">
    <div class="cr-head">
      <div class="cr-name">${esc(d.personal.name)}</div>
      ${d.personal.title ? `<div class="cr-role">${esc(d.personal.title)}</div>` : ""}
      <div class="cr-contact">${c.map(i => i.href ? `<a href="${esc(i.href)}" style="color:#fff" target="_blank" rel="noopener">${i.icon} ${esc(i.text)}</a>` : `<span>${i.icon} ${esc(i.text)}</span>`).join("")}</div>
    </div>
    <div class="sheet-body">
      ${d.about ? `<h3 class="sec">${esc(t.rAbout)}</h3><div class="about-text" style="white-space:pre-line">${esc(d.about)}</div>` : ""}
      ${d.experience && d.experience.length ? `<h3 class="sec">${esc(t.rExperience)}</h3>${expItems(d, t)}` : ""}
      ${d.skills && d.skills.length ? `<h3 class="sec">${esc(t.rSkills)}</h3><div class="skill-tags">${d.skills.map(s => `<span>${esc(s.name)}</span>`).join("")}</div>` : ""}
      ${d.education && d.education.length ? `<h3 class="sec">${esc(t.rEducation)}</h3>${eduItems(d)}` : ""}
      ${d.languages && d.languages.length ? `<h3 class="sec">${esc(t.rLanguages)}</h3><div class="skill-tags">${d.languages.map(l => `<span>${esc(l.name)}${l.level ? " · " + esc(l.level) : ""}</span>`).join("")}</div>` : ""}
      ${customSections(d, t).replace(/<span class="sq"><\/span>/g, "")}
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ Template 4: COMPACT (one page) ============ */
function renderCompact(d, t, opts) {
  const p = d.personal;
  const contactInline = [
    p.email, p.phone, p.location ? "📍 " + p.location : null,
    p.website ? "🌐 " + displayUrl(p.website) : null,
    p.github ? "⌥ " + displayUrl(p.github) : null,
  ].filter(Boolean);
  return `
  <div class="sheet tpl-compact">
    <div class="cp-head">
      <div>
        <div class="cp-name">${esc(p.name)}</div>
        ${p.title ? `<div class="cp-role">${esc(p.title)}</div>` : ""}
      </div>
      <div class="cp-contact">${contactInline.map(x => `<div>${esc(x)}</div>`).join("")}</div>
    </div>
    <div class="sheet-body">
      ${d.about ? `<h3 class="sec">${esc(t.rAbout)}</h3><div class="job-desc">${esc(d.about)}</div>` : ""}
      <div class="two-col">
        <div>
          ${d.experience && d.experience.length ? `<h3 class="sec">${esc(t.rExperience)}</h3>${expItems(d, t)}` : ""}
          ${d.education && d.education.length ? `<h3 class="sec">${esc(t.rEducation)}</h3>${eduItems(d)}` : ""}
          ${customSections(d, t).replace(/<span class="sq"><\/span>/g, "")}
        </div>
        <div>
          ${d.skills && d.skills.length ? `<h3 class="sec">${esc(t.rSkills)}</h3>${d.skills.map(s => `<div class="skill-line-c"><span>${esc(s.name)}</span><span style="color:#8a93a8">${"●".repeat(s.level || 3)}${"○".repeat(5 - (s.level || 3))}</span></div>`).join("")}` : ""}
          ${d.languages && d.languages.length ? `<h3 class="sec">${esc(t.rLanguages)}</h3>${d.languages.map(l => `<div class="skill-line-c"><span>${esc(l.name)}</span><span style="color:#8a93a8">${esc(l.level || "")}</span></div>`).join("")}` : ""}
        </div>
      </div>
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ dispatcher ============ */
function renderResume(d, t, opts) {
  opts = opts || {};
  d = JSON.parse(JSON.stringify(d)); // detach
  d.personal = d.personal || {};
  if (!d.personal.name) d.personal.name = t === I18N.fa ? "نام و نام خانوادگی" : "Your Name";
  const fn = { classic: renderClassic, modern: renderModern, creative: renderCreative, compact: renderCompact }[(d.meta && d.meta.template) || "classic"] || renderClassic;
  return fn(d, t, opts);
}

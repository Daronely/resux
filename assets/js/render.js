/* ============ Resux — Resume Renderer v2 (10 templates) ============ */
"use strict";

/* ---------- helpers ---------- */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function attr(s) { return esc(s).replace(/\n/g, ""); }

function normalizeUrl(u) {
  if (!u) return "";
  u = String(u).trim();
  if (!u) return "";
  if (/^(https?:)?\/\//i.test(u)) return u;
  if (/^(mailto:|tel:)/i.test(u)) return u;
  return "https://" + u;
}
function displayUrl(u) { return String(u || "").replace(/^https?:\/\//i, "").replace(/\/$/, ""); }

/* accent color → readable on-accent ink */
function accentInk(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return "#10131f";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.55 ? "#10131f" : "#ffffff";
}

function contactItems(d) {
  const p = d.personal || {};
  const items = [];
  if (p.email) items.push({ icon: "✉", text: p.email, href: "mailto:" + p.email });
  if (p.phone) items.push({ icon: "☎", text: p.phone, href: "tel:" + String(p.phone).replace(/[^+\d]/g, "") });
  if (p.location) items.push({ icon: "⌖", text: p.location, href: null });
  if (p.website) items.push({ icon: "◉", text: displayUrl(p.website), href: normalizeUrl(p.website) });
  if (p.github) items.push({ icon: "⌥", text: displayUrl(p.github), href: normalizeUrl(p.github) });
  return items;
}

function initialsOf(name) {
  return (name || "").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
}

function qrSvgTag(text) {
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
  const svg = url ? qrSvgTag(url) : "";
  if (!svg) return "";
  return `<div class="qr-slot" title="${attr(url)}">${svg}</div>`;
}

/* ---------- shared blocks ---------- */
function dateRange(x, t) {
  return `${esc(x.start || "")}${x.start && (x.end || x.current) ? " – " : ""}${x.current ? esc(t.rPresent) : esc(x.end || "")}`;
}
function expItems(d, t) {
  if (!d.experience || !d.experience.length) return "";
  return d.experience.map(x => `
    <div class="job">
      <div class="job-top">
        <div><span class="job-title">${esc(x.role)}</span>${x.company ? ` <span class="job-co">— ${esc(x.company)}</span>` : ""}</div>
        <span class="job-date">${dateRange(x, t)}</span>
      </div>
      ${x.desc ? `<div class="job-desc">${esc(x.desc)}</div>` : ""}
    </div>`).join("");
}
function eduItems(d) {
  if (!d.education || !d.education.length) return "";
  return d.education.map(x => `
    <div class="edu-line">
      <div><span class="deg">${esc(x.degree)}</span>${x.school ? ` <span class="sch">— ${esc(x.school)}</span>` : ""}</div>
      ${x.date ? `<span class="yr">${esc(x.date)}</span>` : ""}
    </div>`).join("");
}
function skillTags(d, cls) {
  if (!d.skills || !d.skills.length) return "";
  return `<div class="${cls || "skill-row"}">${d.skills.map(s => `<span class="skill-tag">${esc(s.name)}</span>`).join("")}</div>`;
}
function langTags(d, cls) {
  if (!d.languages || !d.languages.length) return "";
  return `<div class="${cls || "skill-row"}">${d.languages.map(l => `<span class="skill-tag">${esc(l.name)}${l.level ? " · " + esc(l.level) : ""}</span>`).join("")}</div>`;
}
function customSections(d, t, stripSq) {
  if (!d.custom || !d.custom.length) return "";
  return d.custom.filter(s => (s.title && s.title.trim()) || (s.body && s.body.trim())).map(s => `
    <h3 class="sec">${stripSq ? "" : '<span class="sq"></span>'}${esc(s.title || t.rCustom)}</h3>
    <div class="job-desc" style="white-space:pre-line">${esc(s.body || "")}</div>
  `).join("");
}

/* ============ 1. CLASSIC — formal, single column ============ */
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
      ${skillTags(d) ? `<h3 class="sec"><span class="sq"></span>${esc(t.rSkills)}</h3>${skillTags(d)}` : ""}
      ${d.languages && d.languages.length ? `<h3 class="sec"><span class="sq"></span>${esc(t.rLanguages)}</h3>${langTags(d)}` : ""}
      ${customSections(d, t)}
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ 2. MODERN — dark sidebar ============ */
function renderModern(d, t, opts) {
  const p = d.personal;
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
        <div class="avatar">${esc(initialsOf(p.name))}</div>
        ${sideContact.length ? `<h4>${esc(t.rContact)}</h4>${sideContact.map(i => `<div class="contact-item"><b>${esc(i.k)}:</b>${i.h ? `<a href="${esc(i.h)}" target="_blank" rel="noopener">${esc(i.v)}</a>` : esc(i.v)}</div>`).join("")}` : ""}
        ${d.skills && d.skills.length ? `<h4>${esc(t.rSkills)}</h4>${d.skills.map(s => `<div class="skill-line"><span>${esc(s.name)}</span><span class="bar"><i style="width:${(s.level || 3) * 20}%"></i></span></div>`).join("")}` : ""}
        ${d.languages && d.languages.length ? `<h4>${esc(t.rLanguages)}</h4>${d.languages.map(l => `<div class="lang-line"><span>${esc(l.name)}</span><span>${esc(l.level || "")}</span></div>`).join("")}` : ""}
      </aside>
      <div class="main">
        <div class="name-xl">${esc(p.name)}</div>
        ${p.title ? `<div class="role-line">${esc(p.title)}</div>` : ""}
        ${d.about ? `<div class="about-text">${esc(d.about)}</div>` : ""}
        ${d.experience && d.experience.length ? `<h3 class="sec">${esc(t.rExperience)}</h3>${expItems(d, t)}` : ""}
        ${d.education && d.education.length ? `<h3 class="sec">${esc(t.rEducation)}</h3>${eduItems(d)}` : ""}
        ${customSections(d, t, true)}
      </div>
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ 3. CREATIVE — accent gradient header ============ */
function renderCreative(d, t, opts) {
  const c = contactItems(d);
  return `
  <div class="sheet tpl-creative">
    <div class="cr-head">
      <div class="cr-name">${esc(d.personal.name)}</div>
      ${d.personal.title ? `<div class="cr-role">${esc(d.personal.title)}</div>` : ""}
      <div class="cr-contact">${c.map(i => i.href ? `<a href="${esc(i.href)}" target="_blank" rel="noopener">${i.icon} ${esc(i.text)}</a>` : `<span>${i.icon} ${esc(i.text)}</span>`).join("")}</div>
    </div>
    <div class="sheet-body">
      ${d.about ? `<h3 class="sec">${esc(t.rAbout)}</h3><div class="about-text" style="white-space:pre-line">${esc(d.about)}</div>` : ""}
      ${d.experience && d.experience.length ? `<h3 class="sec">${esc(t.rExperience)}</h3>${expItems(d, t)}` : ""}
      ${skillTags(d, "skill-tags") ? `<h3 class="sec">${esc(t.rSkills)}</h3>${skillTags(d, "skill-tags")}` : ""}
      ${d.education && d.education.length ? `<h3 class="sec">${esc(t.rEducation)}</h3>${eduItems(d)}` : ""}
      ${d.languages && d.languages.length ? `<h3 class="sec">${esc(t.rLanguages)}</h3>${langTags(d, "skill-tags")}` : ""}
      ${customSections(d, t, true)}
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ 4. COMPACT — dense one-pager ============ */
function renderCompact(d, t, opts) {
  const p = d.personal;
  const contactInline = [p.email, p.phone, p.location ? "⌖ " + p.location : null, p.website ? "◉ " + displayUrl(p.website) : null, p.github ? "⌥ " + displayUrl(p.github) : null].filter(Boolean);
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
          ${customSections(d, t, true)}
        </div>
        <div>
          ${d.skills && d.skills.length ? `<h3 class="sec">${esc(t.rSkills)}</h3>${d.skills.map(s => `<div class="skill-line-c"><span>${esc(s.name)}</span><span class="dots">${"●".repeat(s.level || 3)}${"○".repeat(5 - (s.level || 3))}</span></div>`).join("")}` : ""}
          ${d.languages && d.languages.length ? `<h3 class="sec">${esc(t.rLanguages)}</h3>${d.languages.map(l => `<div class="skill-line-c"><span>${esc(l.name)}</span><span class="dots">${esc(l.level || "")}</span></div>`).join("")}` : ""}
        </div>
      </div>
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ 5. MINIMAL — swiss, hairlines ============ */
function renderMinimal(d, t, opts) {
  const p = d.personal;
  const line = [p.email, p.phone, p.location, p.website ? displayUrl(p.website) : null, p.github ? displayUrl(p.github) : null].filter(Boolean);
  return `
  <div class="sheet tpl-minimal">
    <header class="mn-head">
      <h1 class="mn-name">${esc(p.name)}</h1>
      ${p.title ? `<div class="mn-role">${esc(p.title)}</div>` : ""}
      <div class="mn-line">${line.map(esc).join(" · ")}</div>
    </header>
    <div class="sheet-body">
      ${d.about ? `<div class="mn-about">${esc(d.about)}</div>` : ""}
      ${d.experience && d.experience.length ? `<h3 class="mn-sec">${esc(t.rExperience)}</h3>${d.experience.map(x => `
        <div class="mn-job">
          <div class="mn-job-l"><span class="job-title">${esc(x.role)}</span>${x.company ? `<span class="job-co">${esc(x.company)}</span>` : ""}</div>
          <span class="job-date">${dateRange(x, t)}</span>
        </div>
        ${x.desc ? `<div class="job-desc">${esc(x.desc)}</div>` : ""}`).join("")}` : ""}
      <div class="mn-cols">
        <div>
          ${d.education && d.education.length ? `<h3 class="mn-sec">${esc(t.rEducation)}</h3>${d.education.map(x => `<div class="mn-job"><div class="mn-job-l"><span class="deg">${esc(x.degree)}</span>${x.school ? `<span class="sch">${esc(x.school)}</span>` : ""}</div>${x.date ? `<span class="yr">${esc(x.date)}</span>` : ""}</div>`).join("")}` : ""}
        </div>
        <div>
          ${d.skills && d.skills.length ? `<h3 class="mn-sec">${esc(t.rSkills)}</h3><div class="mn-skills">${d.skills.map(s => esc(s.name)).join(" · ")}</div>` : ""}
          ${d.languages && d.languages.length ? `<h3 class="mn-sec">${esc(t.rLanguages)}</h3><div class="mn-skills">${d.languages.map(l => esc(l.name + (l.level ? " (" + l.level + ")" : ""))).join(" · ")}</div>` : ""}
        </div>
      </div>
      ${customSections(d, t, true)}
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ 6. EXECUTIVE — large serif, two-col header ============ */
function renderExecutive(d, t, opts) {
  const p = d.personal;
  const c = contactItems(d);
  return `
  <div class="sheet tpl-executive">
    <header class="ex-head">
      <div class="ex-id">
        <h1 class="ex-name">${esc(p.name)}</h1>
        ${p.title ? `<div class="ex-role">${esc(p.title)}</div>` : ""}
      </div>
      <div class="ex-contact">${c.map(i => `<div>${i.icon} ${i.href ? `<a href="${esc(i.href)}" target="_blank" rel="noopener">${esc(i.text)}</a>` : esc(i.text)}</div>`).join("")}</div>
    </header>
    <div class="sheet-body">
      ${d.about ? `<div class="ex-about">${esc(d.about)}</div>` : ""}
      ${d.experience && d.experience.length ? `<h3 class="ex-sec">${esc(t.rExperience)}</h3>${d.experience.map(x => `
        <div class="ex-job">
          <div class="ex-job-head"><span class="ex-role-t">${esc(x.role)}</span><span class="job-date">${dateRange(x, t)}</span></div>
          ${x.company ? `<div class="job-co">${esc(x.company)}</div>` : ""}
          ${x.desc ? `<div class="job-desc">${esc(x.desc)}</div>` : ""}
        </div>`)}` : ""}
      <div class="two-col">
        <div>
          ${d.education && d.education.length ? `<h3 class="ex-sec">${esc(t.rEducation)}</h3>${eduItems(d)}` : ""}
        </div>
        <div>
          ${d.skills && d.skills.length ? `<h3 class="ex-sec">${esc(t.rSkills)}</h3><div class="mn-skills">${d.skills.map(s => esc(s.name)).join(" · ")}</div>` : ""}
          ${d.languages && d.languages.length ? `<h3 class="ex-sec">${esc(t.rLanguages)}</h3>${langTags(d)}` : ""}
        </div>
      </div>
      ${customSections(d, t, true)}
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ 7. ELEGANT — full accent top band + serif name ============ */
function renderElegant(d, t, opts) {
  const p = d.personal;
  const c = contactItems(d);
  const a = (d.meta && d.meta.accent) || "#4338ca";
  return `
  <div class="sheet tpl-elegant" style="--ta:${attr(a)}">
    <div class="el-band">
      <div class="el-ava">${esc(initialsOf(p.name))}</div>
      <div class="el-id">
        <div class="el-name">${esc(p.name)}</div>
        ${p.title ? `<div class="el-role">${esc(p.title)}</div>` : ""}
      </div>
      <div class="el-contact">${c.map(i => `<div>${i.icon} ${i.href ? `<a href="${esc(i.href)}" target="_blank" rel="noopener">${esc(i.text)}</a>` : esc(i.text)}</div>`).join("")}</div>
    </div>
    <div class="sheet-body">
      ${d.about ? `<h3 class="sec"><span class="sq"></span>${esc(t.rAbout)}</h3><div class="about-text">${esc(d.about)}</div>` : ""}
      <div class="two-col">
        <div>
          ${d.experience && d.experience.length ? `<h3 class="sec"><span class="sq"></span>${esc(t.rExperience)}</h3>${expItems(d, t)}` : ""}
        </div>
        <div>
          ${d.education && d.education.length ? `<h3 class="sec"><span class="sq"></span>${esc(t.rEducation)}</h3>${eduItems(d)}` : ""}
          ${d.skills && d.skills.length ? `<h3 class="sec"><span class="sq"></span>${esc(t.rSkills)}</h3>${d.skills.map(s => `<div class="skill-line-c"><span>${esc(s.name)}</span><span class="bar-thin"><i style="width:${(s.level || 3) * 20}%"></i></span></div>`).join("")}` : ""}
          ${d.languages && d.languages.length ? `<h3 class="sec"><span class="sq"></span>${esc(t.rLanguages)}</h3>${langTags(d)}` : ""}
        </div>
      </div>
      ${customSections(d, t)}
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ 8. TIMELINE — center line, dots ============ */
function renderTimeline(d, t, opts) {
  const p = d.personal;
  const c = contactItems(d);
  const tl = (arr, render) => (arr || []).map(render).join("");
  return `
  <div class="sheet tpl-timeline">
    <header class="tl-head">
      <div class="tl-name">${esc(p.name)}</div>
      ${p.title ? `<div class="tl-role">${esc(p.title)}</div>` : ""}
      <div class="contact-line">${c.map(i => i.href ? `<a href="${esc(i.href)}" target="_blank" rel="noopener">${i.icon} ${esc(i.text)}</a>` : `<span>${i.icon} ${esc(i.text)}</span>`).join("")}</div>
    </header>
    <div class="sheet-body">
      ${d.about ? `<div class="about-text" style="margin-bottom:18px">${esc(d.about)}</div>` : ""}
      ${d.experience && d.experience.length ? `<h3 class="tl-sec">${esc(t.rExperience)}</h3>
      <div class="tl-track">${tl(d.experience, x => `
        <div class="tl-item">
          <div class="tl-dot"></div>
          <div class="tl-card">
            <div class="job-top"><div><span class="job-title">${esc(x.role)}</span>${x.company ? ` <span class="job-co">— ${esc(x.company)}</span>` : ""}</div><span class="job-date">${dateRange(x, t)}</span></div>
            ${x.desc ? `<div class="job-desc">${esc(x.desc)}</div>` : ""}
          </div>
        </div>`)}</div>` : ""}
      <div class="two-col" style="margin-top:16px">
        <div>
          ${d.education && d.education.length ? `<h3 class="tl-sec">${esc(t.rEducation)}</h3>${eduItems(d)}` : ""}
          ${customSections(d, t, true)}
        </div>
        <div>
          ${d.skills && d.skills.length ? `<h3 class="tl-sec">${esc(t.rSkills)}</h3>${d.skills.map(s => `<div class="skill-line-c"><span>${esc(s.name)}</span><span class="dots">${"●".repeat(s.level || 3)}${"○".repeat(5 - (s.level || 3))}</span></div>`).join("")}` : ""}
          ${d.languages && d.languages.length ? `<h3 class="tl-sec">${esc(t.rLanguages)}</h3>${langTags(d)}` : ""}
        </div>
      </div>
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ 9. BOLD — huge name, accent blocks ============ */
function renderBold(d, t, opts) {
  const p = d.personal;
  const c = contactItems(d);
  const a = (d.meta && d.meta.accent) || "#4338ca";
  return `
  <div class="sheet tpl-bold" style="--ta:${attr(a)}">
    <header class="bd-head">
      <h1 class="bd-name">${esc(p.name)}</h1>
      ${p.title ? `<div class="bd-role">${esc(p.title)}</div>` : ""}
      <div class="bd-contact">${c.map(i => i.href ? `<a href="${esc(i.href)}" target="_blank" rel="noopener"><b>${i.icon}</b> ${esc(i.text)}</a>` : `<span><b>${i.icon}</b> ${esc(i.text)}</span>`).join("")}</div>
    </header>
    <div class="sheet-body">
      ${d.about ? `<div class="bd-about">${esc(d.about)}</div>` : ""}
      <div class="bd-strip">${(d.skills || []).slice(0, 8).map(s => `<span>${esc(s.name)}</span>`).join("")}</div>
      ${d.experience && d.experience.length ? `<h3 class="bd-sec">${esc(t.rExperience)}</h3>${d.experience.map(x => `
        <div class="bd-job">
          <div class="bd-yr">${esc(x.current ? t.rPresent : (x.end || x.start || ""))}</div>
          <div>
            <div class="job-title">${esc(x.role)}${x.company ? ` <span class="job-co">@ ${esc(x.company)}</span>` : ""}</div>
            ${x.start ? `<div class="job-date">${dateRange(x, t)}</div>` : ""}
            ${x.desc ? `<div class="job-desc">${esc(x.desc)}</div>` : ""}
          </div>
        </div>`).join("")}` : ""}
      <div class="two-col">
        <div>${d.education && d.education.length ? `<h3 class="bd-sec">${esc(t.rEducation)}</h3>${eduItems(d)}` : ""}</div>
        <div>${d.languages && d.languages.length ? `<h3 class="bd-sec">${esc(t.rLanguages)}</h3>${langTags(d)}` : ""}${d.skills && d.skills.length > 8 ? `<h3 class="bd-sec">${esc(t.rSkills)}</h3>${langTags(d)}` : ""}</div>
      </div>
      ${customSections(d, t, true)}
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ 10. TERMINAL — monospace, dev vibe ============ */
function renderTerminal(d, t, opts) {
  const p = d.personal;
  const kv = (k, v) => v ? `<div class="tm-kv"><span class="tm-k">${esc(k)}</span><span class="tm-v">${esc(v)}</span></div>` : "";
  const li = (arr, fn) => (arr || []).map(fn).join("");
  return `
  <div class="sheet tpl-terminal">
    <div class="tm-bar"><span class="tm-dot r"></span><span class="tm-dot y"></span><span class="tm-dot g"></span><span class="tm-title">resume — ${esc(p.name || "user")} — bash</span></div>
    <div class="sheet-body tm-body">
      <div class="tm-cmd"><span class="tm-ps1">$</span> cat ./resume.json <span class="tm-cm"># ${esc(t.rAbout)}</span></div>
      <div class="tm-name">${esc(p.name)}</div>
      ${p.title ? `<div class="tm-role">${esc(p.title)}</div>` : ""}
      <div class="tm-kvs">
        ${kv("email", p.email)}${kv("phone", p.phone)}${kv("location", p.location)}${kv("web", p.website ? displayUrl(p.website) : "")}${kv("github", p.github ? displayUrl(p.github) : "")}
      </div>
      ${d.about ? `<div class="tm-cmd" style="margin-top:14px"><span class="tm-ps1">$</span> cat about.md</div><div class="about-text">${esc(d.about)}</div>` : ""}
      ${d.experience && d.experience.length ? `<div class="tm-cmd" style="margin-top:14px"><span class="tm-ps1">$</span> git log --jobs</div>${li(d.experience, x => `
        <div class="tm-commit">
          <span class="tm-hash">${esc((x.company || "work").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 7) || "a1b2c3")}</span>
          <span class="tm-msg">${esc(x.role)}${x.company ? ` @ ${esc(x.company)}` : ""} <span class="job-date">(${dateRange(x, t)})</span></span>
          ${x.desc ? `<div class="job-desc">${esc(x.desc)}</div>` : ""}
        </div>`)}` : ""}
      <div class="two-col" style="margin-top:14px">
        <div>
          ${d.education && d.education.length ? `<div class="tm-cmd"><span class="tm-ps1">$</span> ls education/</div>${d.education.map(x => `<div class="tm-fs">📄 <b>${esc(x.degree)}</b>${x.school ? ` — ${esc(x.school)}` : ""}${x.date ? ` <span class="job-date">${esc(x.date)}</span>` : ""}</div>`).join("")}` : ""}
          ${customSections(d, t, true)}
        </div>
        <div>
          ${d.skills && d.skills.length ? `<div class="tm-cmd"><span class="tm-ps1">$</span> ls skills/</div>${d.skills.map(s => `<div class="tm-fs">⚙ <b>${esc(s.name)}</b> <span class="tm-pct">${"▮".repeat(s.level || 3)}${"▯".repeat(5 - (s.level || 3))}</span></div>`).join("")}` : ""}
          ${d.languages && d.languages.length ? `<div class="tm-cmd" style="margin-top:10px"><span class="tm-ps1">$</span> ls languages/</div>${d.languages.map(l => `<div class="tm-fs">🌍 <b>${esc(l.name)}</b> ${esc(l.level || "")}</div>`).join("")}` : ""}
        </div>
      </div>
    </div>
    ${qrBlock(d, opts)}
  </div>`;
}

/* ============ dispatcher ============ */
const TEMPLATES = {
  classic: renderClassic, modern: renderModern, creative: renderCreative, compact: renderCompact,
  minimal: renderMinimal, executive: renderExecutive, elegant: renderElegant,
  timeline: renderTimeline, bold: renderBold, terminal: renderTerminal,
};
const TEMPLATE_IDS = Object.keys(TEMPLATES);

function renderResume(d, t, opts) {
  opts = opts || {};
  d = JSON.parse(JSON.stringify(d)); // detach
  d.personal = d.personal || {};
  d.meta = d.meta || {};
  if (!TEMPLATES[d.meta.template]) d.meta.template = "classic";
  if (!d.personal.name) d.personal.name = t === I18N.fa ? "نام و نام خانوادگی" : "Your Name";
  return TEMPLATES[d.meta.template](d, t, opts);
}

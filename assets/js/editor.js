/* ============ Resux — Editor Engine ============ */
"use strict";

/* ---------- state ---------- */
let DATA = null;          // resume data
let LANG = "fa";          // ui language
let SAVE_TIMER = null;
let PUBLISHED = null;     // {slug, key} from localStorage
let CURRENT_ZOOM = 1;

const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

function t(key) { return I18N[LANG][key]; }

/* ---------- storage ---------- */
function loadState() {
  try { PUBLISHED = JSON.parse(localStorage.getItem("resux.published") || "null"); } catch (e) { PUBLISHED = null; }
  try {
    const raw = localStorage.getItem(RESUX.storageKey);
    if (raw) { DATA = JSON.parse(raw); }
  } catch (e) { DATA = null; }
  if (!DATA) DATA = JSON.parse(JSON.stringify(SAMPLE_FA));
  DATA.meta = DATA.meta || { lang: "fa", template: "classic", showQr: false, qrTarget: "auto" };
  DATA.personal = DATA.personal || {};
  DATA.experience = DATA.experience || [];
  DATA.education = DATA.education || [];
  DATA.skills = DATA.skills || [];
  DATA.languages = DATA.languages || [];
  DATA.custom = DATA.custom || [];
}

function scheduleSave() {
  setSaveState("saving");
  clearTimeout(SAVE_TIMER);
  SAVE_TIMER = setTimeout(() => {
    try { localStorage.setItem(RESUX.storageKey, JSON.stringify(DATA)); setSaveState("saved"); }
    catch (e) { setSaveState(""); }
  }, 400);
}

function setSaveState(s) {
  const el = $("#saveState");
  if (!el) return;
  el.className = "save-state " + s;
  $(".lbl", el).textContent = s === "saved" ? t("saved") : s === "saving" ? t("saving") : "";
}

/* ---------- language ---------- */
function setLang(lang, persist) {
  LANG = lang;
  const dir = I18N[lang].dir;
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  if (persist) {
    DATA.meta.lang = lang;
    scheduleSave();
  }
  buildForm();
  renderPreview();
  updateLangBtn();
}

function updateLangBtn() {
  const b = $("#langToggle");
  if (b) { b.textContent = t("langToggle"); b.title = t("langToggleTitle"); }
}

/* ---------- preview ---------- */
function renderPreview() {
  const stage = $("#a4Stage");
  if (!stage) return;
  const tR = I18N[DATA.meta.lang === "en" ? "en" : "fa"];
  const opts = { portfolioUrl: PUBLISHED ? (location.origin + "/u/" + PUBLISHED.slug) : null };
  stage.innerHTML = `<div id="printArea">${renderResume(DATA, tR, opts)}</div>`;
  applyZoom();
}

function applyZoom() {
  const stage = $("#a4Stage");
  if (!stage) return;
  const sheet = $(".sheet", stage);
  const pane = stage.closest(".preview-pane") || stage.closest(".po-body");
  if (!sheet || !pane) return;
  const avail = pane.clientWidth - 32;
  const z = Math.min(1, Math.max(0.35, Math.round(avail / 794 * 20) / 20));
  CURRENT_ZOOM = z;
  sheet.style.transform = `scale(${z})`;
  sheet.style.transformOrigin = "top center";
  // compensate layout height
  sheet.style.marginBottom = (sheet.scrollHeight * (z - 1)) + "px";
}

/* ---------- form builders ---------- */
function field(labelTxt, inputHtml, hint) {
  return `<div class="field"><label>${labelTxt}</label>${inputHtml}${hint ? `<div class="hint">${hint}</div>` : ""}</div>`;
}

function txt(id, val, ph) {
  return `<input type="text" data-bind="${id}" value="${esc(val || "")}" placeholder="${esc(ph || "")}">`;
}

function area(id, val, ph, rows) {
  return `<textarea data-bind="${id}" rows="${rows || 4}" placeholder="${esc(ph || "")}">${esc(val || "")}</textarea>`;
}

function bindInput(el) {
  const path = el.dataset.bind;
  el.addEventListener("input", () => {
    setPath(DATA, path, el.type === "checkbox" ? el.checked : el.value);
    scheduleSave();
    renderPreview();
  });
}

function setPath(obj, path, val) {
  const parts = path.split(".");
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const m = parts[i].match(/^(.+)\[(\d+)\]$/);
    if (m) o = o[m[1]][+m[2]]; else o = o[parts[i]];
  }
  const last = parts[parts.length - 1];
  const m = last.match(/^(.+)\[(\d+)\]$/);
  if (m) o[m[1]][+m[2]] = val; else o[last] = val;
}

function snippetsRow(kind, targetPath) {
  const bank = SNIPPETS[DATA.meta.lang === "en" ? "en" : "fa"][kind];
  const map = {
    about: Object.values(bank).slice(0, 5),
    exp: Object.values(bank).slice(0, 6),
  };
  const list = map[kind] || Object.values(bank).slice(0, 6);
  return `<div class="snippets"><span class="hint" style="align-self:center">${t("snippetsTitle")}</span>${list.map(s =>
    `<button type="button" class="snippet" data-snippet-for="${targetPath}" data-text="${esc(s)}">${esc(s.length > 46 ? s.slice(0, 46) + "…" : s)}</button>`).join("")}</div>`;
}

function buildForm() {
  const root = $("#formRoot");
  if (!root) return;
  const d = DATA;
  const T = I18N.fa; // form labels follow UI language
  const F = I18N[LANG];

  root.innerHTML = "";

  /* -- accordion helper -- */
  function acc(id, n, title, bodyHtml, open) {
    return `<div class="acc ${open ? "open" : ""}" id="acc-${id}">
      <button type="button" class="acc-head" data-acc><span class="n">${n}</span>${title}<span class="chev">▾</span></button>
      <div class="acc-body">${bodyHtml}</div>
    </div>`;
  }

  /* 1 — personal */
  const p = d.personal;
  root.insertAdjacentHTML("beforeend", acc("personal", 1, F.secPersonal, `
    ${field(F.fName, txt("personal.name", p.name, LANG === "fa" ? "مثلاً امیرعلی رضایی" : "e.g. Jane Doe"))}
    ${field(F.fTitle, txt("personal.title", p.title, LANG === "fa" ? "مثلاً توسعه‌دهنده فرانت‌اند" : "e.g. Frontend Developer"))}
    <div class="field-row">
      ${field(F.fEmail, txt("personal.email", p.email, "you@mail.com"))}
      ${field(F.fPhone, txt("personal.phone", p.phone, "۰۹۱۲…"))}
    </div>
    <div class="field-row">
      ${field(F.fLocation, txt("personal.location", p.location, LANG === "fa" ? "تهران" : "Tehran"))}
      ${field(F.fWebsite, txt("personal.website", p.website, "linkedin.com/in/…"))}
    </div>
    ${field(F.fGitHub, txt("personal.github", p.github, "github.com/…"))}
  `, true));

  /* 2 — about */
  root.insertAdjacentHTML("beforeend", acc("about", 2, F.secAbout, `
    ${field(F.fAbout, area("about", d.about, LANG === "fa" ? "۲ تا ۴ جمله درباره خودت…" : "2–4 sentences about you…"), null)}
    ${snippetsRow("about", "about")}
    <div class="hint">${F.fAboutHint}</div>
  `, true));

  /* 3 — experience */
  const expHtml = d.experience.map((x, i) => `
    <div class="item-card" data-exp="${i}">
      <div class="item-head"><span>${i + 1}.</span>
        <div class="actions">
          <button type="button" class="icon-btn up" data-mv="experience,-1,${i}" title="${F.moveUp}" ${i === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="icon-btn down" data-mv="experience,1,${i}" title="${F.moveDown}" ${i === d.experience.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="icon-btn" data-rm="experience,${i}" title="${F.removeItem}">✕</button>
        </div>
      </div>
      <div class="field-row">
        ${field(F.fRole, txt(`experience[${i}].role`, x.role))}
        ${field(F.fCompany, txt(`experience[${i}].company`, x.company))}
      </div>
      <div class="field-row">
        ${field(F.fStartDate, txt(`experience[${i}].start`, x.start, "۱۴۰۲ / 2023"))}
        ${field(F.fEndDate, txt(`experience[${i}].end`, x.end, F.fNow))}
      </div>
      <label style="display:flex;align-items:center;gap:7px;font-size:.8rem;color:var(--muted);margin-bottom:10px">
        <input type="checkbox" data-bind="experience[${i}].current" ${x.current ? "checked" : ""}> ${F.fNow}
      </label>
      ${field(F.fDesc, area(`experience[${i}].desc`, x.desc, "…", 4))}
      ${snippetsRow("exp", `experience[${i}].desc`)}
      <div class="hint">${F.fDescHint}</div>
    </div>`).join("") +
    `<button type="button" class="add-btn" data-add="experience">${F.addExperience}</button>`;
  root.insertAdjacentHTML("beforeend", acc("experience", 3, F.secExperience, expHtml, false));

  /* 4 — education */
  const eduHtml = d.education.map((x, i) => `
    <div class="item-card" data-edu="${i}">
      <div class="item-head"><span>${i + 1}.</span>
        <div class="actions">
          <button type="button" class="icon-btn up" data-mv="education,-1,${i}" ${i === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="icon-btn down" data-mv="education,1,${i}" ${i === d.education.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="icon-btn" data-rm="education,${i}">✕</button>
        </div>
      </div>
      <div class="field-row">
        ${field(F.fDegree, txt(`education[${i}].degree`, x.degree))}
        ${field(F.fSchool, txt(`education[${i}].school`, x.school))}
      </div>
      ${field(F.fEduDate, txt(`education[${i}].date`, x.date, "۱۳۹۸–۱۴۰۲"))}
    </div>`).join("") +
    `<button type="button" class="add-btn" data-add="education">${F.addEducation}</button>`;
  root.insertAdjacentHTML("beforeend", acc("education", 4, F.secEducation, eduHtml, false));

  /* 5 — skills */
  const skHtml = d.skills.map((x, i) => `
    <div class="item-card" data-sk="${i}">
      <div class="item-head"><span>${i + 1}.</span>
        <div class="actions">
          <button type="button" class="icon-btn up" data-mv="skills,-1,${i}" ${i === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="icon-btn down" data-mv="skills,1,${i}" ${i === d.skills.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="icon-btn" data-rm="skills,${i}">✕</button>
        </div>
      </div>
      <div class="field-row">
        ${field(F.fSkill, txt(`skills[${i}].name`, x.name))}
        ${field(F.fLevel, `<select data-bind="skills[${i}].level">${[1,2,3,4,5].map(l => `<option value="${l}" ${x.level == l ? "selected" : ""}>${F["lvl" + l]}</option>`).join("")}</select>`)}
      </div>
    </div>`).join("") +
    `<button type="button" class="add-btn" data-add="skills">${F.addSkill}</button>`;
  root.insertAdjacentHTML("beforeend", acc("skills", 5, F.secSkills, skHtml, false));

  /* 6 — languages */
  const lngHtml = d.languages.map((x, i) => `
    <div class="item-card" data-lg="${i}">
      <div class="item-head"><span>${i + 1}.</span>
        <div class="actions">
          <button type="button" class="icon-btn" data-rm="languages,${i}">✕</button>
        </div>
      </div>
      <div class="field-row">
        ${field(F.fLang, txt(`languages[${i}].name`, x.name))}
        ${field(F.fLangLvl, txt(`languages[${i}].level`, x.level, LANG === "fa" ? "پیشرفته" : "Advanced"))}
      </div>
    </div>`).join("") +
    `<button type="button" class="add-btn" data-add="languages">${F.addLanguage}</button>`;
  root.insertAdjacentHTML("beforeend", acc("languages", 6, F.secLanguages, lngHtml, false));

  /* 7 — custom sections */
  const csHtml = (d.custom || []).map((x, i) => `
    <div class="item-card" data-cs="${i}">
      <div class="item-head"><span>${i + 1}.</span>
        <div class="actions">
          <button type="button" class="icon-btn up" data-mv="custom,-1,${i}" ${i === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="icon-btn down" data-mv="custom,1,${i}" ${i === d.custom.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="icon-btn" data-rm="custom,${i}">✕</button>
        </div>
      </div>
      ${field(F.fSectTitle, txt(`custom[${i}].title`, x.title, LANG === "fa" ? "مثلاً پروژه‌ها" : "e.g. Projects"))}
      ${field(F.fSectBody, area(`custom[${i}].body`, x.body, "…", 4))}
    </div>`).join("") +
    `<button type="button" class="add-btn" data-add="custom">${F.addSection}</button>`;
  root.insertAdjacentHTML("beforeend", acc("custom", 7, F.secCustom, csHtml, false));

  /* 8 — design & settings */
  const tplThumbs = [
    ["classic", F.tplClassic, F.tplClassicD],
    ["modern", F.tplModern, F.tplModernD],
    ["creative", F.tplCreative, F.tplCreativeD],
    ["compact", F.tplCompact, F.tplCompactD],
  ].map(([id, name, desc]) => `
    <div class="tpl-card ${d.meta.template === id ? "selected" : ""}" data-tpl="${id}">
      <div class="tpl-thumb">${id === "modern" ? `<div class="sidebar"></div>` : ""}
        <div class="mini">
          ${id === "classic" ? `<div class="ln dark" style="width:55%"></div><div class="ln brand" style="width:35%"></div>` : ""}
          ${id === "modern" ? `<div class="ln brand" style="width:70%"></div><div class="ln dark" style="width:50%"></div>` : ""}
          ${id === "creative" ? `<div class="ln brand" style="width:85%;height:9px;border-radius:6px"></div><div class="ln" style="width:60%"></div>` : ""}
          ${id === "compact" ? `<div class="ln dark" style="width:45%"></div><div class="ln" style="width:70%"></div><div class="ln" style="width:80%"></div>` : ""}
          <div class="ln" style="width:90%"></div><div class="ln" style="width:75%"></div><div class="ln" style="width:85%"></div><div class="ln" style="width:60%"></div>
        </div>
      </div>
      <div class="tpl-body"><strong>${name}</strong><span>${desc}</span></div>
    </div>`).join("");

  root.insertAdjacentHTML("beforeend", acc("design", 8, F.secDesign, `
    <div class="field"><label>${F.tplChoose}</label><div class="templates-grid" style="grid-template-columns:1fr 1fr">${tplThumbs}</div></div>
    <label style="display:flex;align-items:center;gap:8px;font-size:.88rem;font-weight:600;margin:12px 0 6px">
      <input type="checkbox" id="qrToggle" ${d.meta.showQr ? "checked" : ""}> ${F.showQR}
    </label>
    <div class="field" id="qrTargetField" style="display:${d.meta.showQr ? "block" : "none"}">
      <label>${F.qrTarget}</label>
      <select id="qrTarget">
        <option value="auto" ${d.meta.qrTarget === "auto" ? "selected" : ""}>${F.qrAuto}</option>
        <option value="website" ${d.meta.qrTarget === "website" ? "selected" : ""}>${F.qrWebsite}</option>
        <option value="github" ${d.meta.qrTarget === "github" ? "selected" : ""}>${F.qrGitHub}</option>
        <option value="custom" ${d.meta.qrTarget === "custom" ? "selected" : ""}>${F.qrCustom}</option>
      </select>
      <input type="url" id="qrCustomInput" placeholder="https://…" value="${esc(d.meta.qrCustom || "")}" style="margin-top:8px;${d.meta.qrTarget === "custom" ? "" : "display:none"}">
    </div>
  `, true));

  /* -- wire events -- */
  $$("[data-bind]", root).forEach(bindInput);
  $$("[data-acc]", root).forEach(btn => btn.addEventListener("click", () => btn.parentElement.classList.toggle("open")));
  $$("[data-rm]", root).forEach(b => b.addEventListener("click", () => {
    const [k, i] = b.dataset.rm.split(",");
    DATA[k].splice(+i, 1);
    scheduleSave(); buildForm(); renderPreview();
  }));
  $$("[data-mv]", root).forEach(b => b.addEventListener("click", () => {
    const [k, dir, i] = b.dataset.mv.split(",");
    const j = +i + +dir;
    const arr = DATA[k];
    if (j < 0 || j >= arr.length) return;
    [arr[+i], arr[j]] = [arr[j], arr[+i]];
    scheduleSave(); buildForm(); renderPreview();
  }));
  $$("[data-add]", root).forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.add;
    const tpl = {
      experience: { company: "", role: "", start: "", end: "", current: false, desc: "" },
      education: { school: "", degree: "", date: "" },
      skills: { name: "", level: 3 },
      languages: { name: "", level: "" },
      custom: { title: "", body: "" },
    }[k];
    DATA[k].push(JSON.parse(JSON.stringify(tpl)));
    scheduleSave(); buildForm(); renderPreview();
    // open the accordion it belongs to and scroll into view
    const map = { experience: "experience", education: "education", skills: "skills", languages: "languages", custom: "custom" };
    const accEl = $("#acc-" + map[k]);
    if (accEl) {
      accEl.classList.add("open");
      const cards = $$(`[data-${map[k]}]`, accEl);
      const last = cards[cards.length - 1];
      if (last) last.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }));
  $$("[data-snippet-for]", root).forEach(b => b.addEventListener("click", () => {
    const path = b.dataset.snippetFor;
    const cur = getPath(DATA, path);
    setPath(DATA, path, (cur ? cur.trim() + (cur.trim() ? "\n" : "") : "") + b.dataset.text);
    scheduleSave(); buildForm(); renderPreview();
    const el = $(`[data-bind="${path}"]`, root);
    if (el) el.focus();
  }));
  $$("[data-tpl]", root).forEach(c => c.addEventListener("click", () => {
    DATA.meta.template = c.dataset.tpl;
    scheduleSave();
    $$("[data-tpl]", root).forEach(x => x.classList.toggle("selected", x === c));
    renderPreview();
  }));

  const qrT = $("#qrToggle", root);
  if (qrT) qrT.addEventListener("change", () => {
    DATA.meta.showQr = qrT.checked;
    $("#qrTargetField").style.display = qrT.checked ? "block" : "none";
    scheduleSave(); renderPreview();
  });
  const qrSel = $("#qrTarget", root);
  if (qrSel) qrSel.addEventListener("change", () => {
    DATA.meta.qrTarget = qrSel.value;
    $("#qrCustomInput").style.display = qrSel.value === "custom" ? "block" : "none";
    scheduleSave(); renderPreview();
  });
  const qrCi = $("#qrCustomInput", root);
  if (qrCi) qrCi.addEventListener("input", () => {
    DATA.meta.qrCustom = qrCi.value; scheduleSave(); renderPreview();
  });
}

function getPath(obj, path) {
  const parts = path.split(".");
  let o = obj;
  for (const part of parts) {
    const m = part.match(/^(.+)\[(\d+)\]$/);
    if (m) o = o[m[1]][+m[2]]; else o = o[part];
    if (o == null) return "";
  }
  return o;
}

/* ---------- print ---------- */
function printResume() {
  // ensure preview (which contains #printArea) is in DOM & up to date
  renderPreview();
  // If we're on mobile (preview pane hidden), temporarily open overlay content isn't needed:
  // #printArea exists in the hidden preview pane; visibility rules in @media print handle the rest.
  window.print();
}

/* ---------- backup / restore ---------- */
function backupJson() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "resux-backup-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast(LANG === "fa" ? "فایل پشتیبان دانلود شد" : "Backup downloaded", "ok");
}

function restoreJson(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d.personal || !d.meta) throw new Error("bad");
      DATA = d;
      DATA.meta = DATA.meta || {};
      scheduleSave();
      setLang(DATA.meta.lang === "en" ? "en" : "fa", false);
      toast(LANG === "fa" ? "اطلاعات بازگردانی شد" : "Restored", "ok");
    } catch (e) {
      toast(LANG === "fa" ? "فایل نامعتبر است" : "Invalid file", "err");
    }
  };
  r.readAsText(file);
}

function resetAll() {
  if (!confirm(LANG === "fa" ? "همه اطلاعات پاک شود و از نو شروع کنیم؟" : "Erase everything and start over?")) return;
  localStorage.removeItem(RESUX.storageKey);
  DATA = JSON.parse(JSON.stringify(SAMPLE_FA));
  setLang("fa", false);
  scheduleSave();
  toast(LANG === "fa" ? "از نو شروع کردیم" : "Started over", "ok");
}

/* ---------- publish ---------- */
async function publish() {
  const btn = $("#publishBtn");
  const modal = $("#publishModal");
  const body = $("#publishBody");
  if (!modal || !body) return;
  modal.classList.add("open");
  body.innerHTML = `<p>${t("pubDoing")}</p>`;

  const payload = {
    data: JSON.stringify(DATA),
    key: PUBLISHED ? PUBLISHED.key : null,
    slug: PUBLISHED ? PUBLISHED.slug : null,
  };

  try {
    const res = await fetch("api/publish.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (!res.ok || !j.ok) {
      body.innerHTML = `<p>${res.status === 429 ? t("pubRate") : t("pubErr")}</p>`;
      return;
    }
    PUBLISHED = { slug: j.slug, key: j.key };
    localStorage.setItem("resux.published", JSON.stringify(PUBLISHED));
    const url = location.origin + "/u/" + j.slug;
    body.innerHTML = `
      <p style="color:var(--ok);font-weight:700">${t("pubDone")}</p>
      <p>${t("pubLink")}</p>
      <div class="link-box"><code>${esc(url)}</code><button class="copy-btn" data-copy="${esc(url)}">${t("pubCopy")}</button></div>
      <p style="margin-top:14px">${t("pubKey")}</p>
      <div class="key-box">${esc(j.key)}</div>
      <p style="font-size:.8rem">${t("pubKeyNote")}</p>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        <a class="btn btn-primary btn-sm" href="${esc(url)}" target="_blank" rel="noopener">${t("pubOpen")}</a>
        <button class="btn btn-ghost btn-sm" data-close>${t("close")}</button>
      </div>`;
    $$("[data-copy]", body).forEach(b => b.addEventListener("click", () => {
      navigator.clipboard.writeText(b.dataset.copy).then(() => {
        b.textContent = t("pubCopied");
        setTimeout(() => (b.textContent = t("pubCopy")), 1500);
      });
    }));
    $$("[data-close]", body).forEach(b => b.addEventListener("click", () => modal.classList.remove("open")));
    renderPreview(); // QR auto mode may now have a URL
  } catch (e) {
    body.innerHTML = `<p>${t("pubErr")}</p>`;
  }
}

/* ---------- toast ---------- */
function toast(msg, kind) {
  const wrap = $("#toastWrap");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = "toast " + (kind || "");
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .4s"; }, 2600);
  setTimeout(() => el.remove(), 3100);
}

/* ---------- boot ---------- */
function bootEditor() {
  loadState();
  setLang(DATA.meta.lang === "en" ? "en" : "fa", false);

  $("#printBtn").addEventListener("click", printResume);
  $("#publishBtn").addEventListener("click", publish);
  $("#backupBtn").addEventListener("click", backupJson);
  $("#restoreBtn").addEventListener("change", e => { if (e.target.files[0]) restoreJson(e.target.files[0]); e.target.value = ""; });
  $("#resetBtn").addEventListener("click", resetAll);
  $("#langToggle").addEventListener("click", () => setLang(LANG === "fa" ? "en" : "fa", true));
  $("#themeToggle").addEventListener("click", () => {
    const html = document.documentElement;
    const dark = html.dataset.theme === "dark";
    html.dataset.theme = dark ? "" : "dark";
    localStorage.setItem("resux.theme", dark ? "light" : "dark");
  });
  const savedTheme = localStorage.getItem("resux.theme");
  if (savedTheme === "dark") document.documentElement.dataset.theme = "dark";

  const fab = $("#fabPreview");
  const ov = $("#previewOverlay");
  fab.addEventListener("click", () => {
    renderPreview();
    const stage = $("#a4StageMobile");
    stage.innerHTML = $("#a4Stage").innerHTML;
    ov.classList.add("open");
    document.body.style.overflow = "hidden";
    const sheet = $(".sheet", stage);
    if (sheet) {
      const z = Math.min(1, Math.max(0.35, (window.innerWidth - 36) / 794));
      sheet.style.transform = `scale(${z})`;
      sheet.style.transformOrigin = "top center";
      sheet.style.marginBottom = (sheet.scrollHeight * (z - 1)) + "px";
    }
  });
  $("#poClose").addEventListener("click", () => {
    ov.classList.remove("open");
    document.body.style.overflow = "";
  });

  $("#modalClose") && $("#modalClose").addEventListener("click", () => $("#publishModal").classList.remove("open"));
  $("#publishModal").addEventListener("click", e => { if (e.target.id === "publishModal") e.target.classList.remove("open"); });

  window.addEventListener("resize", applyZoom);
  window.addEventListener("beforeprint", renderPreview);
}

document.addEventListener("DOMContentLoaded", bootEditor);

const CONFIG = {
  API_BASE: window.WORDSMITH_API || "",
  DOWNLOADS: {
    win_installer: "#",
    win_portable: "#",
    source: "downloads/Wordsmith-1.4.0-source.zip"
  },
  VERSION: "1.4.0"
};

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  document.querySelectorAll(".nav a").forEach(a => {
    if (a.dataset.page === page) a.classList.add("active");
  });
  initTyped();
  initApplyForm();
  initFeedbackForm();
});

function initTyped(){
  const el = document.querySelector(".typed");
  if(!el) return;
  const full = el.dataset.text || el.textContent;
  el.textContent = "";
  el.classList.add("cursor-blink");
  let i = 0;
  (function tick(){
    if(i <= full.length){ el.textContent = full.slice(0,i++); setTimeout(tick, 55); }
    else { el.classList.remove("cursor-blink"); }
  })();
}

async function postJSON(path, body){
  const base = (CONFIG.API_BASE || "").replace(/\/$/,"");
  const r = await fetch(base + path, {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
  });
  if(!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

function initApplyForm(){
  const form = document.getElementById("apply-form");
  if(!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    const data = Object.fromEntries(new FormData(form).entries());
    btn.disabled = true; btn.textContent = "Отправляю…";
    try{
      const res = await postJSON("/api/apply", data);
      revealDownload(res.token, data.os);
    }catch(err){
      revealDownload("offline", data.os);
    }
  });
}

function dlLink(href, label, sub, cls){
  const disabled = (!href || href === "#");
  const guard = "alert('Ссылка на сборку появится здесь.');return false;";
  return `<a class="btn ${cls}" href="${disabled?'#':href}" ${disabled?`onclick="${guard}"`:'download'}>
    <span>⌨︎</span><span>${label}<br><small class="muted">${sub}</small></span></a>`;
}

function revealDownload(token, os){
  const box = document.getElementById("download-card");
  const form = document.getElementById("apply-form");
  if(form) form.classList.add("hidden");
  const d = CONFIG.DOWNLOADS;
  box.innerHTML = `
    <div class="sheet">
      <span class="stamp">Доступ открыт</span>
      <h2>Спасибо! Ваша заявка принята.</h2>
      <p class="muted">Код тестера: <b>${token}</b>. Сохраните его — он понадобится в форме фидбека.</p>
      <p>Скачайте Wordsmith ${CONFIG.VERSION}:</p>
      <div class="btn-row">
        ${dlLink(d.win_portable,"Windows · портативная","exe, без установки","red")}
        ${dlLink(d.win_installer,"Windows · установщик",".exe (NSIS)","dark")}
      </div>
      <p class="muted" style="margin-top:10px">Скомпилированная сборка .exe придёт на вашу почту
        после подтверждения заявки. А пока можно забрать исходники, готовые к сборке
        (<code>npm install &amp;&amp; npm run build</code>):</p>
      <div class="btn-row">
        ${dlLink(d.source,"Wordsmith · исходники","zip, готово к сборке","dark")}
      </div>
      <hr class="divider">
      <p class="muted">Поигрались? Будем рады услышать впечатления →
        <a href="feedback.html">оставить фидбек</a>.</p>
    </div>`;
  box.classList.remove("hidden");
  box.scrollIntoView({behavior:"smooth"});
}

function initFeedbackForm(){
  const form = document.getElementById("feedback-form");
  if(!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    const data = Object.fromEntries(new FormData(form).entries());
    data.rating = parseInt(data.rating || "0", 10);
    btn.disabled = true; btn.textContent = "Отправляю…";
    try{ await postJSON("/api/feedback", data); }catch(err){}
    const wrap = document.getElementById("feedback-wrap");
    wrap.innerHTML = `<div class="sheet center">
      <span class="stamp">Принято</span>
      <h2>Спасибо за фидбек!</h2>
      <p class="muted">Каждое слово помогает сделать Wordsmith лучше.</p>
      <a class="btn red" href="index.html">На главную</a>
    </div>`;
    wrap.scrollIntoView({behavior:"smooth"});
  });
}

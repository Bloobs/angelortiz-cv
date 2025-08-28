// Utilidades i18n
const I18N_LABELS = {
  es: {
    brand: "Ángel Ortiz",
    nav: {home:"Inicio", summary:"Resumen", phases:"Fases", career:"Carrera", achievements:"Logros", skills:"Habilidades", awards:"Reconocimientos", charts:"Gráficos", contact:"Contacto"},
    sections: {summary:"Resumen Ejecutivo", phases:"Fases de Carrera", career:"Trayectoria", achievements:"Logros", skills:"Habilidades", awards:"Reconocimientos & Premios", charts:"Gráficos", contact:"Contacto"},
    charts: {yearsByPhase:"Años por Fase", skillsRadar:"Matriz de Competencias"},
    cta: {downloadCv:"Descargar CV (PDF)"},
    contact: {emailLabel:"Correo:"}
  },
  en: {
    brand: "Ángel Ortiz",
    nav: {home:"Home", summary:"Summary", phases:"Phases", career:"Career", achievements:"Achievements", skills:"Skills", awards:"Awards", charts:"Charts", contact:"Contact"},
    sections: {summary:"Executive Summary", phases:"Career Phases", career:"Career Timeline", achievements:"Key Achievements", skills:"Skills", awards:"Recognitions & Awards", charts:"Charts", contact:"Contact"},
    charts: {yearsByPhase:"Years by Phase", skillsRadar:"Skills Matrix"},
    cta: {downloadCv:"Download CV (PDF)"},
    contact: {emailLabel:"Email:"}
  }
};

function setStaticLabels(lang){
  const dict = I18N_LABELS[lang] || I18N_LABELS.en;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const path = el.getAttribute("data-i18n").split(".");
    let obj = dict;
    for(const p of path){ obj = obj?.[p]; }
    if(typeof obj === "string") el.textContent = obj;
  });
  document.getElementById("langLabel").textContent = lang.toUpperCase();
}

// Cargar JSON del idioma
async function loadConfig(lang){
  const file = lang === "es" ? "data/config.es.json" : "data/config.en.json";
  const res = await fetch(file);
  return await res.json();
}

// Menú hamburguesa
function initHamburger(){
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if(!toggle || !menu) return;
  toggle.addEventListener('click', ()=>{
    const open = toggle.classList.toggle('is-open');
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=>{
      toggle.classList.remove('is-open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
    });
  });
}

// Selector de idioma
function initLangSelector(applyLang){
  const wrap = document.querySelector(".lang-switch");
  const btn  = document.getElementById("langBtn");
  const menu = document.getElementById("langMenu");
  if(!wrap || !btn || !menu) return;
  btn.addEventListener("click", (e)=>{ e.stopPropagation(); wrap.classList.toggle("open"); });
  menu.querySelectorAll("[data-lang]").forEach(a=>{
    a.addEventListener("click", (e)=>{
      e.preventDefault();
      const lang = a.getAttribute("data-lang");
      localStorage.setItem("site_lang", lang);
      wrap.classList.remove("open");
      applyLang(lang);
    });
  });
  document.addEventListener("click", ()=> wrap.classList.remove("open"));
}

// Render helpers
function fillHeader(cfg){
  const t = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=val; };
  t('name', cfg.personal.name);
  t('title', cfg.personal.title);
  t('subtitle', cfg.personal.subtitle);
  const email1=document.getElementById('emailLink');
  const email2=document.getElementById('emailLink2');
  if(email1){ email1.textContent = cfg.personal.email; email1.href = 'mailto:'+cfg.personal.email; }
  if(email2){ email2.textContent = cfg.personal.email; email2.href = 'mailto:'+cfg.personal.email; }
  const lin=document.getElementById('linkedinLink'); if(lin) lin.href = cfg.personal.linkedin;
  t('location', cfg.personal.location); t('location2', cfg.personal.location);
  const cv=document.getElementById('downloadCV'); if(cv && cfg.personal.cv_pdf){ cv.href = cfg.personal.cv_pdf; }

  const stats=document.getElementById('heroStats');
  if(stats){
    stats.innerHTML='';
    cfg.stats.forEach(s=>{
      const d=document.createElement('div'); d.className='stat';
      d.innerHTML = `<span class="num">${s.value}</span><span class="lbl">${s.label}</span>`;
      stats.appendChild(d);
    });
  }
}

function renderSummary(cfg){
  const box=document.getElementById('summary');
  if(!box) return; box.innerHTML='';
  (cfg.summary||[]).forEach(p=>{
    const el=document.createElement('p'); el.textContent=p; box.appendChild(el);
  });
}

function renderPhases(cfg){
  const box=document.getElementById('phases'); if(!box) return; box.innerHTML='';
  (cfg.phases||[]).forEach(ph=>{
    const card=document.createElement('div'); card.className='phase-card';
    card.innerHTML = `<h4>${ph.title}</h4><div class="duration">${ph.duration}</div><p>${ph.text}</p>`;
    box.appendChild(card);
  });
}

function renderLineTimeline(cfg){
  const box=document.getElementById('lineTimeline'); if(!box) return; box.innerHTML='';
  (cfg.timeline||[]).forEach(t=>{
    const it=document.createElement('div'); it.className='lt-item'; it.style.setProperty('--dot', t.color||'#1e3a8a');
    it.innerHTML = `
      <div class="lt-head">
        <span class="lt-period">${t.period}</span>
        <span class="lt-role">${t.role}</span> ·
        <span class="lt-company">${t.company}</span>
      </div>
      <div class="lt-desc">${t.desc}</div>`;
    box.appendChild(it);
  });
}

function renderAchievements(cfg){
  const box=document.getElementById('achievements'); if(!box) return; box.innerHTML='';
  (cfg.achievements||[]).forEach(a=>{
    const d=document.createElement('div'); d.className='card';
    d.innerHTML = `<div class="kpi">${a.metric}</div><div>${a.text}</div>`;
    box.appendChild(d);
  });
}

function renderSkills(cfg){
  const box=document.getElementById('skills'); if(!box) return; box.innerHTML='';
  (cfg.skills||[]).forEach(s=>{
    const el=document.createElement('div'); el.className='skill';
    el.innerHTML = `
      <div class="skill-header"><span>${s.name}</span><span class="level">${s.level}%</span></div>
      <div class="bar"><span style="--w:${s.level}%"></span></div>`;
    box.appendChild(el);
  });
  const obs=new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.isIntersecting){
        e.target.querySelectorAll('.bar span').forEach(sp=>{
          sp.style.width = getComputedStyle(sp).getPropertyValue('--w');
        });
      }
    });
  },{threshold:0.3});
  obs.observe(box);
}

function getYouTubeId(url){
  const m = url.match(/(?:youtube\.com\/watch\\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}
function renderAwards(cfg){
  const box = document.getElementById('awards'); if(!box) return; box.innerHTML = '';
  (cfg.awards||[]).forEach(a=>{
    const wrap = document.createElement('div'); wrap.className = 'award';
    // Título opcional
    const title = a.title ? `<div class="title">${a.title}</div>` : '';
    // Imagen o vídeo
    let mediaHtml = '';
    if (a.image) {
      const imgSrc = a.image.startsWith('http') ? a.image : `img/${a.image}`;
      mediaHtml = `<img class="media" src="${imgSrc}" alt="${(a.title||'award')}" loading="lazy">`;
    } else if (a.video) {
      // Miniatura automática de YouTube si no se aportó image
      const ytId = getYouTubeId(a.video);
      const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';
      if (thumb) mediaHtml = `<img class="media" src="${thumb}" alt="${(a.title||'video')}" loading="lazy">`;
    }
    // Envoltorio con enlace (video o link)
    const href = a.video || a.link || null;
    if (href && mediaHtml) mediaHtml = `<a class="media-link" href="${href}" target="_blank" rel="noopener">${mediaHtml}</a>`;

    // Cuerpo de texto con enlace opcional en el título
    const headerLinkOpen  = a.link || a.video ? `<a href="${(a.link||a.video)}" target="_blank" rel="noopener">` : '';
    const headerLinkClose = a.link || a.video ? `</a>` : '';

    wrap.innerHTML = `
      <div class="icon">${a.icon || '🏆'}</div>
      <div class="content">
        ${title ? `<h4 class="award-title">${headerLinkOpen}${a.title}${headerLinkClose}</h4>` : ''}
        <div class="text">${a.text||''}</div>
        ${mediaHtml ? `<div class="media-box">${mediaHtml}</div>` : ''}
      </div>
    `;
    box.appendChild(wrap);
  });
}

function renderCharts(cfg, lang){
  if(!window.Chart) return;
  const labels = I18N_LABELS[lang] || I18N_LABELS.en;

  const c1=document.getElementById('careerChart');
  if(c1){
    new Chart(c1,{
      type:'bar',
      data:{ labels: cfg.career_years.labels,
        datasets:[{ label:'Years', data: cfg.career_years.values,
          backgroundColor:['#1e3a8a','#3b82f6','#60a5fa'] }]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, title:{display:false,text:labels.charts.yearsByPhase}},
        scales:{ y:{ beginAtZero:true, ticks:{ stepSize:2 } } } }
    });
  }
  const c2=document.getElementById('skillsRadar');
  if(c2){
    new Chart(c2,{
      type:'radar',
      data:{ labels: cfg.radar.labels,
        datasets:[{ label:'Level', data: cfg.radar.values, borderColor:'#1e3a8a',
          backgroundColor:'rgba(30,58,138,0.2)', pointBackgroundColor:'#1e3a8a' }]},
      options:{ responsive:true, maintainAspectRatio:false,
        scales:{ r:{ suggestedMin:0, suggestedMax:10, ticks:{ stepSize:2 } } } }
    });
  }
}

// Aplicar idioma: carga JSON, etiquetas y render
async function applyLanguage(lang){
  setStaticLabels(lang);
  const cfg = await loadConfig(lang);
  fillHeader(cfg);
  renderSummary(cfg);
  renderPhases(cfg);
  renderLineTimeline(cfg);
  renderAchievements(cfg);
  renderSkills(cfg);
  renderAwards(cfg);
  renderCharts(cfg, lang);
}

// Init
document.addEventListener('DOMContentLoaded', async ()=>{
  initHamburger();

  // Detecta idioma: localStorage > navegador
  let lang = localStorage.getItem("site_lang");
  if(!lang){
    const navLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    lang = navLang.startsWith("es") ? "es" : "en";
  }
  await applyLanguage(lang);

  initLangSelector(async (lng)=>{ await applyLanguage(lng); });

  // Aparición suave en cards
  document.querySelectorAll('.card').forEach((c,i)=>{
    c.style.opacity=0; setTimeout(()=>{ c.style.transition='opacity .6s ease'; c.style.opacity=1; }, 120*i);
  });
});

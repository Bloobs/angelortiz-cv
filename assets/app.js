(() => {
  const VERSION = '2025-08-29T19:31:debug';
  const log = (...a) => console.log('[APP]', ...a);
  const warn = (...a) => console.warn('[APP]', ...a);
  const err = (...a) => console.error('[APP]', ...a);

  // Etiquetas estáticas mínimas para navegación
  const I18N_LABELS = {
    es: { brand: 'Ángel Ortiz',
      nav:{home:'Inicio',summary:'Resumen',phases:'Fases',career:'Carrera',achievements:'Logros',skills:'Habilidades',awards:'Reconocimientos',charts:'Gráficos',contact:'Contacto'},
      sections:{summary:'Resumen Ejecutivo',phases:'Fases de Carrera',career:'Trayectoria',achievements:'Logros',skills:'Habilidades',awards:'Reconocimientos & Premios',charts:'Gráficos',contact:'Contacto'},
      charts:{yearsByPhase:'Años por Fase',skillsRadar:'Matriz de Competencias'},
      cta:{downloadCv:'Descargar CV (PDF)'}, contact:{emailLabel:'Correo:'}
    },
    en: { brand: 'Ángel Ortiz',
      nav:{home:'Home',summary:'Summary',phases:'Phases',career:'Career',achievements:'Achievements',skills:'Skills',awards:'Awards',charts:'Charts',contact:'Contact'},
      sections:{summary:'Executive Summary',phases:'Career Phases',career:'Career Timeline',achievements:'Key Achievements',skills:'Skills',awards:'Recognitions & Awards',charts:'Charts',contact:'Contact'},
      charts:{yearsByPhase:'Years by Phase',skillsRadar:'Skills Matrix'},
      cta:{downloadCv:'Download CV (PDF)'}, contact:{emailLabel:'Email:'}
    }
  };

  function setStaticLabels(lang){
    try{
      const d = I18N_LABELS[lang] || I18N_LABELS.en;
      document.querySelectorAll('[data-i18n]').forEach(el=>{
        const path = el.getAttribute('data-i18n').split('.');
        let obj = d; for(const p of path){ obj = obj?.[p]; }
        if(typeof obj === 'string') el.textContent = obj;
      });
      const lbl = document.getElementById('langLabel');
      if(lbl) lbl.textContent = (lang||'EN').toUpperCase();
      log('setStaticLabels OK', lang);
    }catch(e){ err('setStaticLabels error', e); }
  }

  async function loadConfig(lang){
    const file = lang==='es' ? 'data/config.es.json' : 'data/config.en.json';
    const url = `${file}?v=${encodeURIComponent(VERSION)}`;
    log('loadConfig start', {lang, url});
    const res = await fetch(url, {cache:'no-store'});
    log('loadConfig response', res.status, res.headers.get('content-type'));
    if(!res.ok) throw new Error(`No se pudo cargar ${file}: ${res.status}`);
    const json = await res.json();
    log('loadConfig OK', {lang, keys:Object.keys(json)});
    return json;
  }

  function qs(id){ const el = document.getElementById(id); if(!el) warn('Elemento no encontrado:', id); return el; }

  function fillHeader(cfg){
    try{
      const set = (id,v)=>{ const el=qs(id); if(el && v!=null) el.textContent=v; };
      set('name', cfg?.personal?.name);
      set('title', cfg?.personal?.title);
      set('subtitle', cfg?.personal?.subtitle);

      const e1 = qs('emailLink'), e2 = qs('emailLink2');
      if(e1 && cfg?.personal?.email){ e1.textContent = cfg.personal.email; e1.href = 'mailto:'+cfg.personal.email; }
      if(e2 && cfg?.personal?.email){ e2.textContent = cfg.personal.email; e2.href = 'mailto:'+cfg.personal.email; }
      const lin = qs('linkedinLink'); if(lin && cfg?.personal?.linkedin){ lin.href = cfg.personal.linkedin; }
      set('location', cfg?.personal?.location);
      set('location2', cfg?.personal?.location);
      const cv = qs('downloadCV'); if(cv && cfg?.personal?.cv_pdf){ cv.href = cfg.personal.cv_pdf; }

      const stats = qs('heroStats');
      if(stats){ stats.innerHTML=''; (cfg?.stats||[]).forEach(s=>{ const d=document.createElement('div'); d.className='stat'; d.innerHTML=`<span class="num">${s.value}</span><span class="lbl">${s.label}</span>`; stats.appendChild(d); }); }
      log('fillHeader OK');
    }catch(e){ err('fillHeader error', e); }
  }

  function renderSummary(cfg){
    try{
      const box = qs('summary'); if(!box) return; box.innerHTML='';
      (cfg?.summary||[]).forEach(p=>{ const el=document.createElement('p'); el.textContent=p; box.appendChild(el); });
      log('renderSummary OK', (cfg?.summary||[]).length);
    }catch(e){ err('renderSummary error', e); }
  }

  function renderPhases(cfg){
    try{
      const box = qs('phases'); if(!box) return; box.innerHTML='';
      (cfg?.phases||[]).forEach(ph=>{ const card=document.createElement('div'); card.className='phase-card'; card.innerHTML=`<h4>${ph.title||''}</h4><div class="duration">${ph.duration||''}</div><p>${ph.text||''}</p>`; box.appendChild(card); });
      log('renderPhases OK', (cfg?.phases||[]).length);
    }catch(e){ err('renderPhases error', e); }
  }

  function renderLineTimeline(cfg){
    try{
      const box = qs('lineTimeline'); if(!box) return; box.innerHTML='';
      (cfg?.timeline||[]).forEach(t=>{ const it=document.createElement('div'); it.className='lt-item'; it.style.setProperty('--dot', t.color||'#1e3a8a'); it.innerHTML=`<div class="lt-head"><span class="lt-period">${t.period||''}</span> <span class="lt-role">${t.role||''}</span> · <span class="lt-company">${t.company||''}</span></div><div class="lt-desc">${t.desc||''}</div>`; box.appendChild(it); });
      log('renderLineTimeline OK', (cfg?.timeline||[]).length);
    }catch(e){ err('renderLineTimeline error', e); }
  }

  function renderAchievements(cfg){
    try{
      const box = qs('achievements'); if(!box) return; box.innerHTML='';
      (cfg?.achievements||[]).forEach(a=>{ const d=document.createElement('div'); d.className='card'; d.innerHTML=`<div class="kpi">${a.metric||''}</div><div>${a.text||''}</div>`; box.appendChild(d); });
      log('renderAchievements OK', (cfg?.achievements||[]).length);
    }catch(e){ err('renderAchievements error', e); }
  }

  function getYouTubeId(url){
  try{
    if(!url) return null;
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./,'');
    if (host === 'youtu.be') {
      // Ej: https://youtu.be/VIDEOID
      const id = u.pathname.slice(1);
      return id || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      // watch?v=ID
      const v = u.searchParams.get('v');
      if (v) return v;
      // /embed/ID
      const parts = u.pathname.split('/');
      const i = parts.indexOf('embed');
      if (i >= 0 && parts[i+1]) return parts[i+1];
    }
    // Fallback: último segmento largo tipo ID
    const tail = String(url).split(/[?#]/).split('/').pop();
    return tail && /^[A-Za-z0-9_-]{6,}$/.test(tail) ? tail : null;
  }catch(e){
    console.warn('[APP] getYouTubeId error', e);
    return null;
  }
}
  function renderAwards(cfg){
    try{
      const box = qs('awards'); if(!box) return; box.innerHTML='';
      (cfg?.awards||[]).forEach(a=>{
        const wrap=document.createElement('div'); wrap.className='award';
        const linked = (a.link||a.video) ? (s)=>`<a href="${(a.link||a.video)}" target="_blank" rel="noopener">${s}</a>` : (s)=>s;
        const title = a.title ? `<h4 class="award-title">${linked(a.title)}</h4>` : '';
        let mediaHtml = '';
        if(a.image){
          const src = a.image.startsWith('http') ? a.image : `img/${a.image}`;
          mediaHtml = `<img class="media" src="${src}" alt="${a.title||'award'}" loading="lazy">`;
        } else if(a.video){
          const id = getYouTubeId(a.video);
          if(id){ const thumb=`https://img.youtube.com/vi/${id}/hqdefault.jpg`; mediaHtml = `<img class="media" src="${thumb}" alt="${a.title||'video'}" loading="lazy">`; }
        }
        if(mediaHtml && (a.video||a.link)) mediaHtml = `<a class="media-link" href="${(a.video||a.link)}" target="_blank" rel="noopener">${mediaHtml}</a>`;
        wrap.innerHTML = `<div class="head"><div class="icon">${a.icon||'🏆'}</div>${title}</div><div class="text">${a.text||''}</div>${mediaHtml?`<div class="media-box">${mediaHtml}</div>`:''}`;
        box.appendChild(wrap);
      });
      log('renderAwards OK', (cfg?.awards||[]).length);
    }catch(e){ err('renderAwards error', e); }
  }

  function renderSkills(cfg){
    try{
      const box = qs('skills'); if(!box) return; box.innerHTML='';
      (cfg?.skills||[]).forEach(s=>{
        const el=document.createElement('div'); el.className='skill';
        el.innerHTML=`<div class="skill-header"><span>${s.name||''}</span><span class="level">${s.level||0}%</span></div><div class="bar"><span style="--w:${s.level||0}%"></span></div>`;
        box.appendChild(el);
      });
      const obs=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ e.target.querySelectorAll('.bar span').forEach(sp=>{ sp.style.width=getComputedStyle(sp).getPropertyValue('--w'); }); } }); },{threshold:0.3});
      obs.observe(box);
      log('renderSkills OK', (cfg?.skills||[]).length);
    }catch(e){ err('renderSkills error', e); }
  }

function renderCharts(cfg){
  try{
    if(!window.Chart){ console.warn('[APP] Chart.js no disponible'); return; }

    const makeChart = (canvasId, type, data, options) => {
      const c = document.getElementById(canvasId);
      if(!c){ console.warn('[APP] canvas no encontrado', canvasId); return; }
      // Garantizar altura visible
      const parent = c.parentElement;
      if(parent && getComputedStyle(parent).position === 'static'){
        parent.style.position = 'relative';
      }
      // Si altura computada es 0, forzar altura por si el layout aún no la ha dado
      const h = c.clientHeight || c.offsetHeight;
      if(!h){
        c.style.height = '360px';
      }
      new Chart(c, { type, data, options });
      console.log('[APP] Chart OK', canvasId);
    };

    makeChart('careerChart', 'bar', {
      labels: cfg.career_years.labels,
      datasets: [{ label:'Years', data: cfg.career_years.values,
        backgroundColor:['#1e3a8a','#3b82f6','#60a5fa'] }]
    }, {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales:{ y:{ beginAtZero:true, ticks:{ stepSize:2 } } }
    });

    makeChart('skillsRadar', 'radar', {
      labels: cfg.radar.labels,
      datasets: [{ label:'Level', data: cfg.radar.values,
        borderColor:'#1e3a8a', backgroundColor:'rgba(30,58,138,0.2)',
        pointBackgroundColor:'#1e3a8a'}]
    }, {
      responsive:true, maintainAspectRatio:false,
      scales:{ r:{ suggestedMin:0, suggestedMax:10, ticks:{ stepSize:2 } } }
    });

  }catch(e){
    console.error('[APP] renderCharts error', e);
  }
}


  async function applyLanguage(lang){
    log('applyLanguage start', lang);
    setStaticLabels(lang);
    const cfg = await loadConfig(lang);
    fillHeader(cfg);
    renderSummary(cfg);
    renderPhases(cfg);
    renderLineTimeline(cfg);
    renderAchievements(cfg);
    renderSkills(cfg);
    renderAwards(cfg);
    renderCharts(cfg);
    log('applyLanguage done', lang);
  }

  function initHamburger(){
    try{
      const toggle=document.querySelector('.nav-toggle');
      const menu=document.querySelector('.nav-menu');
      if(!toggle || !menu){ warn('Hamburger elements missing'); return; }
      toggle.addEventListener('click',(e)=>{ e.stopPropagation(); const open=toggle.classList.toggle('is-open'); menu.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', open?'true':'false'); });
      document.addEventListener('click',()=>{ toggle.classList.remove('is-open'); menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false'); }, {passive:true});
      menu.addEventListener('click',(e)=>e.stopPropagation());
      log('initHamburger OK');
    }catch(e){ err('initHamburger error', e); }
  }

  function initLangSelector(apply){
    try{
      const wrap=document.querySelector('.lang-switch');
      const btn=document.getElementById('langBtn');
      const menu=document.getElementById('langMenu');
      if(!wrap||!btn||!menu){ warn('Lang selector elements missing'); return; }
      btn.addEventListener('click',(e)=>{ e.stopPropagation(); wrap.classList.toggle('open'); });
      menu.addEventListener('click',(e)=>e.stopPropagation());
      document.addEventListener('click',()=> wrap.classList.remove('open'), {passive:true});
      menu.querySelectorAll('[data-lang]').forEach(a=>{
        a.addEventListener('click', async (e)=>{
          e.preventDefault();
          const lang=a.getAttribute('data-lang');
          localStorage.setItem('site_lang', lang);
          wrap.classList.remove('open');
          try{ await apply(lang); }catch(ex){ err('apply lang error', ex); }
        });
      });
      log('initLangSelector OK');
    }catch(e){ err('initLangSelector error', e); }
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    log('DOMContentLoaded');
    initHamburger();
    initLangSelector(async (l)=>await applyLanguage(l));
    try{
      let lang = localStorage.getItem('site_lang');
      if(!lang){
        const nav=(navigator.language||navigator.userLanguage||'en').toLowerCase();
        lang = nav.startsWith('es') ? 'es' : 'en';
      }
      await applyLanguage(lang);
    }catch(e){
      err('Init applyLanguage error', e);
      // Fallback duro a EN si falla ES
      try{ await applyLanguage('en'); }catch(e2){ err('Fallback EN error', e2); }
    }
  });

  // Log de carga del archivo
  log('app.js cargado', {version: VERSION});
})();

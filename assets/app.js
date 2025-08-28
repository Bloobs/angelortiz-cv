// Cargar JSON central
async function loadConfig(){
  const res = await fetch('data/config.json');
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

// Rellenar cabecera/hero
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

  // Stats
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

// Resumen
function renderSummary(cfg){
  const box=document.getElementById('summary');
  if(!box) return; box.innerHTML='';
  cfg.summary.forEach(p=>{
    const el=document.createElement('p'); el.textContent=p; box.appendChild(el);
  });
}

// Fases
function renderPhases(cfg){
  const box=document.getElementById('phases'); if(!box) return; box.innerHTML='';
  cfg.phases.forEach(ph=>{
    const card=document.createElement('div'); card.className='phase-card';
    card.innerHTML = `<h4>${ph.title}</h4><div class="duration">${ph.duration}</div><p>${ph.text}</p>`;
    box.appendChild(card);
  });
}

// Timeline con líneas de color
function renderLineTimeline(cfg){
  const box=document.getElementById('lineTimeline'); if(!box) return; box.innerHTML='';
  cfg.timeline.forEach(t=>{
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

// Logros
function renderAchievements(cfg){
  const box=document.getElementById('achievements'); if(!box) return; box.innerHTML='';
  cfg.achievements.forEach(a=>{
    const d=document.createElement('div'); d.className='card';
    d.innerHTML = `<div class="kpi">${a.metric}</div><div>${a.text}</div>`;
    box.appendChild(d);
  });
}

// Habilidades
function renderSkills(cfg){
  const box=document.getElementById('skills'); if(!box) return; box.innerHTML='';
  cfg.skills.forEach(s=>{
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

// Reconocimientos
function renderAwards(cfg){
  const box=document.getElementById('awards'); if(!box) return; box.innerHTML='';
  cfg.awards.forEach(a=>{
    const item=document.createElement('div'); item.className='award';
    item.innerHTML = `<div class="icon">${a.icon||'🏆'}</div><div class="text">${a.text}</div>`;
    box.appendChild(item);
  });
}

// Gráficos
function renderCharts(cfg){
  if(!window.Chart) return;
  const c1=document.getElementById('careerChart');
  if(c1){
    new Chart(c1,{
      type:'bar',
      data:{ labels: cfg.career_years.labels,
        datasets:[{ label:'Años', data: cfg.career_years.values,
          backgroundColor:['#1e3a8a','#3b82f6','#60a5fa'] }]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{ y:{ beginAtZero:true, ticks:{ stepSize:2 } } } }
    });
  }
  const c2=document.getElementById('skillsRadar');
  if(c2){
    new Chart(c2,{
      type:'radar',
      data:{ labels: cfg.radar.labels,
        datasets:[{ label:'Nivel', data: cfg.radar.values, borderColor:'#1e3a8a',
          backgroundColor:'rgba(30,58,138,0.2)', pointBackgroundColor:'#1e3a8a' }]},
      options:{ responsive:true, maintainAspectRatio:false,
        scales:{ r:{ suggestedMin:0, suggestedMax:10, ticks:{ stepSize:2 } } } }
    });
  }
}

// Init
document.addEventListener('DOMContentLoaded', async ()=>{
  initHamburger();
  try{
    const cfg = await loadConfig();
    fillHeader(cfg);
    renderSummary(cfg);
    renderPhases(cfg);
    renderLineTimeline(cfg);
    renderAchievements(cfg);
    renderSkills(cfg);
    renderAwards(cfg);
    renderCharts(cfg);
  }catch(e){
    console.warn('No se pudo cargar data/config.json', e);
  }
  // Efecto suave de aparición en cards
  document.querySelectorAll('.card').forEach((c,i)=>{
    c.style.opacity=0; setTimeout(()=>{ c.style.transition='opacity .6s ease'; c.style.opacity=1; }, 120*i);
  });
});

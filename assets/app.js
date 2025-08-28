// Carga de configuración desde data/config.json para generar contenido y gráficos
async function loadConfig(){
  const res = await fetch('data/config.json');
  return await res.json();
}

function fillHeader(cfg){
  const setText = (id, val) => { const el=document.getElementById(id); if(el) el.textContent = val; };
  setText('name', cfg.personal.name);
  setText('title', cfg.personal.title);
  setText('subtitle', cfg.personal.subtitle);

  const emailLink = document.getElementById('emailLink');
  const emailLink2 = document.getElementById('emailLink2');
  if (emailLink){ emailLink.textContent = cfg.personal.email; emailLink.href = 'mailto:'+cfg.personal.email; }
  if (emailLink2){ emailLink2.textContent = cfg.personal.email; emailLink2.href = 'mailto:'+cfg.personal.email; }

  const linkedinLink = document.getElementById('linkedinLink');
  if (linkedinLink){ linkedinLink.href = cfg.personal.linkedin; }

  const loc = document.getElementById('location');
  const loc2 = document.getElementById('location2');
  if (loc) loc.textContent = cfg.personal.location;
  if (loc2) loc2.textContent = cfg.personal.location;

  const summary = document.getElementById('summary');
  if (summary) summary.textContent = cfg.summary;

  // Enlace del CV desde JSON (si existe)
  const cvBtn = document.getElementById('downloadCV');
  if (cvBtn && cfg.personal.cv_pdf){
    cvBtn.href = cfg.personal.cv_pdf;
  }
}

function renderTimeline(cfg){
  const box = document.getElementById('timeline');
  if (!box) return;
  box.innerHTML = '';
  cfg.timeline.forEach(item=>{
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.setAttribute('data-icon', item.icon||'💼');
    el.innerHTML = `
      <div class="time">${item.period}</div>
      <div class="role">${item.role} · ${item.company}</div>
      <div class="desc">${item.desc}</div>
    `;
    box.appendChild(el);
  });

  // Efecto de aparición
  const obs = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  },{threshold:0.2});
  box.querySelectorAll('.timeline-item').forEach(it=>obs.observe(it));
}

function renderAchievements(cfg){
  const box = document.getElementById('achievements');
  if (!box) return;
  box.innerHTML = '';
  cfg.achievements.forEach(a=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="kpi">${a.metric}</div><div>${a.text}</div>`;
    box.appendChild(card);
  });
}

function renderSkills(cfg){
  const box = document.getElementById('skills');
  if (!box) return;
  box.innerHTML = '';
  cfg.skills.forEach(s=>{
    const el = document.createElement('div');
    el.className = 'skill';
    el.innerHTML = `
      <div class="skill-header"><span>${s.name}</span><span class="level">${s.level}%</span></div>
      <div class="bar"><span style="--w:${s.level}%"></span></div>
    `;
    box.appendChild(el);
  });

  // Barras de habilidades animadas al entrar en viewport
  const skillsObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.querySelectorAll('.bar span').forEach(sp=>{
          sp.style.width = getComputedStyle(sp).getPropertyValue('--w');
        });
      }
    });
  },{threshold:0.3});
  skillsObs.observe(box);
}

function renderCharts(cfg){
  // Career bar chart
  const ctx1 = document.getElementById('careerChart');
  if(ctx1 && window.Chart){
    new Chart(ctx1,{
      type:'bar',
      data:{
        labels:cfg.career_years.labels,
        datasets:[{
          label:'Años',
          data:cfg.career_years.values,
          backgroundColor:['#1e3a8a','#3b82f6','#60a5fa']
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{ y:{ beginAtZero:true, ticks:{ stepSize:2 } } }
      }
    });
  }

  // Skills radar
  const ctx2 = document.getElementById('skillsRadar');
  if(ctx2 && window.Chart){
    new Chart(ctx2,{
      type:'radar',
      data:{
        labels:cfg.radar.labels,
        datasets:[{
          label:'Nivel',
          data:cfg.radar.values,
          borderColor:'#1e3a8a',
          backgroundColor:'rgba(30,58,138,0.2)',
          pointBackgroundColor:'#1e3a8a'
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        scales:{ r:{ suggestedMin:0, suggestedMax:10, ticks:{ stepSize:2 } } }
      }
    });
  }
}

// Menú hamburguesa
function initHamburger(){
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('is-open');
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Cerrar al hacer clic en un enlace
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  initHamburger();
  try{
    const cfg = await loadConfig();
    fillHeader(cfg);
    renderTimeline(cfg);
    renderAchievements(cfg);
    renderSkills(cfg);
    renderCharts(cfg);
  }catch(e){
    // Si no hay config.json o falla la carga, no rompemos la página
    console.warn('No se pudo cargar data/config.json', e);
  }

  // Animación simple para cards de logros
  document.querySelectorAll('.card').forEach((c,i)=>{
    c.style.opacity=0;
    setTimeout(()=>{ c.style.transition='opacity .6s ease'; c.style.opacity=1; }, 120*i);
  });
});

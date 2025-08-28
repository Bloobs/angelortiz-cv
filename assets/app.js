// Carga de configuración desde data/config.json para generar contenido y gráficos
async function loadConfig(){
  const res = await fetch('data/config.json');
  return await res.json();
}

function fillHeader(cfg){
  document.getElementById('name').textContent = cfg.personal.name;
  document.getElementById('title').textContent = cfg.personal.title;
  document.getElementById('subtitle').textContent = cfg.personal.subtitle;
  document.getElementById('emailLink').textContent = cfg.personal.email;
  document.getElementById('emailLink').href = 'mailto:'+cfg.personal.email;
  document.getElementById('emailLink2').textContent = cfg.personal.email;
  document.getElementById('emailLink2').href = 'mailto:'+cfg.personal.email;
  document.getElementById('linkedinLink').href = cfg.personal.linkedin;
  document.getElementById('location').textContent = cfg.personal.location;
  document.getElementById('location2').textContent = cfg.personal.location;
  document.getElementById('summary').textContent = cfg.summary;
}

function renderTimeline(cfg){
  const box = document.getElementById('timeline');
  box.innerHTML = '';
  cfg.timeline.forEach(item=>{
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.setAttribute('data-icon', item.icon||'💼');
    el.innerHTML = `<div class="time">${item.period}</div><div class="role">${item.role} · ${item.company}</div><div class="desc">${item.desc}</div>`;
    box.appendChild(el);
  });
  const obs = new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting) e.target.classList.add('visible');});},{threshold:0.2});
  document.querySelectorAll('.timeline-item').forEach(it=>obs.observe(it));
}

function renderAchievements(cfg){
  const box = document.getElementById('achievements');
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
  box.innerHTML = '';
  cfg.skills.forEach(s=>{
    const el = document.createElement('div');
    el.className = 'skill';
    el.innerHTML = `<div class="skill-header"><span>${s.name}</span><span class="level">${s.level}%</span></div><div class="bar"><span style="--w:${s.level}%"></span></div>`;
    box.appendChild(el);
  });
  const skillsObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){ e.target.querySelectorAll('.bar span').forEach(sp=>sp.style.width=getComputedStyle(sp).getPropertyValue('--w')); }});
  },{threshold:0.3});
  skillsObs.observe(box);
}

function renderCharts(cfg){
  // Career bar chart from cfg.career_years
  const ctx1 = document.getElementById('careerChart');
  if(ctx1){
    new Chart(ctx1,{type:'bar',data:{labels:cfg.career_years.labels,datasets:[{label:'Años',data:cfg.career_years.values,backgroundColor:['#1e3a8a','#3b82f6','#60a5fa']} ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:2}}}}});
  }
  // Skills radar from cfg.radar
  const ctx2 = document.getElementById('skillsRadar');
  if(ctx2){
    new Chart(ctx2,{type:'radar',data:{labels:cfg.radar.labels,datasets:[{label:'Nivel',data:cfg.radar.values,borderColor:'#1e3a8a',backgroundColor:'rgba(30,58,138,0.2)',pointBackgroundColor:'#1e3a8a'}]},options:{responsive:true,maintainAspectRatio:false,scales:{r:{suggestedMin:0,suggestedMax:10,ticks:{stepSize:2}}}}});
  }
}

(async()=>{
  const cfg = await loadConfig();
  fillHeader(cfg);
  renderTimeline(cfg);
  renderAchievements(cfg);
  renderSkills(cfg);
  renderCharts(cfg);
})();

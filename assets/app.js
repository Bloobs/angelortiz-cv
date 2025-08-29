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

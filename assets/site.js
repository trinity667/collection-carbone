// La page d'accueil : les logiciels à tester (apps.json, tenu par le tableau de bord) et les contacts (config.js).
(() => {
  const C = window.CC.contact;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const ICON = {
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.1 5.1 0 001.1 2.7 11.7 11.7 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.1-.2-.2-.4-.3z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 2h-3.3v13.2a2.9 2.9 0 11-2.9-2.9c.3 0 .6 0 .9.1V9a6.3 6.3 0 105.3 6.2V8.6a7.8 7.8 0 004.4 1.4V6.7A4.4 4.4 0 0116.6 2z"/></svg>',
    in: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9.5h4V21H3zM10 9.5h3.8v1.6h.1a4.2 4.2 0 013.8-2c4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/></svg>',
    gh: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3a2.7 2.7 0 00-1.1-1.5c-.9-.6.1-.6.1-.6a2.1 2.1 0 011.5 1 2.2 2.2 0 003 .9 2.2 2.2 0 01.6-1.4c-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 011-2.7 3.6 3.6 0 01.1-2.6s.8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1a3.6 3.6 0 01.1 2.6 3.9 3.9 0 011 2.7c0 3.9-2.4 4.7-4.6 5a2.4 2.4 0 01.7 1.9V21c0 .3.2.6.7.5A10 10 0 0012 2z"/></svg>',
  };
  const link = (href, ic, b, span) => `<a class="contact" href="${esc(href)}" target="_blank" rel="noopener"><span class="ic">${ICON[ic]}</span><span><b>${esc(b)}</b><span>${esc(span)}</span></span></a>`;
  const wa = (n, text) => `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
  document.getElementById('contacts').innerHTML = [
    ...C.whatsapp.map((w) => link(wa(w.num, 'Bonjour Collection Carbone,'), 'wa', 'WhatsApp', w.label)),
    link(`mailto:${C.email}`, 'mail', 'E-mail', C.email),
    link(C.tiktok.url, 'tiktok', 'TikTok', C.tiktok.label),
    link(C.linkedin.url, 'in', 'LinkedIn', C.linkedin.label),
    link(C.github.url, 'gh', 'GitHub', C.github.label),
  ].join('');
  document.getElementById('foot-links').innerHTML = [`<a href="${esc(C.linkedin.url)}" target="_blank" rel="noopener">LinkedIn</a>`, `<a href="${esc(C.tiktok.url)}" target="_blank" rel="noopener">TikTok</a>`, `<a href="${esc(C.github.url)}" target="_blank" rel="noopener">GitHub</a>`].join(' · ');
  document.getElementById('y').textContent = new Date().getFullYear();

  const box = document.getElementById('apps');
  fetch('apps.json?t=' + Date.now()).then((r) => r.json()).then((apps) => {
    const list = (Array.isArray(apps) ? apps : []).filter((a) => a.statut !== 'masque');
    if (!list.length) { box.innerHTML = '<div class="empty">Aucun logiciel à tester pour le moment. Revenez bientôt !</div>'; return; }
    box.innerHTML = list.map((a) => {
      const open = a.statut !== 'ferme' && a.fichier;
      const steps = (a.installation?.length ? a.installation : ['Téléchargez le fichier.', 'Extrayez-le (clic droit, « Extraire tout… »).', 'Lancez le programme .exe du dossier.']).map((s) => `<li>${esc(s)}</li>`).join('');
      const ask = wa(C.whatsapp[0].num, `Bonjour, je teste ${a.nom} ${a.version ?? ''} et voici mon retour : `);
      return `<article class="app">
        <div class="body">
          ${a.image ? `<div class="shot" style="background-image:url('${esc(a.image)}');margin:-28px -28px 22px"></div>` : ''}
          <span class="eyebrow">${esc(a.edition || 'Version d’essai')}</span>
          <h3 style="font-size:1.6rem">${esc(a.nom)}</h3>
          <p>${esc(a.accroche)}</p>
          <p class="muted">${esc(a.description)}</p>
          <div class="meta">${(a.parties ?? []).map((p) => `<span class="chip gold">${esc(p)}</span>`).join('')}</div>
        </div>
        <div class="side">
          <div class="meta" style="margin-top:0">
            ${a.version ? `<span class="chip">Version ${esc(a.version)}</span>` : ''}
            ${a.plateforme ? `<span class="chip">${esc(a.plateforme)}</span>` : ''}
            ${a.taille ? `<span class="chip">${esc(a.taille)}</span>` : ''}
            ${open ? '' : '<span class="chip off">Test fermé pour le moment</span>'}
          </div>
          <h3>Pour l’installer</h3>
          <ol>${steps}</ol>
          <div style="display:flex;flex-wrap:wrap;gap:10px">
            ${open ? `<a class="btn gold" href="${esc(a.fichier)}" rel="noopener">⬇ Télécharger l’essai</a>` : '<button class="btn gold" disabled>Bientôt disponible</button>'}
            <a class="btn ghost" href="${esc(ask)}" target="_blank" rel="noopener">Donner mon avis</a>
          </div>
        </div>
      </article>`;
    }).join('');
  }).catch(() => { box.innerHTML = '<div class="empty">La liste des logiciels n’a pas pu être chargée.</div>'; });
})();

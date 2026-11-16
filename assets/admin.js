// Le tableau de bord : la liste des logiciels à tester (apps.json du dépôt), chaque fichier dans une Release GitHub.
// Tout passe par l'API de GitHub avec le jeton de la personne, gardé dans ce navigateur seulement.
(() => {
  const { owner, repo, branch } = window.CC.github;
  const API = `https://api.github.com/repos/${owner}/${repo}`;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const PARTIES = ['Photo', 'Graphisme', 'Motion design', 'Montage', 'Son', 'Studio 3D', 'Données'];
  $('repo-name').textContent = $('repo-name2').textContent = `${owner}/${repo}`;
  $('f-parties').innerHTML = PARTIES.map((p) => `<label><input type="checkbox" value="${esc(p)}"> ${esc(p)}</label>`).join('');

  let token = '', apps = [], sha = null, editing = -1;
  const store = { get: () => { try { return sessionStorage.getItem('cc-token') || localStorage.getItem('cc-token') || ''; } catch { return ''; } },
    set: (t, keep) => { try { sessionStorage.setItem('cc-token', t); if (keep) localStorage.setItem('cc-token', t); } catch { /* private window */ } },
    clear: () => { try { sessionStorage.removeItem('cc-token'); localStorage.removeItem('cc-token'); } catch { /* */ } } };
  const msg = (id, text, ok) => { const m = $(id); m.textContent = text; m.className = 'msg ' + (ok === true ? 'ok' : ok === false ? 'err' : ''); };
  async function gh(path, opt = {}) {
    const r = await fetch(path.startsWith('http') ? path : API + path, { ...opt, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(opt.headers ?? {}) } });
    if (!r.ok && r.status !== 404) { let e = ''; try { e = (await r.json()).message; } catch { /* */ } throw new Error(`${r.status} ${e}`); }
    return r.status === 404 ? null : r.status === 204 ? {} : r.json();
  }
  const b64 = (text) => btoa(String.fromCharCode(...new TextEncoder().encode(text)));
  const fromB64 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, '')), (c) => c.charCodeAt(0)));
  const bufB64 = async (file) => { const b = new Uint8Array(await file.arrayBuffer()); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); };
  const slug = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'logiciel';
  const size = (n) => n > 1e9 ? (n / 1e9).toFixed(1) + ' Go' : (n / 1e6).toFixed(0) + ' Mo';

  async function load() {
    const f = await gh(`/contents/apps.json?ref=${branch}`);
    if (f) { sha = f.sha; apps = JSON.parse(fromB64(f.content)); } else { sha = null; apps = []; }
    draw();
  }
  async function saveList(label) {
    const r = await gh('/contents/apps.json', { method: 'PUT', body: JSON.stringify({ message: label, content: b64(JSON.stringify(apps, null, 2) + '\n'), branch, ...(sha ? { sha } : {}) }) });
    sha = r.content.sha;
  }
  function draw() {
    const S = { ouvert: 'Ouvert', ferme: 'Fermé', masque: 'Masqué' };
    $('list').innerHTML = apps.map((a, i) => `<div class="item"><div class="t"><b>${esc(a.nom)} <small>${esc(a.version ?? '')}</small></b><small>${esc(S[a.statut] ?? a.statut)} · ${esc((a.parties ?? []).join(', ') || 'toutes les parties')}${a.taille ? ' · ' + esc(a.taille) : ''}</small></div>
      <div class="acts"><button class="btn ghost" data-a="edit" data-i="${i}">Modifier</button><button class="btn ghost" data-a="statut" data-i="${i}">${a.statut === 'ouvert' ? 'Fermer le test' : 'Ouvrir le test'}</button><button class="btn ghost" data-a="masque" data-i="${i}">${a.statut === 'masque' ? 'Afficher' : 'Masquer'}</button><button class="btn ghost" data-a="up" data-i="${i}" title="Monter">↑</button>${a.fichier ? `<a class="btn ghost" href="${esc(a.fichier)}" target="_blank" rel="noopener">Fichier ↗</a>` : ''}<button class="btn ghost" data-a="del" data-i="${i}">Supprimer</button></div></div>`).join('') || '<div class="empty">Aucun logiciel pour le moment : « ＋ Ajouter un logiciel ».</div>';
  }
  $('list').onclick = async (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return; const i = Number(b.dataset.i), a = apps[i];
    if (b.dataset.a === 'edit') return openForm(i);
    if (b.dataset.a === 'del' && !confirm(`Retirer « ${a.nom} » du site ? (Le fichier reste dans la Release GitHub.)`)) return;
    if (b.dataset.a === 'del') apps.splice(i, 1);
    if (b.dataset.a === 'statut') a.statut = a.statut === 'ouvert' ? 'ferme' : 'ouvert';
    if (b.dataset.a === 'masque') a.statut = a.statut === 'masque' ? 'ouvert' : 'masque';
    if (b.dataset.a === 'up') { if (i === 0) return; [apps[i - 1], apps[i]] = [apps[i], apps[i - 1]]; }
    try { msg('board-msg', 'Enregistrement…'); await saveList(`Tableau de bord : ${a.nom}`); draw(); msg('board-msg', 'Enregistré. Le site se met à jour d’ici une à deux minutes.', true); }
    catch (err) { msg('board-msg', 'Échec : ' + err.message, false); await load(); }
  };

  function openForm(i) {
    editing = i; const a = i >= 0 ? apps[i] : { statut: 'ouvert', edition: 'Version d’essai', plateforme: 'Windows 10 ou 11 (64 bits)', parties: [], installation: ['Téléchargez le fichier .zip.', 'Clic droit sur le fichier, puis « Extraire tout… ».', 'Ouvrez le dossier extrait et lancez le programme .exe.', 'Si Windows affiche « Windows a protégé votre ordinateur », cliquez sur « Informations complémentaires », puis « Exécuter quand même ».'] };
    $('form-title').textContent = i >= 0 ? `Modifier « ${a.nom} »` : 'Ajouter un logiciel';
    for (const k of ['nom', 'version', 'edition', 'statut', 'accroche', 'description', 'plateforme', 'taille', 'fichier']) $('f-' + k).value = a[k] ?? '';
    $('f-installation').value = (a.installation ?? []).join('\n');
    const known = new Set(a.parties ?? []);
    $('f-parties').querySelectorAll('input').forEach((c) => { c.checked = known.has(c.value); known.delete(c.value); });
    $('f-parties-autres').value = [...known].join(', ');
    $('f-file').value = ''; $('f-imgfile').value = ''; msg('form-msg', '');
    $('form').classList.remove('hidden'); $('form').scrollIntoView({ behavior: 'smooth' });
  }
  $('new').onclick = () => openForm(-1);
  $('cancel').onclick = () => $('form').classList.add('hidden');

  $('save').onclick = async () => {
    const v = (k) => $('f-' + k).value.trim();
    if (!v('nom')) return msg('form-msg', 'Il faut un nom.', false);
    const old = editing >= 0 ? apps[editing] : null;
    const a = { ...(old ?? {}), id: old?.id ?? slug(v('nom')), nom: v('nom'), version: v('version'), edition: v('edition'), statut: v('statut'), accroche: v('accroche'), description: v('description'), plateforme: v('plateforme'), taille: v('taille'), fichier: v('fichier'),
      parties: [...[...$('f-parties').querySelectorAll('input:checked')].map((c) => c.value), ...v('parties-autres').split(',').map((s) => s.trim()).filter(Boolean)],
      installation: v('installation').split('\n').map((s) => s.trim()).filter(Boolean), date: new Date().toISOString().slice(0, 10) };
    const btn = $('save'); btn.disabled = true;
    try {
      // the picture: kept in the site itself (assets/apps)
      const img = $('f-imgfile').files[0];
      if (img) {
        msg('form-msg', 'Envoi de l’image…');
        const path = `assets/apps/${a.id}.${img.name.split('.').pop().toLowerCase()}`, cur = await gh(`/contents/${path}?ref=${branch}`);
        await gh(`/contents/${path}`, { method: 'PUT', body: JSON.stringify({ message: `Image de ${a.nom}`, content: await bufB64(img), branch, ...(cur ? { sha: cur.sha } : {}) }) });
        a.image = path;
      }
      // the file: in a Release named after the program and its version
      const file = $('f-file').files[0];
      if (file) {
        const tag = `${a.id}-v${a.version || '1'}`.replace(/[^\w.-]+/g, '-'), name = file.name.replace(/\s+/g, '-');
        msg('form-msg', 'Préparation de la Release…');
        let rel = await gh(`/releases/tags/${encodeURIComponent(tag)}`);
        if (!rel) rel = await gh('/releases', { method: 'POST', body: JSON.stringify({ tag_name: tag, target_commitish: branch, name: `${a.nom} ${a.version} (${a.edition || 'essai'})`, body: a.description || a.accroche || '', draft: false, prerelease: true }) });
        a.fichier = `https://github.com/${owner}/${repo}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(name)}`;
        a.taille = size(file.size);
        const same = rel.assets?.find((x) => x.name === name); if (same) await gh(`/releases/assets/${same.id}`, { method: 'DELETE' });
        msg('form-msg', `Envoi du fichier (${size(file.size)})… gardez cette page ouverte.`);
        try {
          await gh(`https://uploads.github.com/repos/${owner}/${repo}/releases/${rel.id}/assets?name=${encodeURIComponent(name)}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file });
        } catch (err) {
          // the browser could not send it (size, network): the Release page takes it by hand, the link is already right
          window.open(rel.html_url.replace('/tag/', '/edit/'), '_blank');
          msg('form-msg', `Le navigateur n’a pas pu envoyer le fichier (${err.message}). La page de la Release est ouverte : glissez-y « ${name} », puis « Update release ». La fiche est enregistrée quand même.`, false);
        }
      }
      if (editing >= 0) apps[editing] = a; else apps.unshift(a);
      await saveList(`${editing >= 0 ? 'Mise à jour' : 'Ajout'} : ${a.nom} ${a.version}`);
      draw();
      if (!$('form-msg').classList.contains('err')) { msg('form-msg', 'Publié. Le site se met à jour d’ici une à deux minutes.', true); setTimeout(() => $('form').classList.add('hidden'), 1500); }
    } catch (err) { msg('form-msg', 'Échec : ' + err.message, false); }
    btn.disabled = false;
  };

  async function connect(t, keep) {
    token = t; msg('login-msg', 'Connexion…');
    try {
      const r = await gh(''); if (!r) throw new Error(`le dépôt ${owner}/${repo} est introuvable avec ce jeton`);
      if (r.permissions && !r.permissions.push) throw new Error('ce jeton ne peut pas écrire dans le dépôt (permission Contents : Read and write)');
      store.set(t, keep); await load();
      $('login').classList.add('hidden'); $('board').classList.remove('hidden'); $('logout').classList.remove('hidden');
    } catch (err) { token = ''; msg('login-msg', 'Connexion impossible : ' + err.message, false); }
  }
  $('connect').onclick = () => { const t = $('token').value.trim(); if (t) connect(t, $('remember').checked); };
  $('logout').onclick = (e) => { e.preventDefault(); store.clear(); location.reload(); };
  const saved = store.get(); if (saved) connect(saved, false);
})();

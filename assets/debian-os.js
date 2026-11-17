/* ==========================================================
   Portfolio Thomas Popelka — bureau Debian
   Démarrage (GRUB → boot → session), gestionnaire de fenêtres,
   Fichiers, terminal avec agent IA.
   ========================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.matchMedia('(max-width:760px)').matches; };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  /* ======================================================== icônes */
  var G = {
    user: '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/>',
    badge: '<circle cx="12" cy="10" r="5.2"/><path d="M9 14.6 7.6 21l4.4-2 4.4 2-1.4-6.4"/>',
    case: '<rect x="3.5" y="7.5" width="17" height="12" rx="1.6"/><path d="M8.5 7.5V6a1.6 1.6 0 0 1 1.6-1.6h3.8A1.6 1.6 0 0 1 15.5 6v1.5M3.5 12.5h17"/>',
    cube: '<path d="M3.5 7.5 12 3.5l8.5 4v9l-8.5 4-8.5-4Z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.6"/><path d="m4 7 8 6 8-6"/>',
    home: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10.5V19h4.5v-5h3v5H18v-8.5"/>',
    doc: '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6"/>'
  };
  function folder(glyph, back, front) {
    return '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' +
      '<path d="M4 11a4 4 0 0 1 4-4h10.5l4 4H40a4 4 0 0 1 4 4v21a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="' + back + '"/>' +
      '<path d="M4 18a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="' + front + '"/>' +
      '<path d="M8 14h32a4 4 0 0 1 4 4v1H4v-1a4 4 0 0 1 4-4z" fill="#fff" opacity=".18"/>' +
      (glyph ? '<g transform="translate(15 17.5) scale(.75)" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" opacity=".95">' + G[glyph] + '</g>' : '') +
      '</svg>';
  }
  var ICONS = {
    apropos: folder('user', '#A80030', '#D70A53'),
    competences: folder('grid', '#A80030', '#D70A53'),
    certifications: folder('badge', '#A80030', '#D70A53'),
    experiences: folder('case', '#A80030', '#D70A53'),
    projets: folder('cube', '#A80030', '#D70A53'),
    contact: folder('mail', '#A80030', '#D70A53'),
    fichiers: folder('home', '#5E5C64', '#9A9996'),
    folder: folder('', '#A80030', '#D70A53'),
    terminal: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="6" width="40" height="36" rx="8" fill="#2B2836"/><rect x="4" y="6" width="40" height="8" rx="4" fill="#3D3846"/><rect x="7" y="14" width="34" height="25" rx="2" fill="#171421"/><path d="m12 21 6 5-6 5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 32h10" stroke="#D70A53" stroke-width="2.6" stroke-linecap="round"/></svg>',
    pdf: '<svg class="ico" viewBox="0 0 48 48" aria-hidden="true"><path d="M11 4h18l10 10v30H11z" fill="#fff" stroke="#C0BFBC"/><path d="M29 4v10h10" fill="#E8E8EA" stroke="#C0BFBC"/><rect x="7" y="26" width="26" height="11" rx="2" fill="#D70A53"/><text x="20" y="34.2" text-anchor="middle" font-family="Cantarell,sans-serif" font-size="7.5" font-weight="700" fill="#fff">PDF</text></svg>'
  };

  /* ======================================================== applications */
  var APPS = {
    apropos:        { title: 'À propos', kind: 'content', w: 780, h: 580 },
    competences:    { title: 'Compétences', kind: 'content', w: 760, h: 600 },
    certifications: { title: 'Certifications', kind: 'content', w: 760, h: 600 },
    experiences:    { title: 'Expériences', kind: 'content', w: 820, h: 620 },
    projets:        { title: 'Projets', kind: 'content', w: 740, h: 560 },
    contact:        { title: 'Contact', kind: 'content', w: 640, h: 600 },
    terminal:       { title: 'Terminal', kind: 'terminal', w: 760, h: 480 },
    fichiers:       { title: 'Fichiers', kind: 'files', w: 760, h: 480 }
  };
  var DESK_ICONS = ['apropos', 'competences', 'certifications', 'experiences', 'projets', 'contact', 'terminal', 'fichiers', 'cv'];
  var DOCK = ['apropos', 'competences', 'certifications', 'experiences', 'projets', 'contact', '|', 'terminal', 'fichiers'];
  var FILES = {
    'cv.pdf': 'cv.pdf',
    'CCNA1.pdf': 'CCNA1.pdf',
    'certficatio_stormshield.pdf': 'certficatio_stormshield.pdf',
    'certification_stormshield_csne.pdf': 'certification_stormshield_csne.pdf'
  };

  /* liens automatiques sur les puces d'outils */
  var TOOL_LINKS = [
    [/^Windows Server$/, 'https://www.microsoft.com/windows-server'], [/^Windows$/, 'https://www.microsoft.com/windows'],
    [/^Debian$/, 'https://www.debian.org'], [/^Ubuntu$/, 'https://ubuntu.com'], [/^VMware$/, 'https://www.vmware.com'],
    [/^VirtualBox$/, 'https://www.virtualbox.org'], [/^Wireshark$/, 'https://www.wireshark.org'], [/^Nmap$/, 'https://nmap.org'],
    [/^VS Code$/, 'https://code.visualstudio.com'], [/^Git \/ GitHub$/, 'https://github.com/Ptan07'], [/^PHP$/, 'https://www.php.net'],
    [/^MySQL$/, 'https://www.mysql.com'], [/^PostgreSQL$/, 'https://www.postgresql.org'], [/^Python$/, 'https://www.python.org'],
    [/^Bash$/, 'https://www.gnu.org/software/bash/'], [/^PowerShell$/, 'https://learn.microsoft.com/powershell/'],
    [/^(Word|Excel|PowerPoint|Outlook|Microsoft 365)$/, 'https://www.microsoft.com/microsoft-365'],
    [/^MicroSIP$/, 'https://www.microsip.org'], [/^ISL$/, 'https://www.islonline.com'],
    [/^GPO$/, 'https://fr.wikipedia.org/wiki/Strat%C3%A9gie_de_groupe'], [/^VPN$/, 'https://fr.wikipedia.org/wiki/R%C3%A9seau_priv%C3%A9_virtuel'],
    [/^Active Directory$/, 'https://fr.wikipedia.org/wiki/Active_Directory'], [/^DNS$/, 'https://fr.wikipedia.org/wiki/Domain_Name_System'],
    [/^DHCP$/, 'https://fr.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol'], [/^BigFix$/, 'https://www.hcl-software.com/bigfix'],
    [/^Sécurité SI$/, 'https://cyber.gouv.fr'], [/^Firewall$/, 'https://www.stormshield.com'],
    [/^PKI$/, 'https://fr.wikipedia.org/wiki/Infrastructure_%C3%A0_cl%C3%A9s_publiques'], [/^VPN IPsec$/, 'https://fr.wikipedia.org/wiki/IPsec'],
    [/^Apache sous Debian$/, 'https://httpd.apache.org'], [/^Arduino/, 'https://www.arduino.cc'], [/Nominatim$/, 'https://nominatim.org'],
    [/^Matplotlib/, 'https://matplotlib.org'], [/^Manifest \+ service worker/, 'https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps']
  ];
  $$('#content .pills span').forEach(function (s) {
    var t = s.textContent.trim();
    for (var i = 0; i < TOOL_LINKS.length; i++) {
      if (TOOL_LINKS[i][0].test(t)) {
        var a = document.createElement('a'); a.href = TOOL_LINKS[i][1]; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = t;
        s.replaceWith(a); break;
      }
    }
  });

  /* ======================================================== notifications */
  var notifEl = $('#notif'), notifT;
  function notify(msg) { notifEl.textContent = msg; notifEl.classList.add('show'); clearTimeout(notifT); notifT = setTimeout(function () { notifEl.classList.remove('show'); }, 2600); }

  /* ======================================================== horloge */
  function tick() {
    var d = new Date();
    var time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    var day = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    $('#clock').innerHTML = '<span class="cday">' + esc(day) + '&nbsp; </span>' + esc(time);
    $('#loginTime').textContent = time;
    $('#loginDate').textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  tick(); setInterval(tick, 15000);

  /* ======================================================== fond d'écran (spirale tracée) */
  (function () {
    var svg = $('#spiral'), out = '';
    [[1, 'rgba(215,10,83,.55)', 34], [0.93, 'rgba(255,255,255,.07)', 10], [1.07, 'rgba(168,0,48,.5)', 6]].forEach(function (cfg) {
      var pts = [];
      for (var t = 0.6; t < 4.4 * Math.PI; t += 0.04) {
        var r = 26 * Math.exp(0.205 * t) * cfg[0];
        pts.push((Math.cos(-t) * r).toFixed(1) + ',' + (Math.sin(-t) * r * 0.97).toFixed(1));
      }
      out += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + cfg[1] + '" stroke-width="' + cfg[2] + '" stroke-linecap="round"/>';
    });
    svg.innerHTML = out;
  })();

  /* ======================================================== gestionnaire de fenêtres */
  var ws = $('#windows'), wins = {}, zTop = 10, cascade = 0;

  function contentNode(id) { return $('#content section[data-app="' + id + '"]') || $('[data-home="' + id + '"]'); }

  function openApp(id, opts) {
    opts = opts || {};
    if (id === 'cv') { window.open('cv.pdf', '_blank'); return; }
    var app = APPS[id]; if (!app) return;
    $('#overview').hidden = true; $('#btnActivities').classList.remove('on');
    var w = wins[id];
    if (w) { w.el.hidden = false; w.el.classList.remove('minimizing'); w.el.style.transform = ''; focusWin(id); if (opts.after) opts.after(w); return w; }

    var el = document.createElement('section');
    el.className = 'window' + (app.kind === 'terminal' ? ' is-term' : '');
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', app.title);
    el.innerHTML =
      '<header class="w-head"><div class="w-left">' + (ICONS[id] || '') + '</div>' +
      '<div class="w-title">' + esc(app.title) + '</div>' +
      '<div class="w-ctrl">' +
        '<button class="mn" aria-label="Réduire"><svg viewBox="0 0 12 12"><path d="M2.5 8.5h7" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
        '<button class="mx" aria-label="Agrandir"><svg viewBox="0 0 12 12"><rect x="2.5" y="2.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button>' +
        '<button class="x" aria-label="Fermer"><svg viewBox="0 0 12 12"><path d="m3 3 6 6M9 3 3 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
      '</div></header><div class="w-body"></div><div class="w-resize" aria-hidden="true"></div>';
    $('#windows').appendChild(el);

    var r = ws.getBoundingClientRect();
    var W = Math.min(app.w, r.width - 40), H = Math.min(app.h, r.height - 110);
    var x = opts.x != null ? opts.x : Math.max(10, (r.width - W) / 2 + (cascade % 5) * 28 - 56);
    var y = opts.y != null ? opts.y : Math.max(8, (r.height - 90 - H) / 2 + (cascade % 5) * 24 - 30);
    cascade++;
    el.style.width = W + 'px'; el.style.height = H + 'px'; el.style.left = x + 'px'; el.style.top = y + 'px';

    w = wins[id] = { id: id, el: el, body: $('.w-body', el) };
    if (app.kind === 'content') { var n = contentNode(id); n.setAttribute('data-home', id); w.body.appendChild(n); bindContent(n); }
    if (app.kind === 'files') buildFiles(w);
    if (app.kind === 'terminal') w.term = new Terminal(w);

    $('.x', el).onclick = function () { closeWin(id); };
    $('.mx', el).onclick = function () { el.classList.toggle('max'); };
    $('.mn', el).onclick = function () { minimizeWin(id); };
    var head = $('.w-head', el);
    head.addEventListener('dblclick', function (e) { if (!e.target.closest('button')) el.classList.toggle('max'); });
    el.addEventListener('pointerdown', function () { focusWin(id); }, true);
    makeDraggable(el, head); makeResizable(el, $('.w-resize', el));
    focusWin(id); updateDock();
    if (opts.after) opts.after(w);
    return w;
  }

  function focusWin(id) {
    Object.keys(wins).forEach(function (k) { wins[k].el.classList.toggle('inactive', k !== id); });
    var w = wins[id]; if (!w) return;
    w.el.style.zIndex = ++zTop;
    if (w.term && !isMobile()) setTimeout(function () { w.term.focus(); }, 0);
  }

  function closeWin(id) {
    var w = wins[id]; if (!w) return;
    if (w.term) w.term.abort();
    w.el.classList.add('closing');
    setTimeout(function () {
      var n = $('[data-home="' + id + '"]', w.el); if (n) $('#content').appendChild(n);
      w.el.remove(); delete wins[id]; updateDock();
    }, reduce ? 0 : 150);
  }

  function minimizeWin(id) {
    var w = wins[id], btn = $('#dock [data-app="' + id + '"]'); if (!w) return;
    if (btn && !reduce) {
      var a = w.el.getBoundingClientRect(), b = btn.getBoundingClientRect();
      w.el.classList.add('minimizing');
      w.el.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top - a.top - a.height / 2) + 'px) scale(.08)';
      setTimeout(function () { w.el.hidden = true; }, 280);
    } else w.el.hidden = true;
  }

  function makeDraggable(el, handle) {
    handle.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('button') || el.classList.contains('max') || isMobile()) return;
      var sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop, r = ws.getBoundingClientRect();
      handle.setPointerCapture(e.pointerId);
      function mv(ev) {
        el.style.left = Math.min(Math.max(ox + ev.clientX - sx, -el.offsetWidth + 80), r.width - 80) + 'px';
        el.style.top = Math.min(Math.max(oy + ev.clientY - sy, 0), r.height - 46) + 'px';
      }
      function up() { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', up); }
      handle.addEventListener('pointermove', mv); handle.addEventListener('pointerup', up);
    });
  }
  function makeResizable(el, grip) {
    grip.addEventListener('pointerdown', function (e) {
      e.preventDefault(); var sx = e.clientX, sy = e.clientY, w0 = el.offsetWidth, h0 = el.offsetHeight;
      grip.setPointerCapture(e.pointerId);
      function mv(ev) { el.style.width = Math.max(320, w0 + ev.clientX - sx) + 'px'; el.style.height = Math.max(220, h0 + ev.clientY - sy) + 'px'; }
      function up() { grip.removeEventListener('pointermove', mv); grip.removeEventListener('pointerup', up); }
      grip.addEventListener('pointermove', mv); grip.addEventListener('pointerup', up);
    });
  }

  /* interactions dans les fenêtres de contenu */
  function bindContent(root) {
    if (root.dataset.bound) return; root.dataset.bound = '1';
    $$('[data-open]', root).forEach(function (b) { b.addEventListener('click', function () { openApp(b.dataset.open); }); });
    $$('[data-copy]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.copy;
        (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () { notify('Adresse copiée : ' + v); }, function () { notify(v); });
      });
    });
    $$('.tabs button', root).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.tabs button', root).forEach(function (x) { x.classList.toggle('on', x === b); });
        $$('[data-pane]', root).forEach(function (p) { p.hidden = p.dataset.pane !== b.dataset.tab; });
      });
    });
  }

  /* ======================================================== Fichiers */
  function buildFiles(w) {
    var places = {
      home: { label: 'Dossier personnel', path: '/home/thomas', items: ['apropos', 'competences', 'certifications', 'experiences', 'projets', 'contact', 'f:certificats', 'cv.pdf'] },
      docs: { label: 'Documents', path: '/home/thomas/Documents', items: ['cv.pdf'] },
      certs: { label: 'Certificats', path: '/home/thomas/certificats', items: ['CCNA1.pdf', 'certficatio_stormshield.pdf', 'certification_stormshield_csne.pdf'] }
    };
    w.body.innerHTML = '<div class="files"><aside></aside><div class="pane"><p class="path"></p><div class="fgrid"></div></div></div>';
    var aside = $('aside', w.body);
    Object.keys(places).forEach(function (k) {
      var b = document.createElement('button'); b.dataset.place = k;
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (k === 'home' ? G.home : k === 'docs' ? G.doc : G.badge) + '</svg>' + places[k].label;
      b.onclick = function () { show(k); }; aside.appendChild(b);
    });
    function show(k) {
      $$('button', aside).forEach(function (b) { b.classList.toggle('on', b.dataset.place === k); });
      $('.path', w.body).textContent = places[k].path;
      var grid = $('.fgrid', w.body); grid.innerHTML = '';
      places[k].items.forEach(function (it) {
        var node;
        if (FILES[it]) {
          node = document.createElement('a'); node.href = FILES[it]; node.target = '_blank'; node.innerHTML = ICONS.pdf + esc(it);
        } else if (it === 'f:certificats') {
          node = document.createElement('button'); node.innerHTML = ICONS.folder + 'certificats'; node.onclick = function () { show('certs'); };
        } else {
          node = document.createElement('button'); node.innerHTML = ICONS[it] + esc(APPS[it].title); node.onclick = function () { openApp(it); };
        }
        grid.appendChild(node);
      });
    }
    show('home');
  }

  /* ======================================================== bureau : icônes, dock, activités */
  function iconBtn(id, cls) {
    var b = document.createElement('button'); b.className = cls; b.dataset.app = id;
    var label = id === 'cv' ? 'CV.pdf' : APPS[id].title;
    b.innerHTML = (id === 'cv' ? ICONS.pdf : ICONS[id]) + '<span>' + esc(label) + '</span>';
    return b;
  }
  DESK_ICONS.forEach(function (id) {
    var b = iconBtn(id, 'dicon');
    b.addEventListener('click', function () {
      if (isMobile() || b.classList.contains('sel')) { openApp(id); b.classList.remove('sel'); return; }
      $$('.dicon').forEach(function (x) { x.classList.toggle('sel', x === b); });
    });
    b.addEventListener('dblclick', function () { openApp(id); b.classList.remove('sel'); });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); openApp(id); } });
    $('#icons').appendChild(b);
  });
  DOCK.forEach(function (id) {
    if (id === '|') { var s = document.createElement('span'); s.className = 'sep'; $('#dock').appendChild(s); return; }
    var b = document.createElement('button'); b.dataset.app = id; b.setAttribute('aria-label', APPS[id].title);
    b.innerHTML = ICONS[id] + '<span class="tip">' + esc(APPS[id].title) + '</span>';
    b.onclick = function () {
      var w = wins[id];
      if (w && !w.el.hidden && w.el.style.zIndex == zTop && !w.el.classList.contains('inactive')) minimizeWin(id); else openApp(id);
    };
    $('#dock').appendChild(b);
  });
  function updateDock() { $$('#dock button').forEach(function (b) { b.classList.toggle('running', !!wins[b.dataset.app]); }); }

  var grid = $('#appGrid');
  Object.keys(APPS).concat(['cv']).forEach(function (id) {
    var b = iconBtn(id, ''); b.onclick = function () { openApp(id); }; grid.appendChild(b);
  });
  function toggleOverview(force) {
    var ov = $('#overview'), show = force != null ? force : ov.hidden;
    ov.hidden = !show; $('#btnActivities').classList.toggle('on', show);
    if (show) { $('#search').value = ''; filterApps(''); setTimeout(function () { $('#search').focus(); }, 30); }
  }
  function filterApps(q) { q = norm(q); $$('button', grid).forEach(function (b) { b.hidden = q && norm(b.textContent).indexOf(q) < 0; }); }
  $('#btnActivities').onclick = function () { toggleOverview(); };
  $('#search').addEventListener('input', function (e) { filterApps(e.target.value); });
  $('#search').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var first = $$('button', grid).filter(function (b) { return !b.hidden; })[0]; if (first) first.click(); }
  });
  $('#overview').addEventListener('click', function (e) { if (e.target.id === 'overview') toggleOverview(false); });
  $('#clock').onclick = function () { notify(new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })); };
  $('#workspace').addEventListener('click', function (e) { if (e.target.closest('.wallpaper')) $$('.dicon').forEach(function (x) { x.classList.remove('sel'); }); });

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.altKey && (e.key === 't' || e.key === 'T')) { e.preventDefault(); openApp('terminal'); }
    if (e.key === 'Escape' && !$('#overview').hidden) toggleOverview(false);
  });

  /* ======================================================== base de connaissances (mode hors ligne) */
  var KB = [
    { k: ['qui', 'presente', 'presentation', 'profil', 'resume', 'thomas', 'popelka', 'bonjour', 'salut', 'hello'],
      a: "Thomas Popelka est alternant administrateur & sécurité des systèmes et réseaux chez Groupe Si2A (centres de formation, Annecy) et étudiant en 3e année de BUT Réseaux & Télécommunications à l'IUT d'Annecy. Il s'intéresse à l'administration système, aux réseaux d'entreprise et à la cybersécurité — de la configuration d'un VLAN à l'analyse d'une vulnérabilité Active Directory." },
    { k: ['competence', 'skill', 'sait', 'maitrise', 'savoir', 'capable', 'technique', 'technos', 'technologie'],
      a: "Ses compétences couvrent cinq domaines :\n- Réseau : routeurs & switches, LAN/VLAN, routage OSPF, ACL, WAN/VPN, DNS/DHCP, analyse de trames Wireshark\n- Système : Windows Server (AD DS, GPO, DNS, DHCP), Debian/Ubuntu, VMware/VirtualBox, scripts Bash et PowerShell\n- Cybersécurité : reconnaissance (Whois, DNS, Nmap), analyse de vulnérabilités (CVE), notions de pentest Active Directory\n- Développement : HTML/CSS/JS, PHP, MySQL/PostgreSQL, Python\n- Helpdesk : support N1/N2, télémaintenance, interventions terrain, Microsoft 365 & Exchange" },
    { k: ['reseau', 'cisco', 'vlan', 'ospf', 'routage', 'switch', 'routeur', 'wireshark', 'acl', 'wan', 'lan'],
      a: "Côté réseau : configuration de routeurs et switches, LAN/VLAN, routage OSPF, ACL, WAN et VPN, DNS/DHCP et analyse de trames avec Wireshark. Il a validé le CCNA 1 (Cisco Networking Academy) et les certifications Stormshield SNS et CSNE." },
    { k: ['systeme', 'windows', 'server', 'linux', 'debian', 'ubuntu', 'active directory', 'ad', 'gpo', 'virtualisation', 'vmware', 'powershell', 'bash', 'script'],
      a: "Côté système : Windows Server (AD DS, GPO, DNS, DHCP), Linux Debian/Ubuntu pour les services de base, virtualisation VMware/VirtualBox et scripts d'automatisation Bash et PowerShell — par exemple la création automatisée d'environ 100 comptes Active Directory." },
    { k: ['securite', 'cyber', 'pentest', 'vulnerabilite', 'cve', 'nmap', 'firewall', 'pare-feu', 'anssi', 'goad', 'attaque'],
      a: "Côté cybersécurité : reconnaissance (Whois, DNS, Nmap), analyse de vulnérabilités (CVE), notions de pentest Active Directory pratiquées sur le lab GOAD avec Orange Cyberdefense, et administration de pare-feux Stormshield (certifications SNS et CSNE). Il a aussi suivi le MOOC SecNumacadémie de l'ANSSI." },
    { k: ['certif', 'diplome', 'ccna', 'stormshield', 'csne', 'sns', 'secnum', 'mooc'],
      a: "Il a 4 certifications :\n- MOOC SecNumacadémie — ANSSI\n- CCNA 1 — Introduction to Networks (Cisco Networking Academy)\n- Certification Stormshield Network Security (SNS)\n- CSNE — Certified Stormshield Network Expert (valable jusqu'au 12/11/2029)\nLes certificats sont dans l'application Fichiers, dossier certificats." },
    { k: ['experience', 'alternance', 'alternant', 'si2a', 'travail', 'emploi', 'poste', 'entreprise', 'actuel', 'helpdesk', 'support'],
      a: "Depuis 2025, il est alternant administrateur & sécurité des systèmes et réseaux chez Groupe Si2A (centres de formation). Il y gère l'ensemble du helpdesk : support téléphonique (MicroSIP), prise en main à distance (ISL), traitement des tickets, déploiement de GPO, problèmes Outlook/M365, gestion des accès VPN et maintenance des serveurs et du parc sur site." },
    { k: ['stage', 'visilab', 'geneve', 'suisse', 'meyrin'],
      a: "En 2025, il a fait un stage d'administrateur réseaux & systèmes chez VisilabGroup à Meyrin (Suisse) : gestion des postes Windows, support N1/N2, comptes et droits, déploiement logiciel (BigFix), diagnostic d'incidents réseau, configuration d'équipements, supervision du LAN et suivi des mises à jour de sécurité." },
    { k: ['projet', 'realisation', 'greenweather', 'meteo', 'fitness', 'pwa', 'wifi', 'location', 'voiture', 'lab'],
      a: "Quelques projets :\n- Automatisation Active Directory (scripts Bash & PowerShell, ~100 comptes, Apache sous Debian)\n- GreenWeatherCare : station météo connectée Arduino → Firebase avec interface web\n- Application fitness (PWA) : recherche d'exercices et carte des salles de sport\n- Simulation de déploiement WiFi en Python (Matplotlib, FFT, calcul d'atténuation)\n- En formation : lab de pentest AD (GOAD), infrastructure Windows Server, site de location de voitures en PHP/MySQL" },
    { k: ['formation', 'etude', 'ecole', 'iut', 'but', 'universite', 'annee'],
      a: "Il est en 3e année de BUT Réseaux & Télécommunications à l'IUT d'Annecy, en alternance chez Groupe Si2A." },
    { k: ['contact', 'joindre', 'mail', 'email', 'telephone', 'tel', 'appeler', 'numero', 'linkedin', 'github'],
      a: "Pour le contacter :\n- Email : Thomas.Popelka@etu.univ-smb.fr\n- Téléphone : 06 43 64 41 03\n- LinkedIn : https://www.linkedin.com/in/thomas-popelka-9a8055388\n- GitHub : https://github.com/Ptan07\nIl répond généralement sous 48h." },
    { k: ['disponible', 'disponibilite', 'recherche', 'cherche', 'recrut', 'embauche', 'quand', 'libre'],
      a: "Il est disponible pour une alternance ou un stage. Le plus simple pour en discuter : Thomas.Popelka@etu.univ-smb.fr ou LinkedIn." },
    { k: ['habite', 'localisation', 'ville', 'annecy', 'mobilite', 'permis', 'voiture', 'deplacer'],
      a: "Il est basé à Annecy (France) et a le permis B." },
    { k: ['cv', 'curriculum'],
      a: "Son CV est disponible ici : cv.pdf (tapez « open cv.pdf »)." }
  ];
  function localAnswer(q) {
    var n = ' ' + norm(q).replace(/[^a-z0-9@.+\- ]/g, ' ') + ' ', best = null, score = 0;
    KB.forEach(function (e) {
      var s = 0; e.k.forEach(function (k) { if (n.indexOf(k.length <= 3 ? ' ' + k + ' ' : k) >= 0) s += k.length > 4 ? 2 : 1; });
      if (s > score) { score = s; best = e; }
    });
    return best ? best.a : "Je n'ai pas cette information dans le portfolio. Le mieux est de demander directement à Thomas : Thomas.Popelka@etu.univ-smb.fr ou https://www.linkedin.com/in/thomas-popelka-9a8055388";
  }

  /* ======================================================== agent IA */
  var Agent = {
    history: [],
    endpoint: (window.PORTFOLIO_AI_ENDPOINT || '').trim(),
    online: function () { return !!this.endpoint; },
    reset: function () { this.history = []; },
    ask: function (q, onText, signal) {
      var self = this;
      this.history.push({ role: 'user', content: q });
      this.history = this.history.slice(-10);
      if (!this.endpoint) return this._local(q, onText, signal, false);
      var full = '';
      return fetch(this.endpoint, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: this.history }), signal: signal
      }).then(function (res) {
        if (res.status === 429) throw new Error('rate');
        if (!res.ok || !res.body) throw new Error('http ' + res.status);
        var reader = res.body.getReader(), dec = new TextDecoder(), buf = '';
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) return;
            buf += dec.decode(r.value, { stream: true });
            var parts = buf.split('\n\n'); buf = parts.pop();
            parts.forEach(function (ev) {
              ev.split('\n').forEach(function (line) {
                if (line.indexOf('data:') !== 0) return;
                var d; try { d = JSON.parse(line.slice(5)); } catch (e) { return; }
                if (d.type === 'content_block_delta' && d.delta && d.delta.type === 'text_delta') { full += d.delta.text; onText(d.delta.text); }
                if (d.type === 'error') throw new Error('api');
              });
            });
            return pump();
          });
        }
        return pump();
      }).then(function () {
        self.history.push({ role: 'assistant', content: full || '…' });
        return { mode: 'ia' };
      }).catch(function (err) {
        if (err.name === 'AbortError') { self.history.pop(); throw err; }
        if (full) { self.history.push({ role: 'assistant', content: full }); return { mode: 'ia' }; }
        return self._local(q, onText, signal, err.message === 'rate' ? 'rate' : true);
      });
    },
    _local: function (q, onText, signal, failed) {
      var self = this, txt = localAnswer(q), i = 0;
      return new Promise(function (resolve, reject) {
        (function step() {
          if (signal && signal.aborted) { self.history.pop(); return reject(Object.assign(new Error('abort'), { name: 'AbortError' })); }
          if (i >= txt.length) { self.history.push({ role: 'assistant', content: txt }); return resolve({ mode: failed ? (failed === 'rate' ? 'rate' : 'fallback') : 'local' }); }
          var n = reduce ? txt.length : 3; onText(txt.slice(i, i + n)); i += n; setTimeout(step, 12);
        })();
      });
    }
  };

  /* ======================================================== terminal */
  var FS_TXT = {
    'a_propos.txt': [0, 9, 12], 'competences.txt': [1], 'certifications.txt': [5], 'experiences.txt': [6, 7], 'projets.txt': [8], 'contact.txt': [10, 11]
  };
  var HOME_LS = ['a_propos.txt', 'competences.txt', 'certifications.txt', 'experiences.txt', 'projets.txt', 'contact.txt', 'cv.pdf', 'certificats/'];
  var CERT_LS = ['CCNA1.pdf', 'certficatio_stormshield.pdf', 'certification_stormshield_csne.pdf'];
  var CMDS = ['help', 'whoami', 'neofetch', 'ls', 'cd', 'pwd', 'cat', 'open', 'clear', 'history', 'date', 'uname', 'contact', 'cv', 'ask', 'reset', 'echo', 'sudo', 'apt', 'exit', 'man'];
  var SUGGEST = ['Quelles sont ses compétences ?', 'Quelles certifications a-t-il ?', 'Que fait-il en alternance ?', 'Est-il disponible ?', 'Comment le contacter ?'];
  var LINK_RE = /(https?:\/\/[^\s)]+[^\s).,;:!?]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\b[\w_]+\.pdf\b)/g;

  function Terminal(win) {
    var self = this;
    this.win = win; this.cwd = '~'; this.hist = []; this.hi = 0; this.busy = false; this.ctrl = null;
    this.el = document.createElement('div'); this.el.className = 'term';
    win.body.appendChild(this.el);
    this.out = document.createElement('div'); this.el.appendChild(this.out);
    this.row = document.createElement('div'); this.row.className = 'prompt-row';
    this.ps = document.createElement('span'); this.row.appendChild(this.ps);
    this.input = document.createElement('input');
    this.input.setAttribute('aria-label', 'Commande ou question'); this.input.autocapitalize = 'off'; this.input.autocomplete = 'off'; this.input.spellcheck = false;
    this.row.appendChild(this.input); this.el.appendChild(this.row);
    this.setPrompt();
    this.el.addEventListener('click', function (e) { if (!e.target.closest('a,button') && !window.getSelection().toString()) self.focus(); });
    this.input.addEventListener('keydown', function (e) { self.key(e); });
    this.boot();
  }
  Terminal.prototype.focus = function () { this.input.focus({ preventScroll: true }); };
  Terminal.prototype.promptHTML = function () { return '<span class="u">thomas@debian</span>:<span class="p">' + esc(this.cwd) + '</span>$ '; };
  Terminal.prototype.setPrompt = function () { this.ps.innerHTML = this.promptHTML(); };
  Terminal.prototype.scroll = function () { this.el.scrollTop = this.el.scrollHeight; };
  Terminal.prototype.print = function (html, cls) { var d = document.createElement('div'); d.className = 'line' + (cls ? ' ' + cls : ''); d.innerHTML = html; this.out.appendChild(d); this.scroll(); return d; };
  Terminal.prototype.text = function (t, cls) { return this.print(linkify(t), cls); };
  function linkify(t) {
    return esc(t).replace(LINK_RE, function (m) {
      if (/^https?:/.test(m)) return '<a href="' + m + '" target="_blank" rel="noopener noreferrer">' + m + '</a>';
      if (m.indexOf('@') > 0) return '<a href="mailto:' + m + '">' + m + '</a>';
      if (FILES[m]) return '<a href="' + FILES[m] + '" target="_blank">' + m + '</a>';
      return m;
    });
  }
  function cleanMd(t) { return t.replace(/\*\*|__|`/g, '').replace(/^#+\s*/gm, ''); }

  Terminal.prototype.boot = function () {
    this.neofetch();
    this.print('Bienvenue sur le portfolio de <b>Thomas Popelka</b>.');
    this.print('Posez une question en français sur son parcours, l\'<span class="ai">agent IA</span> vous répond. Tapez <span class="y">help</span> pour les commandes.');
    this.chips();
  };
  Terminal.prototype.chips = function () {
    var self = this, d = this.print('', 'chips');
    SUGGEST.forEach(function (q) {
      var b = document.createElement('button'); b.textContent = q;
      b.onclick = function () { if (!self.busy) { self.input.value = q; self.submit(); } };
      d.appendChild(b);
    });
  };
  Terminal.prototype.neofetch = function () {
    var art = [
      '████████ ██████ ',
      '   ██    ██   ██',
      '   ██    ██████ ',
      '   ██    ██     ',
      '   ██    ██     '
    ].join('\n');
    var info = [
      ['', '<span class="u">thomas</span>@<span class="u">debian</span>'],
      ['', '<span class="d">-------------</span>'],
      ['OS', 'Debian GNU/Linux 13 (trixie) x86_64'],
      ['Rôle', 'Alternant admin & sécurité systèmes et réseaux'],
      ['Entreprise', 'Groupe Si2A — Centres de formation'],
      ['Formation', 'BUT R&T, 3ᵉ année — IUT d\'Annecy'],
      ['Lieu', 'Annecy, France · Permis B'],
      ['Certifs', 'ANSSI · CCNA 1 · Stormshield SNS · CSNE'],
      ['Shell', 'bash 5.2'],
      ['Agent IA', Agent.online() ? '<span class="u">en ligne</span>' : '<span class="y">hors ligne</span> (réponses à partir du portfolio)']
    ].map(function (r) { return r[0] ? '<span class="k">' + r[0] + '</span>: ' + (r[1].indexOf('<') === 0 ? r[1] : esc(r[1])) : r[1]; }).join('\n');
    var blocks = ['#171421', '#C01C28', '#26A269', '#A2734C', '#12488B', '#A347BA', '#2AA1B3', '#D0CFCC'].map(function (c) { return '<span style="background:' + c + '">   </span>'; }).join('');
    this.print('<div class="neo"><pre>' + esc(art) + '</pre><div>' + info + '\n\n' + blocks + '</div></div>');
  };

  Terminal.prototype.key = function (e) {
    var self = this;
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && !window.getSelection().toString()) {
      e.preventDefault();
      if (this.busy) { this.abort(); return; }
      this.print(this.promptHTML() + esc(this.input.value) + '^C'); this.input.value = ''; return;
    }
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); this.out.innerHTML = ''; return; }
    if (this.busy) { if (e.key === 'Enter') e.preventDefault(); return; }
    if (e.key === 'Enter') { e.preventDefault(); this.submit(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (this.hi > 0) { this.hi--; this.input.value = this.hist[this.hi] || ''; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (this.hi < this.hist.length) { this.hi++; this.input.value = this.hist[this.hi] || ''; } }
    else if (e.key === 'Tab') { e.preventDefault(); this.complete(); }
    setTimeout(function () { self.scroll(); }, 0);
  };
  Terminal.prototype.complete = function () {
    var v = this.input.value, parts = v.split(' ');
    var pool = parts.length === 1 ? CMDS : (this.cwd === '~' ? HOME_LS : CERT_LS).concat(Object.keys(APPS));
    var last = parts[parts.length - 1], m = pool.filter(function (c) { return c.indexOf(last) === 0; });
    if (m.length === 1) { parts[parts.length - 1] = m[0] + (m[0].slice(-1) === '/' ? '' : ' '); this.input.value = parts.join(' '); }
    else if (m.length > 1) { this.print(this.promptHTML() + esc(v)); this.print(esc(m.join('   '))); }
  };
  Terminal.prototype.abort = function () { if (this.ctrl) this.ctrl.abort(); };

  Terminal.prototype.submit = function () {
    var raw = this.input.value, v = raw.trim();
    this.print(this.promptHTML() + esc(raw)); this.input.value = '';
    if (!v) return;
    this.hist.push(v); this.hi = this.hist.length;
    var parts = v.split(/\s+/), cmd = parts[0], arg = parts.slice(1).join(' ');
    var fn = this.cmd[cmd];
    if (fn && !(cmd.length > 0 && /\?$/.test(v) && parts.length > 2)) fn.call(this, arg, parts.slice(1));
    else this.ask(v);
  };

  Terminal.prototype.ask = function (q) {
    var self = this;
    if (q.length > 500) { this.print('<span class="r">agent:</span> question trop longue (500 caractères max).'); return; }
    this.busy = true; this.row.style.visibility = 'hidden';
    var line = this.print('<span class="ai">agent ›</span> ', 'answer'), span = document.createElement('span'), cur = document.createElement('span');
    cur.className = 'cursor'; line.appendChild(span); line.appendChild(cur);
    var acc = '';
    this.ctrl = window.AbortController ? new AbortController() : null;
    Agent.ask(q, function (t) { acc += t; span.textContent = cleanMd(acc); self.scroll(); }, this.ctrl && this.ctrl.signal)
      .then(function (r) {
        span.innerHTML = linkify(cleanMd(acc));
        if (r.mode === 'fallback') self.print('<span class="d">(agent IA injoignable : réponse tirée du portfolio)</span>');
        if (r.mode === 'rate') self.print('<span class="d">(trop de questions d\'un coup : réponse tirée du portfolio, réessayez dans une minute)</span>');
      })
      .catch(function () { span.innerHTML = linkify(cleanMd(acc)) + '<span class="d"> ^C</span>'; })
      .then(function () { cur.remove(); self.busy = false; self.ctrl = null; self.row.style.visibility = ''; self.focus(); self.scroll(); });
  };

  Terminal.prototype.cmd = {
    help: function () {
      this.print([
        '<span class="y">Posez simplement votre question</span>, par ex. : <span class="d">Quelles technos maîtrise-t-il ?</span>',
        '',
        '  <span class="u">ask</span> &lt;question&gt;   interroger l\'agent IA',
        '  <span class="u">whoami</span>           qui est Thomas',
        '  <span class="u">neofetch</span>         fiche système… et profil',
        '  <span class="u">ls</span>, <span class="u">cd</span>, <span class="u">cat</span>     parcourir ses fichiers (ex. cat competences.txt)',
        '  <span class="u">open</span> &lt;nom&gt;       ouvrir une appli ou un PDF (ex. open certifications, open cv.pdf)',
        '  <span class="u">contact</span>          coordonnées',
        '  <span class="u">cv</span>               ouvrir le CV',
        '  <span class="u">reset</span>            nouvelle conversation avec l\'agent',
        '  <span class="u">clear</span>            effacer l\'écran (Ctrl+L)',
        '',
        '<span class="d">Tab complète, ↑/↓ parcourent l\'historique, Ctrl+C interrompt l\'agent.</span>'
      ].join('\n'));
    },
    whoami: function () { this.text(KB[0].a); },
    neofetch: function () { this.neofetch(); },
    pwd: function () { this.print(this.cwd === '~' ? '/home/thomas' : '/home/thomas/certificats'); },
    ls: function (a) {
      var dir = a.replace(/\/$/, '');
      var list = (dir === 'certificats' || (this.cwd !== '~' && !dir)) ? CERT_LS : (!dir || dir === '~' || dir === '.' ? HOME_LS : null);
      if (!list) { this.print('ls: impossible d\'accéder à \'' + esc(a) + '\': Aucun fichier ou dossier de ce type'); return; }
      this.print(list.map(function (f) { return f.slice(-1) === '/' ? '<span class="p">' + esc(f) + '</span>' : (FILES[f] ? '<a href="' + FILES[f] + '" target="_blank">' + esc(f) + '</a>' : esc(f)); }).join('   '));
    },
    cd: function (a) {
      a = a.replace(/\/$/, '');
      if (!a || a === '~' || a === '..' || a === '/home/thomas') this.cwd = '~';
      else if (a === 'certificats' && this.cwd === '~') this.cwd = '~/certificats';
      else this.print('bash: cd: ' + esc(a) + ': Aucun fichier ou dossier de ce type');
      this.setPrompt();
    },
    cat: function (a) {
      if (!a) { this.print('cat: opérande manquant'); return; }
      var f = a.replace(/^\.\//, '');
      if (FS_TXT.hasOwnProperty(f) && this.cwd === '~') this.text(FS_TXT[f].map(function (i) { return KB[i].a; }).join('\n\n'));
      else if (FILES[f] || /\.pdf$/.test(f)) this.print('cat: ' + esc(f) + ' : fichier binaire — essayez <span class="y">open ' + esc(f) + '</span>');
      else this.print('cat: ' + esc(f) + ': Aucun fichier ou dossier de ce type');
    },
    open: function (a) {
      a = a.replace(/\.txt$/, '').replace(/^a_propos$/, 'apropos').replace(/\/$/, '');
      var key = norm(a);
      if (FILES[a]) { window.open(FILES[a], '_blank'); this.print('Ouverture de ' + esc(a) + '…'); return; }
      if (key === 'certificats') { openApp('fichiers'); return; }
      var id = Object.keys(APPS).filter(function (k) { return k === key || norm(APPS[k].title) === key; })[0];
      if (id) { openApp(id); this.print('Ouverture de ' + esc(APPS[id].title) + '…'); }
      else this.print('open: « ' + esc(a) + ' » introuvable. Essayez : ' + Object.keys(APPS).join(', ') + ', cv.pdf');
    },
    clear: function () { this.out.innerHTML = ''; },
    history: function () { this.print(this.hist.map(function (h, i) { return ('    ' + (i + 1)).slice(-5) + '  ' + esc(h); }).join('\n')); },
    date: function () { this.print(esc(new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'medium' }))); },
    uname: function (a) { this.print(/-a/.test(a) ? 'Linux debian 6.12.0-amd64 #1 SMP PREEMPT_DYNAMIC Debian x86_64 GNU/Linux' : 'Linux'); },
    contact: function () { this.text(KB[10].a); },
    cv: function () { window.open('cv.pdf', '_blank'); this.print('Ouverture de cv.pdf…'); },
    ask: function (a) { if (a) this.ask(a); else this.print('usage : ask &lt;question&gt;'); },
    reset: function () { Agent.reset(); this.print('<span class="d">Nouvelle conversation avec l\'agent.</span>'); },
    echo: function (a) { this.print(esc(a)); },
    man: function (a) { this.print(a ? 'Aucune entrée de manuel pour ' + esc(a) + ' — tapez <span class="y">help</span>.' : 'Quelle page de manuel voulez-vous ?'); },
    sudo: function (a) {
      if (/apt( install)? .*(alternance|stage|recrut)/.test(a)) this.cmd.apt.call(this, a.replace(/^apt\s*/, ''));
      else this.print('[sudo] Mot de passe de thomas : \nthomas n\'apparaît pas dans le fichier sudoers. Cet incident sera signalé… au recruteur. 😉');
    },
    apt: function (a) {
      if (/install/.test(a)) {
        var pkg = esc(a.replace(/^install\s*/, '') || 'paquet');
        this.print('Lecture des listes de paquets... Fait\nConstruction de l\'arbre des dépendances... Fait\nLes NOUVEAUX paquets suivants seront installés :\n  ' + pkg + '\nParamétrage de ' + pkg + ' ... <span class="u">OK</span>\n<span class="y">Pour finaliser l\'installation : Thomas.Popelka@etu.univ-smb.fr</span>');
      } else this.print('Atteint :1 http://deb.debian.org/debian trixie InRelease\nLecture des listes de paquets... Fait\nTous les paquets sont à jour — Thomas aussi.');
    },
    exit: function () { closeWin('terminal'); }
  };

  /* ======================================================== séquence de démarrage */
  var seen = false;
  try { seen = sessionStorage.getItem('deb-session') === '1'; } catch (e) {}
  if (/[?&]skip/.test(location.search)) seen = true;

  function startDesktop() {
    ['grub', 'bootlog', 'login'].forEach(function (id) { $('#' + id).hidden = true; });
    $('#desktop').hidden = false;
    try { sessionStorage.setItem('deb-session', '1'); } catch (e) {}
    var r = ws.getBoundingClientRect();
    if (!isMobile() && r.width > 1180) {
      openApp('apropos', { x: Math.max(130, r.width * 0.08), y: 30 });
      openApp('terminal', { x: r.width - Math.min(760, r.width - 40) - Math.max(40, r.width * 0.05), y: Math.max(60, r.height - 480 - 110) });
    } else openApp('terminal');
    if (Agent.online()) setTimeout(function () { notify('Agent IA en ligne — posez vos questions dans le Terminal'); }, 500);
  }

  function showLogin() {
    $('#bootlog').hidden = true; $('#login').hidden = false;
    var form = $('#loginForm');
    form.onsubmit = function (e) { e.preventDefault(); startDesktop(); };
    setTimeout(function () { $('.go', form).focus(); }, 50);
    $('#login').onclick = function (e) { if (!e.target.closest('form')) startDesktop(); };
  }

  function bootLog() {
    $('#grub').hidden = true; $('#bootlog').hidden = false;
    var lines = [
      'Loading Linux 6.12.0-amd64 ...', 'Loading initial ramdisk ...', '',
      '[  OK  ] Started systemd-journald.service - Journal Service.',
      '[  OK  ] Mounted /home/thomas/competences.',
      '[  OK  ] Mounted /home/thomas/certificats (4 fichiers).',
      '[  OK  ] Started NetworkManager.service - Network Manager.',
      '[  OK  ] Reached target network-online.target - Network is Online.',
      '[  OK  ] Started ssh.service - OpenBSD Secure Shell server.',
      '[  OK  ] Started portfolio-agent.service - Agent IA du portfolio.',
      '[  OK  ] Started gdm.service - GNOME Display Manager.',
      '[  OK  ] Reached target graphical.target - Graphical Interface.'
    ], i = 0, pre = $('#bootText'), done = false;
    function finish() { if (done) return; done = true; showLogin(); }
    $('#bootlog').onclick = finish;
    (function step() {
      if (done) return;
      if (i >= lines.length) { setTimeout(finish, 350); return; }
      pre.innerHTML += esc(lines[i]).replace('[  OK  ]', '[  <span class="ok">OK</span>  ]') + '\n'; i++;
      setTimeout(step, i < 3 ? 160 : 110);
    })();
  }

  function grub() {
    $('#grub').hidden = false;
    var n = 3, t, done = false, cnt = $('#grubCount');
    function go() { if (done) return; done = true; clearInterval(t); document.removeEventListener('keydown', key); bootLog(); }
    function key(e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); go(); } else { clearInterval(t); cnt.textContent = ''; } }
    t = setInterval(function () { n--; cnt.textContent = n > 0 ? 'L\'entrée sélectionnée sera exécutée automatiquement dans ' + n + 's.' : ''; if (n <= 0) go(); }, 1000);
    document.addEventListener('keydown', key);
    $('#grub').onclick = go;
  }

  if (seen || reduce) startDesktop(); else grub();

  /* accès depuis la console, pour le débogage */
  window.debianPortfolio = { openApp: openApp, Agent: Agent };
})();

/* specdec-findings client script. The page is static markup; this file only does what HTML
   and CSS cannot: the theme toggle, the copy buttons of the cite section and the modules, the findings filters, the glossary search, opening a finding
   when a link targets it, opening every closed expander for a print (a closed details
   prints nothing of its contents), and letting a module card cell taller than the screen stick
   by its foot. Without it the page reads in full, with the filters, the
   toggle and the copy buttons hidden. Loaded in <head> so the stored theme applies before
   the first paint. */
(function () {
  'use strict';
  var KEY = 'specdec-findings-theme';
  var ORDER = ['auto', 'light', 'dark'];
  var root = document.documentElement;
  var current = 'auto';
  try { current = window.localStorage.getItem(KEY) || 'auto'; } catch (e) { current = 'auto'; }
  if (ORDER.indexOf(current) < 0) current = 'auto';
  var applyTheme = function (v) {
    if (v === 'light' || v === 'dark') root.setAttribute('data-theme', v);
    else root.removeAttribute('data-theme');
  };
  applyTheme(current);

  // print (decision 18): a closed <details> prints nothing of its contents, so every closed one is
  // opened for the print and closed again after it; the light theme is used on paper and the
  // reader's choice restored after
  var openedForPrint = [];
  window.addEventListener('beforeprint', function () {
    openedForPrint = [];
    var all = document.querySelectorAll('details:not([open])');
    for (var i = 0; i < all.length; i++) { all[i].open = true; openedForPrint.push(all[i]); }
    applyTheme('light');
  });
  window.addEventListener('afterprint', function () {
    for (var j = 0; j < openedForPrint.length; j++) openedForPrint[j].open = false;
    openedForPrint = [];
    applyTheme(current);
  });

  var ready = function (fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  ready(function () {
    var status = document.getElementById('copy-status');

    // theme toggle: auto, light, dark, then auto again
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      var show = function () { toggle.textContent = 'Theme: ' + current; };
      show();
      toggle.hidden = false;
      toggle.addEventListener('click', function () {
        current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
        try { window.localStorage.setItem(KEY, current); } catch (e) { /* storage unavailable: the choice lasts for this view */ }
        applyTheme(current);
        show();
      });
    }

    // provenance chips are plain links to their lines at the commit since decision 27 (plan 16.39); no script

    // copy buttons (decision 15): copy the text of the block the button names
    var copies = document.querySelectorAll('button.copy');
    for (var c = 0; c < copies.length; c++) copies[c].hidden = false;
    document.addEventListener('click', function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest('button.copy') : null;
      if (!b) return;
      var t = document.getElementById(b.getAttribute('data-copy'));
      if (!t) return;
      var s = t.textContent;
      var done = function () {
        b.classList.add('copied');
        if (status) status.textContent = 'Copied';
        window.setTimeout(function () { b.classList.remove('copied'); }, 900);
      };
      var fallback = function () {
        var r = document.createRange();
        r.selectNodeContents(t);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        if (status) status.textContent = 'Selected the text to copy';
      };
      try { navigator.clipboard.writeText(s).then(done, fallback); } catch (e) { fallback(); }
    });

    // findings filters: part, status word, free text
    var list = document.getElementById('findinglist');
    var bar = document.getElementById('finding-filters');
    if (list && bar) {
      var cards = Array.prototype.slice.call(list.querySelectorAll('details.finding'));
      var texts = cards.map(function (c) { return c.textContent.toLowerCase(); });
      var part = document.getElementById('f-part');
      var word = document.getElementById('f-status');
      var q = document.getElementById('f-q');
      var count = document.getElementById('f-count');
      var applyF = function () {
        var p = part.value, w = word.value, s = q.value.trim().toLowerCase(), n = 0;
        cards.forEach(function (c, i) {
          var words = (c.getAttribute('data-words') || '').split('|');
          var ok = (!p || c.getAttribute('data-part') === p) && (!w || words.indexOf(w) >= 0) && (!s || texts[i].indexOf(s) >= 0);
          c.classList.toggle('hidden', !ok);
          if (ok) n++;
        });
        count.textContent = n + ' of ' + cards.length + ' findings';
      };
      [part, word, q].forEach(function (x) { x.addEventListener('input', applyF); x.addEventListener('change', applyF); });
      bar.hidden = false;
      applyF();
    }

    // glossary search
    var gl = document.getElementById('glossary-list');
    var gbar = document.getElementById('glossary-filter');
    if (gl && gbar) {
      var entries = Array.prototype.slice.call(gl.querySelectorAll('.entry'));
      var gtexts = entries.map(function (e) {
        var term = e.querySelector('.term'), def = e.querySelector('.def');
        return ((term ? term.textContent : '') + ' ' + (def ? def.textContent : '')).toLowerCase();
      });
      var gq = document.getElementById('g-q');
      var gcount = document.getElementById('g-count');
      var applyG = function () {
        var s = gq.value.trim().toLowerCase(), n = 0;
        entries.forEach(function (e, i) {
          var ok = !s || gtexts[i].indexOf(s) >= 0;
          e.classList.toggle('hidden', !ok);
          if (ok) n++;
        });
        gcount.textContent = n + ' of ' + entries.length + ' terms';
      };
      gq.addEventListener('input', applyG);
      gbar.hidden = false;
      applyG();
    }

    // open a finding when its anchor is the target (a link from the kill board, an arc,
    // a lesson or an erratum), and show it even if a filter had hidden it
    var openHash = function () {
      var h = '';
      try { h = decodeURIComponent(window.location.hash.slice(1)); } catch (e) { h = ''; }
      var t = h && document.getElementById(h);
      if (t && t.tagName === 'DETAILS') { t.open = true; t.classList.remove('hidden'); }
    };
    window.addEventListener('hashchange', openHash);
    openHash();

    // decision 25 (plan 16.37): a sticky module card cell taller than the room under the rail sticks by its foot,
    // so it scrolls with the page until its bottom is 16 px above the viewport's and every line can be read
    var cells = document.querySelectorAll('.cardcell');
    if (cells.length) {
      var fit = function () {
        for (var i = 0; i < cells.length; i++) {
          var c = cells[i];
          c.style.top = '';
          if (getComputedStyle(c).position !== 'sticky') continue;
          var room = window.innerHeight - 64;
          if (c.offsetHeight > room) c.style.top = (window.innerHeight - c.offsetHeight - 16) + 'px';
        }
      };
      fit();
      window.addEventListener('resize', fit);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    }
  });
})();

/* 红色记忆 · 党史征程 — 交互脚本（原生 JS，无外部依赖）
   设计要点：导航采用轻量 SPA（局部刷新 #content），
   音乐控件与音频元素位于外壳中、不随内容切换重载，故切页时音乐不中断。 */

(function () {
  'use strict';

  var isLocal = location.protocol === 'file:';
  var rotateTimer = null;
  var io = null;

  /* ---------- 背景音乐控件（全站常驻，只创建一次） ---------- */
  var musicWrap, audio, musicBtn, volSlider;
  function buildMusic() {
    musicWrap = document.createElement('div');
    musicWrap.className = 'music';
    musicWrap.innerHTML =
      '<button class="music__btn" aria-label="播放或暂停背景音乐" type="button">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>' +
      '</button>' +
      '<div class="music__meta"><b>红色旋律</b><span>背景音乐 · 流行</span></div>' +
      '<input class="music__vol" type="range" min="0" max="1" step="0.01" value="0.5" aria-label="音量">' +
      '<span class="music__eq" aria-hidden="true"><i></i><i></i><i></i></span>';
    document.body.appendChild(musicWrap);

    audio = new Audio('music/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';

    musicBtn = musicWrap.querySelector('.music__btn');
    volSlider = musicWrap.querySelector('.music__vol');
    volSlider.addEventListener('input', function () { audio.volume = parseFloat(volSlider.value); });
    musicBtn.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().then(function () { musicWrap.classList.add('playing'); })
          .catch(function () { /* 浏览器拦截自动播放，需用户再次点击 */ });
      } else {
        audio.pause();
        musicWrap.classList.remove('playing');
      }
    });
  }

  /* ---------- 移动端菜单（nav 在 #content 之外，绑定一次） ---------- */
  function bindNav() {
    var toggle = document.querySelector('.nav__toggle');
    var links = document.querySelector('.nav__links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') links.classList.remove('open'); });
  }

  /* ---------- 页面级交互（每次加载 & 每次 SPA 切换后调用） ---------- */
  function initPage() {
    var content = document.getElementById('content');
    if (!content) return;

    /* 滚动入场动画 */
    var reveals = content.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
      if (io) io.disconnect();
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }

    /* 时间轴展开 */
    content.querySelectorAll('.tl-card').forEach(function (card) {
      card.addEventListener('click', function () { card.classList.toggle('open'); });
    });

    /* 人物 / 精神 卡片翻转 */
    content.querySelectorAll('.person').forEach(function (p) {
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');
      p.addEventListener('click', function () { p.classList.toggle('flipped'); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.classList.toggle('flipped'); }
      });
    });

    /* Hero 标语轮播 */
    if (rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }
    var hero = content.querySelector('.hero');
    if (hero) {
      var heroInner = hero.querySelector('.wrap');
      var quotes = ['从石库门到天安门', '从兴业路到复兴路', '信仰，是最长的红飘带', '每一代青年都有自己的际遇', '百年征程，初心不改'];
      var box = document.createElement('div');
      box.className = 'hero__rotate';
      var sp = document.createElement('span');
      box.appendChild(sp);
      var lead = heroInner ? heroInner.querySelector('p.lead') : null;
      if (lead) lead.insertAdjacentElement('afterend', box);
      else if (heroInner) heroInner.appendChild(box);
      var qi = 0;
      function showQ() {
        sp.style.opacity = 0;
        setTimeout(function () { sp.textContent = quotes[qi]; sp.style.opacity = 1; qi = (qi + 1) % quotes.length; }, 500);
      }
      showQ();
      rotateTimer = setInterval(showQ, 3200);
    }
  }

  /* ---------- Hero 视差（全局绑定一次，实时取当前 hero__bg） ---------- */
  function bindParallax() {
    window.addEventListener('scroll', function () {
      var hb = document.querySelector('.hero__bg');
      if (!hb) return;
      var y = window.scrollY || window.pageYOffset;
      if (y < 900) hb.style.transform = 'translateY(' + (y * 0.25) + 'px)';
    }, { passive: true });
  }

  /* ---------- SPA 导航 ---------- */
  function setActiveNav(url) {
    var file = (url.split('?')[0].split('#')[0].split('/').pop()) || 'index.html';
    document.querySelectorAll('.nav__links a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === file);
    });
  }

  function navigate(url, push) {
    if (isLocal) { window.location.href = url; return; } // file:// 不支持 fetch，退回整页跳转
    fetch(url, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('bad'); return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var newContent = doc.getElementById('content');
        if (!newContent) throw new Error('no content');
        var main = document.getElementById('content');
        main.innerHTML = newContent.innerHTML;
        main.setAttribute('data-page', newContent.getAttribute('data-page') || '');
        document.title = doc.title || document.title;
        if (push !== false) history.pushState({ url: url }, '', url);
        window.scrollTo(0, 0);
        setActiveNav(url);
        initPage();
      })
      .catch(function () { window.location.href = url; });
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('http') === 0 || a.target === '_blank') return;
    if (href.indexOf('.html') === -1) return;
    e.preventDefault();
    navigate(href, true);
  });

  window.addEventListener('popstate', function () {
    navigate(location.pathname + location.search, false);
  });

  /* ---------- 启动 ---------- */
  buildMusic();
  bindNav();
  bindParallax();
  initPage();
})();

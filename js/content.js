(function () {
  var FALLBACK_NEWS = [
    { title: '성경암송대회 (요한복음 1:1-18)', en: 'Scripture Memory Contest (John 1:1-18)', date: '06.07' },
    { title: '찬양예배 — 주일 2부 예배', en: 'Praise Worship — Sunday 2nd Service', date: '06.07' },
    { title: '한글학교 — 2층 유초등부실', en: 'Korean School — 2nd floor children’s room', date: '매주 일요일' },
    { title: '경로 선물 — 75세 이상 어르신', en: 'Gifts for seniors ages 75+', date: '진행 중' }
  ];

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  function applySermon(s) {
    if (!s) return;
    var frame = document.getElementById('home-sermon-frame');
    if (frame && s.youtube_id) {
      frame.src = 'https://www.youtube.com/embed/' + encodeURIComponent(s.youtube_id) + '?rel=0&modestbranding=1&playsinline=1';
    }
    setText('home-sermon-kicker', '최신 주일설교 · ' + (window.FKC.formatKoDate(s.sermon_date) || ''));
    setText('home-sermon-title', s.title);
    setText('home-sermon-title-en', s.title_en);
    var meta = [s.scripture, s.preacher].filter(Boolean).join(' · ');
    var metaEn = [s.scripture_en, s.preacher].filter(Boolean).join(' · ');
    setText('home-sermon-meta', meta);
    setText('home-sermon-meta-en', metaEn);
  }

  function applyNews(rows) {
    var box = document.getElementById('home-news-list');
    if (!box || !rows || !rows.length) return;
    box.innerHTML = '';
    rows.slice(0, 4).forEach(function (n) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;gap:16px;padding:15px 0;border-bottom:1px solid rgba(11,22,38,0.08);';
      var left = document.createElement('span');
      left.className = 'bi';
      left.style.lineHeight = '1.3';
      var t = document.createElement('span');
      t.style.cssText = 'display:block;font-size:14.5px;color:#2B3849;';
      t.textContent = n.title;
      var en = document.createElement('span');
      en.className = 'en';
      en.textContent = n.title_en || '';
      left.appendChild(t);
      left.appendChild(en);
      var date = document.createElement('span');
      date.style.cssText = 'font-size:12.5px;color:#8492A2;flex:none;';
      date.textContent = n.date_label || window.FKC.formatShort(n.sort_date) || '';
      row.appendChild(left);
      row.appendChild(date);
      box.appendChild(row);
    });
  }

  function applySermonPage(rows) {
    var hero = document.getElementById('sermon-list-hero');
    var grid = document.getElementById('sermon-list-grid');
    if (!rows || !rows.length) return;
    var first = rows[0];
    if (hero) {
      hero.innerHTML =
        (first.youtube_id
          ? '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(first.youtube_id) + '?rel=0&modestbranding=1&playsinline=1" title="주일설교" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>'
          : '<img src="../gallery/11.jpg" alt="">') +
        '<div class="txt"><div class="meta">' +
        [first.scripture, window.FKC.formatKoDate(first.sermon_date)].filter(Boolean).join(' · ') +
        '</div><h2></h2><p></p></div>';
      hero.querySelector('h2').textContent = first.title;
      hero.querySelector('p').textContent = first.preacher || '';
    }
    if (grid) {
      grid.innerHTML = rows.slice(1, 4).map(function (s) {
        return '<article><div class="pad"><span class="meta" style="color:#8A5F14;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:600"></span><h3></h3><p></p></div></article>';
      }).join('');
      Array.prototype.forEach.call(grid.children, function (el, i) {
        var s = rows[i + 1];
        el.querySelector('.meta').textContent = [s.scripture, window.FKC.formatKoDate(s.sermon_date)].filter(Boolean).join(' · ');
        el.querySelector('h3').textContent = s.title;
        el.querySelector('p').textContent = s.preacher || '';
      });
    }
  }

  function applyBulletinPage(rows) {
    var list = document.getElementById('bulletin-list');
    if (!list || !rows || !rows.length) return;
    list.innerHTML = '';
    rows.forEach(function (b) {
      var a = document.createElement('a');
      a.className = 'row';
      a.href = b.url || '#';
      if (b.url) a.target = '_blank';
      a.innerHTML = '<div><strong></strong><span></span></div><span class="pill">PDF</span>';
      a.querySelector('strong').textContent = b.title;
      a.querySelector('span').textContent = window.FKC.formatKoDate(b.bulletin_date);
      list.appendChild(a);
    });
  }

  async function run() {
    if (!window.FKC) return;
    try {
      var sermons = await window.FKC.fetchSermons();
      var news = await window.FKC.fetchNews();
      var bulletins = await window.FKC.fetchBulletins();
      if (sermons && sermons.length) applySermon(sermons[0]);
      if (news && news.length) applyNews(news);
      if (document.getElementById('sermon-list-hero') && sermons) applySermonPage(sermons);
      if (document.getElementById('bulletin-list') && bulletins) applyBulletinPage(bulletins);
    } catch (err) {
      console.warn('content load skipped', err);
    }
  }

  function ready(fn) {
    var start = function () {
      if (
        document.getElementById('home-news-list') ||
        document.getElementById('sermon-list-hero') ||
        document.getElementById('bulletin-list')
      ) {
        fn();
        return;
      }
      var n = 0;
      var t = setInterval(function () {
        n += 1;
        if (
          document.getElementById('home-news-list') ||
          document.getElementById('sermon-list-hero') ||
          document.getElementById('bulletin-list') ||
          n > 80
        ) {
          clearInterval(t);
          fn();
        }
      }, 50);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }

  ready(run);
})();

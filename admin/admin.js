(function () {
  var sb = null;
  var currentUser = null;

  function $(id) { return document.getElementById(id); }
  function show(el, on) { el.classList.toggle('hidden', !on); }
  function flash(msg) {
    var el = $('flash');
    if (!el) return;
    el.textContent = msg || '';
    if (msg) setTimeout(function () { el.textContent = ''; }, 2500);
  }
  function formData(form) {
    var o = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      o[el.name] = el.value;
    });
    return o;
  }
  function fillForm(form, row) {
    form.reset();
    Object.keys(row || {}).forEach(function (k) {
      if (form.elements[k] != null) form.elements[k].value = row[k] == null ? '' : row[k];
    });
  }

  async function ensureClient() {
    var cfg = await window.FKC.loadConfig();
    try {
      var local = JSON.parse(localStorage.getItem('fkc-supabase') || 'null');
      if ((!cfg.url || !cfg.anonKey) && local && local.url && local.anonKey) cfg = local;
    } catch (e) {}
    if (!cfg.url || !cfg.anonKey) return null;
    if (!window._fkcAdmin) window._fkcAdmin = window.supabase.createClient(cfg.url, cfg.anonKey);
    sb = window._fkcAdmin;
    return sb;
  }

  async function route() {
    var client = await ensureClient();
    if (!client) {
      show($('setupPanel'), true);
      show($('loginPanel'), false);
      show($('appPanel'), false);
      return;
    }
    show($('setupPanel'), false);
    var { data: { session } } = await client.auth.getSession();
    currentUser = session && session.user;
    if (!currentUser) {
      show($('loginPanel'), true);
      show($('appPanel'), false);
      $('logoutBtn').hidden = true;
      $('who').textContent = '';
      return;
    }
    show($('loginPanel'), false);
    show($('appPanel'), true);
    $('logoutBtn').hidden = false;
    $('who').textContent = currentUser.email || '';
    await Promise.all([loadSermons(), loadNews(), loadBulletins()]);
  }

  $('saveSetup').onclick = function () {
    var url = $('setupUrl').value.trim();
    var anonKey = $('setupKey').value.trim();
    if (!url || !anonKey) {
      $('setupErr').textContent = 'URL과 키를 모두 입력해 주세요.';
      return;
    }
    localStorage.setItem('fkc-supabase', JSON.stringify({ url: url, anonKey: anonKey }));
    window._fkcAdmin = null;
    $('setupErr').textContent = '';
    route();
  };

  $('loginBtn').onclick = async function () {
    $('loginErr').textContent = '';
    try {
      var client = await ensureClient();
      var { error } = await client.auth.signInWithPassword({
        email: $('email').value.trim(),
        password: $('password').value
      });
      if (error) throw error;
      await route();
    } catch (err) {
      $('loginErr').textContent = err.message || '로그인에 실패했습니다.';
    }
  };

  $('logoutBtn').onclick = async function () {
    if (sb) await sb.auth.signOut();
    window._fkcAdmin = null;
    await route();
  };

  document.querySelectorAll('.tabs button').forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll('.tabs button').forEach(function (b) { b.classList.toggle('on', b === btn); });
      ['sermons', 'news', 'bulletins'].forEach(function (name) {
        show($('tab-' + name), btn.getAttribute('data-tab') === name);
      });
    };
  });

  function listBlock(rows, mount, fields, onEdit, onDelete) {
    mount.innerHTML = '';
    (rows || []).forEach(function (row) {
      var div = document.createElement('div');
      div.className = 'item';
      var left = document.createElement('div');
      var b = document.createElement('b');
      b.textContent = row[fields.title];
      var small = document.createElement('small');
      small.textContent = fields.sub(row);
      left.appendChild(b);
      left.appendChild(small);
      var actions = document.createElement('div');
      actions.className = 'btn-row';
      var edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'btn ghost';
      edit.textContent = '수정';
      edit.onclick = function () { onEdit(row); };
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn danger';
      del.textContent = '삭제';
      del.onclick = function () { onDelete(row); };
      actions.appendChild(edit);
      actions.appendChild(del);
      div.appendChild(left);
      div.appendChild(actions);
      mount.appendChild(div);
    });
  }

  async function loadSermons() {
    var { data, error } = await sb.from('sermons').select('*').order('sermon_date', { ascending: false });
    if (error) throw error;
    listBlock(data, $('sermonList'), {
      title: 'title',
      sub: function (r) { return [r.sermon_date, r.preacher].filter(Boolean).join(' · '); }
    }, function (row) {
      fillForm($('sermonForm'), row);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, async function (row) {
      if (!confirm('이 설교를 삭제할까요?')) return;
      var { error } = await sb.from('sermons').delete().eq('id', row.id);
      if (error) return alert(error.message);
      flash('삭제했습니다.');
      loadSermons();
    });
  }

  async function loadNews() {
    var { data, error } = await sb.from('news').select('*').order('sort_date', { ascending: false, nullsFirst: false });
    if (error) throw error;
    listBlock(data, $('newsList'), {
      title: 'title',
      sub: function (r) { return r.date_label || r.sort_date || ''; }
    }, function (row) {
      fillForm($('newsForm'), row);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, async function (row) {
      if (!confirm('이 소식을 삭제할까요?')) return;
      var { error } = await sb.from('news').delete().eq('id', row.id);
      if (error) return alert(error.message);
      flash('삭제했습니다.');
      loadNews();
    });
  }

  async function loadBulletins() {
    var { data, error } = await sb.from('bulletins').select('*').order('bulletin_date', { ascending: false });
    if (error) throw error;
    listBlock(data, $('bulletinList'), {
      title: 'title',
      sub: function (r) { return r.bulletin_date || ''; }
    }, function (row) {
      fillForm($('bulletinForm'), row);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, async function (row) {
      if (!confirm('이 주보를 삭제할까요?')) return;
      var { error } = await sb.from('bulletins').delete().eq('id', row.id);
      if (error) return alert(error.message);
      flash('삭제했습니다.');
      loadBulletins();
    });
  }

  $('sermonForm').onsubmit = async function (e) {
    e.preventDefault();
    var o = formData(this);
    var payload = {
      title: o.title,
      title_en: o.title_en || '',
      scripture: o.scripture || '',
      scripture_en: o.scripture_en || '',
      preacher: o.preacher || '',
      sermon_date: o.sermon_date,
      youtube_id: window.FKC.youtubeId(o.youtube_id)
    };
    var q = o.id
      ? sb.from('sermons').update(payload).eq('id', o.id)
      : sb.from('sermons').insert(payload);
    var { error } = await q;
    if (error) return alert(error.message);
    this.reset();
    flash('설교를 저장했습니다.');
    loadSermons();
  };

  $('newsForm').onsubmit = async function (e) {
    e.preventDefault();
    var o = formData(this);
    var payload = {
      title: o.title,
      title_en: o.title_en || '',
      date_label: o.date_label,
      sort_date: o.sort_date || null
    };
    var q = o.id
      ? sb.from('news').update(payload).eq('id', o.id)
      : sb.from('news').insert(payload);
    var { error } = await q;
    if (error) return alert(error.message);
    this.reset();
    flash('소식을 저장했습니다.');
    loadNews();
  };

  $('bulletinForm').onsubmit = async function (e) {
    e.preventDefault();
    var o = formData(this);
    var payload = {
      title: o.title,
      bulletin_date: o.bulletin_date,
      url: o.url || ''
    };
    var q = o.id
      ? sb.from('bulletins').update(payload).eq('id', o.id)
      : sb.from('bulletins').insert(payload);
    var { error } = await q;
    if (error) return alert(error.message);
    this.reset();
    flash('주보를 저장했습니다.');
    loadBulletins();
  };

  route().catch(function (err) {
    console.error(err);
    $('loginErr').textContent = err.message || '연결에 실패했습니다.';
    show($('loginPanel'), true);
  });
})();

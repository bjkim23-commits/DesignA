(function (global) {
  function youtubeId(value) {
    if (!value) return '';
    var s = String(value).trim();
    var m = s.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    return s;
  }

  function formatKoDate(iso) {
    if (!iso) return '';
    var p = String(iso).slice(0, 10).split('-');
    if (p.length !== 3) return iso;
    return p[0] + '.' + p[1] + '.' + p[2];
  }

  function formatShort(iso) {
    if (!iso) return '';
    var p = String(iso).slice(0, 10).split('-');
    if (p.length !== 3) return iso;
    return p[1] + '.' + p[2];
  }

  async function loadConfig() {
    var file = (global.FKC_SUPABASE && global.FKC_SUPABASE.url && global.FKC_SUPABASE.anonKey)
      ? global.FKC_SUPABASE
      : null;
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem('fkc-supabase') || 'null'); } catch (e) {}
    try {
      var res = await fetch('/api/public-config', { headers: { Accept: 'application/json' } });
      if (res.ok) {
        var json = await res.json();
        if (json && json.url && json.anonKey) return json;
      }
    } catch (e) {}
    if (file) return file;
    if (stored && stored.url && stored.anonKey) return stored;
    return { url: '', anonKey: '' };
  }

  var clientPromise = null;
  async function getClient() {
    if (clientPromise) return clientPromise;
    clientPromise = (async function () {
      var cfg = await loadConfig();
      if (!cfg.url || !cfg.anonKey || !global.supabase) return null;
      return global.supabase.createClient(cfg.url, cfg.anonKey);
    })();
    return clientPromise;
  }

  async function fetchSermons() {
    var sb = await getClient();
    if (!sb) return null;
    var { data, error } = await sb.from('sermons').select('*').order('sermon_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function fetchNews() {
    var sb = await getClient();
    if (!sb) return null;
    var { data, error } = await sb.from('news').select('*').order('sort_date', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function fetchBulletins() {
    var sb = await getClient();
    if (!sb) return null;
    var { data, error } = await sb.from('bulletins').select('*').order('bulletin_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  global.FKC = {
    youtubeId: youtubeId,
    formatKoDate: formatKoDate,
    formatShort: formatShort,
    loadConfig: loadConfig,
    getClient: getClient,
    fetchSermons: fetchSermons,
    fetchNews: fetchNews,
    fetchBulletins: fetchBulletins
  };
})(window);

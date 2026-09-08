/* K-GUIDE 회원·로그인 공통 (Supabase)
   ─ 호칭·문구는 KG_TEXT 한 곳에만 있음. 「ガイド」 호칭이 바뀌면 여기만 고치면 됨. */
(function () {
  var URL_ = 'https://tplqztqbvhhsobdcvvhw.supabase.co';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbHF6dHFidmhoc29iZGN2dmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NTMwMjEsImV4cCI6MjEwNDQyOTAyMX0.bGK3FbUeDM4RXmnzaTDRARSwbxQ_SefkN87PsSn7_cY';

  /* ── 호칭·공통 문구 (여기 한 곳만 고치면 전 화면에 반영) ── */
  window.KG_TEXT = {
    guideJa: 'ガイド',
    guideKo: '가이드',
    pendingJa: '審査中です。承認までお待ちください',
    pendingKo: '심사 중입니다. 승인까지 기다려 주세요',
    approvedJa: '承認済み',
    approvedKo: '승인 완료',
    rejectedJa: '今回は承認されませんでした',
    rejectedKo: '이번에는 승인되지 않았습니다',
    adminEmail: 'tournaria1@gmail.com'
  };

  var sb = null;
  try { sb = window.supabase.createClient(URL_, ANON, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }); } catch (e) { }

  var KGA = window.KGA = {
    sb: sb,
    T: window.KG_TEXT,
    _profile: null,

    base: function () { return location.pathname.replace(/[^/]*$/, ''); },
    url: function (p) { return location.origin + KGA.base() + p; },

    async session() { if (!sb) return null; var r = await sb.auth.getSession(); return r.data.session || null; },
    async user() { var s = await KGA.session(); return s ? s.user : null; },

    async profile(force) {
      if (KGA._profile && !force) return KGA._profile;
      var u = await KGA.user(); if (!u) return null;
      var r = await sb.from('profiles').select('*').eq('id', u.id).maybeSingle();
      if (r.error) return null;
      var p = r.data;
      if (!p) { // 트리거가 못 만든 예외 상황 대비
        await sb.from('profiles').insert({ id: u.id, email: u.email, role: 'traveler', status: 'approved' });
        r = await sb.from('profiles').select('*').eq('id', u.id).maybeSingle(); p = r.data;
      }
      KGA._profile = p; return p;
    },

    async signUp(email, password, meta) {
      var r = await sb.auth.signUp({ email: email, password: password, options: { data: meta || {} } });
      if (r.error) throw r.error;
      if (!r.data.session) { // 확인메일이 켜져 있는 경우에도 바로 로그인 시도
        var s = await sb.auth.signInWithPassword({ email: email, password: password });
        if (s.error) throw s.error;
      }
      KGA._profile = null; return r.data;
    },
    async signIn(email, password) {
      var r = await sb.auth.signInWithPassword({ email: email, password: password });
      if (r.error) throw r.error;
      KGA._profile = null; return r.data;
    },
    async signOut() { await sb.auth.signOut(); KGA._profile = null; try { sessionStorage.removeItem('kg_synced'); } catch (e) { } },
    async sendReset(email) {
      var r = await sb.auth.resetPasswordForEmail(email, { redirectTo: KGA.url('reset.html') });
      if (r.error) throw r.error; return true;
    },
    async setPassword(pw) { var r = await sb.auth.updateUser({ password: pw }); if (r.error) throw r.error; return true; },

    /* 역할 확인 — 아니면 홈으로 */
    async requireRole(role, redirect) {
      var p = await KGA.profile();
      if (!p || p.role !== role) { location.replace(redirect || 'home.html'); return null; }
      return p;
    },

    /* ── 즐겨찾기·플랜 동기화 ── */
    _lsGet: function (k, d) { try { return JSON.parse(localStorage.getItem(k) || d); } catch (e) { return JSON.parse(d); } },
    _lsSet: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },

    async pull() {
      var u = await KGA.user(); if (!u) return false;
      var r = await sb.from('user_data').select('fav,plan').eq('user_id', u.id).maybeSingle();
      if (r.error) return false;
      var srvFav = (r.data && r.data.fav) || [];
      var srvPlan = (r.data && r.data.plan) || {};
      var locFav = KGA._lsGet('kg_fav', '[]');
      var locPlan = KGA._lsGet('kg_plan', '{}');
      var merged = locFav.slice();
      srvFav.forEach(function (id) { if (merged.indexOf(id) < 0) merged.push(id); });
      var plan = (locPlan && (locPlan.course || (locPlan.spots || []).length)) ? locPlan : srvPlan;
      var changed = JSON.stringify(merged) !== JSON.stringify(locFav) || JSON.stringify(plan) !== JSON.stringify(locPlan);
      KGA._lsSet('kg_fav', merged); KGA._lsSet('kg_plan', plan || {});
      await KGA.push(true);
      return changed;
    },

    _t: null,
    push: function (now) {
      clearTimeout(KGA._t);
      var run = async function () {
        var u = await KGA.user(); if (!u) return;
        await sb.from('user_data').upsert({
          user_id: u.id,
          fav: KGA._lsGet('kg_fav', '[]'),
          plan: KGA._lsGet('kg_plan', '{}'),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      };
      if (now) return run();
      KGA._t = setTimeout(run, 800);
    }
  };

  /* 저장할 때마다 자동으로 서버에 올림 */
  try {
    var _set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      _set.apply(this, arguments);
      if (this === window.localStorage && (k === 'kg_fav' || k === 'kg_plan')) KGA.push();
    };
  } catch (e) { }

  /* 로그인 상태면 페이지 열 때 1회 동기화 (바뀐 게 있으면 한 번만 새로고침) */
  if (sb) {
    KGA.session().then(function (s) {
      if (!s) return;
      var done = false; try { done = sessionStorage.getItem('kg_synced') === '1'; } catch (e) { }
      if (done) { KGA.push(); return; }
      KGA.pull().then(function (changed) {
        try { sessionStorage.setItem('kg_synced', '1'); } catch (e) { }
        if (changed && !/\b(login|signup|reset|guide-apply|admin)\.html/.test(location.pathname)) location.reload();
      });
    });
    sb.auth.onAuthStateChange(function (ev) {
      if (ev === 'SIGNED_OUT') { try { sessionStorage.removeItem('kg_synced'); } catch (e) { } KGA._profile = null; }
    });
  }
})();

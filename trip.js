/* K-GUIDE 旅程(여정) 공통 엔진 — trip.html · plan 통합 · 홈 카드 · 알림
   UI 문구는 각 페이지가 window.KGT 에 넣어 준다(언어별로 번역됨). 이 파일에는 일본어 UI 문구를 두지 않는다. */
(function () {
  'use strict';
  var T = window.KGT || (window.KGT = {});
  var VAPID_PUBLIC = 'BBqhMIsANZVtW4DX3WA1f4Nd9X-UyYxJSAJcQ3cJyYXC5wy8tViOmvt-aCEjUAcwXMt5PhRF1nVmycb-Jv0se1c';

  /* ── 기본 유틸 ─────────────────────────────── */
  function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); }); }
  function lsGet(k, d) { try { return JSON.parse(localStorage.getItem(k) || d); } catch (e) { return JSON.parse(d); } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseD(s) { var a = String(s || '').split('-').map(Number); return new Date(a[0], (a[1] || 1) - 1, a[2] || 1); }
  function todayS() { return ymd(new Date()); }
  function addDays(s, n) { var d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); }
  function diffDays(a, b) { return Math.round((parseD(b) - parseD(a)) / 86400000); }
  var DOW = function () { return T.dow || ['日', '月', '火', '水', '木', '金', '土']; };
  function mdw(s) { var d = parseD(s); return (d.getMonth() + 1) + '/' + d.getDate() + '(' + DOW()[d.getDay()] + ')'; }
  function md(s) { var d = parseD(s); return (d.getMonth() + 1) + '/' + d.getDate(); }
  function hm(mins) { mins = ((mins % 1440) + 1440) % 1440; return pad(Math.floor(mins / 60)) + ':' + pad(mins % 60); }
  function toMin(t) { var a = String(t || '').split(':').map(Number); return (a[0] || 0) * 60 + (a[1] || 0); }
  function SP() { return (window.KG && window.KG.spots) || []; }
  function byId(id) { var a = SP(); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function CS() { return (window.KG && window.KG.courses) || []; }
  function bgOf(u) { return u ? "url('" + u + "') center / cover no-repeat" : 'linear-gradient(135deg,#E9ECF8,#D1D6EE)'; }
  function base() { return location.pathname.replace(/(ko\/)?[^\/]*$/, ''); }
  function inKo() { return /\/ko\/[^\/]*$/.test(location.pathname); }
  function up() { return inKo() ? '../' : './'; }
  function here(p) { return p; }

  /* ── 휴관 판정 (일본어 원문 rest 기준 · 언어와 무관) ─────────── */
  var DOWJ = ['日', '月', '火', '水', '木', '金', '土'];
  var KR_HOLI = new Set(['2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18', '2026-03-01', '2026-03-02', '2026-05-05', '2026-05-24', '2026-05-25', '2026-06-06', '2026-08-15', '2026-08-17', '2026-09-24', '2026-09-25', '2026-09-26', '2026-10-03', '2026-10-05', '2026-10-09', '2026-12-25', '2027-01-01', '2027-02-06', '2027-02-07', '2027-02-08', '2027-03-01', '2027-05-05', '2027-05-13', '2027-06-06', '2027-08-15', '2027-08-16', '2027-09-14', '2027-09-15', '2027-09-16', '2027-10-03', '2027-10-04', '2027-10-09', '2027-12-25']);
  var SEOL = { day: ['2026-02-17', '2027-02-07'], run: ['2026-02-16', '2026-02-17', '2026-02-18', '2027-02-06', '2027-02-07', '2027-02-08'] };
  var CHUSEOK = { day: ['2026-09-25', '2027-09-15'], run: ['2026-09-24', '2026-09-25', '2026-09-26', '2027-09-14', '2027-09-15', '2027-09-16'] };
  function closedOn(r, d) {
    r = r || ''; if (!r) return false;
    if (/年中無休|無休|年中開放|年中運航|休みなし/.test(r) && !/店舗により|一部/.test(r)) return false;
    var key = ymd(d), dow = DOWJ[d.getDay()], isHoli = KR_HOLI.has(key);
    var r1 = r.replace(/第\d月曜日?/g, ''), r2 = r1.replace(/[（(][^）)]*[）)]/g, '').replace(/[^、,／/]*祝日の(場合|次|翌|時)[^、,／/]*/g, '');
    var wd = new Set((r1.match(/[月火水木金土日](?=曜)/g) || [])); if (/週末/.test(r)) { wd.add('土'); wd.add('日'); }
    if (/祝日|公休日|祝祭日/.test(r2) && isHoli) return true;
    if (/1月1日/.test(r) && key.slice(5) === '01-01') return true;
    if (/12月25日/.test(r) && key.slice(5) === '12-25') return true;
    if (/5月1日/.test(r) && key.slice(5) === '05-01') return true;
    var run = /連休/.test(r);
    if (/ソルナル|ソルラル|旧正月|旧暦1月1日/.test(r) && (run ? SEOL.run : SEOL.day).indexOf(key) >= 0) return true;
    if (/秋夕|旧暦8月15日/.test(r) && (run ? CHUSEOK.run : CHUSEOK.day).indexOf(key) >= 0) return true;
    if (/第1月曜/.test(r) && dow === '月' && d.getDate() <= 7) { var ms = (r.match(/(\d{1,2})月/g) || []).map(function (x) { return parseInt(x, 10); }); if (!ms.length || ms.indexOf(d.getMonth() + 1) >= 0) return true; }
    if (wd.has(dow)) { if (/祝日の場合|祝日は開|祝日の時|祝日と重なる/.test(r) && isHoli) return false; return true; }
    if (/翌日|翌平日|次の平日/.test(r)) { var y = parseD(key); y.setDate(y.getDate() - 1); if (wd.has(DOWJ[y.getDay()]) && KR_HOLI.has(ymd(y))) return true; }
    return false;
  }
  function alwaysShut(s) { return /閉鎖|閉館|休業中|工事/.test(String((s && (s.restJa || s.rest)) || '')) && /中|閉鎖/.test(String((s && (s.restJa || s.rest)) || '')) && /閉鎖中|休業中|長期休/.test(String((s && (s.restJa || s.rest)) || '')); }
  function shutOn(s, dateStr) { if (!s) return false; if (alwaysShut(s)) return true; return closedOn(s.restJa || s.rest, parseD(dateStr)); }
  window.KGTRIP_closedOn = closedOn;

  /* ── 여행 저장소 ─────────────────────────────── */
  var TRIPS = window.TRIPS = {
    all: function () { var l = lsGet('kg_trips', '[]'); return Array.isArray(l) ? l : []; },
    save: function (l) { lsSet('kg_trips', l); },
    curId: function () { try { return localStorage.getItem('kg_trip_current') || ''; } catch (e) { return ''; } },
    setCur: function (id) { try { localStorage.setItem('kg_trip_current', id || ''); } catch (e) { } },
    get: function (id) { var l = TRIPS.all(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; },
    cur: function () { var l = TRIPS.all(); if (!l.length) return null; return TRIPS.get(TRIPS.curId()) || l[0]; },
    put: function (t) {
      var l = TRIPS.all(), i = -1;
      for (var k = 0; k < l.length; k++) if (l[k].id === t.id) i = k;
      t.updated = Date.now();
      if (i < 0) l.push(t); else l[i] = t;
      TRIPS.save(l); TRIPS.setCur(t.id);
      try { PUSHJ.reschedule(); } catch (e) { }
      return t;
    },
    del: function (id) { var l = TRIPS.all().filter(function (t) { return t.id !== id; }); TRIPS.save(l); if (TRIPS.curId() === id) TRIPS.setCur(l.length ? l[0].id : ''); try { PUSHJ.reschedule(); } catch (e) { } },
    make: function (start, end) {
      var t = { id: 'T' + Date.now().toString(36), name: '', city: [], start: start, end: end, flights: { in: null, out: null }, days: [], stay: null, pool: [], mode: 'arex', intl: true, updated: Date.now() };
      TRIPS.fixDays(t); return t;
    },
    fixDays: function (t) {
      var n = Math.max(1, diffDays(t.start, t.end) + 1), old = t.days || [], out = [], keep = [];
      for (var i = 0; i < n; i++) {
        var date = addDays(t.start, i), o = null;
        for (var k = 0; k < old.length; k++) if (old[k].date === date) o = old[k];
        out.push({ date: date, start: (o && o.start) || '10:00', spots: (o && o.spots) || [] });
      }
      old.forEach(function (d) { if (out.filter(function (x) { return x.date === d.date; }).length === 0) keep = keep.concat(d.spots || []); });
      t.days = out;
      if (keep.length) { t.pool = (t.pool || []).concat(keep.filter(function (id) { return (t.pool || []).indexOf(id) < 0; })); }
      return t;
    },
    nights: function (t) { var n = diffDays(t.start, t.end); return n <= 0 ? (T.dayTrip || '日帰り') : (T.nights || '{n}泊{m}日').replace('{n}', n).replace('{m}', n + 1); },
    label: function (t) { return md(t.start) + '〜' + md(t.end) + (t.city && t.city.length ? ' · ' + t.city.join('·') : '') + ' · ' + TRIPS.nights(t); },
    autoName: function (t) { return ((t.city && t.city[0]) || (T.seoul || 'ソウル')) + ' ' + md(t.start) + '〜' + md(t.end); },
    placed: function (t) { var s = []; (t.days || []).forEach(function (d) { s = s.concat(d.spots || []); }); return s; },
    poolIds: function (t) {
      var placed = TRIPS.placed(t), fav = lsGet('kg_fav', '[]'), out = [];
      (t.pool || []).concat(fav).forEach(function (id) { if (out.indexOf(id) < 0 && placed.indexOf(id) < 0 && byId(id)) out.push(id); });
      return out;
    },
    addTo: function (t, dateStr, ids) {
      ids = [].concat(ids);
      (t.days || []).forEach(function (d) { d.spots = (d.spots || []).filter(function (id) { return ids.indexOf(id) < 0; }); });
      t.pool = (t.pool || []).filter(function (id) { return ids.indexOf(id) < 0; });
      var day = null; (t.days || []).forEach(function (d) { if (d.date === dateStr) day = d; });
      if (!day) { day = t.days[0]; }
      day.spots = (day.spots || []).concat(ids);
      TRIPS.put(t); return t;
    },
    toPool: function (t, ids) {
      ids = [].concat(ids);
      t.pool = (t.pool || []).concat(ids.filter(function (id) { return (t.pool || []).indexOf(id) < 0 && TRIPS.placed(t).indexOf(id) < 0; }));
      TRIPS.put(t); return t;
    },
    dayIndexFor: function (t, dateStr) { for (var i = 0; i < t.days.length; i++) if (t.days[i].date === dateStr) return i; return 0; },
    todayIndex: function (t) { var s = todayS(); if (s < t.start) return 0; if (s > t.end) return t.days.length - 1; return TRIPS.dayIndexFor(t, s); }
  };

  /* kg_plan → 여행 이관 (16번) */
  function migrate() {
    if (TRIPS.all().length) return null;
    var p = lsGet('kg_plan', '{}'), ids = [];
    if (p && p.course) { var c = CS().filter(function (x) { return x.id === p.course; })[0]; if (c) ids = String(c.spots).split(',').map(function (s) { return s.trim(); }).filter(Boolean); }
    else if (p && Array.isArray(p.spots)) ids = p.spots.filter(function (id) { return byId(id); });
    if (!ids.length) return null;
    var t = TRIPS.make(todayS(), todayS());
    t.name = T.myTrip || 'マイ旅程';
    t.city = [(byId(ids[0]) || {}).city || (T.seoul || 'ソウル')];
    t.days[0].spots = ids;
    TRIPS.put(t);
    try { localStorage.removeItem('kg_plan'); } catch (e) { }
    setTimeout(function () { toast(T.migrated || 'これまでのプランを旅程に移しました'); }, 600);
    return t;
  }
  window.KGTRIP_migrate = migrate;

  /* ── 공항 이동 소요표 ─────────────────────────── */
  /* [AREX/공항철도, リムジン, タクシー] 분 */
  var ETA = {
    ICN: { '明洞': [61, 70, 60], '鍾路 · 光化門': [58, 75, 65], '北村 · 三清洞': [65, 80, 70], '東大門': [65, 80, 70], '弘大': [55, 65, 60], '江南': [73, 75, 70], '梨泰院': [70, 80, 65], '聖水': [75, 85, 70], '蚕室': [80, 85, 75], '汝矣島': [60, 60, 55], '大学路 · 城北': [70, 85, 70], '新村 · 西大門': [55, 70, 60], '仁川': [45, 50, 40], '仁川空港・永宗島': [20, 20, 15], '_': [70, 80, 65] },
    GMP: { '明洞': [35, 45, 35], '鍾路 · 光化門': [35, 45, 35], '弘大': [25, 35, 25], '江南': [40, 45, 40], '汝矣島': [25, 30, 20], '蚕室': [50, 55, 45], '_': [35, 45, 35] },
    PUS: { '海雲台': [60, 60, 45], '西面・田浦': [40, 40, 35], '南浦洞・チャガルチ': [45, 45, 40], '広安里': [50, 50, 40], '釜山駅・草梁': [45, 45, 35], '_': [50, 50, 40] },
    CJU: { '済州市・空港周辺': [20, 20, 15], '_': [40, 45, 40] }
  };
  /* 한국어판은 에리어 이름이 한국어라 같은 값을 한 번 더 넣어 둔다(언어가 늘면 여기에 추가) */
  var ETA_ALIAS = {
    '\uba85\ub3d9': '\u660e\u6d1e', '\uc885\ub85c\u00b7\uad11\ud654\ubb38': '\u9418\u8def \u00b7 \u5149\u5316\u9580', '\ubd81\ucd0c\u00b7\uc0bc\uccad\ub3d9': '\u5317\u6751 \u00b7 \u4e09\u6e05\u6d1e',
    '\ub3d9\ub300\ubb38': '\u6771\u5927\u9580', '\ud64d\ub300': '\u5f18\u5927', '\uac15\ub0a8': '\u6c5f\u5357', '\uc774\ud0dc\uc6d0': '\u68a8\u6cf0\u9662',
    '\uc131\uc218': '\u8056\u6c34', '\uc7a0\uc2e4': '\u8695\u5ba4', '\uc5ec\uc758\ub3c4': '\u6c5d\u77e3\u5cf6',
    '\ub300\ud559\ub85c\u00b7\uc131\ubd81': '\u5927\u5b66\u8def \u00b7 \u57ce\u5317', '\uc2e0\ucd0c\u00b7\uc11c\ub300\ubb38': '\u65b0\u6751 \u00b7 \u897f\u5927\u9580',
    '\uc778\ucc9c': '\u4ec1\u5ddd', '\uc778\ucc9c\uacf5\ud56d\u00b7\uc601\uc885\ub3c4': '\u4ec1\u5ddd\u7a7a\u6e2f\u30fb\u6c38\u5b97\u5cf6',
    '\ud574\uc6b4\ub300': '\u6d77\u96f2\u53f0', '\uc11c\uba74\u00b7\uc804\ud3ec': '\u897f\u9762\u30fb\u7530\u6d66',
    '\ub0a8\ud3ec\ub3d9\u00b7\uc790\uac08\uce58': '\u5357\u6d66\u6d1e\u30fb\u30c1\u30e3\u30ac\u30eb\u30c1', '\uad11\uc548\ub9ac': '\u5e83\u5b89\u91cc',
    '\ubd80\uc0b0\uc5ed\u00b7\ucd08\ub7c9': '\u91dc\u5c71\u99c5\u30fb\u8349\u6881', '\uc81c\uc8fc\uc2dc\u00b7\uacf5\ud56d \uc8fc\ubcc0': '\u6e08\u5dde\u5e02\u30fb\u7a7a\u6e2f\u5468\u8fba'
  };
  var AP_LIST = ['ICN1', 'ICN2', 'GMP', 'PUS', 'CJU'];
  function apGroup(k) { return String(k || '').slice(0, 3) === 'ICN' ? 'ICN' : (k || 'ICN'); }
  function apLabel(k) { return (T.ap && T.ap[k]) || k; }
  function etaMin(airport, stay, mode) {
    var g = ETA[apGroup(airport)] || ETA.ICN;
    var area = (stay && (stay.area || stay.city)) || '';
    if (!g[area] && ETA_ALIAS[area]) area = ETA_ALIAS[area];
    var row = g[area] || g['_'];
    var i = mode === 'limo' ? 1 : mode === 'taxi' ? 2 : 0;
    return row[i];
  }

  /* ── 플라이트 타임라인 계산 (11번) ────────────── */
  function outTimeline(t) {
    var f = t.flights && t.flights.out; if (!f || !f.time) return null;
    var lead = (t.intl === false) ? 90 : 180;
    var dep = toMin(f.time);
    var arrAp = dep - lead;
    var eta = etaMin(f.airport, t.stay, t.mode || 'arex');
    var leave = arrAp - eta - 20;
    var check = leave - 40;
    return {
      kind: 'out', date: t.end, eta: eta, mode: t.mode || 'arex', flight: f,
      rows: [
        { key: 'pack', min: check, label: T.tlPack || '荷造り・チェックアウト' },
        { key: 'leave', min: leave, label: T.tlLeave || 'ホテル出発' },
        { key: 'arrAp', min: arrAp, label: T.tlArrAp || '空港到着（目標）' },
        { key: 'dep', min: dep, label: T.tlDep || '出発' }
      ]
    };
  }
  function inTimeline(t) {
    var f = t.flights && t.flights.in; if (!f || !f.time) return null;
    var land = toMin(f.time);
    var outAp = land + 60;
    var eta = etaMin(f.airport, t.stay, t.mode || 'arex');
    var hotel = outAp + eta;
    var start = Math.ceil((hotel + 30) / 15) * 15;
    return {
      kind: 'in', date: t.start, eta: eta, mode: t.mode || 'arex', flight: f, tourStart: start,
      rows: [
        { key: 'land', min: land, label: T.tlLand || '着陸' },
        { key: 'immi', min: land, label: T.tlImmi || '入国審査・荷物（約60分）', span: true },
        { key: 'outAp', min: outAp, label: T.tlOutAp || '空港出発' },
        { key: 'hotel', min: hotel, label: T.tlHotel || 'ホテル到着（予想）' }
      ]
    };
  }
  function tlFor(t, dateStr) {
    if (!t) return null;
    if (dateStr === t.end && t.flights && t.flights.out) return outTimeline(t);
    if (dateStr === t.start && t.flights && t.flights.in) return inTimeline(t);
    return null;
  }
  window.KGTRIP_tl = tlFor;

  /* ── Day 스팟 시각 계산 ──────────────────────── */
  function dist(a, b) { return (a && b && a.lat && b.lat) ? Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 88) : 0; }

  /* ── 11차 A: 이동시간·영업시간·피로 상수 (숫자는 여기 한 곳에서만 바꾼다) ── */
  var TCFG = {
    WALK_KMH: 4.5, DETOUR: 1.3, WALK_MAX_KM: 1.2,
    METRO_KMH: 27, METRO_FIX: 12,
    SAME_AREA_KM: 0.4, SAME_AREA_MIN: 5,
    TRANSFER_PENALTY_MIN: 10,
    MOVE_RATIO: 0.35,
    SORT_GAIN_MIN: 10,
    LATE_MIN: 1200,
    DAY_END: 1260
  };
  window.KGTRIP_CFG = TCFG;

  function rad(x) { return x * Math.PI / 180; }
  function distKm(a, b) {
    if (!a || !b || !a.lat || !b.lat || !a.lng || !b.lng) return 0;
    var la1 = rad(+a.lat), la2 = rad(+b.lat), dla = la2 - la1, dlo = rad(+b.lng - +a.lng);
    var h = Math.sin(dla / 2) * Math.sin(dla / 2) + Math.cos(la1) * Math.cos(la2) * Math.sin(dlo / 2) * Math.sin(dlo / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  /* 좌표 기반 「추정치」다. 실측 경로 API 가 아니므로 화면에는 반드시 「約」을 붙인다 */
  function legOf(a, b) {
    if (!a || !b) return null;
    if (a.city && b.city && a.city !== b.city) return { cross: true, min: 0, km: 0, mode: 'x' };
    var d = distKm(a, b);
    if (!d) return { min: 0, km: 0, mode: 'walk' };
    if (a.area && b.area && a.area === b.area && d <= TCFG.SAME_AREA_KM) return { min: TCFG.SAME_AREA_MIN, km: d, mode: 'walk' };
    if (d <= TCFG.WALK_MAX_KM) return { min: Math.max(1, Math.round(d / TCFG.WALK_KMH * 60 * TCFG.DETOUR)), km: d, mode: 'walk' };
    return { min: Math.round((d * TCFG.DETOUR) / TCFG.METRO_KMH * 60 + TCFG.METRO_FIX), km: d, mode: 'metro' };
  }
  window.KGTRIP_leg = legOf;
  /* 영업시간: 자유 문장에서 가장 이른 開始·가장 늦은 終了만 뽑는다. 못 뽑으면 검증하지 않는다(추측 금지) */
  function hoursRange(s) {
    var txt = String((s && s.hours) || '');
    if (!txt) return null;
    var re = /(\d{1,2}):(\d{2})\s*[–—\-~～〜ー−]\s*(\d{1,2}):(\d{2})/g, m, o = null, c = null;
    while ((m = re.exec(txt))) {
      var a = (+m[1]) * 60 + (+m[2]), b = (+m[3]) * 60 + (+m[4]);
      if (b <= a) b += 1440;
      if (o === null || a < o) o = a;
      if (c === null || b > c) c = b;
    }
    if (o === null) return null;
    return { open: o, close: c };
  }
  window.KGTRIP_hours = hoursRange;

  function dayPlan(t, di) {
    var d = t.days[di]; if (!d) return { rows: [], walk: 0, warn: 0, stayMin: 0, moveMin: 0, startMin: 600, endMin: 600 };
    var tl = tlFor(t, d.date);
    var startMin = toMin(d.start || '10:00');
    if (tl && tl.kind === 'in') startMin = Math.max(startMin, tl.tourStart);
    var limit = (tl && tl.kind === 'out') ? tl.rows[1].min : null;
    var sp = (d.spots || []).map(byId).filter(Boolean);
    var mins = startMin, moveTotal = 0, stayTotal = 0, warn = 0, rows = [];
    sp.forEach(function (x, i) {
      var nx = sp[i + 1], leg = nx ? legOf(x, nx) : null;
      var stay = parseInt(x.stay, 10) || 60;
      var shut = shutOn(x, d.date);
      var late = (limit != null && mins >= limit);
      var hr = hoursRange(x), hw = '', hs = false;
      if (hr) {
        var arr = mins % 1440;
        if (hr.close > 1440 && arr < (hr.open % 1440)) arr += 1440;
        if (arr < hr.open) hw = 'early';
        else if (arr > hr.close) hw = 'late';
        else if (hr.close - arr < stay) hs = true;
      }
      if (shut) warn++;
      var mv = (leg && !leg.cross) ? leg.min : 0;
      rows.push({
        id: x.id, n: i + 1, time: hm(mins), min: mins, stay: stay, name: x.name, area: x.area || '', photo: bgOf(x.photo),
        shut: shut, late: late, hw: hw, hShort: hs, hOpen: hr ? hm(hr.open % 1440) : '', hClose: hr ? hm(hr.close % 1440) : '',
        hasLeg: !!nx, km: (leg && !leg.cross) ? leg.km.toFixed(1) : '', legMin: mv,
        legMode: leg ? leg.mode : '', legCross: !!(leg && leg.cross)
      });
      stayTotal += stay; moveTotal += mv;
      mins += stay + mv;
    });
    return { rows: rows, walk: moveTotal, warn: warn, endMin: mins, stayMin: stayTotal, moveMin: moveTotal, startMin: startMin };
  }
  window.KGTRIP_dayPlan = dayPlan;

  /* ── 11차 A-5: 순서 정리 — 거리가 아니라 「피로」 기준. 스팟을 빼거나 막지 않고 순서만 바꾼다 ── */
  function permute(a, cb) {
    var n = a.length, used = [], out = [];
    (function rec() {
      if (out.length === n) { cb(out); return; }
      for (var i = 0; i < n; i++) { if (used[i]) continue; used[i] = 1; out.push(a[i]); rec(); out.pop(); used[i] = 0; }
    })();
  }
  function routeCost(t, di, order) {
    var d = t.days[di], stayArea = (t.stay && t.stay.area) || '';
    var tl = tlFor(t, d.date), mins = toMin(d.start || '10:00');
    if (tl && tl.kind === 'in') mins = Math.max(mins, tl.tourStart);
    var cost = 0, move = 0;
    for (var i = 0; i < order.length; i++) {
      var x = order[i], nx = order[i + 1];
      mins += (parseInt(x.stay, 10) || 60);
      if (!nx) break;
      var l = legOf(x, nx), m = l.cross ? 90 : l.min;
      cost += m + (l.mode === 'metro' ? TCFG.TRANSFER_PENALTY_MIN : 0);
      if (mins >= TCFG.LATE_MIN && (x.areaKey || x.area) !== (nx.areaKey || nx.area)) cost += 30;
      if (!l.cross) move += l.min;
      mins += m;
    }
    var last = order[order.length - 1];
    if (stayArea && last && (last.area === stayArea || last.areaKey === stayArea)) cost -= 15;
    if (stayArea && order[0] && (order[0].area === stayArea || order[0].areaKey === stayArea)) cost -= 8;
    return { cost: cost, move: move, end: mins };
  }
  function tidyOrder(t, di) {
    var d = t.days[di]; if (!d) return null;
    var sp = (d.spots || []).map(byId).filter(Boolean);
    if (sp.length < 3) return null;
    var head = sp[0], rest = sp.slice(1), best = null;
    if (rest.length <= 6) {
      permute(rest, function (arr) {
        var o = [head].concat(arr), c = routeCost(t, di, o);
        if (!best || c.cost < best.cost) best = { cost: c.cost, move: c.move, ids: o.map(function (x) { return x.id; }) };
      });
    } else {
      var pool = rest.slice(), o = [head], cp = head;
      while (pool.length) {
        var bi = 0, bv = Infinity;
        for (var i = 0; i < pool.length; i++) { var l = legOf(cp, pool[i]); var v = l.cross ? 999 : l.min + (l.mode === 'metro' ? TCFG.TRANSFER_PENALTY_MIN : 0); if (v < bv) { bv = v; bi = i; } }
        cp = pool.splice(bi, 1)[0]; o.push(cp);
      }
      var c2 = routeCost(t, di, o);
      best = { cost: c2.cost, move: c2.move, ids: o.map(function (x) { return x.id; }) };
    }
    var now = routeCost(t, di, sp);
    return { now: now.move, next: best.move, ids: best.ids, same: best.ids.join() === sp.map(function (x) { return x.id; }).join() };
  }
  window.KGTRIP_tidy = tidyOrder;

  /* ── 11차 B: 항공편 기반 코스 자동 배치 ── */
  function ngDays(c) {
    var s = String(c.ng_day || '');
    if (!s || /^(なし|特になし)/.test(s)) return [];
    return s.match(/[月火水木金土日](?=曜)/g) || [];
  }
  function courseSpots(c) {
    return String(c.spots || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean).map(byId).filter(Boolean);
  }
  function courseCity(c) { var sp = courseSpots(c); return c.city || (sp[0] && sp[0].city) || 'ソウル'; }
  function courseAreas(c) { var o = {}; courseSpots(c).forEach(function (s) { if (s.areaKey) o[s.areaKey] = 1; }); return Object.keys(o); }
  function cityOk(cc, allowed) {
    if (!allowed.length) return true;
    if (allowed.indexOf(cc) >= 0) return true;
    if (allowed.indexOf('近郊') >= 0 && ['ソウル', '釜山', '済州'].indexOf(cc) < 0) return true;
    return false;
  }
  /* 그 Day 에 쓸 수 있는 시간 (기존 타임라인 계산 재사용) */
  function dayWindow(t, di) {
    var d = t.days[di], tl = tlFor(t, d.date), last = t.days.length - 1;
    var from = 600, to = TCFG.DAY_END, luggage = false;
    if (di === 0) { luggage = true; if (tl && tl.kind === 'in') from = tl.tourStart; }
    if (di === last) { luggage = true; from = (di === 0 ? from : 540); if (tl && tl.kind === 'out') to = tl.rows[1].min; }
    return { from: from, to: to, hours: Math.max(0, (to - from) / 60), luggage: luggage, hasFlight: !!tl };
  }
  window.KGTRIP_window = dayWindow;
  /* 코스 조합 제안. variant 0,1,2… 는 다음 후보 조합 */
  function autoPlan(t, variant) {
    variant = variant || 0;
    var allowed = (t.city && t.city.length) ? t.city.slice() : [];
    var stayArea = (t.stay && t.stay.area) || '';
    var all = CS().filter(function (c) { return courseSpots(c).length >= 2 && (parseFloat(c.hours) || 0) > 0; });
    var used = {}, prevAreas = [], out = [], anyFlight = false;
    for (var di = 0; di < t.days.length; di++) {
      var d = t.days[di], w = dayWindow(t, di);
      if (w.hasFlight) anyFlight = true;
      if ((d.spots || []).length) { out.push({ di: di, date: d.date, busy: true, w: w }); prevAreas = []; continue; }
      if (w.hours < 3) { out.push({ di: di, date: d.date, none: true, w: w }); prevAreas = []; continue; }
      var dow = DOWJ[parseD(d.date).getDay()];
      var cand = [];
      all.forEach(function (c) {
        if (used[c.id]) return;
        if (!cityOk(courseCity(c), allowed)) return;
        if (ngDays(c).indexOf(dow) >= 0) return;
        var h = parseFloat(c.hours) || 0;
        if (h > w.hours + 1) return;                              /* 1시간까지는 넘어도 후보로 두고 점수로 거른다 */
        var sp = courseSpots(c), open = sp.filter(function (s) { return !shutOn(s, d.date); });
        if (open.length < 2) return;
        var ar = courseAreas(c);
        if (prevAreas.length && ar.length && ar.every(function (a) { return prevAreas.indexOf(a) >= 0; })) return;
        var sc = 0;
        sc += (w.hours - h) * 2;                                  /* 남는 시간이 적은 코스를 우선 */
        if (h > w.hours) sc += (h - w.hours) * 6;                 /* 시간을 넘기면 그만큼 불리하게 */
        if (stayArea) {
          var nearStay = ar.indexOf(stayArea) >= 0 || String(c.area || '').indexOf(stayArea) >= 0;
          if (di === 0 && nearStay) sc -= 8;
          if (di === t.days.length - 1) sc += nearStay ? -14 : 14;  /* 귀국일은 숙소 에리어 안 */
        }
        if (w.luggage) sc += 1;
        /* 그 시간에 실제로 문이 열려 있는지 (A-4 와 같은 기준). 못 뽑히면 검증하지 않는다 */
        var t0 = w.from, bad = 0;
        for (var i2 = 0; i2 < open.length; i2++) {
          var hr2 = hoursRange(open[i2]), st2 = parseInt(open[i2].stay, 10) || 60;
          if (hr2 && (t0 < hr2.open || t0 > hr2.close || (hr2.close - t0) < st2)) bad++;
          t0 += st2;
          if (open[i2 + 1]) { var l2 = legOf(open[i2], open[i2 + 1]); t0 += (l2 && !l2.cross) ? l2.min : 0; }
        }
        sc += bad * 12;
        if (t0 > w.to) sc += (t0 - w.to) / 10;
        cand.push({ c: c, sc: sc, open: open, cut: sp.length - open.length, h: h, bad: bad });
      });
      cand.sort(function (a, b) { return a.sc - b.sc; });
      if (!cand.length) { out.push({ di: di, date: d.date, none: true, w: w }); prevAreas = []; continue; }
      var pick = cand[Math.min(variant, cand.length - 1)];
      used[pick.c.id] = 1; prevAreas = courseAreas(pick.c);
      out.push({ di: di, date: d.date, w: w, course: pick.c, ids: pick.open.map(function (s) { return s.id; }), cut: pick.cut, hours: pick.h });
    }
    return { days: out, anyFlight: anyFlight, variants: 3 };
  }
  window.KGTRIP_auto = autoPlan;
  function applyPlan(t, plan) {
    plan.days.forEach(function (r) {
      if (r.busy || r.none || !r.ids) return;
      t.days[r.di].spots = r.ids.slice();
      t.pool = (t.pool || []).filter(function (id) { return r.ids.indexOf(id) < 0; });
    });
    TRIPS.put(t); return t;
  }
  window.KGTRIP_apply = applyPlan;


  /* ── 공통 UI 부품 ────────────────────────────── */
  function toast(msg, ms) {
    var el = document.getElementById('kgtoast');
    if (!el) {
      el = document.createElement('div'); el.id = 'kgtoast';
      el.style.cssText = 'position:fixed; left:50%; bottom:120px; transform:translateX(-50%); z-index:12000; max-width:330px; padding:12px 16px; border-radius:14px; background:rgba(17,21,41,.92); color:#fff; font-size:13px; font-weight:600; line-height:1.5; box-shadow:0 8px 32px rgba(17,21,41,.28); text-align:center; display:none;';
      document.body.appendChild(el);
    }
    el.innerHTML = msg; el.style.display = 'block';
    clearTimeout(el.__t); el.__t = setTimeout(function () { el.style.display = 'none'; }, ms || 3200);
  }
  window.KGTOAST = toast;

  var sheetEl = null;
  function sheet(title, inner, opt) {
    closeSheet();
    opt = opt || {};
    sheetEl = document.createElement('div');
    sheetEl.id = 'kgsheet';
    sheetEl.style.cssText = 'position:fixed; inset:0; z-index:11000; background:rgba(17,21,41,.42); display:flex; align-items:flex-end; justify-content:center;';
    var box = document.createElement('div');
    box.style.cssText = 'width:100%; max-width:430px; max-height:86%; overflow-y:auto; background:#fff; border-radius:24px 24px 0 0; box-shadow:0 -8px 32px rgba(17,21,41,.18); padding:0 16px 28px;';
    box.innerHTML = '<div style="position:sticky; top:0; background:#fff; padding:10px 0 8px; z-index:2;"><div style="width:40px;height:4px;border-radius:100px;background:#D1D3DB;margin:0 auto 10px;"></div>'
      + '<div style="display:flex; align-items:center; gap:8px;"><div style="flex:1; font-size:16px; font-weight:700; color:#111527;">' + esc(title) + '</div>'
      + '<div data-close="1" style="width:32px;height:32px;border-radius:16px;background:#F2F4FC;display:flex;align-items:center;justify-content:center;color:#4B4F63;font-size:16px;font-weight:700;cursor:pointer;">✕</div></div></div>'
      + '<div id="kgsheetbody">' + inner + '</div>';
    sheetEl.appendChild(box);
    sheetEl.addEventListener('click', function (e) {
      if (e.target === sheetEl || (e.target.getAttribute && e.target.getAttribute('data-close'))) closeSheet();
    });
    document.body.appendChild(sheetEl);
    if (opt.onMount) opt.onMount(box);
    return box;
  }
  function closeSheet() { if (sheetEl && sheetEl.parentNode) sheetEl.parentNode.removeChild(sheetEl); sheetEl = null; }
  window.KGSHEET = sheet; window.KGSHEETCLOSE = closeSheet;

  function undoBar(msg, fn) {
    var el = document.getElementById('kgundo');
    if (!el) {
      el = document.createElement('div'); el.id = 'kgundo';
      el.style.cssText = 'position:fixed; left:50%; bottom:120px; transform:translateX(-50%); z-index:12000; width:330px; box-sizing:border-box; padding:12px 14px; border-radius:16px; background:#fff; box-shadow:0 8px 32px rgba(17,21,41,.20); display:none; align-items:center; gap:12px;';
      document.body.appendChild(el);
    }
    el.innerHTML = '<div style="flex:1; font-size:12px; font-weight:600; color:#4B4F63;">' + esc(msg) + '</div><div id="kgundob" style="font-size:14px; font-weight:700; color:#3F52B4; cursor:pointer;">' + esc(T.undo || '元に戻す') + '</div>';
    el.style.display = 'flex';
    clearTimeout(el.__t); el.__t = setTimeout(function () { el.style.display = 'none'; }, 4500);
    el.querySelector('#kgundob').onclick = function () { el.style.display = 'none'; clearTimeout(el.__t); fn(); };
  }
  window.KGUNDO = undoBar;

  /* ── 날짜 선택 시트 (旅程に追加 · 別の日へ) ───── */
  function dayChips(t, ids, opt) {
    opt = opt || {};
    var html = '<div style="display:flex; flex-direction:column; gap:8px; padding-top:8px;">';
    t.days.forEach(function (d, i) {
      var shut = ids.map(byId).filter(Boolean).filter(function (s) { return shutOn(s, d.date); });
      var dis = shut.length > 0;
      html += '<div data-day="' + d.date + '" style="display:flex; align-items:center; gap:10px; min-height:52px; padding:10px 14px; border-radius:16px; background:' + (dis ? '#F7F7FA' : '#fff') + '; box-shadow:inset 0 0 0 1px ' + (dis ? '#E1E3EC' : '#D1D3DB') + '; cursor:pointer;">'
        + '<div style="flex:1; min-width:0;"><div style="font-size:15px; font-weight:700; color:' + (dis ? '#9C9FAF' : '#111527') + ';">' + esc(mdw(d.date)) + '</div>'
        + '<div style="font-size:11px; font-weight:600; color:#9C9FAF; margin-top:2px;">Day ' + (i + 1) + ' · ' + (d.spots || []).length + (T.spotUnit || 'スポット') + '</div></div>'
        + (dis ? '<div style="font-size:12px; font-weight:700; color:#B22459; white-space:nowrap;">' + esc(T.thisDayShut || 'この日は休館') + '</div>' : '')
        + '</div>';
    });
    if (!opt.noPool) html += '<div data-day="__pool__" style="display:flex; align-items:center; min-height:52px; padding:10px 14px; border-radius:16px; background:#F2F4FC; color:#3F52B4; font-size:15px; font-weight:700; cursor:pointer;">' + esc(T.poolPick || '行きたい場所（まだ決めない）') + '</div>';
    html += '</div>';
    return html;
  }

  function pickDay(t, ids, title, opt) {
    opt = opt || {};
    var box = sheet(title, dayChips(t, ids, opt));
    box.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('[data-day]');
      if (!el) return;
      var v = el.getAttribute('data-day');
      closeSheet();
      if (v === '__pool__') { TRIPS.toPool(t, ids); if (opt.after) opt.after(null); return; }
      TRIPS.addTo(t, v, ids);
      var shut = ids.map(byId).filter(Boolean).filter(function (s) { return shutOn(s, v); });
      if (shut.length) toast((T.shutToast || '{d}は{n}の休館日です。別の日がおすすめ').replace('{d}', mdw(v)).replace('{n}', shut[0].name));
      else toast((T.addedTo || '{d}に追加しました').replace('{d}', mdw(v)));
      if (opt.after) opt.after(v);
    });
  }
  window.KGTRIP_pickDay = pickDay;

  /* ── 「旅程に追加」 진입점 (검색·상세·코스 공통, 16번) ── */
  function addToTrip(ids, opt) {
    opt = opt || {};
    ids = [].concat(ids).filter(Boolean);
    if (!ids.length) return;
    migrate();
    var t = TRIPS.cur();
    if (!t) {
      /* 여행이 없으면: 코스는 바로 만들기로, 스팟은 보관함으로 */
      if (opt.needTrip) { newTripFlow(function (nt) { pickDay(nt, ids, opt.title || (T.addToTrip || '旅程に追加'), { after: function () { bar(); } }); }); return; }
      var pool = lsGet('kg_pool_free', '[]');
      ids.forEach(function (id) { if (pool.indexOf(id) < 0) pool.push(id); });
      lsSet('kg_pool_free', pool);
      toast(T.noTripPool || '「行きたい場所」に入れました。旅程をつくると日にちに入れられます');
      bar(); return;
    }
    pickDay(t, ids, opt.title || (T.addToTrip || '旅程に追加'), { after: function () { bar(); } });
  }
  window.KGTRIP_add = addToTrip;

  function newTripFlow(cb) { location.href = up() === './' ? 'trip.html?new=1' : 'trip.html?new=1'; if (cb) { } }

  /* 하단 고정 바 「行きたい場所 N件 · 旅程へ →」 */
  function freePool() { return lsGet('kg_pool_free', '[]').filter(function (id) { return byId(id); }); }
  function bar() {
    if (/trip\.html/.test(location.pathname)) return;
    var t = TRIPS.cur();
    var n = t ? TRIPS.poolIds(t).length : freePool().length;
    var el = document.getElementById('kgtripbar');
    if (!n) { if (el) el.style.display = 'none'; return; }
    if (!el) {
      el = document.createElement('a'); el.id = 'kgtripbar';
      el.style.cssText = 'position:fixed; left:50%; bottom:112px; transform:translateX(-50%); z-index:900; width:330px; box-sizing:border-box; height:46px; padding:0 16px; border-radius:16px; background:#3F52B4; color:#fff; box-shadow:0 8px 32px rgba(17,21,41,.22); display:flex; align-items:center; gap:8px; text-decoration:none;';
      document.body.appendChild(el);
    }
    el.href = 'trip.html?pool=1';
    el.style.display = 'flex';
    el.innerHTML = '<span style="flex:1; font-size:14px; font-weight:600;">' + esc(t ? (T.poolBar || '行きたい場所 {n}件').replace('{n}', n) : (T.poolBarNo || '{n}件').replace('{n}', n)) + '</span>'
      + '<span style="font-size:14px; font-weight:700;">' + esc(t ? (T.toTrip || '旅程へ →') : (T.makeTrip || '旅程をつくる →')) + '</span>';
  }
  window.KGTRIP_bar = bar;

  /* ── ICS ────────────────────────────────────── */
  function icsFor(t) {
    var out = [], n = 0;
    function ev(dateStr, min, title) {
      var d = parseD(dateStr); d.setMinutes(d.getMinutes() + min);
      function z(x) { return x.getUTCFullYear() + pad(x.getUTCMonth() + 1) + pad(x.getUTCDate()) + 'T' + pad(x.getUTCHours()) + pad(x.getUTCMinutes()) + '00Z'; }
      var e = new Date(d.getTime() + 30 * 60000);
      n++;
      out.push('BEGIN:VEVENT\r\nUID:kg' + Date.now() + n + '@kguide\r\nDTSTAMP:' + z(new Date()) + '\r\nDTSTART:' + z(d) + '\r\nDTEND:' + z(e) + '\r\nSUMMARY:' + title.replace(/[,;]/g, ' ') + '\r\nBEGIN:VALARM\r\nTRIGGER:-PT15M\r\nACTION:DISPLAY\r\nDESCRIPTION:' + title.replace(/[,;]/g, ' ') + '\r\nEND:VALARM\r\nEND:VEVENT');
    }
    [inTimeline(t), outTimeline(t)].forEach(function (tl) {
      if (!tl) return;
      tl.rows.forEach(function (r) { if (r.span) return; ev(tl.date, r.min, 'K-GUIDE · ' + r.label); });
    });
    if (!out.length) return null;
    return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//K-GUIDE//JP\r\nCALSCALE:GREGORIAN\r\n' + out.join('\r\n') + '\r\nEND:VCALENDAR\r\n';
  }
  function downloadIcs(t) {
    var s = icsFor(t);
    if (!s) { toast(T.noFlight || 'フライトを登録すると、空港へ向かう時刻をお知らせします'); return; }
    var b = new Blob([s], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'kguide-trip.ics';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  window.KGTRIP_ics = downloadIcs;

  /* ── 알림 설정 · 푸시 ───────────────────────── */
  var NOTIFY_DEF = { airport: false, closed: false, morning: false, homeCard: true };
  var NOTIFY = window.KGNOTIFY = {
    get: function () { var v = lsGet('kg_notify', 'null') || {}; var o = {}; Object.keys(NOTIFY_DEF).forEach(function (k) { o[k] = (v[k] === undefined) ? NOTIFY_DEF[k] : !!v[k]; }); return o; },
    set: function (o) { lsSet('kg_notify', o); try { PUSHJ.reschedule(); } catch (e) { } }
  };
  function deviceId() { var id = ''; try { id = localStorage.getItem('kg_device_id') || ''; } catch (e) { } if (!id) { id = uuid(); try { localStorage.setItem('kg_device_id', id); } catch (e) { } } return id; }
  window.KGDEVICE = deviceId;
  function sb() { return (window.KGA && window.KGA.sb) || null; }
  function b64url(s) { var p = '='.repeat((4 - s.length % 4) % 4); var b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); var a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }

  var PUSHJ = window.KGPUSH = {
    supported: function () { return ('serviceWorker' in navigator) && ('PushManager' in window) && ('Notification' in window); },
    standalone: function () { return window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true); },
    iosNeedsHome: function () { var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); return ios && !PUSHJ.standalone(); },
    reg: function () { if (!('serviceWorker' in navigator)) return Promise.reject(new Error('nosw')); return navigator.serviceWorker.register(base() + 'sw.js', { scope: base() }); },
    async subscribe() {
      if (!PUSHJ.supported()) throw new Error('unsupported');
      var r = await PUSHJ.reg();
      await navigator.serviceWorker.ready;
      var perm = await Notification.requestPermission();
      if (perm !== 'granted') throw new Error('denied');
      var s = await r.pushManager.getSubscription();
      if (!s) s = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64url(VAPID_PUBLIC) });
      var j = s.toJSON();
      var c = sb(); if (c) {
        var uid = null; try { var u = await window.KGA.user(); uid = u ? u.id : null; } catch (e) { }
        /* anon 은 SELECT 권한이 없어 upsert(merge) 가 RLS 에 막힌다 → 지우고 다시 넣는다 */
        try { await c.from('push_subs').delete().eq('endpoint', j.endpoint); } catch (e) { }
        await c.from('push_subs').insert({ device_id: deviceId(), user_id: uid, endpoint: j.endpoint, keys: j.keys, lang: inKo() ? 'ko' : 'ja', created: new Date().toISOString() });
      }
      return s;
    },
    async unsubscribe() {
      try {
        var r = await navigator.serviceWorker.getRegistration(base());
        var s = r && await r.pushManager.getSubscription();
        if (s) { var ep = s.endpoint; await s.unsubscribe(); var c = sb(); if (c) await c.from('push_subs').delete().eq('endpoint', ep); }
      } catch (e) { }
      await PUSHJ.clearJobs();
    },
    async clearJobs() { var c = sb(); if (!c) return; try { await c.from('push_jobs').delete().eq('device_id', deviceId()).eq('sent', false); } catch (e) { } },
    async test() {
      var c = sb(); if (!c) { toast(T.pushNoServer || '通知サーバーに接続できませんでした'); return; }
      await c.from('push_jobs').insert({ device_id: deviceId(), fire_at: new Date().toISOString(), kind: 'test', title: 'K-GUIDE', body: T.pushTest || 'テスト通知です。これが届けば設定完了です', url: base() + 'trip.html', sent: false });
      toast(T.pushTestSent || 'テスト通知を送りました（最大5分）');
    },
    /* 여정 저장 시 알림 시각을 다시 계산해 서버에 올린다 */
    reschedule: function () {
      var c = sb(); if (!c) return;
      clearTimeout(PUSHJ._t);
      PUSHJ._t = setTimeout(function () { PUSHJ._run(); }, 900);
    },
    async _run() {
      var c = sb(); if (!c) return;
      var n = NOTIFY.get();
      try { await c.from('push_jobs').delete().eq('device_id', deviceId()).eq('sent', false); } catch (e) { return; }
      if (!n.airport && !n.closed && !n.morning) return;
      var t = TRIPS.cur(); if (!t) return;
      var uid = null; try { var u = await window.KGA.user(); uid = u ? u.id : null; } catch (e) { }
      var jobs = [], now = Date.now();
      function at(dateStr, min, off) { var d = parseD(dateStr); d.setMinutes(d.getMinutes() + min + (off || 0)); return d; }
      function add(d, kind, title, body) { if (d.getTime() <= now) return; jobs.push({ device_id: deviceId(), user_id: uid, fire_at: d.toISOString(), kind: kind, title: title, body: body, url: base() + 'trip.html', sent: false }); }
      if (n.airport) {
        var ot = outTimeline(t);
        if (ot) {
          var pack = ot.rows[0], leave = ot.rows[1], arr = ot.rows[2];
          add(at(t.end, pack.min, -15), 'airport', 'K-GUIDE', T.pushPack || '🧳 荷造り・チェックアウトの時間です');
          add(at(t.end, pack.min), 'airport', 'K-GUIDE', T.pushPack || '🧳 荷造り・チェックアウトの時間です');
          var lv = (T.pushLeave || '🚗 そろそろホテルを出発 · 空港到着 {t} 目標').replace('{t}', hm(arr.min));
          add(at(t.end, leave.min, -15), 'airport', 'K-GUIDE', lv);
          add(at(t.end, leave.min), 'airport', 'K-GUIDE', lv);
          add(at(t.end, arr.min, -15), 'airport', 'K-GUIDE', (T.pushArrAp || '✈ 空港到着の目標時刻 {t}').replace('{t}', hm(arr.min)));
        }
        var it = inTimeline(t);
        if (it) add(at(t.start, it.tourStart, -15), 'airport', 'K-GUIDE', (T.pushTour || '🗺 観光は {t} から始められます').replace('{t}', hm(it.tourStart)));
      }
      if (n.closed) {
        t.days.forEach(function (d) {
          var shut = (d.spots || []).map(byId).filter(Boolean).filter(function (s) { return shutOn(s, d.date); });
          if (!shut.length) return;
          var prev = addDays(d.date, -1);
          add(at(prev, 20 * 60), 'closed', 'K-GUIDE', (T.pushClosed || '⚠ 明日 {d} は{n}が休館です').replace('{d}', mdw(d.date)).replace('{n}', shut[0].name));
        });
      }
      if (n.morning) {
        t.days.forEach(function (d) {
          var names = (d.spots || []).map(byId).filter(Boolean).map(function (s) { return s.name; });
          if (!names.length) return;
          add(at(d.date, 8 * 60), 'morning', 'K-GUIDE', (T.pushMorning || '☀ 今日は {n}').replace('{n}', names.slice(0, 3).join(' → ')));
        });
      }
      if (!jobs.length) return;
      try { await c.from('push_jobs').insert(jobs); } catch (e) { }
    }
  };

  /* 로그인 동기화 대상에 kg_trips · kg_notify 추가 */
  try {
    var _set = Storage.prototype.setItem;
    if (!Storage.prototype.__kgtrip) {
      Storage.prototype.setItem = function (k, v) {
        _set.apply(this, arguments);
        if (this === window.localStorage && (k === 'kg_trips' || k === 'kg_notify') && window.KGA && KGA.push) KGA.push();
      };
      Storage.prototype.__kgtrip = 1;
    }
  } catch (e) { }

  /* ── 페이지별 부팅 ─────────────────────────── */
  function boot() {
    migrate();
    bar();
    if (document.getElementById('kgtrip')) window.KGTRIP_render && window.KGTRIP_render();
    if (document.getElementById('kghomecard')) window.KGHOME_render && window.KGHOME_render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);

  window.KGTRIP = { TRIPS: TRIPS, dayPlan: dayPlan, tlFor: tlFor, shutOn: shutOn, mdw: mdw, md: md, hm: hm, toMin: toMin, addDays: addDays, diffDays: diffDays, ymd: ymd, parseD: parseD, todayS: todayS, esc: esc, bgOf: bgOf, byId: byId, sheet: sheet, closeSheet: closeSheet, toast: toast, pickDay: pickDay, dayChips: dayChips, etaMin: etaMin, apLabel: apLabel, AP_LIST: AP_LIST, NOTIFY: NOTIFY, PUSH: PUSHJ, freePool: freePool, uuid: uuid, lsGet: lsGet, lsSet: lsSet, DOW: DOW, pad: pad, up: up, base: base, inKo: inKo, dist: dist, distKm: distKm, legOf: legOf, hoursRange: hoursRange, TCFG: TCFG, tidyOrder: tidyOrder, autoPlan: autoPlan, applyPlan: applyPlan, dayWindow: dayWindow, CS: CS };
})();

/* ═══ trip.html 화면 ═══════════════════════════════════════════ */
(function () {
  'use strict';
  var K = window.KGTRIP, T = window.KGT || {};
  var TRIPS = K.TRIPS, esc = K.esc, mdw = K.mdw, md = K.md, hm = K.hm, byId = K.byId;
  var root, state = { view: 'list', id: '', d: 0, pool: false, edit: false };

  function q(n) { return new URLSearchParams(location.search).get(n); }
  function setUrl() {
    var s = 'trip.html';
    if (state.view === 'new') s += '?new=1' + (state.id ? '&id=' + state.id : '');
    else if (state.view === 'day') s += '?id=' + state.id + '&d=' + state.d;
    try { history.replaceState(null, '', s); } catch (e) { }
  }
  function go(v, opt) { Object.assign(state, opt || {}); state.view = v; setUrl(); render(); }

  /* ── 부품 ── */
  function card(inner, style) { return '<div style="border-radius:16px; background:#fff; box-shadow:0 2px 8px rgba(131,139,180,.12); ' + (style || '') + '">' + inner + '</div>'; }
  function h1(t, sub) {
    return '<div style="display:flex; align-items:center; justify-content:space-between; padding:20px 16px 0; gap:8px;">'
      + '<div style="min-width:0; display:flex; flex-direction:column; gap:2px;">'
      + '<div style="font-size:20px; font-weight:700; color:#111527; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(t) + '</div>'
      + (sub ? '<div style="font-size:12px; font-weight:500; color:#6B6E80;">' + esc(sub) + '</div>' : '') + '</div>'
      + '<div style="display:flex; align-items:center; justify-content:center; width:48px; height:48px; flex-shrink:0; border-radius:16px; background:#F2F4FC;"><k-icon name="RoutingSize24" size="24" style="color:#3F52B4"></k-icon></div></div>';
  }

  /* ── 1. 여행 목록 ── */
  function renderList() {
    var l = TRIPS.all().slice().sort(function (a, b) { return a.start < b.start ? -1 : 1; });
    var h = h1(T.title || '旅程をつくる', l.length ? (T.nTrips || '{n}件の旅程').replace('{n}', l.length) : '');
    h += '<div style="display:flex; flex-direction:column; gap:12px; padding:20px 16px 0;">';
    if (!l.length) {
      h += card('<div style="padding:32px 16px; display:flex; flex-direction:column; align-items:center; gap:12px;">'
        + '<k-icon name="RoutingSize24" size="32" style="color:#9C9FAF"></k-icon>'
        + '<div style="font-size:14px; font-weight:600; line-height:20px; color:#4B4F63; text-align:center;">' + esc(T.emptyList || 'まだ旅程がありません') + '</div>'
        + '<div style="font-size:12px; font-weight:500; line-height:18px; color:#9C9FAF; text-align:center;">' + esc(T.emptyListSub || '旅行の日にちを決めて、行きたい場所を入れていきましょう') + '</div></div>');
    }
    l.forEach(function (t) {
      var n = TRIPS.placed(t).length, cur = TRIPS.cur();
      h += '<div data-open="' + t.id + '" style="cursor:pointer; border-radius:16px; background:#fff; box-shadow:0 2px 8px rgba(131,139,180,.12); padding:14px 16px; display:flex; flex-direction:column; gap:8px;">'
        + '<div style="display:flex; align-items:center; gap:8px;">'
        + '<div style="flex:1; min-width:0; font-size:16px; font-weight:700; color:#111527; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(t.name || TRIPS.autoName(t)) + '</div>'
        + (cur && cur.id === t.id ? '<span style="flex-shrink:0; display:inline-flex; align-items:center; height:22px; padding:0 8px; border-radius:8px; background:#F2F4FC; color:#3F52B4; font-size:11px; font-weight:700;">' + esc(T.current || '表示中') + '</span>' : '')
        + '</div>'
        + '<div style="font-size:12px; font-weight:500; color:#6B6E80;">' + esc(TRIPS.label(t)) + ' · ' + n + esc(T.spotUnit || 'スポット') + '</div>'
        + '<div style="display:flex; gap:8px; padding-top:4px;">'
        + '<div data-edit="' + t.id + '" style="flex:1; height:36px; border-radius:12px; background:#F2F4FC; color:#3F52B4; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; cursor:pointer;">' + esc(T.editTrip || '旅程を編集') + '</div>'
        + '<div data-del="' + t.id + '" style="width:44px; height:36px; border-radius:12px; background:#F7F7FA; color:#B22459; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center; cursor:pointer;">✕</div>'
        + '</div></div>';
    });
    h += '<div data-new="1" style="cursor:pointer; height:48px; border-radius:16px; background:#3F52B4; color:#fff; font-size:16px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px;">' + esc(T.newTrip || '＋ 新しい旅程') + '</div>';
    h += '</div><div style="height:130px;"></div>';
    return h;
  }

  /* ── 2. 달력 부품 ── */
  var calM = null;
  function calendar(sel) {
    var today = K.parseD(K.todayS());
    if (!calM) calM = new Date(today.getFullYear(), today.getMonth(), 1);
    var y = calM.getFullYear(), m = calM.getMonth();
    var first = new Date(y, m, 1), lead = first.getDay(), last = new Date(y, m + 1, 0).getDate();
    var h = '<div style="border-radius:16px; background:#fff; box-shadow:inset 0 0 0 1px #E1E3EC; padding:12px 10px 10px;">'
      + '<div style="display:flex; align-items:center; justify-content:space-between; padding:0 6px 8px;">'
      + '<div data-cal="-1" style="width:36px;height:36px;border-radius:18px;background:#F2F4FC;display:flex;align-items:center;justify-content:center;cursor:pointer;"><k-icon name="ArrowRightSize20" size="18" style="color:#3F52B4; transform:rotate(180deg)"></k-icon></div>'
      + '<div style="font-size:15px; font-weight:700; color:#111527;">' + y + '.' + K.pad(m + 1) + '</div>'
      + '<div data-cal="1" style="width:36px;height:36px;border-radius:18px;background:#F2F4FC;display:flex;align-items:center;justify-content:center;cursor:pointer;"><k-icon name="ArrowRightSize20" size="18" style="color:#3F52B4"></k-icon></div>'
      + '</div><div style="display:grid; grid-template-columns:repeat(7,1fr); gap:2px;">';
    K.DOW().forEach(function (d, i) { h += '<div style="height:24px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:' + (i === 0 ? '#B22459' : i === 6 ? '#3F52B4' : '#9C9FAF') + ';">' + esc(d) + '</div>'; });
    for (var i = 0; i < lead; i++) h += '<div></div>';
    for (var dnum = 1; dnum <= last; dnum++) {
      var ds = y + '-' + K.pad(m + 1) + '-' + K.pad(dnum);
      var past = K.parseD(ds) < today;
      var isS = sel.start === ds, isE = sel.end === ds;
      var inR = sel.start && sel.end && ds > sel.start && ds < sel.end;
      var bgc = (isS || isE) ? '#3F52B4' : inR ? '#E9ECF8' : 'transparent';
      var fg = (isS || isE) ? '#fff' : past ? '#D1D3DB' : '#111527';
      h += '<div ' + (past ? '' : 'data-pick="' + ds + '"') + ' style="height:42px; display:flex; align-items:center; justify-content:center; border-radius:12px; background:' + bgc + '; color:' + fg + '; font-family:Poppins,sans-serif; font-size:14px; font-weight:600; cursor:' + (past ? 'default' : 'pointer') + ';">' + dnum + '</div>';
    }
    h += '</div></div>';
    return h;
  }

  /* ── 3. 새 여행 / 편집 ── */
  var draft = null;
  function renderNew() {
    var t = draft;
    var sel = { start: t.start, end: t.end };
    var nights = (t.start && t.end) ? TRIPS.nights(t) : '';
    var h = h1(state.id ? (T.editTrip || '旅程を編集') : (T.newTripTitle || '新しい旅程'), '');
    h += '<div style="display:flex; flex-direction:column; gap:20px; padding:18px 16px 0;">';
    /* 날짜 */
    h += '<div style="display:flex; flex-direction:column; gap:10px;"><div style="font-size:16px; font-weight:700; color:#111527;">' + esc(T.pickDates || '到着日・帰国日') + '</div>';
    h += '<div style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:' + (t.start ? '#111527' : '#9C9FAF') + ';">'
      + '<span>' + esc(t.start ? mdw(t.start) : (T.arriveDay || '到着日')) + '</span><span style="color:#9C9FAF;">〜</span>'
      + '<span style="color:' + (t.end ? '#111527' : '#9C9FAF') + ';">' + esc(t.end ? mdw(t.end) : (T.leaveDay || '帰国日')) + '</span>'
      + (nights ? '<span style="margin-left:auto; display:inline-flex; align-items:center; height:24px; padding:0 10px; border-radius:12px; background:#F2F4FC; color:#3F52B4; font-size:12px; font-weight:700;">' + esc(nights) + '</span>' : '') + '</div>';
    h += calendar(sel);
    h += '<div style="font-size:11px; font-weight:500; color:#9C9FAF;">' + esc(T.maxDays || '最大10日まで選べます') + '</div></div>';
    /* Day 미리보기 */
    if (t.start && t.end) {
      h += '<div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:2px;">';
      TRIPS.fixDays(t).days.forEach(function (d, i) {
        h += '<div style="flex-shrink:0; padding:8px 12px; border-radius:12px; background:#F7F7FA; text-align:center;"><div style="font-size:13px; font-weight:700; color:#111527;">' + esc(mdw(d.date)) + '</div><div style="font-size:10px; font-weight:600; color:#9C9FAF;">Day ' + (i + 1) + '</div></div>';
      });
      h += '</div>';
    }
    /* 항공편 */
    h += '<div style="display:flex; flex-direction:column; gap:10px;"><div style="font-size:16px; font-weight:700; color:#111527;">' + esc(T.flightSec || 'フライト') + '<span style="font-size:11px; font-weight:500; color:#9C9FAF; margin-left:6px;">' + esc(T.optional || '任意') + '</span></div>';
    h += '<div style="font-size:11px; font-weight:500; line-height:1.6; color:#6B6E80;">' + esc(T.flightHelp || '入れておくと、空港へ向かう時刻を計算してお知らせします') + '</div>';
    h += flightBox('in', t.flights.in);
    h += flightBox('out', t.flights.out);
    h += '<label style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; color:#4B4F63; cursor:pointer;"><input type="checkbox" id="fintl" ' + (t.intl === false ? '' : 'checked') + ' style="width:18px;height:18px;accent-color:#3F52B4;">' + esc(T.intlFlight || '国際線（空港には3時間前に到着）') + '</label>';
    h += '</div>';
    /* 도시 */
    h += '<div style="display:flex; flex-direction:column; gap:10px;"><div style="font-size:16px; font-weight:700; color:#111527;">' + esc(T.citySec || '都市') + '</div><div style="display:flex; gap:8px; flex-wrap:wrap;">';
    (T.cities || ['ソウル', '釜山', '済州', '近郊']).forEach(function (c) {
      var on = (t.city || []).indexOf(c) >= 0;
      h += '<div data-city="' + esc(c) + '" style="cursor:pointer; display:inline-flex; align-items:center; height:36px; padding:0 14px; border-radius:18px; background:' + (on ? '#3F52B4' : '#fff') + '; color:' + (on ? '#fff' : '#4B4F63') + '; box-shadow:' + (on ? 'none' : 'inset 0 0 0 1px #D1D3DB') + '; font-size:13px; font-weight:600;">' + esc(c) + '</div>';
    });
    h += '</div></div>';
    /* 이름 */
    h += '<div style="display:flex; flex-direction:column; gap:8px;"><div style="font-size:16px; font-weight:700; color:#111527;">' + esc(T.nameSec || '名前') + '</div>'
      + '<input id="tname" value="' + esc(t.name || '') + '" placeholder="' + esc(t.start && t.end ? TRIPS.autoName(t) : '') + '" style="width:100%; box-sizing:border-box; height:48px; border:0; box-shadow:inset 0 0 0 1px #E1E3EC; border-radius:14px; background:#fff; padding:0 14px; font-size:15px; font-family:inherit; color:#111527; outline:none;"></div>';
    /* 숙소 */
    h += '<div style="display:flex; flex-direction:column; gap:8px;"><div style="font-size:16px; font-weight:700; color:#111527;">' + esc(T.staySec || '泊まるところ') + '</div>';
    h += '<div style="font-size:11px; font-weight:500; color:#6B6E80;">' + esc(T.stayHelp || '空港へ向かう時刻の計算に使います') + '</div>';
    if (t.stay) {
      h += card('<div style="padding:10px 14px; display:flex; align-items:center; gap:12px;"><div style="width:48px;height:48px;flex-shrink:0;border-radius:10px;background:' + K.bgOf(t.stay.photo) + ';"></div>'
        + '<div style="flex:1; min-width:0;"><div style="font-size:14px; font-weight:700; color:#111527; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(t.stay.name) + '</div>'
        + '<div style="font-size:11px; font-weight:500; color:#6B6E80;">' + esc(t.stay.area || '') + '</div></div>'
        + '<div data-stay="1" style="flex-shrink:0; height:32px; padding:0 12px; border-radius:12px; background:#F2F4FC; color:#3F52B4; font-size:12px; font-weight:600; display:flex; align-items:center; cursor:pointer;">' + esc(T.change || '変える') + '</div></div>');
    } else {
      h += '<div data-stay="1" style="cursor:pointer; height:44px; border-radius:16px; background:#fff; box-shadow:inset 0 0 0 1px #3F52B4; color:#3F52B4; font-size:14px; font-weight:600; display:flex; align-items:center; justify-content:center;">' + esc(T.pickStay || '泊まるところを選ぶ') + '</div>';
    }
    h += '</div>';
    /* 저장 */
    h += '<div style="display:flex; flex-direction:column; gap:8px; padding-bottom:8px;">'
      + (state.id && TRIPS.get(state.id) ? '<div data-omaedit="1" style="cursor:pointer; height:46px; border-radius:16px; background:#fff; box-shadow:inset 0 0 0 1px #3F52B4; color:#3F52B4; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px;">\u2728 ' + esc(T.omaRedo || 'おまかせで組み直す') + '</div>' : '')
      + '<div data-save="1" style="cursor:pointer; height:48px; border-radius:16px; background:' + (t.start && t.end ? '#3F52B4' : '#F2F4FC') + '; color:' + (t.start && t.end ? '#fff' : '#9C9FAF') + '; font-size:16px; font-weight:600; display:flex; align-items:center; justify-content:center;">' + esc(T.save || '保存') + '</div>'
      + '<div data-cancel="1" style="cursor:pointer; height:40px; color:#6B6E80; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center;">' + esc(T.cancel || 'キャンセル') + '</div></div>';
    h += '</div><div style="height:130px;"></div>';
    return h;
  }
  function flightBox(kind, f) {
    var isIn = kind === 'in';
    return '<div style="border-radius:16px; background:#fff; box-shadow:inset 0 0 0 1px #E1E3EC; padding:12px 14px; display:flex; flex-direction:column; gap:8px;">'
      + '<div style="font-size:13px; font-weight:700; color:#3F52B4;">' + esc(isIn ? (T.inFlight || '到着便') : (T.outFlight || '帰国便')) + '</div>'
      + '<div style="display:flex; gap:8px;">'
      + '<input id="f' + kind + 'no" value="' + esc((f && f.no) || '') + '" placeholder="' + esc(T.flightNo || '便名') + '" style="flex:1; min-width:0; box-sizing:border-box; height:44px; border:0; box-shadow:inset 0 0 0 1px #E1E3EC; border-radius:12px; padding:0 12px; font-size:14px; font-family:inherit; outline:none;">'
      + '<div id="f' + kind + 'time" data-tf="' + kind + '" data-v="' + esc((f && f.time) || '') + '" style="cursor:pointer; width:118px; flex-shrink:0; box-sizing:border-box; height:44px; box-shadow:inset 0 0 0 1px #E1E3EC; border-radius:12px; padding:0 12px; font-size:15px; font-weight:600; font-family:Poppins,sans-serif; display:flex; align-items:center; justify-content:center; color:' + ((f && f.time) ? '#111527' : '#9C9FAF') + ';">' + esc((f && f.time) || '--:--') + '</div>'
      + '</div><div style="display:flex; gap:6px; overflow-x:auto;">'
      + K.AP_LIST.map(function (a) {
        var on = f && f.airport === a;
        return '<div data-ap="' + kind + ':' + a + '" style="cursor:pointer; flex-shrink:0; display:inline-flex; align-items:center; height:32px; padding:0 12px; border-radius:16px; background:' + (on ? '#3F52B4' : '#F7F7FA') + '; color:' + (on ? '#fff' : '#4B4F63') + '; font-size:12px; font-weight:600;">' + esc(K.apLabel(a)) + '</div>';
      }).join('') + '</div>'
      + '<div style="font-size:11px; font-weight:500; color:#9C9FAF;">' + esc(isIn ? (T.inHelp || '到着空港と着陸時刻') : (T.outHelp || '出発空港と出発時刻')) + '</div></div>';
  }

  /* ── 4. Day 화면 ── */
  function renderDay() {
    var t = TRIPS.get(state.id) || TRIPS.cur();
    if (!t) return renderList();
    state.id = t.id; TRIPS.setCur(t.id);
    if (state.d >= t.days.length) state.d = t.days.length - 1;
    if (state.d < 0) state.d = 0;
    var day = t.days[state.d], plan = K.dayPlan(t, state.d), tl = K.tlFor(t, day.date);
    var h = '';
    /* 헤더 */
    h += '<div style="display:flex; align-items:center; justify-content:space-between; padding:20px 16px 0; gap:8px;">'
      + '<div style="min-width:0; display:flex; flex-direction:column; gap:2px;">'
      + '<div data-switch="1" style="cursor:pointer; display:flex; align-items:center; gap:4px; font-size:20px; font-weight:700; color:#111527;"><span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:250px;">' + esc(t.name || TRIPS.autoName(t)) + '</span><span style="font-size:13px; color:#6B6E80;">▾</span></div>'
      + '<div style="font-size:12px; font-weight:500; color:#6B6E80;">' + esc(TRIPS.label(t)) + '</div></div>'
      + '<div data-editrip="1" style="cursor:pointer; display:flex; align-items:center; justify-content:center; width:48px; height:48px; flex-shrink:0; border-radius:16px; background:#F2F4FC;"><k-icon name="Setting2Size24" size="22" style="color:#3F52B4"></k-icon></div></div>';
    /* Day 탭 */
    h += '<div style="display:flex; gap:8px; overflow-x:auto; padding:16px 16px 2px;">';
    t.days.forEach(function (d, i) {
      var p = K.dayPlan(t, i), on = i === state.d;
      h += '<div data-day="' + i + '" style="cursor:pointer; flex-shrink:0; min-width:78px; padding:8px 12px; border-radius:14px; background:' + (on ? '#3F52B4' : '#fff') + '; box-shadow:' + (on ? 'none' : 'inset 0 0 0 1px #E1E3EC') + '; text-align:center;">'
        + '<div style="font-size:14px; font-weight:700; color:' + (on ? '#fff' : '#111527') + ';">' + esc(mdw(d.date)) + '</div>'
        + '<div style="font-size:10px; font-weight:600; color:' + (on ? 'rgba(255,255,255,.8)' : '#9C9FAF') + '; margin-top:2px;">Day ' + (i + 1) + (p.warn ? ' · <span style="color:' + (on ? '#FFD3E2' : '#B22459') + '">⚠' + p.warn + '</span>' : '') + '</div></div>';
    });
    h += '</div>';
    /* Day 요약 바 (한 줄) */
    h += sumBar(t, plan, state.d);
    /* 타임라인 카드 */
    h += '<div style="padding:16px 16px 0;">' + (tl ? tlCard(t, tl) : noFlightCard(t)) + '</div>';
    /* 지도 */
    if (plan.rows.length) {
      h += '<div style="margin:16px 16px 0; display:flex; flex-direction:column; gap:8px;">'
        + '<div id="kgmapbox" style="position:relative; height:230px; border-radius:16px; overflow:hidden; background:#F2F4FC;">'
        + '<div id="kgmap" style="position:absolute; left:0; top:0; right:0; bottom:0;"></div>'
        + '<div id="kgmaphint" style="position:absolute; left:50%; bottom:20px; transform:translateX(-50%); z-index:600; pointer-events:none; display:flex; align-items:center; justify-content:center; height:28px; padding:0 14px; border-radius:14px; background:rgba(255,255,255,.88); box-shadow:0 2px 8px rgba(131,139,180,.20); color:#4B4F63; font-size:12px; font-weight:600; white-space:nowrap;">' + esc(T.mapHint || '地図をタップして操作') + '</div>'
        + '<div id="kgmapfs" style="position:absolute; right:10px; top:10px; z-index:601; display:flex; align-items:center; justify-content:center; height:30px; padding:0 12px; border-radius:15px; background:#fff; box-shadow:0 2px 8px rgba(131,139,180,.24); color:#3F52B4; font-size:12px; font-weight:600; cursor:pointer;">' + esc(T.fullScreen || '全画面') + '</div></div>'
        + '<a href="https://map.naver.com/p/search/' + encodeURIComponent((byId(plan.rows[0].id) || {}).ko || plan.rows[0].name) + '" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:6px; height:40px; border-radius:16px; background:#fff; color:#3F52B4; font-size:14px; font-weight:600; box-shadow:0 2px 8px rgba(131,139,180,.12); text-decoration:none;"><k-icon name="LocationSize18" size="18" style="color:#3F52B4"></k-icon>' + esc(T.naverOpen || 'NAVER地図で開く') + '</a></div>';
    }
    /* 스팟 목록 */
    h += '<div style="display:flex; align-items:baseline; justify-content:space-between; padding:20px 16px 0;">'
      + '<div style="display:flex; align-items:center; gap:8px; min-width:0;"><div style="font-size:16px; font-weight:700; color:#111527;">' + esc(mdw(day.date)) + ' · ' + plan.rows.length + esc(T.spotUnit || 'スポット') + '</div>'
      + '<div data-tstart="1" style="cursor:pointer; flex-shrink:0; display:inline-flex; align-items:center; gap:4px; height:26px; padding:0 10px; border-radius:13px; background:#F2F4FC; color:#3F52B4; font-size:11px; font-weight:700;">' + esc(T.startAt || '開始') + ' <span style="font-family:Poppins,sans-serif;">' + esc(day.start || '10:00') + '</span></div></div>'
      + '</div>';
    h += '<div style="display:flex; flex-direction:column; gap:12px; padding:12px 16px 0;">';
    if (!plan.rows.length) {
      h += card('<div style="padding:24px 16px; display:flex; flex-direction:column; align-items:center; gap:12px;">'
        + '<div style="font-size:14px; font-weight:600; color:#4B4F63; text-align:center;">' + esc(T.emptyDay || 'この日はまだ空いています') + '</div>'
        + '<div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; justify-content:center;">'
        + '<div data-oma="1" style="cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; height:44px; padding:0 20px; border-radius:16px; background:#3F52B4; color:#fff; font-size:14px; font-weight:700;">\u2728 ' + esc(T.omaBtn || 'おまかせで組む') + '</div>'
        + '<a href="search.html" style="display:flex; align-items:center; justify-content:center; height:44px; padding:0 20px; border-radius:16px; background:#fff; box-shadow:inset 0 0 0 1px #3F52B4; color:#3F52B4; font-size:14px; font-weight:600; text-decoration:none;">' + esc(T.findSpots || 'スポットを探す') + '</a></div>'
        + (K.dayWindow(t, state.d).hasFlight ? '' : '<div style="font-size:11px; font-weight:500; color:#9C9FAF; text-align:center; line-height:1.6;">' + esc(T.omaNoFlight || 'フライトを登録すると、もっと正確に組めます') + '</div>') + '</div>');
    }
    plan.rows.forEach(function (r, i) {
      h += '<div style="display:flex; flex-direction:column; gap:6px;">'
        + '<div style="display:flex; gap:10px; align-items:stretch;">'
        + '<div style="flex:1; min-width:0; border-radius:16px; background:#fff; box-shadow:0 2px 8px rgba(131,139,180,.12); padding:8px; display:flex; gap:12px; align-items:center;">'
        + '<a href="spot.html?id=' + r.id + '" style="display:flex; gap:12px; align-items:center; flex:1; min-width:0; text-decoration:none; color:inherit;">'
        + '<div style="width:56px; height:56px; flex-shrink:0; border-radius:8px; background:' + r.photo + ';"></div>'
        + '<div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:3px;">'
        + '<div style="display:flex; align-items:center; gap:6px;"><span style="font-family:Poppins,sans-serif; font-size:12px; font-weight:600; color:#3F52B4;">' + r.time + '</span>'
        + '<span style="font-size:10px; font-weight:600; color:#9C9FAF;">' + esc(T.stayFor || '滞在') + ' ' + r.stay + esc(T.min || '分') + '</span></div>'
        + '<div style="font-size:14px; font-weight:700; color:#111527; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(r.name) + '</div>'
        + '<div style="font-size:11px; font-weight:500; color:#6B6E80; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(r.area) + '</div>'
        + (r.shut ? '<div style="font-size:11px; font-weight:700; color:#B22459;">⚠ ' + esc(T.thisDayShut || 'この日は休館') + '</div>' : '')
        + (r.late ? '<div style="font-size:11px; font-weight:700; color:#B22459;">⚠ ' + esc(T.tooLate || '間に合わない可能性') + '</div>' : '')
        + hoursWarn(r)
        + '</div></a></div>'
        + '<div style="display:flex; flex-direction:column; gap:4px; flex-shrink:0;">'
        + '<div data-up="' + i + '" style="width:32px; height:32px; border-radius:16px; background:#F2F4FC; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity:' + (i === 0 ? '.3' : '1') + ';"><k-icon name="ArrowRightSize20" size="18" style="color:#3F52B4; transform:rotate(-90deg)"></k-icon></div>'
        + '<div data-down="' + i + '" style="width:32px; height:32px; border-radius:16px; background:#F2F4FC; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity:' + (i >= plan.rows.length - 1 ? '.3' : '1') + ';"><k-icon name="ArrowRightSize20" size="18" style="color:#3F52B4; transform:rotate(90deg)"></k-icon></div>'
        + '<div data-rm="' + i + '" style="width:32px; height:32px; border-radius:16px; background:#F2F4FC; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#B22459; font-size:15px; font-weight:700; line-height:1;">✕</div>'
        + '</div></div>'
        + '<div style="display:flex; align-items:center; gap:8px; padding-left:4px;">'
        + '<div data-move="' + i + '" style="cursor:pointer; display:inline-flex; align-items:center; height:28px; padding:0 12px; border-radius:14px; background:' + (r.shut || r.late ? '#FCF2F6' : '#F7F7FA') + '; color:' + (r.shut || r.late ? '#B22459' : '#4B4F63') + '; font-size:11px; font-weight:700;">' + esc(T.moveDay || '別の日へ') + '</div>'
        + '</div></div>'
        + legLine(r);
    });
    if (plan.rows.length) {
      h += '<a href="search.html" style="display:flex; align-items:center; justify-content:center; gap:6px; height:48px; border-radius:16px; background:#fff; box-shadow:inset 0 0 0 1px #3F52B4; color:#3F52B4; font-size:16px; font-weight:600; text-decoration:none;"><k-icon name="AddSize20" size="20" style="color:#3F52B4"></k-icon>' + esc(T.addSpot || 'スポットを追加') + '</a>';
    }
    h += '</div>';
    h += '<div style="height:' + (state.pool ? 420 : 180) + 'px;"></div>';
    return h;
  }

  /* ── 11차 A: 요약 바 · 이동 줄 · 영업시간 경고 ── */
  var ORANGE = '#A8620A', ORANGE_BG = '#FBF1E4';
  function dur(m) { m = Math.max(0, Math.round(m)); var hh = Math.floor(m / 60), mm = m % 60; return hh ? (T.hLeft || '{h}時間{m}分').replace('{h}', hh).replace('{m}', mm) : (T.mLeft || '{m}分').replace('{m}', mm); }
  function sumBar(t, plan, di) {
    if (!plan.rows.length) return '';
    var act = plan.stayMin + plan.moveMin;
    var many = act > 0 && (plan.moveMin / act) > K.TCFG.MOVE_RATIO;
    var txt = (T.sumTour || '観光 {t}').replace('{t}', dur(plan.stayMin))
      + ' · ' + (T.sumMove || '移動 約{t}').replace('{t}', dur(plan.moveMin))
      + ' · ' + (T.sumSpots || '{n}スポット').replace('{n}', plan.rows.length);
    var h = '<div style="padding:12px 16px 0;">'
      + '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:9px 12px; border-radius:12px; background:' + (many ? ORANGE_BG : '#F7F7FA') + ';">'
      + '<div style="font-size:12px; font-weight:600; color:' + (many ? ORANGE : '#4B4F63') + ';">' + esc(txt) + '</div>'
      + (many ? '<div style="font-size:11px; font-weight:700; color:' + ORANGE + ';">' + esc(T.moveMany || '移動が多めです') + '</div>' : '')
      + '</div>';
    h += hintLine(t, plan, di, many);
    var w = K.dayWindow(t, di);
    if (w.luggage) h += '<div style="padding:6px 4px 0; font-size:11px; font-weight:500; color:#9C9FAF;">' + esc(T.luggageHint || '荷物がある日は少なめでも大丈夫') + '</div>';
    return h + '</div>';
  }
  /* 제안 한 줄 — 금지가 아니라 제안. 무시해도 아무 일도 일어나지 않는다 */
  function hintLine(t, plan, di, many) {
    if (plan.rows.length < 3) return '';
    var areas = plan.rows.map(function (r) { var s2 = K.byId(r.id) || {}; return s2.areaKey || r.area || ''; });
    var seen = {}, back = false, prev = '';
    areas.forEach(function (a) { if (!a) return; if (a !== prev) { if (seen[a]) back = true; seen[a] = 1; prev = a; } });
    var act = plan.stayMin + plan.moveMin;
    var longDay = act > 660;
    var r = K.tidyOrder(t, di);
    var gain = (r && !r.same) ? (r.now - r.next) : 0;
    var bigGain = r && r.now > 0 && (gain / r.now) >= 0.2;
    var msg = '';
    if (many || back || bigGain || longDay) {
      if (gain >= K.TCFG.SORT_GAIN_MIN) msg = (T.hintTidy || '順番を整えると 約{n}分 短くなります').replace('{n}', Math.round(gain));
      else if (back) msg = T.hintBack || '同じエリアを行ったり来たりしています';
      else if (longDay) msg = T.hintLong || '今日は長めの一日です。無理のない範囲で';
    }
    return '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:8px 4px 0;">'
      + '<div style="flex:1; min-width:0; font-size:11px; font-weight:500; color:#6B6E80; line-height:1.6;">' + esc(msg) + '</div>'
      + '<div data-tidy="1" style="cursor:pointer; flex-shrink:0; display:inline-flex; align-items:center; height:26px; padding:0 11px; border-radius:13px; background:#F2F4FC; color:#3F52B4; font-size:11px; font-weight:700;">' + esc(T.tidyBtn || '順番を整える') + '</div></div>';
  }
  function legLine(r) {
    if (!r.hasLeg) return '';
    if (r.legCross) return '<div style="padding:2px 0 0 6px; font-size:11px; font-weight:700; color:#B22459;">⚠ ' + esc(T.legCross || '別の都市です') + '</div>';
    var ic = r.legMode === 'metro' ? '🚇' : '🚶';
    var tx = (r.legMode === 'metro' ? (T.legMetro || '地下鉄 約{n}分') : (T.legWalk || '徒歩 約{n}分')).replace('{n}', r.legMin);
    return '<div style="padding:2px 0 0 6px; font-size:11px; font-weight:500; color:#9C9FAF;">' + ic + ' ' + esc(tx) + '</div>';
  }
  function hoursWarn(r) {
    var m = '';
    if (r.hw === 'late') m = (T.hoursLate || '到着予定 {a} · 営業は {c} まで').replace('{a}', r.time).replace('{c}', r.hClose);
    else if (r.hw === 'early') m = (T.hoursEarly || '到着予定 {a} · 営業は {o} から').replace('{a}', r.time).replace('{o}', r.hOpen);
    else if (r.hShort) m = T.hoursShort || '滞在時間が足りません';
    if (!m) return '';
    return '<div style="font-size:11px; font-weight:700; color:' + ORANGE + ';">' + esc(m) + '</div>';
  }

  /* ── 11차 A-5: 「順番を整える」 시트 ── */
  function tidySheet() {
    var t = TRIPS.get(state.id) || TRIPS.cur(); if (!t) return;
    var r = K.tidyOrder(t, state.d);
    if (!r || r.same || (r.now - r.next) < K.TCFG.SORT_GAIN_MIN) { K.toast(T.tidyFine || '今の順番で問題ありません'); return; }
    var inner = '<div style="padding-top:8px; display:flex; flex-direction:column; gap:12px;">'
      + '<div style="padding:14px 16px; border-radius:16px; background:#F2F4FC; font-size:15px; font-weight:700; color:#111527; text-align:center;">'
      + esc((T.tidyCmp || '移動 {a} → 約{b}').replace('{a}', dur(r.now)).replace('{b}', dur(r.next))) + '</div>'
      + '<div style="display:flex; flex-direction:column; gap:6px;">';
    r.ids.forEach(function (id, i) {
      var sp = K.byId(id) || {};
      inner += '<div style="display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px; background:#fff; box-shadow:inset 0 0 0 1px #E1E3EC;">'
        + '<span style="font-family:Poppins,sans-serif; font-size:12px; font-weight:700; color:#3F52B4; width:16px;">' + (i + 1) + '</span>'
        + '<span style="flex:1; min-width:0; font-size:13px; font-weight:600; color:#111527; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(sp.name || id) + '</span>'
        + '<span style="font-size:11px; font-weight:500; color:#9C9FAF;">' + esc(sp.area || '') + '</span></div>';
    });
    inner += '</div><div style="display:flex; gap:8px;">'
      + '<div data-tidyno="1" style="cursor:pointer; flex:1; height:48px; border-radius:16px; background:#F7F7FA; color:#4B4F63; font-size:15px; font-weight:700; display:flex; align-items:center; justify-content:center;">' + esc(T.tidyNo || 'やめる') + '</div>'
      + '<div data-tidyok="1" style="cursor:pointer; flex:1.4; height:48px; border-radius:16px; background:#3F52B4; color:#fff; font-size:15px; font-weight:700; display:flex; align-items:center; justify-content:center;">' + esc(T.tidyOk || 'この順番にする') + '</div></div></div>';
    var box = K.sheet(T.tidyTitle || '順番を整える', inner);
    box.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-tidyok],[data-tidyno]'); if (!b) return;
      if (b.getAttribute('data-tidyok')) {
        var t2 = TRIPS.get(state.id) || TRIPS.cur(), bak = (t2.days[state.d].spots || []).slice();
        t2.days[state.d].spots = r.ids.slice(); TRIPS.put(t2); K.closeSheet(); render();
        window.KGUNDO(T.tidyDone || '順番を変えました', function () { var t3 = TRIPS.get(state.id); t3.days[state.d].spots = bak; TRIPS.put(t3); render(); });
      } else K.closeSheet();
    });
  }

  /* ── 11차 B: 「おまかせ」 제안 시트 ── */
  var omaV = 0;
  function omaSheet(v) {
    var t = TRIPS.get(state.id) || TRIPS.cur(); if (!t) return;
    omaV = v || 0;
    var plan = K.autoPlan(t, omaV);
    var got = plan.days.filter(function (r) { return r.ids && r.ids.length; }).length;
    if (!got) { K.toast(T.omaNone || '入れられるコースが見つかりませんでした'); return; }
    var inner = '<div style="padding-top:6px; display:flex; flex-direction:column; gap:10px;">';
    plan.days.forEach(function (r) {
      var head = mdw(r.date), tag = '';
      if (r.di === 0 && r.w.hasFlight) tag = (T.omaArrive || '到着日 · 観光は {t} から').replace('{t}', K.hm(r.w.from));
      else if (r.di === t.days.length - 1 && r.w.hasFlight) tag = (T.omaLeave || '帰国日 · ホテル出発 {t}').replace('{t}', K.hm(r.w.to));
      inner += '<div style="display:flex; flex-direction:column; gap:5px; padding:12px 14px; border-radius:16px; background:#fff; box-shadow:inset 0 0 0 1px #E1E3EC;">'
        + '<div style="display:flex; align-items:baseline; gap:8px; flex-wrap:wrap;">'
        + '<span style="font-size:13px; font-weight:700; color:#111527;">' + esc(head) + '</span>'
        + (tag ? '<span style="font-size:11px; font-weight:600; color:#6B6E80;">' + esc(tag) + '</span>' : '') + '</div>';
      if (r.busy) inner += '<div style="font-size:12px; font-weight:600; color:#6B6E80;">' + esc((T.omaBusy || '{d} はすでに予定があるのでそのままにしました').replace('{d}', md(r.date))) + '</div>';
      else if (!r.ids) inner += '<div style="font-size:12px; font-weight:600; color:#6B6E80;">' + esc(T.omaMoveOnly || 'この日は移動だけにしました') + '</div>';
      else {
        var mv = 0, sps = r.ids.map(K.byId).filter(Boolean);
        for (var i = 0; i < sps.length - 1; i++) { var l = K.legOf(sps[i], sps[i + 1]); if (l && !l.cross) mv += l.min; }
        inner += '<div style="font-size:14px; font-weight:700; color:#111527;">' + esc(r.course.name) + '</div>'
          + '<div style="font-size:11px; font-weight:500; color:#6B6E80;">' + esc((T.omaCourseSum || '観光 {h}時間 · 移動 約{m}').replace('{h}', r.hours).replace('{m}', dur(mv))) + '</div>'
          + '<div style="font-size:11px; font-weight:500; color:#9C9FAF; line-height:1.6;">' + esc(sps.map(function (x) { return x.name; }).join(' → ')) + '</div>'
          + (r.cut ? '<div style="font-size:11px; font-weight:700; color:#B22459;">' + esc((T.omaCut || '{n}スポットは休館のため外しました').replace('{n}', r.cut)) + '</div>' : '');
      }
      inner += '</div>';
    });
    if (!plan.anyFlight) inner += '<div style="font-size:11px; font-weight:500; color:#9C9FAF; line-height:1.6;">' + esc(T.omaNoFlight || 'フライトを登録すると、もっと正確に組めます') + '</div>';
    inner += '<div style="display:flex; gap:8px; padding-top:2px;">'
      + '<div data-omano="1" style="cursor:pointer; flex:1; height:48px; border-radius:16px; background:#F7F7FA; color:#4B4F63; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center;">' + esc(T.omaCancel || 'やめる') + '</div>'
      + '<div data-omanext="1" style="cursor:pointer; flex:1.2; height:48px; border-radius:16px; background:#fff; box-shadow:inset 0 0 0 1px #3F52B4; color:#3F52B4; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; text-align:center;">' + esc(T.omaOther || '別のプランを見る') + '</div>'
      + '<div data-omaok="1" style="cursor:pointer; flex:1.4; height:48px; border-radius:16px; background:#3F52B4; color:#fff; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center;">' + esc(T.omaApply || 'このプランにする') + '</div></div></div>';
    var box = K.sheet(T.omaTitle || 'おまかせプラン', inner);
    box.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-omaok],[data-omano],[data-omanext]'); if (!b) return;
      if (b.getAttribute('data-omanext')) { K.closeSheet(); setTimeout(function () { omaSheet(omaV + 1); }, 120); return; }
      if (b.getAttribute('data-omaok')) {
        var t2 = TRIPS.get(state.id) || TRIPS.cur();
        var bak = JSON.parse(JSON.stringify(t2));
        K.applyPlan(t2, plan); K.closeSheet(); render();
        window.KGUNDO(T.omaDone || 'プランを入れました', function () { TRIPS.put(bak); render(); });
        return;
      }
      K.closeSheet();
    });
  }

  function modeChips(t) {
    var ms = [['arex', T.mArex || 'AREX'], ['limo', T.mLimo || 'リムジン'], ['taxi', T.mTaxi || 'タクシー']];
    return '<div style="display:flex; gap:6px;">' + ms.map(function (m) {
      var on = (t.mode || 'arex') === m[0];
      return '<div data-mode="' + m[0] + '" style="cursor:pointer; display:inline-flex; align-items:center; height:28px; padding:0 12px; border-radius:14px; background:' + (on ? 'rgba(255,255,255,.24)' : 'rgba(255,255,255,.10)') + '; color:#fff; box-shadow:' + (on ? 'inset 0 0 0 1px rgba(255,255,255,.7)' : 'none') + '; font-size:11px; font-weight:700;">' + esc(m[1]) + '</div>';
    }).join('') + '</div>';
  }
  function nextEvent(tl, dateStr) {
    var now = new Date(), key = K.ymd(now);
    if (key !== dateStr) return null;
    var cur = now.getHours() * 60 + now.getMinutes();
    for (var i = 0; i < tl.rows.length; i++) { var r = tl.rows[i]; if (r.span) continue; if (r.min > cur) return { label: r.label, left: r.min - cur }; }
    return null;
  }
  function leftTxt(m) {
    var hh = Math.floor(m / 60), mm = m % 60;
    return hh ? (T.hLeft || '{h}時間{m}分').replace('{h}', hh).replace('{m}', mm) : (T.mLeft || '{m}分').replace('{m}', mm);
  }
  function tlCard(t, tl) {
    var ne = nextEvent(tl, tl.date);
    var h = '<div style="border-radius:16px; background:#3F52B4; color:#fff; padding:14px 16px; display:flex; flex-direction:column; gap:10px;">'
      + '<div style="display:flex; align-items:center; gap:8px;">'
      + '<div style="flex:1; font-size:14px; font-weight:700;">' + esc(tl.kind === 'out' ? (T.leaveDayTitle || '帰国日のうごき') : (T.arriveDayTitle || '到着日のうごき')) + '</div>'
      + '<div style="font-size:11px; font-weight:600; opacity:.85;">' + esc((tl.flight.no || '') + ' ' + K.apLabel(tl.flight.airport || '')) + '</div></div>';
    if (ne) h += '<div id="kgcount" data-min="' + ne.left + '" data-lab="' + esc(ne.label) + '" style="font-size:13px; font-weight:700; background:rgba(255,255,255,.16); border-radius:12px; padding:8px 12px;">' + esc(ne.label) + ' ' + esc((T.until || 'まで')) + ' ' + esc(leftTxt(ne.left)) + '</div>';
    h += '<div style="display:flex; flex-direction:column; gap:0;">';
    tl.rows.forEach(function (r, i) {
      if (r.span) { h += '<div style="padding:2px 0 2px 22px; font-size:11px; font-weight:500; opacity:.8;">' + esc(r.label) + '</div>'; return; }
      h += '<div style="display:flex; align-items:center; gap:10px; padding:5px 0;">'
        + '<div style="width:8px; height:8px; border-radius:4px; background:#fff; flex-shrink:0; opacity:.9;"></div>'
        + '<div style="font-family:Poppins,sans-serif; font-size:15px; font-weight:700; width:52px; flex-shrink:0;">' + hm(r.min) + '</div>'
        + '<div style="flex:1; min-width:0; font-size:13px; font-weight:600;">' + esc(r.label) + '</div></div>';
    });
    if (tl.kind === 'in') h += '<div style="padding:4px 0 0 22px; font-size:12px; font-weight:700;">' + esc((T.tourFrom || '観光は {t} から').replace('{t}', hm(tl.tourStart))) + '</div>';
    h += '</div>';
    h += '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' + modeChips(t)
      + '<div style="font-size:11px; font-weight:500; opacity:.85;">' + esc((T.etaIs || '移動 約{n}分').replace('{n}', tl.eta)) + '</div></div>';
    h += '<div data-ics="1" style="cursor:pointer; height:38px; border-radius:12px; background:rgba(255,255,255,.18); color:#fff; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">' + esc(T.toCalendar || 'カレンダーに入れる') + '</div>';
    h += '</div>';
    return h;
  }
  function noFlightCard(t) {
    if (t.days.length > 1 && state.d !== 0 && state.d !== t.days.length - 1) return '';
    return '<div data-editrip="1" style="cursor:pointer; border-radius:16px; background:#F2F4FC; padding:14px 16px; display:flex; align-items:center; gap:10px;">'
      + '<k-icon name="InfoCircleSize20" size="20" style="color:#3F52B4"></k-icon>'
      + '<div style="flex:1; font-size:12px; font-weight:600; line-height:1.6; color:#4B4F63;">' + esc(T.noFlight || 'フライトを登録すると、空港へ向かう時刻をお知らせします') + '</div>'
      + '<div style="font-size:12px; font-weight:700; color:#3F52B4; white-space:nowrap;">' + esc(T.enter || '入力') + '</div></div>';
  }

  /* ── 5. 보관함 서랍 ── */
  function drawer() {
    var t = TRIPS.get(state.id) || TRIPS.cur();
    if (!t) return '';
    var ids = TRIPS.poolIds(t);
    var h = '<div id="kgdrawer" style="position:absolute; left:0; right:0; bottom:98px; z-index:800; background:#fff; border-radius:20px 20px 0 0; box-shadow:0 -6px 24px rgba(131,139,180,.20); max-height:' + (state.pool ? '340px' : '58px') + '; overflow:hidden; display:flex; flex-direction:column;">'
      + '<div data-drawer="1" style="cursor:pointer; flex-shrink:0; padding:8px 16px 10px;">'
      + '<div style="width:40px;height:4px;border-radius:100px;background:#D1D3DB;margin:0 auto 8px;"></div>'
      + '<div style="display:flex; align-items:center; gap:8px;"><div style="flex:1; font-size:14px; font-weight:700; color:#111527;">' + esc(T.poolTitle || '行きたい場所') + ' <span style="font-family:Poppins,sans-serif; color:#3F52B4;">' + ids.length + '</span></div>'
      + '<div style="font-size:12px; font-weight:700; color:#3F52B4;">' + esc(state.pool ? (T.close || '閉じる') + ' ▾' : (T.open || '開く') + ' ▴') + '</div></div></div>';
    if (state.pool) {
      h += '<div style="flex:1; overflow-y:auto; padding:0 16px 16px; display:flex; flex-direction:column; gap:8px;">';
      if (!ids.length) {
        h += '<div style="padding:20px 0; text-align:center; font-size:13px; font-weight:500; color:#9C9FAF;">' + esc(T.poolEmpty || 'まだありません') + '</div>'
          + '<a href="search.html" style="height:40px; border-radius:14px; background:#F2F4FC; color:#3F52B4; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; text-decoration:none;">' + esc(T.findSpots || 'スポットを探す') + '</a>';
      }
      ids.forEach(function (id) {
        var s = byId(id); if (!s) return;
        h += '<div style="display:flex; gap:10px; align-items:center; padding:6px 8px; border-radius:14px; background:#F7F7FA;">'
          + '<div style="width:44px;height:44px;flex-shrink:0;border-radius:8px;background:' + K.bgOf(s.photo) + ';"></div>'
          + '<div style="flex:1; min-width:0;"><div style="font-size:13px; font-weight:700; color:#111527; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(s.name) + '</div>'
          + '<div style="font-size:11px; font-weight:500; color:#6B6E80; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(s.area || '') + '</div></div>'
          + '<div data-put="' + id + '" style="cursor:pointer; flex-shrink:0; height:32px; padding:0 12px; border-radius:12px; background:#3F52B4; color:#fff; font-size:12px; font-weight:700; display:flex; align-items:center;">' + esc((T.putInto || '{d}に入れる').replace('{d}', mdw((TRIPS.get(state.id) || t).days[state.d] ? (TRIPS.get(state.id) || t).days[state.d].date : t.days[0].date))) + '</div>'
          + '</div>';
      });
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  /* ── 렌더 ── */
  function render() {
    root = document.getElementById('kgtrip'); if (!root) return;
    var h = '';
    if (state.view === 'list') h = renderList();
    else if (state.view === 'new') h = renderNew();
    else h = renderDay();
    root.innerHTML = h;
    var dr = document.getElementById('kgdrawerhost');
    if (dr) dr.innerHTML = (state.view === 'day') ? drawer() : '';
    window.KGMAP_IDS = function () {
      if (state.view !== 'day') return [];
      var t = TRIPS.get(state.id); if (!t || !t.days[state.d]) return [];
      return (t.days[state.d].spots || []).slice();
    };
    try { window.dispatchEvent(new Event('kgplan')); } catch (e) { }
    tick();
  }
  window.KGTRIP_render = render;

  var tickT = null;
  function tick() {
    clearInterval(tickT);
    tickT = setInterval(function () {
      var el = document.getElementById('kgcount'); if (!el) return;
      var t = TRIPS.get(state.id); if (!t || !t.days[state.d]) return;
      var tl = K.tlFor(t, t.days[state.d].date); if (!tl) return;
      var ne = nextEvent(tl, tl.date);
      if (!ne) { el.style.display = 'none'; return; }
      el.textContent = ne.label + ' ' + (T.until || 'まで') + ' ' + leftTxt(ne.left);
    }, 60000);
  }


  /* ── 시각 입력: 다이얼(input type=time) 대신 숫자 두 칸 직접 입력 ── */
  function timeSheet(cur, title, cb) {
    var m = /^(\d{1,2}):(\d{1,2})$/.exec(String(cur || '')) || [];
    var pad = K.pad;
    var H = m[1] !== undefined ? pad(parseInt(m[1], 10)) : '', M = m[2] !== undefined ? pad(parseInt(m[2], 10)) : '';
    var host = document.getElementById('kg-overlay-top') || document.body;
    var w = document.createElement('div');
    w.style.cssText = 'position:fixed; left:0; top:0; right:0; bottom:0; z-index:1200; pointer-events:auto; background:rgba(17,21,41,.40); display:flex; align-items:flex-end; justify-content:center;';
    var box = 'width:64px; height:56px; box-sizing:border-box; text-align:center; font-family:Poppins,sans-serif; font-size:24px; font-weight:700; color:#111527; border:0; box-shadow:inset 0 0 0 1px #E1E3EC; border-radius:14px; outline:none; background:#fff;';
    w.innerHTML = '<div style="width:100%; max-width:480px; box-sizing:border-box; background:#fff; border-radius:20px 20px 0 0; padding:16px 16px 24px; display:flex; flex-direction:column; gap:12px;">'
      + '<div style="width:40px; height:4px; border-radius:2px; background:#E9ECF8; margin:0 auto 4px;"></div>'
      + '<div style="font-size:15px; font-weight:700; color:#111527;">' + esc(title || T.timeTitle || '時刻を入力') + '</div>'
      + '<div id="tsPrev" style="text-align:center; font-family:Poppins,sans-serif; font-size:40px; font-weight:700; color:#3F52B4; letter-spacing:1px;">--:--</div>'
      + '<div style="display:flex; align-items:center; justify-content:center; gap:10px;">'
      + '<div style="display:flex; flex-direction:column; align-items:center; gap:4px;"><input id="tsH" inputmode="numeric" maxlength="2" value="' + H + '" placeholder="00" style="' + box + '"><span style="font-size:11px; font-weight:600; color:#6B6E80;">' + esc(T.hour || '時') + '</span></div>'
      + '<div style="font-size:28px; font-weight:700; color:#9C9FAF; padding-bottom:18px;">:</div>'
      + '<div style="display:flex; flex-direction:column; align-items:center; gap:4px;"><input id="tsM" inputmode="numeric" maxlength="2" value="' + M + '" placeholder="00" style="' + box + '"><span style="font-size:11px; font-weight:600; color:#6B6E80;">' + esc(T.minute || '分') + '</span></div>'
      + '</div>'
      + '<div id="tsOk" style="cursor:pointer; height:48px; border-radius:16px; background:#3F52B4; color:#fff; font-size:16px; font-weight:600; display:flex; align-items:center; justify-content:center;">' + esc(T.ok || '決定') + '</div>'
      + '<div id="tsNo" style="cursor:pointer; height:40px; color:#6B6E80; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center;">' + esc(T.cancel || 'キャンセル') + '</div>'
      + '</div>';
    host.appendChild(w);
    var ih = w.querySelector('#tsH'), im = w.querySelector('#tsM'), pv = w.querySelector('#tsPrev');
    function okH() { return /^\d{1,2}$/.test(ih.value) && +ih.value >= 0 && +ih.value <= 23; }
    function okM() { return /^\d{1,2}$/.test(im.value) && +im.value >= 0 && +im.value <= 59; }
    function paint() {
      ih.style.boxShadow = 'inset 0 0 0 ' + (ih.value && !okH() ? '2px #B22459' : '1px #E1E3EC');
      im.style.boxShadow = 'inset 0 0 0 ' + (im.value && !okM() ? '2px #B22459' : '1px #E1E3EC');
      pv.textContent = (okH() && okM()) ? (pad(+ih.value) + ':' + pad(+im.value)) : '--:--';
    }
    function clean(el) { var v = el.value.replace(/[^0-9]/g, '').slice(0, 2); if (v !== el.value) el.value = v; }
    ih.addEventListener('input', function () { clean(ih); paint(); if (ih.value.length === 2) { im.focus(); im.select(); } });
    im.addEventListener('input', function () { clean(im); paint(); });
    ih.addEventListener('focus', function () { ih.select(); });
    im.addEventListener('focus', function () { im.select(); });
    function close() { if (w.parentNode) w.parentNode.removeChild(w); }
    w.addEventListener('click', function (e) {
      if (e.target === w || e.target.id === 'tsNo') { close(); return; }
      if (e.target.id === 'tsOk' || (e.target.closest && e.target.closest('#tsOk'))) {
        if (!okH() || !okM()) { paint(); K.toast(T.timeTitle || '時刻を入力'); return; }
        var v = pad(+ih.value) + ':' + pad(+im.value); close(); cb(v);
      }
    });
    paint(); setTimeout(function () { ih.focus(); ih.select(); }, 60);
  }

  /* ── 이벤트 ── */
  function cur() { return TRIPS.get(state.id) || TRIPS.cur(); }
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-tidy],[data-oma],[data-omaedit],[data-tf],[data-tstart],[data-open],[data-edit],[data-del],[data-new],[data-cal],[data-pick],[data-city],[data-ap],[data-stay],[data-save],[data-cancel],[data-day],[data-up],[data-down],[data-rm],[data-move],[data-switch],[data-editrip],[data-mode],[data-ics],[data-drawer],[data-put]') : null;
    if (!el || !document.getElementById('kgtrip')) return;
    var g = function (k) { return el.getAttribute('data-' + k); };
    if (g('tidy')) { e.preventDefault(); e.stopPropagation(); tidySheet(); return; }
    if (g('oma')) { e.preventDefault(); e.stopPropagation(); omaSheet(0); return; }
    if (g('omaedit')) { e.preventDefault(); e.stopPropagation(); var _t = TRIPS.get(state.id); if (!_t) return; draft = null; go('day', { id: _t.id, d: 0 }); setTimeout(function () { omaSheet(0); }, 60); return; }
    if (g('tf')) {
      e.preventDefault(); e.stopPropagation(); collect();
      var _k = g('tf'), _el = document.getElementById('f' + _k + 'time');
      var _cur = (_el && _el.getAttribute('data-v')) || (_k === 'in' ? '14:00' : '11:00');
      timeSheet(_cur, _k === 'in' ? (T.inFlight || '到着便') : (T.outFlight || '帰国便'), function (v) {
        if (!draft) return;
        var f = draft.flights[_k] || {};
        f.time = v; if (!f.airport) f.airport = 'ICN1';
        draft.flights[_k] = f; render();
      });
      return;
    }
    if (g('tstart')) {
      e.preventDefault(); e.stopPropagation();
      var _t = cur(); if (!_t) return;
      var _d = _t.days[state.d];
      timeSheet(_d.start || '10:00', T.startAt || '開始', function (v) { _d.start = v; TRIPS.put(_t); render(); });
      return;
    }
    if (g('open') !== null && g('open')) { e.preventDefault(); go('day', { id: g('open'), d: TRIPS.todayIndex(TRIPS.get(g('open'))) }); return; }
    if (g('edit')) { e.preventDefault(); e.stopPropagation(); draft = JSON.parse(JSON.stringify(TRIPS.get(g('edit')))); go('new', { id: g('edit') }); return; }
    if (g('del')) {
      e.preventDefault(); e.stopPropagation();
      var id = g('del'), bak = JSON.parse(JSON.stringify(TRIPS.get(id)));
      TRIPS.del(id); render();
      K.toast(''); window.KGUNDO(T.deleted || '旅程を削除しました', function () { TRIPS.put(bak); render(); });
      return;
    }
    if (g('new')) { e.preventDefault(); draft = TRIPS.make('', ''); calM = null; go('new', { id: '' }); return; }
    if (g('cal')) { e.preventDefault(); calM = new Date(calM.getFullYear(), calM.getMonth() + parseInt(g('cal'), 10), 1); collect(); render(); return; }
    if (g('pick')) {
      e.preventDefault(); collect();
      var ds = g('pick');
      if (!draft.start || (draft.start && draft.end)) { draft.start = ds; draft.end = ''; }
      else if (ds < draft.start) { draft.start = ds; draft.end = ''; }
      else {
        if (K.diffDays(draft.start, ds) > 9) { K.toast(T.maxDays || '最大10日まで選べます'); return; }
        draft.end = ds; TRIPS.fixDays(draft);
      }
      render(); return;
    }
    if (g('city')) { e.preventDefault(); collect(); var c = g('city'), i = draft.city.indexOf(c); if (i < 0) draft.city.push(c); else draft.city.splice(i, 1); render(); return; }
    if (g('ap')) { e.preventDefault(); collect(); var p = g('ap').split(':'); draft.flights[p[0]] = Object.assign({}, draft.flights[p[0]] || {}, { airport: p[1] }); render(); return; }
    if (g('stay')) { e.preventDefault(); collect(); stayPicker(); return; }
    if (g('cancel')) { e.preventDefault(); draft = null; go(TRIPS.all().length ? 'list' : 'list'); return; }
    if (g('save')) {
      e.preventDefault(); collect();
      if (!draft.start || !draft.end) { K.toast(T.needDates || '到着日と帰国日を選んでください'); return; }
      if (!draft.name) draft.name = TRIPS.autoName(draft);
      TRIPS.fixDays(draft); TRIPS.put(draft);
      var nid = draft.id; draft = null;
      go('day', { id: nid, d: TRIPS.todayIndex(TRIPS.get(nid)) });
      K.toast(T.saved || '保存しました');
      return;
    }
    if (g('day') !== null && state.view === 'day') { e.preventDefault(); state.pool = false; go('day', { d: parseInt(g('day'), 10) }); return; }
    if (g('switch')) {
      e.preventDefault();
      var l = TRIPS.all(), inner = '<div style="display:flex; flex-direction:column; gap:8px; padding-top:8px;">';
      l.forEach(function (x) { inner += '<div data-pick2="' + x.id + '" style="cursor:pointer; padding:12px 14px; border-radius:16px; background:' + (x.id === state.id ? '#F2F4FC' : '#fff') + '; box-shadow:inset 0 0 0 1px #E1E3EC;"><div style="font-size:15px; font-weight:700; color:#111527;">' + esc(x.name || TRIPS.autoName(x)) + '</div><div style="font-size:11px; font-weight:500; color:#6B6E80; margin-top:2px;">' + esc(TRIPS.label(x)) + '</div></div>'; });
      inner += '<div data-pick2="__list__" style="cursor:pointer; padding:12px 14px; border-radius:16px; background:#F2F4FC; color:#3F52B4; font-size:14px; font-weight:700; text-align:center;">' + esc(T.allTrips || 'すべての旅程') + '</div></div>';
      var box = K.sheet(T.switchTrip || '別の旅程', inner);
      box.addEventListener('click', function (ev) {
        var b = ev.target.closest && ev.target.closest('[data-pick2]'); if (!b) return;
        var v = b.getAttribute('data-pick2'); K.closeSheet();
        if (v === '__list__') go('list'); else go('day', { id: v, d: TRIPS.todayIndex(TRIPS.get(v)) });
      });
      return;
    }
    if (g('editrip')) { e.preventDefault(); var t0 = cur(); if (!t0) return; draft = JSON.parse(JSON.stringify(t0)); calM = null; go('new', { id: t0.id }); return; }
    if (g('mode')) { e.preventDefault(); var t1 = cur(); t1.mode = g('mode'); TRIPS.put(t1); render(); return; }
    if (g('ics')) { e.preventDefault(); K.closeSheet(); window.KGTRIP_ics(cur()); return; }
    if (g('drawer')) { e.preventDefault(); state.pool = !state.pool; render(); return; }
    if (g('put')) {
      e.preventDefault(); var t2 = cur(); TRIPS.addTo(t2, t2.days[state.d].date, [g('put')]);
      var s = byId(g('put'));
      if (s && K.shutOn(s, t2.days[state.d].date)) K.toast((T.shutToast || '{d}は{n}の休館日です。別の日がおすすめ').replace('{d}', mdw(t2.days[state.d].date)).replace('{n}', s.name));
      render(); return;
    }
    if (g('up') !== null && g('up')) { e.preventDefault(); move(parseInt(g('up'), 10), -1); return; }
    if (g('up') === '0') { e.preventDefault(); return; }
    if (g('down') !== null) { e.preventDefault(); move(parseInt(g('down'), 10), 1); return; }
    if (g('rm') !== null) {
      e.preventDefault();
      var t3 = cur(), i3 = parseInt(g('rm'), 10), day3 = t3.days[state.d], bak3 = (day3.spots || []).slice();
      var removed = day3.spots.splice(i3, 1)[0];
      t3.pool = (t3.pool || []).concat([removed]);
      TRIPS.put(t3); render();
      window.KGUNDO(T.removed || 'スポットを外しました', function () { var t4 = cur(); t4.days[state.d].spots = bak3; t4.pool = (t4.pool || []).filter(function (x) { return x !== removed; }); TRIPS.put(t4); render(); });
      return;
    }
    if (g('move') !== null) {
      e.preventDefault();
      var t5 = cur(), id5 = t5.days[state.d].spots[parseInt(g('move'), 10)];
      K.pickDay(t5, [id5], T.moveDay || '別の日へ', { after: function () { render(); } });
      return;
    }
  }, false);

  function move(i, dir) {
    var t = cur(), a = t.days[state.d].spots, j = i + dir;
    if (j < 0 || j >= a.length) return;
    var v = a[j]; a[j] = a[i]; a[i] = v;
    TRIPS.put(t); render();
  }

  function collect() {
    if (!draft) return;
    var n = document.getElementById('tname'); if (n) draft.name = n.value.trim();
    ['in', 'out'].forEach(function (k) {
      var no = document.getElementById('f' + k + 'no'), tm = document.getElementById('f' + k + 'time');
      if (!no && !tm) return;
      var f = draft.flights[k] || {};
      f.no = no ? no.value.trim() : (f.no || '');
      f.time = tm ? (tm.getAttribute('data-v') || '') : (f.time || '');
      if (!f.airport) f.airport = k === 'in' ? 'ICN1' : 'ICN1';
      draft.flights[k] = (f.no || f.time) ? f : null;
    });
    var ii = document.getElementById('fintl'); if (ii) draft.intl = ii.checked;
  }

  function stayPicker() {
    var list = (window.KG && window.KG.spots || []).filter(function (s) { return /ホテル|宿|旅館|ゲストハウス/.test(String(s.type || '') + String(s.genre || '')); });
    var areas = {};
    (window.KG && window.KG.spots || []).forEach(function (s) { if (s.area) areas[s.area] = (areas[s.area] || 0) + 1; });
    var inner = '<div style="padding-top:8px; display:flex; flex-direction:column; gap:10px;">'
      + '<div style="font-size:12px; font-weight:600; color:#6B6E80;">' + esc(T.stayAreaHelp || '泊まるエリアを選んでください') + '</div>'
      + '<input id="stayname" placeholder="' + esc(T.stayName || 'ホテル名（任意）') + '" value="' + esc((draft.stay && draft.stay.name) || '') + '" style="width:100%; box-sizing:border-box; height:44px; border:0; box-shadow:inset 0 0 0 1px #E1E3EC; border-radius:12px; padding:0 12px; font-size:14px; font-family:inherit; outline:none;">'
      + '<div style="display:flex; flex-wrap:wrap; gap:8px;">';
    Object.keys(areas).sort(function (a, b) { return areas[b] - areas[a]; }).slice(0, 24).forEach(function (a) {
      var on = draft.stay && draft.stay.area === a;
      inner += '<div data-area="' + esc(a) + '" style="cursor:pointer; display:inline-flex; align-items:center; height:34px; padding:0 13px; border-radius:17px; background:' + (on ? '#3F52B4' : '#F7F7FA') + '; color:' + (on ? '#fff' : '#4B4F63') + '; font-size:12px; font-weight:600;">' + esc(a) + '</div>';
    });
    inner += '</div></div>';
    var box = K.sheet(T.pickStay || '泊まるところを選ぶ', inner);
    box.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-area]'); if (!b) return;
      var nm = document.getElementById('stayname');
      draft.stay = { area: b.getAttribute('data-area'), name: (nm && nm.value.trim()) || b.getAttribute('data-area'), photo: '' };
      K.closeSheet(); render();
    });
  }

  /* 부팅 */
  function start() {
    if (!document.getElementById('kgtrip')) return;
    window.KGTRIP_migrate && window.KGTRIP_migrate();
    /* 자유 보관함 → 현재 여행 pool 로 흡수 */
    var free = K.lsGet('kg_pool_free', '[]');
    var t = TRIPS.cur();
    if (t && free.length) { TRIPS.toPool(t, free); K.lsSet('kg_pool_free', []); }
    if (q('new')) { draft = q('id') ? JSON.parse(JSON.stringify(TRIPS.get(q('id')) || TRIPS.make('', ''))) : TRIPS.make('', ''); state.id = q('id') || ''; state.view = 'new'; }
    else if (q('id') && TRIPS.get(q('id'))) { state.view = 'day'; state.id = q('id'); state.d = parseInt(q('d') || '0', 10) || 0; }
    else if (t) { state.view = 'day'; state.id = t.id; state.d = TRIPS.todayIndex(t); }
    else state.view = 'list';
    if (q('pool')) state.pool = true;
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else setTimeout(start, 0);
})();

/* ═══ 홈 「今日」 카드 (시안 F · 2026-09-09 홈정리) ══════════════ */
(function () {
  'use strict';
  var K = window.KGTRIP, T = window.KGT || {};
  /* 홈 플래그(FLAG_JS)와 같은 기준으로 여행을 고른다: 오늘이 포함된 여행 → 30일 안에 시작하는 여행 */
  function pickTrip() {
    var l = K.TRIPS.all(), today = K.todayS(), lim = K.addDays(today, -30), best = null;
    for (var i = 0; i < l.length; i++) {
      var x = l[i]; if (!x || !x.start || !x.end) continue;
      if (today >= x.start && today <= x.end) return x;
      if (today < x.start && x.start >= lim && (!best || x.start < best.start)) best = x;
    }
    return best;
  }
  function render() {
    var host = document.getElementById('kghomecard'); if (!host || !K) return;
    /* React 가 만든 슬롯 안에 우리 전용 컨테이너를 하나 두고, 거기에만 쓴다 (2026-09-09 핫픽스) */
    var box = host.querySelector('[data-kghc]');
    if (!box || box.parentNode !== host) { box = document.createElement('div'); box.setAttribute('data-kghc', '1'); box.style.display = 'contents'; try { host.appendChild(box); } catch (e) { return; } }
    var esc = K.esc, n = K.NOTIFY.get(), t = pickTrip();
    if (!t || !n.homeCard) { box.innerHTML = ''; return; }
    var today = K.todayS(), b1, b2, title, sub = '', href = 'trip.html?id=' + t.id;
    if (today < t.start) {
      b1 = T.hcPre || '出発まで';
      b2 = (T.hcPreN || '{n}日').replace('{n}', K.diffDays(today, t.start));
      title = t.name || (t.city && t.city[0]) || (T.seoul || 'ソウル');
      var fi = t.flights && t.flights.in;
      if (fi && fi.time) sub = (T.hcArr || '到着便 {d} {t} {a}').replace('{d}', K.md(t.start)).replace('{t}', fi.time).replace('{a}', K.apLabel(fi.airport) || '');
    } else {
      var di = K.TRIPS.dayIndexFor(t, today), day = t.days[di] || { date: today, spots: [] };
      var plan = K.dayPlan(t, di), rows = plan.rows;
      b1 = (T.hcNDay || '{n}日目').replace('{n}', di + 1);
      b2 = K.md(day.date);
      title = rows.length ? rows.slice(0, 3).map(function (r) { return r.name; }).join(' → ') : (T.hcFree || '今日は予定がありません');
      var d = new Date(), nowm = d.getHours() * 60 + d.getMinutes(), nx = null;
      for (var i = 0; i < rows.length; i++) { if (K.toMin(rows[i].time) >= nowm) { nx = rows[i]; break; } }
      var parts = [];
      if (nx) parts.push((T.hcNext || '次は {t} {n}').replace('{t}', nx.time).replace('{n}', nx.name));
      var fo = t.flights && t.flights.out;
      if (fo && fo.time) parts.push((T.hcRet || '帰国 {d} {t}').replace('{d}', K.md(t.end)).replace('{t}', fo.time));
      sub = parts.join(' · ');
      href = 'trip.html?id=' + t.id + '&d=' + di;
    }
    box.innerHTML = '<a href="' + href + '" style="margin:0 16px; min-height:90px; box-sizing:border-box; border-radius:18px; background:#3F52B4; color:#fff; display:flex; align-items:center; gap:12px; padding:12px 14px; text-decoration:none;">'
      + '<div style="flex-shrink:0; width:62px; border-radius:12px; background:rgba(255,255,255,.16); padding:8px 0; text-align:center;">'
      + '<div style="font-size:12px; font-weight:700; line-height:1.3;">' + esc(b1) + '</div>'
      + '<div style="font-family:Poppins,sans-serif; font-size:12px; font-weight:600; line-height:1.3; opacity:.92;">' + esc(b2) + '</div></div>'
      + '<div style="flex:1; min-width:0;">'
      + '<div style="font-size:14px; font-weight:700; line-height:1.4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(title) + '</div>'
      + (sub ? '<div style="font-size:11px; font-weight:500; line-height:1.5; margin-top:4px; opacity:.92; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(sub) + '</div>' : '')
      + '</div>'
      + '<div style="flex-shrink:0; font-size:12px; font-weight:700; white-space:nowrap;">' + esc(T.hcTrip || '旅程 ›') + '</div></a>';
  }
  window.KGHOME_render = render;
  /* React 재렌더로 슬롯 내용이 사라지면 다시 그린다 */
  function alive() { var h = document.getElementById('kghomecard'); return !!(h && h.querySelector('[data-kghc]')); }
  function recheck() { if (document.getElementById('kghomecard') && !alive()) { try { render(); } catch (e) { } } }
  if (window.MutationObserver) {
    var mo = new MutationObserver(recheck);
    function watch() { if (document.body) mo.observe(document.body, { childList: true, subtree: true }); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
  }
  setInterval(recheck, 1000);
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-hc]'); if (!b) return;
    var open = false; try { open = localStorage.getItem('kg_home_card_open') === '1'; localStorage.setItem('kg_home_card_open', open ? '0' : '1'); } catch (er) { }
    render();
  }, false);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(render, 60); }); else setTimeout(render, 60);
})();

/* ═══ マイページ 通知 설정 (12번) ═══════════════════════════ */
(function () {
  'use strict';
  var K = window.KGTRIP, T = window.KGT || {};
  function sw(on) {
    return '<div style="width:44px; height:26px; flex-shrink:0; border-radius:13px; background:' + (on ? '#3F52B4' : '#D1D3DB') + '; position:relative; transition:background .15s;">'
      + '<div style="position:absolute; top:3px; left:' + (on ? '21px' : '3px') + '; width:20px; height:20px; border-radius:10px; background:#fff; box-shadow:0 1px 3px rgba(17,21,41,.25); transition:left .15s;"></div></div>';
  }
  function row(k, title, sub, on) {
    return '<div data-tg="' + k + '" style="cursor:pointer; min-height:60px; border-radius:16px; background:#F7F7FA; padding:12px 16px; display:flex; align-items:center; gap:14px;">'
      + '<div style="flex:1; min-width:0;"><div style="font-size:14px; font-weight:600; line-height:20px; color:#373B51;">' + K.esc(title) + '</div>'
      + (sub ? '<div style="font-size:11px; font-weight:400; line-height:16px; color:#6B6E80; margin-top:2px;">' + K.esc(sub) + '</div>' : '') + '</div>' + sw(on) + '</div>';
  }
  function render() {
    var host = document.getElementById('kgnotify'); if (!host || !K) return;
    var n = K.NOTIFY.get(), P = K.PUSH;
    var h = '<div style="display:flex; flex-direction:column; gap:12px;">'
      + '<div style="font-size:16px; font-weight:700; color:#111527;">' + K.esc(T.notifySec || '通知') + '</div>';
    if (!P.supported()) h += '<div style="font-size:11px; font-weight:500; line-height:1.6; color:#B22459;">' + K.esc(T.pushUnsupported || 'このブラウザは通知に対応していません') + '</div>';
    else if (P.iosNeedsHome()) h += '<div style="font-size:11px; font-weight:500; line-height:1.6; color:#B22459;">' + K.esc(T.pushIos || 'iPhone は「ホーム画面に追加」してから通知をオンにできます') + '</div>';
    h += row('airport', T.ntAirport || '空港へ向かう時刻の通知', T.ntAirportSub || '帰国日にホテル出発・空港到着の時刻をお知らせします', n.airport)
      + row('closed', T.ntClosed || '休館日の前日にお知らせ', T.ntClosedSub || '次の日が休館のスポットがあれば前日20時に', n.closed)
      + row('morning', T.ntMorning || '朝の予定通知', T.ntMorningSub || '旅行中まいあさ8時に今日の予定を', n.morning)
      + row('homeCard', T.ntHome || 'ホームに今日の予定を表示', T.ntHomeSub || 'ホーム画面のいちばん上に今日の予定カードを出します', n.homeCard);
    h += '<div style="display:flex; gap:8px;">'
      + '<div data-nt="test" style="cursor:pointer; flex:1; height:44px; border-radius:14px; background:#F2F4FC; color:#3F52B4; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">' + K.esc(T.sendTest || 'テスト通知を送る') + '</div>'
      + '<div data-nt="ics" style="cursor:pointer; flex:1; height:44px; border-radius:14px; background:#F2F4FC; color:#3F52B4; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">' + K.esc(T.toCalendar || 'カレンダーに入れる') + '</div></div>';
    h += '</div>';
    box.innerHTML = h;
  }
  window.KGNOTIFY_render = render;
  document.addEventListener('click', async function (e) {
    var host = document.getElementById('kgnotify'); if (!host) return;
    var b = e.target.closest && e.target.closest('[data-tg],[data-nt]'); if (!b) return;
    var K2 = window.KGTRIP;
    if (b.getAttribute('data-nt')) {
      var a = b.getAttribute('data-nt');
      if (a === 'test') { try { await K2.PUSH.subscribe(); } catch (er) { } K2.PUSH.test(); }
      if (a === 'ics') { var t = K2.TRIPS.cur(); if (!t) { K2.toast(T.noTripYet || 'まず旅程をつくってください'); return; } window.KGTRIP_ics(t); }
      return;
    }
    var k = b.getAttribute('data-tg'), n = K2.NOTIFY.get();
    var want = !n[k];
    if (want && (k === 'airport' || k === 'closed' || k === 'morning')) {
      try { await K2.PUSH.subscribe(); }
      catch (err) {
        K2.toast(err && err.message === 'denied' ? (T.pushDenied || '通知が許可されていません。ブラウザの設定から許可してください') : (T.pushFail || '通知をオンにできませんでした'));
        return;
      }
    }
    n[k] = want; K2.NOTIFY.set(n); render();
    if (want && (k === 'airport' || k === 'closed' || k === 'morning')) { K2.PUSH.test(); }
    if (!want && !K2.NOTIFY.get().airport && !K2.NOTIFY.get().closed && !K2.NOTIFY.get().morning) { K2.PUSH.unsubscribe(); }
    if (k === 'homeCard') { /* 홈에서만 반영 */ }
  }, false);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(render, 60); }); else setTimeout(render, 60);
})();

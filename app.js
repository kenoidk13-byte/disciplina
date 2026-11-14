/* Disciplina — логика и состояние */
(function () {
  'use strict';

  var KEY = 'disciplina.v1';
  var app = document.getElementById('app');

  var S = load();
  var UI = {
    route: { name: 'program' },
    obStep: 1,
    filter: 'all',
    sheet: null,
    dayKey: null,
    summary: null,
    rest: null,
    detailId: null,
    exId: null,
    exBack: 'history',
    histLimit: 60,
    tick: null
  };

  /* ---------------- state ---------------- */

  function defaultState() {
    return {
      v: 1,
      onboarded: false,
      goal: 'mass',
      daysPerWeek: 3,
      buildMode: 'auto',
      customDays: [],
      equipment: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'],
      selected: [],
      weights: {},
      program: null,
      active: null,
      history: [],
      createdAt: Date.now()
    };
  }

  function load() {
    var base = defaultState();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return base;
      var p = JSON.parse(raw);
      Object.keys(base).forEach(function (k) {
        if (p[k] === undefined) p[k] = base[k];
      });
      if (!Array.isArray(p.selected)) p.selected = [];
      if (!Array.isArray(p.equipment)) p.equipment = base.equipment;
      if (!Array.isArray(p.history)) p.history = [];
      if (!p.weights || typeof p.weights !== 'object') p.weights = {};
      if (p.buildMode !== 'custom') p.buildMode = 'auto';
      if (!Array.isArray(p.customDays)) p.customDays = [];
      return p;
    } catch (e) {
      return base;
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {
      toast('Не удалось сохранить — хранилище переполнено');
    }
  }

  /* ---------------- utils ---------------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function num(v, def) {
    var n = parseFloat(String(v).replace(',', '.'));
    return isFinite(n) ? n : def;
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function roundW(w) { return Math.round(w * 10) / 10; }

  function kg(w) {
    if (!w) return 'свой вес';
    return (w % 1 === 0 ? String(w) : w.toFixed(1).replace('.', ',')) + ' кг';
  }

  function mmss(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function mins(sec) { return Math.max(1, Math.round(sec / 60)); }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  function dateShort(ts) {
    return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }

  function dateLong(ts) {
    var d = new Date(ts);
    var o = { weekday: 'short', day: 'numeric', month: 'long' };
    if (d.getFullYear() !== new Date().getFullYear()) o.year = 'numeric';
    return d.toLocaleDateString('ru-RU', o).replace(' г.', '');
  }

  function sameWeek(ts) {
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setDate(start.getDate() - ((now.getDay() + 6) % 7));
    return ts >= start.getTime();
  }

  function toast(msg) {
    var el = document.querySelector('.toast');
    if (el) el.remove();
    var d = document.createElement('div');
    d.className = 'toast';
    d.textContent = msg;
    document.body.appendChild(d);
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { d.remove(); }, 2600);
  }

  function go(name, extra) {
    UI.route = Object.assign({ name: name }, extra || {});
    UI.sheet = null;
    if (name !== 'session') UI.rest = null;
    render();
    if (name !== 'session') window.scrollTo(0, 0);
  }

  function byId(id) { return D.BY_ID[id]; }

  function pool() {
    return S.selected.map(byId).filter(Boolean);
  }

  function isAvailable(ex) {
    return S.equipment.indexOf(ex.eq) !== -1;
  }

  /* ---------------- program generation ---------------- */

  function scheme(ex) {
    var g = S.goal;
    var compound = ['squat', 'hinge', 'lunge', 'hpush', 'vpush', 'hpull', 'vpull'].indexOf(ex.pat) !== -1;
    var s;
    if (g === 'mass') s = compound ? { sets: 4, lo: 6, hi: 10, rest: 120 } : { sets: 3, lo: 10, hi: 12, rest: 90 };
    else if (g === 'cut') s = compound ? { sets: 3, lo: 10, hi: 12, rest: 75 } : { sets: 3, lo: 12, hi: 15, rest: 45 };
    else s = compound ? { sets: 3, lo: 8, hi: 10, rest: 90 } : { sets: 3, lo: 10, hi: 12, rest: 60 };

    if (ex.pat === 'core') s = { sets: 3, lo: 12, hi: 15, rest: 45 };
    if (ex.pat === 'calves') s = { sets: 3, lo: 12, hi: 15, rest: 45 };
    if (ex.eq === 'bodyweight' && (ex.pat === 'hpush' || ex.pat === 'vpush')) {
      s = { sets: 3, lo: 10, hi: 15, rest: 60 };
    }
    return s;
  }

  function itemFrom(ex, slotPats) {
    var sc = scheme(ex);
    return {
      exId: ex.id,
      sets: sc.sets, lo: sc.lo, hi: sc.hi, rest: sc.rest,
      pats: (slotPats || [ex.pat]).slice()
    };
  }

  function recentIds(n) {
    var set = {};
    S.history.slice(0, n).forEach(function (h) {
      (h.entries || []).forEach(function (e) { set[e.exId] = true; });
    });
    return set;
  }

  var EQ_PREF = { barbell: 0, smith: 0.3, dumbbell: 0.6, machine: 1, cable: 1.2, kettlebell: 1, bodyweight: 1.6, bands: 2.2 };

  var MIN_SESSION = 50 * 60;   /* тренировка не короче 50 минут */
  var SET_OVERHEAD = 35;       /* подход + переход */
  var MAX_EX = 8;              /* потолок упражнений в дне */

  function daySeconds(items) {
    var s = 0;
    items.forEach(function (it) { s += it.sets * (it.rest + SET_OVERHEAD); });
    return s;
  }

  function fitDay(items, dayIds, cands, weekUse, recent) {
    if (!items.length) return items;
    var setCap = S.goal === 'cut' ? 4 : 5;
    var restCap = S.goal === 'mass' ? 180 : S.goal === 'maintain' ? 150 : 120;

    /* 1. добираем упражнения, пока день короче 50 минут */
    while (items.length < MAX_EX && daySeconds(items) < MIN_SESSION) {
      var free = cands.filter(function (e) { return !dayIds[e.id]; });
      var best = pickBest(free, weekUse, recent, dayIds);
      if (!best) break;
      take(items, dayIds, weekUse, best);
    }

    /* 2. подходы: по кругу, пока не наберём время */
    var guard = 0;
    while (daySeconds(items) < MIN_SESSION && guard++ < 200) {
      var grown = false;
      for (var i = 0; i < items.length; i++) {
        if (items[i].sets < setCap) {
          items[i].sets++;
          grown = true;
          if (daySeconds(items) >= MIN_SESSION) break;
        }
      }
      if (!grown) break;
    }

    /* 3. отдых — крайняя мера, если упражнений и подходов не хватило */
    guard = 0;
    while (daySeconds(items) < MIN_SESSION && guard++ < 200) {
      var rested = false;
      for (var j = 0; j < items.length; j++) {
        if (items[j].rest < restCap) {
          items[j].rest += 15;
          rested = true;
          if (daySeconds(items) >= MIN_SESSION) break;
        }
      }
      if (!rested) break;
    }
    return items;
  }

  function pickBest(cands, weekUse, recent, dayIds) {
    var best = null, bestScore = 1e9;
    cands.forEach(function (e) {
      var sc = Math.random() * 2.4;
      if (dayIds && dayIds[e.id]) sc += 100;
      sc += (weekUse[e.id] || 0) * 7;
      if (recent[e.id]) sc += 4;
      if (e.lvl > 2) sc += 2.5;
      sc += EQ_PREF[e.eq] || 0;
      if (sc < bestScore) { bestScore = sc; best = e; }
    });
    return best;
  }

  function take(items, dayIds, weekUse, ex, slotPats) {
    if (!ex || dayIds[ex.id]) return;
    dayIds[ex.id] = true;
    weekUse[ex.id] = (weekUse[ex.id] || 0) + 1;
    items.push(itemFrom(ex, slotPats));
  }

  function fillDay(items, dayIds, cands, weekUse, recent) {
    var extra = cands.filter(function (e) { return !dayIds[e.id]; });
    extra.sort(function (a, b) {
      return (weekUse[a.id] || 0) - (weekUse[b.id] || 0) || Math.random() - 0.5;
    });
    for (var k = 0; k < extra.length && items.length < 5; k++) {
      take(items, dayIds, weekUse, extra[k]);
    }
  }

  function buildDayItems(tpl, p, weekUse, recent) {
    var items = [], dayIds = {};
    tpl.slots.forEach(function (slot) {
      var cands = p.filter(function (e) { return slot.pats.indexOf(e.pat) !== -1 && !dayIds[e.id]; });
      if (!cands.length) {
        cands = p.filter(function (e) { return slot.pats.indexOf(e.pat) !== -1; });
      }
      if (!cands.length) return;
      take(items, dayIds, weekUse, pickBest(cands, weekUse, recent, dayIds), slot.pats);
    });
    if (items.length < 5) fillDay(items, dayIds, p, weekUse, recent);
    return fitDay(items, dayIds, p, weekUse, recent);
  }

  /* ---------------- конструктор дней по группам ---------------- */

  var CUSTOM_ORDER = ['legs', 'back', 'chest', 'shoulders', 'arms', 'abs'];
  var CUSTOM_CAP = { legs: 3, back: 3, chest: 2, shoulders: 2, arms: 3, abs: 2 };
  var DEFAULT_SPLITS = {
    2: [['legs', 'abs'], ['chest', 'back', 'shoulders', 'arms']],
    3: [['legs', 'abs'], ['chest', 'back'], ['shoulders', 'arms']],
    4: [['legs'], ['chest', 'shoulders'], ['back', 'arms'], ['legs', 'abs']]
  };

  function groupDef(k) {
    for (var i = 0; i < D.BUILD_GROUPS.length; i++) {
      if (D.BUILD_GROUPS[i].k === k) return D.BUILD_GROUPS[i];
    }
    return null;
  }

  function groupTitle(k) {
    var g = groupDef(k);
    return g ? g.t : k;
  }

  function groupMuscles(k) {
    var g = groupDef(k);
    return g ? g.g : [];
  }

  function musclesOf(groups) {
    var out = [];
    groups.forEach(function (k) {
      groupMuscles(k).forEach(function (m) {
        if (out.indexOf(m) === -1) out.push(m);
      });
    });
    return out;
  }

  function customDayName(groups) {
    return groups.map(groupTitle).join(' · ');
  }

  function normalizeCustomDays(fillDefaults) {
    var n = clamp(S.daysPerWeek, 2, 4);
    var prev = Array.isArray(S.customDays) ? S.customDays : [];
    var arr = [];
    for (var i = 0; i < n; i++) {
      var d = prev[i];
      arr.push({ groups: d && Array.isArray(d.groups) ? d.groups.slice() : [] });
    }
    if (fillDefaults) {
      var split = DEFAULT_SPLITS[n] || DEFAULT_SPLITS[3];
      arr.forEach(function (d, i) {
        if (!d.groups.length) d.groups = (split[i] || ['legs']).slice();
      });
    }
    S.customDays = arr;
    return arr;
  }

  function customDaysPlan() { return normalizeCustomDays(false); }

  function ensureCustomDays() { return normalizeCustomDays(true); }

  function buildCustomDay(groups, p, weekUse, recent) {
    var order = CUSTOM_ORDER.filter(function (g) { return groups.indexOf(g) !== -1; });
    if (!order.length) return [];

    var counts = {}, seq = [], guard = 0;
    order.forEach(function (g) { counts[g] = 0; });
    while (seq.length < 6 && guard < 60) {
      var g = order[seq.length % order.length];
      if (counts[g] < (CUSTOM_CAP[g] || 2)) { counts[g]++; seq.push(g); }
      guard++;
    }

    var items = [], dayIds = {}, gi = {};
    seq.forEach(function (group) {
      var idx = gi[group] || 0;
      gi[group] = idx + 1;
      var pats = D.GROUP_PATS[group] || [];
      var pat = pats.length ? pats[idx % pats.length] : null;
      var muscles = groupMuscles(group);

      var inGroup = p.filter(function (e) { return muscles.indexOf(e.g) !== -1 && !dayIds[e.id]; });
      var cands = pat ? inGroup.filter(function (e) { return e.pat === pat; }) : [];
      if (!cands.length) cands = inGroup;
      if (!cands.length) return;

      var best = pickBest(cands, weekUse, recent, dayIds);
      take(items, dayIds, weekUse, best, pat ? [pat] : null);
    });

    if (items.length < 5) {
      var mine = musclesOf(groups);
      fillDay(items, dayIds, p.filter(function (e) { return mine.indexOf(e.g) !== -1; }), weekUse, recent);
    }
    var mineAll = musclesOf(groups);
    return fitDay(items, dayIds, p.filter(function (e) { return mineAll.indexOf(e.g) !== -1; }), weekUse, recent);
  }

  function generateProgram() {
    var p = pool();
    if (!p.length) return;
    var recent = recentIds(3);
    var count = clamp(S.daysPerWeek, 2, 4);
    var weekUse = {};
    var days = [];

    if (S.buildMode === 'custom') {
      var plan = customDaysPlan();
      var hasGroups = plan.some(function (d) { return d.groups.length > 0; });
      if (hasGroups) {
        var used = {};
        plan.forEach(function (d, i) {
          if (!d.groups.length) return;
          var citems = buildCustomDay(d.groups, p, weekUse, recent);
          if (!citems.length) return;
          used['ABCD'[i]] = true;
          days.push({
            key: 'ABCD'[i],
            name: customDayName(d.groups) || ('День ' + (i + 1)),
            groups: d.groups.slice(),
            items: citems
          });
        });
        /* для дня без подходящих упражнений добираем шаблонной схемой */
        for (var j = 0; j < count && days.length < count; j++) {
          var keyF = 'ABCD'[j];
          if (used[keyF]) continue;
          var tplF = D.DAY_TEMPLATES[j % D.DAY_TEMPLATES.length];
          var itemsF = buildDayItems(tplF, p, weekUse, recent);
          if (itemsF.length) days.push({ key: keyF, name: tplF.name, items: itemsF });
        }
        if (days.length) {
          days.sort(function (a, b) { return a.key < b.key ? -1 : 1; });
          S.program = { createdAt: Date.now(), mode: 'custom', days: days };
          save();
          return;
        }
      }
    }

    for (var i = 0; i < count; i++) {
      var tpl = D.DAY_TEMPLATES[i % D.DAY_TEMPLATES.length];
      var items = buildDayItems(tpl, p, weekUse, recent);
      if (items.length) days.push({ key: tpl.key, name: tpl.name, items: items });
    }
    S.program = { createdAt: Date.now(), mode: 'auto', days: days };
    save();
  }

  function regenerateDay(key) {
    if (!S.program) return;
    var day = S.program.days.filter(function (d) { return d.key === key; })[0];
    if (!day) return;
    var weekUse = {};
    S.program.days.forEach(function (d) {
      if (d.key === key) return;
      d.items.forEach(function (it) { weekUse[it.exId] = (weekUse[it.exId] || 0) + 1; });
    });
    var recent = recentIds(3);
    var items;
    if (S.program.mode === 'custom' && day.groups && day.groups.length) {
      items = buildCustomDay(day.groups, pool(), weekUse, recent);
    } else {
      var tpl = D.DAY_TEMPLATES.filter(function (t) { return t.key === key; })[0] || D.DAY_TEMPLATES[0];
      items = buildDayItems(tpl, pool(), weekUse, recent);
    }
    if (items.length) day.items = items;
    save();
  }

  function pruneProgram() {
    if (!S.program) return;
    var sel = {};
    S.selected.forEach(function (id) { sel[id] = true; });
    S.program.days.forEach(function (d) {
      d.items = d.items.filter(function (it) { return sel[it.exId]; });
    });
    S.program.days = S.program.days.filter(function (d) { return d.items.length; });
    if (!S.program.days.length) S.program = null;
    save();
  }

  /* ---------------- progression ---------------- */

  function stepFor(ex) { return D.STEP[ex.eq] || 0; }

  function lastEntry(exId) {
    for (var i = 0; i < S.history.length; i++) {
      var es = (S.history[i].entries || []).filter(function (e) { return e.exId === exId; });
      if (es.length) return es[0];
    }
    return null;
  }

  function weightFor(exId) {
    var w = S.weights[exId];
    return w && typeof w.w === 'number' ? w.w : 0;
  }

  function exerciseSeries(exId) {
    var out = [];
    for (var i = S.history.length - 1; i >= 0; i--) {
      var es = (S.history[i].entries || []).filter(function (e) { return e.exId === exId; });
      if (es.length) {
        var maxW = Math.max.apply(null, es[0].sets.map(function (s) { return s.w; }));
        out.push(maxW);
      }
    }
    return out;
  }

  function weekCount() {
    var n = 0, seen = {};
    S.history.forEach(function (h) {
      if (sameWeek(h.ts) && !seen[h.dayKey]) { seen[h.dayKey] = true; n++; }
    });
    return n;
  }

  function doneKeysThisWeek() {
    var seen = {};
    S.history.forEach(function (h) { if (sameWeek(h.ts)) seen[h.dayKey] = true; });
    return seen;
  }

  function nextDay() {
    if (!S.program || !S.program.days.length) return null;
    var counts = {};
    S.history.slice(0, 15).forEach(function (h) { counts[h.dayKey] = (counts[h.dayKey] || 0) + 1; });
    var last = S.history[0] ? S.history[0].dayKey : null;
    var best = null, bestScore = 1e9;
    S.program.days.forEach(function (d) {
      var c = counts[d.key] || 0;
      if (d.key === last) c += 0.5;
      if (c < bestScore) { bestScore = c; best = d; }
    });
    return best || S.program.days[0];
  }

  /* ---------------- session ---------------- */

  function startSession(day) {
    var entries = day.items.map(function (it) {
      var ex = byId(it.exId);
      var w = weightFor(it.exId);
      return {
        exId: it.exId,
        sets: it.sets, lo: it.lo, hi: it.hi, rest: it.rest,
        prev: weightFor(it.exId),
        weight: w,
        rows: Array.apply(null, Array(it.sets)).map(function () {
          return { w: w, r: it.hi, done: false };
        })
      };
    });
    S.active = { dayKey: day.key, name: day.name, startedAt: Date.now(), entries: entries };
    save();
    go('session');
  }

  function sessionStats() {
    var total = 0, done = 0;
    if (!S.active) return { total: 0, done: 0 };
    S.active.entries.forEach(function (e) {
      total += e.sets;
      done += e.rows.filter(function (r) { return r.done; }).length;
    });
    return { total: total, done: done };
  }

  function finishSession() {
    var a = S.active;
    if (!a) return;
    var doneAll = [];
    a.entries.forEach(function (e) {
      e.rows.forEach(function (r) { if (r.done) doneAll.push(r); });
    });
    if (!doneAll.length) {
      if (!confirm('Ни одного подхода не отмечено. Выйти без сохранения?')) return;
      S.active = null; save(); go('program'); return;
    }

    var bumps = [], volume = 0, entries = [];
    a.entries.forEach(function (e) {
      var doneRows = e.rows.filter(function (r) { return r.done; });
      if (!doneRows.length) return;
      var ex = byId(e.exId);
      var maxW = Math.max.apply(null, doneRows.map(function (r) { return r.w; }));
      var maxR = Math.max.apply(null, doneRows.map(function (r) { return r.r; }));
      var minR = Math.min.apply(null, doneRows.map(function (r) { return r.r; }));
      doneRows.forEach(function (r) { volume += (r.w || 0) * (r.r || 0); });

      var newW = maxW;
      var step = ex ? stepFor(ex) : 0;
      if (maxW > 0 && doneRows.length >= e.sets && minR >= e.hi && step > 0) {
        newW = roundW(maxW + step);
        bumps.push({ exId: e.exId, from: maxW, to: newW });
      }
      S.weights[e.exId] = { w: newW || 0, r: maxR };

      entries.push({
        exId: e.exId,
        sets: doneRows.map(function (r) { return { w: r.w, r: r.r }; })
      });
    });

    var dur = Math.round((Date.now() - a.startedAt) / 1000);
    S.history.unshift({
      id: 'h' + Date.now(),
      ts: Date.now(),
      dayKey: a.dayKey,
      dayName: a.name,
      duration: dur,
      volume: Math.round(volume),
      entries: entries
    });
    if (S.history.length > 500) S.history.length = 500;

    S.active = null;
    save();
    UI.summary = { duration: dur, volume: Math.round(volume), sets: doneAll.length, bumps: bumps, name: a.name };
    if (navigator.vibrate) { try { navigator.vibrate([18, 45, 22]); } catch (e) {} }
    go('finish');
  }

  /* ---------------- boot ---------------- */

  (function boot() {
    var h = location.hash;
    var demo = h.indexOf('#demo') === 0 && !S.onboarded && !S.history.length;
    if (demo) {
      seedDemo(h);
      UI.route = h === '#demo-pick' ? { name: 'onboarding', step: 1 }
        : h === '#demo-session' ? { name: 'session' }
        : { name: 'program' };
    } else if (S.active) {
      UI.route = { name: 'session' };
    } else if (!S.onboarded) {
      UI.route = { name: 'onboarding', step: 1 };
    }
  })();

  window.addEventListener('load', function () {
    render();
  });

  function seedDemo(mode) {
    var ids = ['bench', 'db_bench', 'db_incline', 'pushup', 'bb_row', 'db_row', 'pulldown', 'pullup', 'seated_row',
      'ohp', 'db_ohp', 'lat_raise', 'bb_curl', 'hammer', 'pushdown', 'cg_bench', 'squat', 'leg_press', 'lunge',
      'leg_ext', 'rdl', 'leg_curl', 'hip_thrust', 'calf_stand', 'plank', 'crunch_cable',
      'hack_squat', 'hyperext', 'bb_curl_rev'];
    S.selected = ids.slice();
    S.equipment = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'];
    ids.forEach(function (id) {
      var ex = byId(id);
      S.weights[id] = { w: D.DEFAULT_W[ex.eq] || 0, r: 10 };
    });
    S.weights.bench.w = 62.5; S.weights.squat.w = 80; S.weights.rdl.w = 70;
    S.weights.db_row.w = 26; S.weights.ohp.w = 40; S.weights.lat_raise.w = 8;
    S.weights.pulldown.w = 55; S.weights.leg_press.w = 120; S.weights.bb_curl.w = 25;

    if (mode === '#demo-pick') { S.onboarded = false; save(); return; }

    S.buildMode = 'auto';
    S.customDays = [];
    S.onboarded = true;
    generateProgram();

    if (mode === '#demo-session') {
      startSession(S.program.days[0]);
      save();
      return;
    }

    var d = new Date();
    var demoDays = ['Всё тело A', 'Тяга и плечи', 'Всё тело C'];
    var backs = [3, 6, 9, 14, 21, 30, 44, 60];
    var acc = ['rdl', 'ohp', 'bb_curl', 'leg_press', 'db_row', 'pushdown', 'lat_raise', 'plank'];
    S.history = backs.map(function (back, i) {
      var benchW = Math.max(40, 62.5 - i * 2.5);
      var squatW = Math.max(50, 80 - i * 2.5);
      var entries = [
        { exId: 'bench', sets: [{ w: benchW, r: 10 }, { w: benchW, r: 9 }, { w: benchW, r: 8 }] },
        { exId: 'squat', sets: [{ w: squatW, r: 8 }, { w: squatW, r: 8 }, { w: squatW, r: 7 }] }
      ];
      var accId = acc[i % acc.length], accEx = byId(accId);
      var accW = accEx.pat === 'core' ? 0 : Math.max(0, (D.DEFAULT_W[accEx.eq] || 0) + (6 - i) * 2);
      entries.push({ exId: accId, sets: [{ w: accW, r: 12 }, { w: accW, r: 10 }] });
      var vol = 0;
      entries.forEach(function (e) { e.sets.forEach(function (s) { vol += (s.w || 0) * s.r; }); });
      return {
        id: 'hd' + i, ts: d.getTime() - back * 86400000,
        dayKey: 'ABC'[i % 3], dayName: demoDays[i % 3],
        duration: 3000 + (i % 4) * 300, volume: vol, entries: entries
      };
    });
    save();
  }

  /* expose for ui.js */
  window.DS = {
    get S() { return S; },
    get UI() { return UI; },
    save: save, go: go, toast: toast, render: render, esc: esc, num: num, clamp: clamp,
    kg: kg, mmss: mmss, mins: mins, plural: plural, dateShort: dateShort, dateLong: dateLong,
    byId: byId, pool: pool, isAvailable: isAvailable, scheme: scheme, itemFrom: itemFrom,
    generateProgram: generateProgram, regenerateDay: regenerateDay, pruneProgram: pruneProgram,
    customDaysPlan: customDaysPlan, ensureCustomDays: ensureCustomDays,
    customDayName: customDayName, groupTitle: groupTitle,
    stepFor: stepFor, lastEntry: lastEntry, weightFor: weightFor, exerciseSeries: exerciseSeries,
    weekCount: weekCount, doneKeysThisWeek: doneKeysThisWeek, nextDay: nextDay,
    daySeconds: daySeconds, MIN_SESSION: MIN_SESSION,
    startSession: startSession, sessionStats: sessionStats, finishSession: finishSession,
    roundW: roundW, startTick: startTick
  };

  /* renders are defined in ui.js, which loads after this file */
  function render() {
    if (window.UIrender) window.UIrender();
  }

  function startTick() {
    if (UI.tick) return;
    UI.tick = setInterval(function () {
      var el = document.getElementById('elapsed');
      if (el && S.active) el.textContent = mmss((Date.now() - S.active.startedAt) / 1000);
      if (UI.rest) {
        var left = (UI.rest.end - Date.now()) / 1000;
        var fill = document.getElementById('restfill');
        var time = document.getElementById('resttime');
        if (time) time.textContent = mmss(left);
        if (fill) fill.style.width = Math.max(0, Math.min(100, (left / UI.rest.total) * 100)) + '%';
        if (left <= 0) {
          UI.rest = null;
          if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
          render();
        }
      }
    }, 250);
  }
})();

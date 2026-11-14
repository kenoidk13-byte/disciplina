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
    pickQuery: '',
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
      p.customDays = p.customDays.map(function (d) {
        return { groups: migrateGroups(d && d.groups) };
      });
      if (p.program && Array.isArray(p.program.days)) {
        p.program.days.forEach(function (d) {
          if (Array.isArray(d.groups)) d.groups = migrateGroups(d.groups);
        });
      }
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
    /* RIR — сколько повторов оставлять в запасе в последнем подходе.
       База 1–3, изоляция 0–2 — по Хелмсу/Ниппарду. */
    var s;
    if (g === 'mass') s = compound ? { sets: 4, lo: 6, hi: 10, rest: 120, rir: 2 } : { sets: 3, lo: 10, hi: 15, rest: 75, rir: 1 };
    else if (g === 'cut') s = compound ? { sets: 3, lo: 8, hi: 12, rest: 120, rir: 1 } : { sets: 3, lo: 12, hi: 20, rest: 60, rir: 0 };
    else s = compound ? { sets: 3, lo: 6, hi: 10, rest: 120, rir: 3 } : { sets: 3, lo: 10, hi: 15, rest: 60, rir: 2 };

    if (ex.pat === 'core') s = { sets: 3, lo: 12, hi: 20, rest: 45, rir: 1 };
    if (ex.pat === 'calves') s = { sets: 4, lo: 10, hi: 15, rest: 60, rir: 1 };
    if (ex.pat === 'delt_iso' || ex.pat === 'rear_delt') s = { sets: 3, lo: 12, hi: 20, rest: 45, rir: 1 };
    if (ex.eq === 'bodyweight' && (ex.pat === 'hpush' || ex.pat === 'vpush')) {
      s = { sets: 3, lo: 8, hi: 15, rest: 60, rir: 1 };
    }
    return s;
  }

  /* порядок упражнений в дне: крупные многосуставные → изоляция крупных мышц
     → руки → икры → пресс (ACSM: большие группы и многосуставные раньше) */
  var PAT_RANK = {
    squat: 0, hinge: 0, lunge: 0, hpull: 0, vpull: 0, hpush: 0, vpush: 0,
    quad_iso: 1, ham_iso: 1, glute_iso: 1, chest_iso: 1, lat_iso: 1, traps: 1,
    delt_iso: 2, rear_delt: 2,
    biceps: 3, triceps: 3, calves: 4, core: 5
  };
  var GROUP_RANK = {
    quads: 0, ham: 1, glutes: 2, back: 3, traps: 4,
    chest: 5, shoulders: 6, biceps: 7, triceps: 8, calves: 9, abs: 10
  };

  function orderItems(items) {
    return items.slice().sort(function (a, b) {
      var ea = byId(a.exId), eb = byId(b.exId);
      if (!ea || !eb) return 0;
      var ra = PAT_RANK[ea.pat], rb = PAT_RANK[eb.pat];
      ra = ra === undefined ? 9 : ra;
      rb = rb === undefined ? 9 : rb;
      if (ra !== rb) return ra - rb;
      var ga = GROUP_RANK[ea.g], gb = GROUP_RANK[eb.g];
      return (ga === undefined ? 9 : ga) - (gb === undefined ? 9 : gb);
    });
  }

  function itemFrom(ex, slotPats) {
    var sc = scheme(ex);
    return {
      exId: ex.id,
      sets: sc.sets, lo: sc.lo, hi: sc.hi, rest: sc.rest, rir: sc.rir,
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

  /* когда упражнение делали в последний раз и сколько раз вообще.
     История хранится от новых к старым, поэтому первая встреча — самая свежая. */
  function usageMaps() {
    var last = {}, count = {};
    S.history.forEach(function (h, i) {
      var ts = h.ts || (Date.now() - i * 1000);
      (h.entries || []).forEach(function (e) {
        if (last[e.exId] === undefined) last[e.exId] = ts;
        count[e.exId] = (count[e.exId] || 0) + 1;
      });
    });
    return { last: last, count: count };
  }

  var EQ_PREF = { barbell: 0, smith: 0.3, dumbbell: 0.6, machine: 1, cable: 1.2, kettlebell: 1, bodyweight: 1.6, bands: 2.2 };

  var MIN_SESSION = 50 * 60;   /* тренировка не короче 50 минут */
  var SET_OVERHEAD = 35;       /* подход + переход */
  var MAX_EX = 9;              /* потолок упражнений в дне */

  function daySeconds(items) {
    var s = 0;
    items.forEach(function (it) { s += it.sets * (it.rest + SET_OVERHEAD); });
    return s;
  }

  /* ---------------- недельный объём ----------------
     Ориентиры: 10–20 подходов на мышцу в неделю (Хелмс, Ниппард,
     Шёнфельд), частота 2+, RIR 1–3 на базе и 0–2 на изоляции.
     Косвенная работа от базовых движений считается за 0.4–0.5 подхода. */

  var VOL_TARGET = {
    chest: [10, 20], back: [10, 20], shoulders: [9, 18],
    biceps: [8, 16], triceps: [8, 16],
    quads: [10, 20], ham: [8, 16], glutes: [8, 16],
    calves: [8, 14], abs: [6, 12], traps: [4, 10]
  };

  var PAT_AFF = {
    squat: { quads: 1, glutes: 0.4, ham: 0.25 },
    lunge: { quads: 1, glutes: 0.4, ham: 0.25 },
    hpush: { chest: 1, shoulders: 0.5, triceps: 0.5 },
    vpush: { shoulders: 1, triceps: 0.5 },
    hpull: { back: 1, biceps: 0.5 },
    vpull: { back: 1, biceps: 0.5 },
    rear_delt: { shoulders: 1, back: 0.25 },
    core: { abs: 1 }
  };

  var PAT_PRIMARY = {
    squat: 'quads', lunge: 'quads', hpush: 'chest', vpush: 'shoulders',
    hpull: 'back', vpull: 'back'
  };

  function muscleAffinity(ex) {
    var a;
    if (ex.pat === 'hinge') {
      /* таз: ягодичный мост/траст — ягодицы, остальное — бицепс бедра */
      a = ex.g === 'glutes'
        ? { glutes: 1, ham: 0.4, back: 0.25 }
        : { ham: 1, glutes: 0.6, back: 0.4 };
    } else {
      a = {};
      var base = PAT_AFF[ex.pat];
      if (base) Object.keys(base).forEach(function (m) { a[m] = base[m]; });
      a[ex.g] = Math.max(a[ex.g] || 0, 1);
    }
    return a;
  }

  function primaryMuscle(ex) {
    if (ex.pat === 'hinge') return ex.g === 'glutes' ? 'glutes' : 'ham';
    return PAT_PRIMARY[ex.pat] || ex.g;
  }

  function addVolume(vol, ex, sets) {
    var a = muscleAffinity(ex);
    Object.keys(a).forEach(function (m) { vol[m] = (vol[m] || 0) + sets * a[m]; });
  }

  function overHigh(ex, vol) {
    var a = muscleAffinity(ex);
    return Object.keys(a).some(function (m) {
      return (vol[m] || 0) + a[m] > volTarget(m)[1] + 2.01;
    });
  }

  function weekVolume() {
    var vol = {};
    if (!S.program) return vol;
    S.program.days.forEach(function (d) {
      (d.items || []).forEach(function (it) {
        var ex = byId(it.exId);
        if (ex) addVolume(vol, ex, it.sets);
      });
    });
    return vol;
  }

  function weekFrequency() {
    var f = {};
    if (!S.program) return f;
    S.program.days.forEach(function (d) {
      var seen = {};
      (d.items || []).forEach(function (it) {
        var ex = byId(it.exId);
        if (!ex) return;
        var a = muscleAffinity(ex);
        Object.keys(a).forEach(function (m) {
          if (a[m] >= 0.5 && !seen[m]) { seen[m] = true; f[m] = (f[m] || 0) + 1; }
        });
      });
    });
    return f;
  }

  function volTarget(m) {
    var t = VOL_TARGET[m] || [8, 16];
    /* за 2 тренировки по 50–70 минут 10+ подходов на все мышцы не влезает:
       цель снижена, но остаётся выше поддерживающего минимума */
    if (clamp(S.daysPerWeek, 2, 4) === 2) {
      return [Math.round(t[0] * 0.7), Math.round(t[1] * 0.9)];
    }
    return t.slice();
  }

  function inScope(ex, scope) {
    if (!scope) return true;
    if (scope.indexOf(primaryMuscle(ex)) !== -1) return true;
    var a = muscleAffinity(ex);
    return Object.keys(a).some(function (m) { return a[m] >= 0.5 && scope.indexOf(m) !== -1; });
  }

  function fitDay(items, ctx) {
    if (!items.length) return items;
    var setCap = S.goal === 'cut' ? 4 : 5;
    var restCap = S.goal === 'mass' ? 180 : S.goal === 'maintain' ? 150 : 120;

    function addSets(checkVolume) {
      var guard = 0;
      while (daySeconds(items) < MIN_SESSION && guard++ < 400) {
        var grown = false;
        for (var i = 0; i < items.length; i++) {
          if (items[i].sets >= setCap) continue;
          var ex = byId(items[i].exId);
          if (!ex) continue;
          var a = muscleAffinity(ex);
          if (checkVolume) {
            var over = Object.keys(a).some(function (m) {
              var t = volTarget(m);
              return (ctx.vol[m] || 0) + a[m] > t[1] + 0.01;
            });
            if (over) continue;
          }
          items[i].sets++;
          if (ctx && ctx.vol) {
            Object.keys(a).forEach(function (m) { ctx.vol[m] = (ctx.vol[m] || 0) + a[m]; });
          }
          grown = true;
          if (daySeconds(items) >= MIN_SESSION) break;
        }
        if (!grown) break;
      }
    }

    /* 1. отдых — добираем 50 минут, не раздувая объём */
    var guard = 0;
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

    /* 2. скудный набор: если отдыха не хватило — добавляем подходы */
    addSets(false);
    return items;
  }

  /* после сборки всех дней добираем подходы мышцам, которые не дошли
     до нижней границы недельного объёма. День не длиннее 75 минут,
     потолок цели не превышаем больше чем на 2 подхода. */
  function volumeOfDays(days) {
    var vol = {};
    (days || []).forEach(function (d) {
      (d.items || []).forEach(function (it) {
        var ex = byId(it.exId);
        if (ex) addVolume(vol, ex, it.sets);
      });
    });
    return vol;
  }

  function balanceVolume(days) {
    if (!days || !days.length) return;
    var vol = volumeOfDays(days);
    var setCap = S.goal === 'cut' ? 4 : 5;
    var maxSec = 75 * 60;
    var guard = 0;

    while (guard++ < 200) {
      var changed = false;
      D.GORDER.forEach(function (m) {
        var t = volTarget(m);
        if ((vol[m] || 0) >= t[0]) return;

        var best = null, bestSec = Infinity;
        days.forEach(function (d) {
          var sec = daySeconds(d.items);
          d.items.forEach(function (it) {
            var ex = byId(it.exId);
            if (!ex || primaryMuscle(ex) !== m || it.sets >= setCap) return;
            if (sec + it.rest + SET_OVERHEAD > maxSec) return;
            var a = muscleAffinity(ex);
            if (overHigh(ex, vol)) return;
            if (sec < bestSec) { best = { it: it, a: a }; bestSec = sec; }
          });
        });

        if (best) {
          best.it.sets++;
          var a = best.a;
          Object.keys(a).forEach(function (mm) { vol[mm] = (vol[mm] || 0) + a[mm]; });
          changed = true;
        }
      });
      if (!changed) break;
    }
  }

  /* контекст недели: пул, уже использованные упражнения и объём */
  function newContext() {
    var use = usageMaps();
    var order = {};
    D.EXERCISES.forEach(function (e, i) { order[e.id] = i; });
    return {
      pool: pool(), exUse: {}, vol: {}, recent: recentIds(3),
      lastUse: use.last, useCount: use.count, order: order
    };
  }

  function needScore(ex, ctx, dayPrimary) {
    var a = muscleAffinity(ex);
    var s = 0;
    Object.keys(a).forEach(function (m) {
      var t = volTarget(m), cur = ctx.vol[m] || 0, w = a[m];
      if (cur < t[0]) s += (t[0] - cur) * w * 3;
      else if (cur < t[1]) s += (t[1] - cur) * w * 0.6;
      else s -= Math.min(cur - t[1], 20) * w * 1.2;
      /* не добираем мышцу выше недельного потолка */
      if (cur >= t[1] - 1) s -= 25 * w;
      else if (cur + 3 * w > t[1]) s -= 12 * w;
    });
    if ((dayPrimary[primaryMuscle(ex)] || 0) >= 2) s -= 1000;
    if (ctx.exUse[ex.id]) s -= 40;
    if (ctx.recent[ex.id]) s -= 8;
    if (ex.lvl > 2) s -= 2.5;
    s -= (EQ_PREF[ex.eq] || 0) * 1.5;
    s += Math.random() * 1.2;
    return s;
  }

  /* сначала не использованные на этой неделе, иначе — любые */
  function fresh(cands, ctx) {
    var out = cands.filter(function (e) { return !ctx.exUse[e.id]; });
    return out.length ? out : cands;
  }

  function bestByScore(cands, ctx, dayPrimary, dayIds) {
    var best = null, bestScore = -1e9;
    cands.forEach(function (e) {
      if (dayIds[e.id]) return;
      var sc = needScore(e, ctx, dayPrimary);
      if (sc > bestScore) { bestScore = sc; best = e; }
    });
    return best;
  }

  /* Ротация «Таза»: из подходящих вариантов берём тот, который
     делали давнее всех. Иначе один вариант всегда выигрывает по объёму,
     а «Гиперэкстензия» и другие не появляются. Свежие упражнения уходят
     в конец, неиспользованные — в начало. */
  function lruPick(cands, ctx) {
    if (!cands.length) return null;
    var safe = cands.filter(function (e) { return !overHigh(e, ctx.vol); });
    if (safe.length) cands = safe;
    var best = null, bestKey = null;
    cands.forEach(function (e) {
      var key = [ctx.lastUse[e.id] || 0, ctx.useCount[e.id] || 0, ctx.order[e.id] || 0];
      if (!bestKey || key[0] < bestKey[0] ||
          (key[0] === bestKey[0] && key[1] < bestKey[1]) ||
          (key[0] === bestKey[0] && key[1] === bestKey[1] && key[2] < bestKey[2])) {
        best = e; bestKey = key;
      }
    });
    return best;
  }

  function hingeOptions(cands, slot) {
    if (!slot.pats || slot.pats.indexOf('hinge') === -1) return null;
    var hs = cands.filter(function (e) { return e.pat === 'hinge'; });
    return hs.length ? hs : null;
  }

  function takeScored(items, dayIds, dayPrimary, ctx, ex, slotPats) {
    if (!ex || dayIds[ex.id]) return false;
    var item = itemFrom(ex, slotPats);
    dayIds[ex.id] = true;
    var pm = primaryMuscle(ex);
    dayPrimary[pm] = (dayPrimary[pm] || 0) + 1;
    ctx.exUse[ex.id] = (ctx.exUse[ex.id] || 0) + 1;
    addVolume(ctx.vol, ex, item.sets);
    items.push(item);
    return true;
  }

  function slotCandidates(ctx, slot, dayIds, dayPrimary, scope, relaxCap) {
    return ctx.pool.filter(function (e) {
      if (slot.pats.indexOf(e.pat) === -1) return false;
      if (!inScope(e, scope)) return false;
      if (dayIds[e.id]) return false;
      if (!relaxCap && (dayPrimary[primaryMuscle(e)] || 0) >= 2) return false;
      return true;
    });
  }

  /* какие мышцы закрывает слот — для замены упражнения без повтора */
  function slotMuscles(slot) {
    var map = {
      hinge: ['ham', 'glutes'], core: ['abs'], calves: ['calves'],
      quad_iso: ['quads'], ham_iso: ['ham'], glute_iso: ['glutes'],
      chest_iso: ['chest'], delt_iso: ['shoulders'], rear_delt: ['shoulders'],
      biceps: ['biceps'], triceps: ['triceps']
    };
    var out = [];
    (slot.pats || []).forEach(function (p) {
      var ms = map[p] || (PAT_PRIMARY[p] ? [PAT_PRIMARY[p]] : []);
      ms.forEach(function (m) { if (out.indexOf(m) === -1) out.push(m); });
    });
    return out;
  }

  function buildSplitDay(spec, ctx) {
    var items = [], dayIds = {}, dayPrimary = {};
    var scope = spec.scope || null;
    var maxEx = spec.maxEx || 8;

    (spec.slots || []).forEach(function (slot) {
      function unused(list) {
        return list.filter(function (e) { return !ctx.exUse[e.id]; });
      }
      var cands = unused(slotCandidates(ctx, slot, dayIds, dayPrimary, scope, false));
      if (!cands.length) {
        var relaxed = slotCandidates(ctx, slot, dayIds, dayPrimary, scope, true);
        cands = unused(relaxed);
        /* паттерн исчерпан: берём неиспользованное упражнение той же мышцы,
           чтобы не повторять одно и то же в течение недели */
        if (!cands.length) {
          var ms = slotMuscles(slot);
          cands = ctx.pool.filter(function (e) {
            var pm = primaryMuscle(e);
            return !dayIds[e.id] && !ctx.exUse[e.id] && inScope(e, scope) &&
              ms.indexOf(pm) !== -1 && (dayPrimary[pm] || 0) < 2;
          });
        }
        /* совсем нет вариантов — повторяем упражнение */
        if (!cands.length) cands = relaxed;
      }
      if (!cands.length) return;
      var pick = hingeOptions(cands, slot);
      pick = pick ? lruPick(pick, ctx) : bestByScore(cands, ctx, dayPrimary, dayIds);
      takeScored(items, dayIds, dayPrimary, ctx, pick, slot.pats);
    });

    /* добиваем день упражнениями самых отстающих по объёму мышц */
    while (items.length < maxEx) {
      var extra = fresh(ctx.pool.filter(function (e) {
        return !dayIds[e.id] && inScope(e, scope) && (dayPrimary[primaryMuscle(e)] || 0) < 2 &&
          !overHigh(e, ctx.vol);
      }), ctx);
      if (!extra.length) break;
      var best = bestByScore(extra, ctx, dayPrimary, dayIds);
      if (!best) break;
      takeScored(items, dayIds, dayPrimary, ctx, best);
    }

    /* страховка для скудного набора: добираем из всего пула */
    while (items.length < 5) {
      var any = fresh(ctx.pool.filter(function (e) { return !dayIds[e.id]; }), ctx);
      if (!any.length) break;
      takeScored(items, dayIds, dayPrimary, ctx, bestByScore(any, ctx, dayPrimary, dayIds));
    }

    return orderItems(fitDay(items, ctx));
  }

  /* ---------------- конструктор дней по группам ---------------- */

  var CUSTOM_ORDER = ['legs', 'back', 'chest', 'shoulders', 'biceps', 'triceps', 'abs'];
  var CUSTOM_CAP = { legs: 3, back: 3, chest: 2, shoulders: 2, biceps: 2, triceps: 2, abs: 2 };
  var DEFAULT_SPLITS = {
    2: [['legs', 'abs'], ['chest', 'back', 'shoulders', 'biceps', 'triceps']],
    3: [['legs', 'abs'], ['chest', 'back'], ['shoulders', 'biceps', 'triceps']],
    4: [['legs'], ['chest', 'shoulders', 'triceps'], ['back', 'biceps'], ['legs', 'abs']]
  };

  /* «Руки» из старых сохранений раскладываются на бицепс и трицепс */
  function migrateGroups(groups) {
    var out = [];
    function add(k) { if (out.indexOf(k) === -1) out.push(k); }
    (Array.isArray(groups) ? groups : []).forEach(function (k) {
      if (k === 'arms') { add('biceps'); add('triceps'); }
      else if (groupDef(k)) add(k);
    });
    return out;
  }

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
      arr.push({ groups: d && Array.isArray(d.groups) ? migrateGroups(d.groups) : [] });
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

  function buildCustomDay(groups, ctx) {
    groups = migrateGroups(groups);
    var order = CUSTOM_ORDER.filter(function (g) { return groups.indexOf(g) !== -1; });
    if (!order.length) return [];

    var counts = {}, seq = [], guard = 0;
    order.forEach(function (g) { counts[g] = 0; });
    while (seq.length < 7 && guard < 60) {
      var g = order[seq.length % order.length];
      if (counts[g] < (CUSTOM_CAP[g] || 2)) { counts[g]++; seq.push(g); }
      guard++;
    }

    var mine = musclesOf(groups);
    var items = [], dayIds = {}, dayPrimary = {}, gi = {};
    seq.forEach(function (group) {
      var idx = gi[group] || 0;
      gi[group] = idx + 1;
      var pats = D.GROUP_PATS[group] || [];
      var pat = pats.length ? pats[idx % pats.length] : null;
      var muscles = groupMuscles(group);

      var inGroup = ctx.pool.filter(function (e) { return muscles.indexOf(e.g) !== -1 && !dayIds[e.id]; });
      var cands = pat ? inGroup.filter(function (e) { return e.pat === pat; }) : [];
      if (!cands.length) cands = inGroup;
      cands = fresh(cands, ctx);
      if (!cands.length) return;

      var chosen = pat === 'hinge' ? lruPick(cands, ctx) : bestByScore(cands, ctx, dayPrimary, dayIds);
      takeScored(items, dayIds, dayPrimary, ctx, chosen, pat ? [pat] : null);
    });

    /* добиваем объём внутри выбранных групп */
    while (items.length < 8) {
      var extra = fresh(ctx.pool.filter(function (e) {
        return !dayIds[e.id] && mine.indexOf(e.g) !== -1 &&
          (dayPrimary[primaryMuscle(e)] || 0) < 2 && !overHigh(e, ctx.vol);
      }), ctx);
      if (!extra.length) break;
      var best = bestByScore(extra, ctx, dayPrimary, dayIds);
      if (!best) break;
      takeScored(items, dayIds, dayPrimary, ctx, best);
    }

    /* если упражнений мало — берём всё, что есть в группах */
    while (items.length < 5) {
      var any = fresh(ctx.pool.filter(function (e) {
        return !dayIds[e.id] && mine.indexOf(e.g) !== -1;
      }), ctx);
      if (!any.length) break;
      takeScored(items, dayIds, dayPrimary, ctx, bestByScore(any, ctx, dayPrimary, dayIds));
    }

    return orderItems(fitDay(items, ctx));
  }

  function templateSpec(tpl, key) {
    return { key: key, name: tpl.name, scope: null, maxEx: 8, slots: tpl.slots };
  }

  function generateProgram() {
    var p = pool();
    if (!p.length) return;
    var ctx = newContext();
    var count = clamp(S.daysPerWeek, 2, 4);
    var days = [];

    if (S.buildMode === 'custom') {
      var plan = customDaysPlan();
      var hasGroups = plan.some(function (d) { return d.groups.length > 0; });
      if (hasGroups) {
        var used = {};
        plan.forEach(function (d, i) {
          if (!d.groups.length) return;
          var citems = buildCustomDay(d.groups, ctx);
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
          var itemsF = buildSplitDay(templateSpec(tplF, keyF), ctx);
          if (itemsF.length) days.push({ key: keyF, name: tplF.name, items: itemsF });
        }
        if (days.length) {
          days.sort(function (a, b) { return a.key < b.key ? -1 : 1; });
          balanceVolume(days);
          S.program = { createdAt: Date.now(), mode: 'custom', days: days };
          save();
          return;
        }
      }
    }

    /* авто: 2–3 дня фулбоди, 4 дня верх/низ — по рекомендациям
       Helms / Nippard / RP: 2+ тренировки на мышцу и 10–20 подходов */
    var split = D.SPLITS[count] || D.SPLITS[3];
    split.forEach(function (spec, i) {
      if (i >= count) return;
      var items = buildSplitDay(spec, ctx);
      if (items.length) days.push({ key: spec.key, name: spec.name, items: items });
    });
    balanceVolume(days);
    S.program = { createdAt: Date.now(), mode: 'auto', days: days };
    save();
  }

  function regenerateDay(key) {
    if (!S.program) return;
    var day = S.program.days.filter(function (d) { return d.key === key; })[0];
    if (!day) return;
    var ctx = newContext();
    S.program.days.forEach(function (d) {
      if (d.key === key) return;
      (d.items || []).forEach(function (it) {
        var ex = byId(it.exId);
        if (!ex) return;
        ctx.exUse[ex.id] = (ctx.exUse[ex.id] || 0) + 1;
        addVolume(ctx.vol, ex, it.sets);
      });
    });
    var items;
    if (S.program.mode === 'custom' && day.groups && day.groups.length) {
      items = buildCustomDay(day.groups, ctx);
    } else {
      var split = D.SPLITS[clamp(S.daysPerWeek, 2, 4)] || D.SPLITS[3];
      var spec = split.filter(function (s) { return s.key === key; })[0] ||
        { key: key, name: day.name, scope: null, maxEx: 8, slots: [] };
      items = buildSplitDay(spec, ctx);
    }
    if (items.length) day.items = items;
    balanceVolume(S.program.days);
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

  /* ---------------- разгрузка ----------------
     После ~6 недель объём срезается на 40% на неделю: это снижает
     накопленную усталость, не теряя мышцы (RP / Helms deload). */

  var DELOAD_AFTER = 42 * 86400000;

  function needsDeload() {
    if (!S.program || S.program.deload) return false;
    var since = S.program.lastDeloadAt || S.program.createdAt;
    return Date.now() - since > DELOAD_AFTER;
  }

  function deloadState() {
    if (!S.program || !S.program.deload) return null;
    return {
      active: Date.now() < S.program.deload.until,
      at: S.program.deload.at,
      until: S.program.deload.until
    };
  }

  function startDeload() {
    if (!S.program || S.program.deload) return;
    var backup = S.program.days.map(function (d) {
      return {
        key: d.key,
        sets: d.items.map(function (it) { return { exId: it.exId, sets: it.sets }; })
      };
    });
    S.program.days.forEach(function (d) {
      d.items.forEach(function (it) { it.sets = Math.max(2, Math.round(it.sets * 0.6)); });
    });
    S.program.deload = { at: Date.now(), until: Date.now() + 7 * 86400000 };
    S.program.deloadBackup = backup;
    S.program.lastDeloadAt = Date.now();
    save();
  }

  function endDeload() {
    if (!S.program || !S.program.deload) return;
    var backup = S.program.deloadBackup;
    if (Array.isArray(backup)) {
      S.program.days.forEach(function (d) {
        var bd = backup.filter(function (x) { return x.key === d.key; })[0];
        if (!bd) return;
        d.items.forEach(function (it) {
          var old = bd.sets.filter(function (x) { return x.exId === it.exId; })[0];
          if (old) it.sets = old.sets;
        });
      });
    }
    delete S.program.deload;
    delete S.program.deloadBackup;
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
        sets: it.sets, lo: it.lo, hi: it.hi, rest: it.rest, rir: it.rir,
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
    orderItems: orderItems, PAT_RANK: PAT_RANK,
    generateProgram: generateProgram, regenerateDay: regenerateDay, pruneProgram: pruneProgram,
    weekVolume: weekVolume, weekFrequency: weekFrequency, volTarget: volTarget,
    VOL_TARGET: VOL_TARGET, muscleAffinity: muscleAffinity,
    needsDeload: needsDeload, deloadState: deloadState, startDeload: startDeload, endDeload: endDeload,
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

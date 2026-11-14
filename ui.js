/* Disciplina — экраны и интерфейс */
(function () {
  'use strict';

  var DS = window.DS, D = window.D, S = DS.S, UI = DS.UI;
  var app = document.getElementById('app');

  function haptic(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

  /* iOS включает :active только если на странице есть touch-обработчик */
  document.addEventListener('touchstart', function () {}, { passive: true });

  var IC = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.56V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1.11-1.56 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.56-1H3a2 2 0 110-4h.09A1.7 1.7 0 004.65 9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009 4.65a1.7 1.7 0 001-1.56V3a2 2 0 114 0v.09a1.7 1.7 0 001 1.56 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.35 9c.24.6.82 1 1.47 1H21a2 2 0 110 4h-.09c-.65 0-1.23.4-1.47 1z"/></svg>',
    prog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    hist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>',
    set: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.55" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8v8M8 5v14M16 5v14M20 8v8M8 12h8"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 4h4M6 7l1 13h10l1-13"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.8-3.8"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12M6 11l6 6 6-6M4 20h16"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V8M6 13l6-6 6 6M4 4h16"/></svg>'
  };

  function nav() {
    var r = UI.route.name;
    return '<nav class="nav">' +
      '<button data-act="nav" data-to="program" class="' + (r === 'program' ? 'on' : '') + '">' + IC.prog + '<span>Программа</span></button>' +
      '<button data-act="nav" data-to="history" class="' + (r === 'history' || r === 'detail' || r === 'exercise' ? 'on' : '') + '">' + IC.hist + '<span>История</span></button>' +
      '<button data-act="nav" data-to="settings" class="' + (r === 'settings' ? 'on' : '') + '">' + IC.set + '<span>Настройки</span></button>' +
      '</nav>';
  }

  function showNav(route) {
    return ['program', 'history', 'detail', 'exercise', 'settings'].indexOf(route) !== -1;
  }

  function hdr(opts) {
    return '<header class="hdr"><div class="pad hdr-in">' +
      (opts.back ? '<button class="back" data-act="back">' + IC.back + '<span>' + DS.esc(opts.back) + '</span></button>' : '') +
      (opts.mark ? '<div class="mark"><span class="mark-t">disciplina</span></div>' : '') +
      (opts.mark ? '<span class="ver">alpha v.1</span>' : '') +
      (opts.title ? '<div class="hdr-t">' + DS.esc(opts.title) + '</div>' : '') +
      (opts.right || '') +
      '</div></header>';
  }

  function chipsEquip() {
    return '<div class="chips">' + Object.keys(D.EQUIP).map(function (k) {
      var on = S.equipment.indexOf(k) !== -1;
      return '<button class="chip ' + (on ? 'on' : '') + '" data-act="eq" data-v="' + k + '">' + D.EQUIP[k] + '</button>';
    }).join('') + '</div>';
  }

  function chipsFilter() {
    return '<div class="chips">' + D.FILTERS.map(function (f) {
      return '<button class="chip ' + (UI.filter === f.k ? 'on' : '') + '" data-act="filter" data-v="' + f.k + '">' + f.t + '</button>';
    }).join('') + '</div>';
  }

  /* ---- сборка программы: авто или по группам ---- */

  function modeBlock() {
    var cards = [
      { k: 'auto', b: 'Авто', i: 'Готовые схемы: всё тело, тяга и плечи, объём' },
      { k: 'custom', b: 'Сам', i: 'Выбираю группы мышц для каждого дня' }
    ];
    return '<div class="sect"><span class="eyebrow">Как собирать дни</span><div class="stack-s">' +
      cards.map(function (c) {
        return '<button class="mode-card ' + (S.buildMode === c.k ? 'on' : '') + '" data-act="setMode" data-v="' + c.k + '">' +
          '<span class="ring"><i></i></span><span class="mode-t"><b>' + c.b + '</b><i>' + c.i + '</i></span></button>';
      }).join('') + '</div></div>';
  }

  function builderDays() {
    var plan = DS.customDaysPlan();
    var rows = plan.map(function (d, i) {
      var chips = D.BUILD_GROUPS.map(function (bg) {
        var on = d.groups.indexOf(bg.k) !== -1;
        return '<button class="chip ' + (on ? 'on' : '') + '" data-act="dayGroup" data-day="' + i + '" data-g="' + bg.k + '">' + bg.t + '</button>';
      }).join('');
      var name = d.groups.length ? DS.customDayName(d.groups) : 'День ' + (i + 1);
      return '<div class="bday ' + (d.groups.length ? '' : 'empty') + '">' +
        '<div class="bday-h"><span class="bday-k">' + 'ABCD'[i] + '</span><b>' + DS.esc(name) + '</b>' +
        (d.groups.length ? '' : '<i>выбери группы</i>') + '</div>' +
        '<div class="chips">' + chips + '</div></div>';
    }).join('');
    return '<div class="sect"><span class="eyebrow">Дни и группы</span>' +
      '<div class="stack-s">' + rows + '</div>' +
      '<p class="hint">Отметь группы для каждого дня — упражнения подберу из твоего набора с учётом истории и весов.</p>' +
      '</div>';
  }

  function normQ(s) {
    return String(s || '').toLowerCase().replace(/ё/g, 'е').trim();
  }

  function curFilter() {
    return D.FILTERS.filter(function (x) { return x.k === UI.filter; })[0] || D.FILTERS[0];
  }

  function inFilter(ex, f) {
    return !f.g || f.g.indexOf(ex.g) !== -1;
  }

  function matchesQuery(ex) {
    var q = normQ(UI.pickQuery);
    if (!q) return true;
    var parts = [ex.n, D.GROUP[ex.g], D.EQUIP[ex.eq]];
    D.FILTERS.forEach(function (f) {
      if (f.g && f.g.indexOf(ex.g) !== -1) parts.push(f.t);
    });
    var hay = normQ(parts.join(' '));
    return q.split(/\s+/).every(function (part) { return hay.indexOf(part) !== -1; });
  }

  function filteredExercises() {
    var f = curFilter();
    return D.EXERCISES.filter(function (e) {
      return DS.isAvailable(e) && inFilter(e, f) && matchesQuery(e);
    });
  }

  function hiddenByEquip() {
    var f = curFilter();
    return D.EXERCISES.filter(function (e) {
      return !DS.isAvailable(e) && inFilter(e, f) && matchesQuery(e);
    }).length;
  }

  function pickRow(ex) {
    var on = S.selected.indexOf(ex.id) !== -1;
    return '<button class="pick ' + (on ? 'on' : '') + '" data-act="toggleEx" data-id="' + ex.id + '">' +
      '<span class="box">' + (on ? IC.check : '') + '</span>' +
      '<span class="pick-t"><b>' + DS.esc(ex.n) + '</b><i>' + D.GROUP[ex.g] + ' · ' + D.EQUIP[ex.eq] + '</i></span>' +
      '</button>';
  }

  function pickList() {
    var list = filteredExercises();
    if (list.length) return list.map(pickRow).join('');
    var hidden = hiddenByEquip();
    var msg = hidden
      ? 'Скрыто фильтром инвентаря: ' + hidden + '. Включи нужный чип выше.'
      : 'Попробуй другое название или другую группу.';
    return '<div class="empty"><b>Ничего не найдено</b><p>' + msg + '</p></div>';
  }

  function searchField() {
    var q = UI.pickQuery || '';
    return '<div class="pick-search">' + IC.search +
      '<input id="exq" type="search" inputmode="search" autocomplete="off" spellcheck="false" ' +
      'placeholder="Найти упражнение" aria-label="Найти упражнение" value="' + DS.esc(q) + '">' +
      '<button class="pick-clear" data-act="pickClear" aria-label="Очистить поиск"' +
      (q ? '' : ' style="display:none"') + '>' + IC.x + '</button></div>';
  }

  function gaps() {
    var pats = {};
    S.selected.forEach(function (id) { var e = DS.byId(id); if (e) pats[e.pat] = true; });
    var out = [];
    if (!pats.squat && !pats.lunge && !pats.hinge) out.push('ноги');
    if (!pats.hpush && !pats.vpush) out.push('жимы');
    if (!pats.hpull && !pats.vpull) out.push('тяги');
    if (!pats.core) out.push('пресс');
    return out;
  }

  function screenPick(edit) {
    var n = S.selected.length;
    var gap = gaps();
    var body =
      hdr({ back: edit ? 'Настройки' : (UI.route.step > 1 ? 'Назад' : null), mark: !edit && UI.route.step === 1 }) +
      '<div class="wrap">' +
      (edit ? '' : '<div class="steps"><i class="on"></i><i></i><i></i></div>') +
      '<div class="head-block">' +
      '<h1>' + (edit ? 'Твои упражнения' : 'Что тебе доступно?') + '</h1>' +
      '<p class="sub">Отметь упражнения, которые умеешь делать и хочешь видеть в программе. Инвентарь можно отфильтровать.</p>' +
      '</div>' +
      '<div class="pick-filters">' + searchField() + chipsEquip() + chipsFilter() + '</div>' +
      '<div id="picklist">' + pickList() + '</div>' +
      '</div>' +
      '<div class="foot">' +
      '<div class="row"><span>Выбрано <b>' + n + '</b> ' + DS.plural(n, 'упражнение', 'упражнения', 'упражнений') + '</span>' +
      (gap.length && n >= 5 ? '<span class="warn">нет: ' + gap.join(', ') + '</span>' : '') + '</div>' +
      '<button class="btn" data-act="' + (edit ? 'pickDone' : 'obNext') + '" ' + (n < 5 ? 'disabled' : '') + '>' +
      (edit ? 'Готово' : (n < 5 ? 'Выбери минимум 5' : 'Далее')) + '</button>' +
      '</div>';
    return body;
  }

  function weightInput(id, val) {
    return '<label class="inp"><input type="number" inputmode="decimal" step="0.5" min="0" ' +
      'value="' + (val ? val : '') + '" placeholder="0" data-wid="' + id + '" data-k="w"><span>кг</span></label>';
  }

  function repsInput(id, val) {
    return '<label class="inp r"><input type="number" inputmode="numeric" step="1" min="1" ' +
      'value="' + (val || '') + '" placeholder="10" data-wid="' + id + '" data-k="r"><span>повт</span></label>';
  }

  function screenWeights(edit) {
    var ids = S.selected.filter(function (id) { return DS.byId(id) && DS.isAvailable(DS.byId(id)); });
    var groups = {};
    ids.forEach(function (id) {
      var ex = DS.byId(id);
      (groups[ex.g] = groups[ex.g] || []).push(ex);
    });
    var blocks = D.GORDER.filter(function (g) { return groups[g]; }).map(function (g) {
      return '<div class="wgroup"><h3>' + D.GROUP[g] + '</h3>' + groups[g].map(function (ex) {
        var w = S.weights[ex.id] || {};
        if (w.w === undefined) w = { w: D.DEFAULT_W[ex.eq] || 0, r: 10 };
        return '<div class="wrow"><div class="wrow-n"><b>' + DS.esc(ex.n) + '</b><i>' + D.EQUIP[ex.eq] + '</i></div>' +
          weightInput(ex.id, w.w) + repsInput(ex.id, w.r) + '</div>';
      }).join('') + '</div>';
    }).join('');

    return hdr({ back: edit ? 'Настройки' : 'Назад' }) +
      '<div class="wrap">' +
      (edit ? '' : '<div class="steps"><i class="on"></i><i class="on"></i><i></i></div>') +
      '<div class="head-block">' +
      '<h1>' + (edit ? 'Рабочие веса' : 'С какими весами?') + '</h1>' +
      '<p class="sub">Укажи вес, с которым делаешь 8–10 повторов. Дальше программа сама будет его поднимать.</p>' +
      '</div>' +
      (blocks || '<div class="empty"><b>Нет упражнений</b><p>Вернись и выбери упражнения.</p></div>') +
      '</div>' +
      '<div class="foot"><button class="btn" data-act="' + (edit ? 'weightsDone' : 'obNext') + '">' +
      (edit ? 'Готово' : 'Далее') + '</button></div>';
  }

  function goalCard(k) {
    var g = D.GOALS[k];
    return '<button class="goal-card ' + (S.goal === k ? 'on' : '') + '" data-act="goal" data-v="' + k + '">' +
      '<span class="ring"><i></i></span><span><b>' + g.t + '</b><p>' + g.d + '</p></span></button>';
  }

  function screenGoal(edit) {
    var days = [2, 3, 4].map(function (n) {
      return '<button class="' + (S.daysPerWeek === n ? 'on' : '') + '" data-act="days" data-v="' + n + '">' + n + ' дня</button>';
    }).join('');
    return hdr({ back: edit ? 'Настройки' : 'Назад' }) +
      '<div class="wrap">' +
      (edit ? '' : '<div class="steps"><i class="on"></i><i class="on"></i><i class="on"></i></div>') +
      '<div class="head-block"><h1>Какая цель?</h1><p class="sub">От цели зависит количество подходов, повторов и отдых. Программа рассчитывается минимум на 50 минут.</p></div>' +
      goalCard('mass') + goalCard('maintain') + goalCard('cut') +
      '<div class="sect"><span class="eyebrow">Тренировок в неделю</span><div class="seg">' + days + '</div></div>' +
      modeBlock() +
      (S.buildMode === 'custom' ? builderDays() : '') +
      '</div>' +
      '<div class="foot"><button class="btn" data-act="' + (edit ? 'goalDone' : 'buildProgram') + '">' +
      (edit ? 'Сохранить' : 'Собрать программу') + '</button></div>';
  }

  /* ---------------- program ---------------- */

  function goalChip() {
    return '<span class="goalchip"><i></i>' + D.GOALS[S.goal].t + ' · ' + S.daysPerWeek + ' дн/нед</span>';
  }

  function dayCard(day) {
    var done = !!DS.doneKeysThisWeek()[day.key];
    var next = DS.nextDay();
    var isNext = next && next.key === day.key && !done;
    var minutes = Math.round(DS.daySeconds(day.items) / 60);

    var rows = day.items.map(function (it) {
      var ex = DS.byId(it.exId);
      if (!ex) return '';
      var w = DS.weightFor(it.exId);
      return '<li><span class="ex-n">' + DS.esc(ex.n) + '</span>' +
        '<span class="ex-w">' + it.sets + '×' + it.lo + '–' + it.hi + ' · <b>' + DS.kg(w) + '</b></span></li>';
    }).join('');

    return '<article class="day ' + (done ? 'done' : '') + '">' +
      '<div class="day-h">' +
      '<span class="day-k">' + (done ? IC.check : DS.esc(day.key)) + '</span>' +
      '<div class="day-t"><h2>' + DS.esc(day.name) + '</h2>' +
      '<p>' + day.items.length + ' ' + DS.plural(day.items.length, 'упражнение', 'упражнения', 'упражнений') +
      ' · ~' + minutes + ' мин' + (isNext ? ' · <span class="acc">следующая</span>' : '') + '</p></div>' +
      '</div>' +
      '<ul class="exlist">' + rows + '</ul>' +
      '<div class="day-a">' +
      '<button class="btn" data-act="start" data-key="' + DS.esc(day.key) + '">Начать</button>' +
      '<button class="btn ghost" data-act="editDay" data-key="' + DS.esc(day.key) + '">Изменить</button>' +
      '</div></article>';
  }

  function screenProgram() {
    if (!S.onboarded) return '';
    if (!S.program || !S.program.days.length) {
      return hdr({ mark: true, right: '<button class="iconbtn" data-act="nav" data-to="settings">' + IC.gear + '</button>' }) +
        '<div class="wrap"><div class="proghead">' + goalChip() + '<h1>Программа</h1></div>' +
        '<div class="empty"><b>Программы пока нет</b><p>Выбери упражнения — и я соберу первую программу.</p></div>' +
        '<div class="actions"><button class="btn" data-act="openPick">Выбрать упражнения</button></div></div>';
    }

    var days = S.program.days;
    var week = DS.weekCount();
    var old = Date.now() - S.program.createdAt > 21 * 86400000;
    var banner = old
      ? '<div class="note"><div><b>Пора обновить.</b> Программа работает уже больше трёх недель. Собери новую — веса и история сохранятся.</div></div>'
      : '';
    var shortDays = days.filter(function (d) { return DS.daySeconds(d.items) < DS.MIN_SESSION; });
    var shortNote = shortDays.length
      ? '<div class="note"><div><b>День короче 50 минут.</b> В выбранных группах не хватает упражнений — добавь ещё, и день дотянется до 50 минут.</div></div>'
      : '';

    var dots = days.map(function (d) {
      return '<span class="' + (DS.doneKeysThisWeek()[d.key] ? 'done' : '') + '"></span>';
    }).join('');

    return hdr({ mark: true, right: '<button class="iconbtn" data-act="nav" data-to="settings">' + IC.gear + '</button>' }) +
      '<div class="wrap">' +
      '<div class="proghead">' + goalChip() +
      '<h1>Программа</h1>' +
      '<p class="sub">' + days.length + ' ' + DS.plural(days.length, 'тренировка', 'тренировки', 'тренировок') +
      ' в неделю · сделано ' + week + ' из ' + days.length + '</p>' +
      '<div class="weekdots">' + dots + '</div></div>' +
      banner +
      shortNote +
      days.map(dayCard).join('') +
      '<div class="actions">' +
      '<button class="btn ghost" data-act="regen">Пересобрать программу</button>' +
      '<button class="btn ghost" data-act="openBuilder">Сборка дней по группам</button>' +
      '</div>' +
      '<p class="sub center mt-10">' +
      (S.buildMode === 'custom' ? 'Дни собраны по твоим группам мышц. ' : '') +
      'Упражнения обновятся с учётом последних тренировок, веса останутся.</p>' +
      '</div>';
  }

  /* ---------------- day editor ---------------- */

  function currentDay() {
    if (!S.program) return null;
    return S.program.days.filter(function (d) { return d.key === UI.dayKey; })[0] || null;
  }

  function screenDay() {
    var day = currentDay();
    if (!day) return screenProgram();
    var rows = day.items.map(function (it, i) {
      var ex = DS.byId(it.exId);
      if (!ex) return '';
      return '<div class="wrow">' +
        '<div class="wrow-n"><b>' + DS.esc(ex.n) + '</b><i>' + it.sets + '×' + it.lo + '–' + it.hi + ' · ' + D.GROUP[ex.g] + ' · ' + DS.kg(DS.weightFor(it.exId)) + '</i></div>' +
        '<button class="iconbtn" data-act="swapOpen" data-idx="' + i + '" aria-label="Заменить">' + IC.swap + '</button>' +
        '<button class="iconbtn" data-act="delEx" data-idx="' + i + '" aria-label="Удалить">' + IC.trash + '</button>' +
        '</div>';
    }).join('');

    return hdr({ back: 'Программа' }) +
      '<div class="wrap pb-nav">' +
      '<div class="head-block"><h1>' + DS.esc(day.name) + '</h1>' +
      '<p class="sub">' + (day.groups && day.groups.length ? DS.customDayName(day.groups) + ' · ' : '') +
      day.items.length + ' ' + DS.plural(day.items.length, 'упражнение', 'упражнения', 'упражнений') +
      ' · ~' + Math.round(DS.daySeconds(day.items) / 60) + ' мин. Замени или убери то, что не подходит.</p></div>' +
      '<div class="stack-s">' + rows + '</div>' +
      '<div class="actions tight">' +
      '<button class="btn ghost sm" data-act="addOpen">' + IC.plus + '<span>Добавить упражнение</span></button>' +
      '<button class="btn ghost sm" data-act="regenDay">' + IC.swap + '<span>Пересобрать день</span></button>' +
      '</div></div>' +
      '<div class="foot"><button class="btn" data-act="start" data-key="' + DS.esc(day.key) + '">Начать тренировку</button></div>';
  }

  /* ---------------- builder ---------------- */

  function builderValid() {
    if (S.buildMode !== 'custom') return true;
    var plan = DS.customDaysPlan();
    return plan.every(function (d) { return d.groups.length > 0; });
  }

  function screenBuilder() {
    return hdr({ back: UI.builderBack === 'program' ? 'Программа' : 'Настройки' }) +
      '<div class="wrap pb-nav">' +
      '<div class="head-block"><h1>Сборка дней</h1>' +
      '<p class="sub">«Авто» — готовые схемы. «Сам» — ты задаёшь группы мышц на каждый день, упражнения подбираются под них.</p></div>' +
      modeBlock() +
      (S.buildMode === 'custom' ? builderDays() : '') +
      '</div>' +
      '<div class="foot"><button class="btn" data-act="builderDone"' + (builderValid() ? '' : ' disabled') + '>' +
      (S.buildMode === 'custom' ? 'Собрать по группам' : 'Пересобрать программу') + '</button></div>';
  }

  /* ---------------- session ---------------- */

  function entryPrev(e) {
    var last = DS.lastEntry(e.exId);
    if (!last || !last.sets.length) return 'Первый раз';
    var top = last.sets.reduce(function (a, s) { return s.w > a.w ? s : a; }, last.sets[0]);
    return 'Прошлый раз: ' + DS.kg(top.w) + ' × ' + top.r;
  }

  function setRow(e, ei, r, ri) {
    return '<div class="set ' + (r.done ? 'done' : '') + '">' +
      '<span class="idx num">' + (ri + 1) + '</span>' +
      '<label class="inp"><input type="number" inputmode="decimal" step="0.5" min="0" ' +
      'value="' + (r.w || '') + '" placeholder="0" data-si="' + ei + '" data-ri="' + ri + '" data-k="w"><span>кг</span></label>' +
      '<label class="inp"><input type="number" inputmode="numeric" step="1" min="0" ' +
      'value="' + (r.r || '') + '" placeholder="—" data-si="' + ei + '" data-ri="' + ri + '" data-k="r"><span>повт</span></label>' +
      '<button class="chk" data-act="toggleSet" data-si="' + ei + '" data-ri="' + ri + '" aria-label="Подход выполнен">' + IC.check + '</button>' +
      '</div>';
  }

  function exBlock(e, ei) {
    var ex = DS.byId(e.exId);
    if (!ex) return '';
    var done = e.rows.filter(function (r) { return r.done; }).length;
    var allDone = done === e.rows.length;
    var dots = e.rows.map(function (r) { return '<i class="' + (r.done ? 'on' : '') + '"></i>'; }).join('');
    return '<section class="ex-block ' + (allDone ? 'done' : '') + '">' +
      '<div class="ex-head"><div class="ex-head-t"><h3>' + DS.esc(ex.n) + '</h3>' +
      '<div class="meta">' + e.sets + '×' + e.lo + '–' + e.hi + ' · отдых ' + DS.mmss(e.rest) + ' · ' + D.GROUP[ex.g] + '</div>' +
      '<div class="prev">' + entryPrev(e) + '</div></div>' +
      '<div class="dots">' + dots + '</div></div>' +
      e.rows.map(function (r, ri) { return setRow(e, ei, r, ri); }).join('') +
      '</section>';
  }

  function screenSession() {
    if (!S.active) return '';
    var a = S.active, st = DS.sessionStats();
    var pct = st.total ? (st.done / st.total) * 100 : 0;
    return '<header class="hdr"><div class="pad sess-top">' +
      '<button class="iconbtn" data-act="cancelSession" aria-label="Закрыть">' + IC.x + '</button>' +
      '<div class="sess-t"><div class="eyebrow">Тренировка</div>' +
      '<h2 class="sess-name">' + DS.esc(a.name) + '</h2></div>' +
      '<div class="sess-time num" id="elapsed">0:00</div>' +
      '</div>' +
      '<div class="pad sess-prog"><div class="track"><div class="fill" style="width:' + pct + '%"></div></div></div>' +
      '</header>' +
      '<div class="wrap pb-session">' +
      a.entries.map(exBlock).join('') +
      '<div class="actions"><button class="btn" data-act="finishSession">Завершить тренировку</button></div>' +
      '</div>' + restBar();
  }

  function restBar() {
    if (!UI.rest) return '';
    var left = (UI.rest.end - Date.now()) / 1000;
    var cls = 'rest' + (UI.rest.animated ? ' noin' : '');
    UI.rest.animated = true;
    return '<div class="' + cls + '">' +
      '<div class="r-top"><b>Отдых</b><span id="resttime">' + DS.mmss(left) + '</span></div>' +
      '<div class="r-track"><div class="r-fill" id="restfill" style="width:' + Math.max(0, (left / UI.rest.total) * 100) + '%"></div></div>' +
      '<div class="r-btns"><button data-act="restAdd">+15 секунд</button><button data-act="restSkip">Пропустить</button></div>' +
      '</div>';
  }

  /* ---------------- finish ---------------- */

  function screenFinish() {
    var s = UI.summary;
    if (!s) return screenProgram();
    var bumps = s.bumps.length
      ? '<div class="sect"><span class="eyebrow">Новый рабочий вес</span><div class="card">' +
      s.bumps.map(function (b) {
        var ex = DS.byId(b.exId);
        return '<div class="prow"><div class="n"><b>' + DS.esc(ex ? ex.n : b.exId) + '</b></div>' +
          '<div class="w">' + DS.kg(b.from) + ' → <span class="acc">' + DS.kg(b.to) + '</span></div></div>';
      }).join('') + '</div></div>'
      : '';

    return hdr({ title: 'Тренировка' }) +
      '<div class="wrap pb-flat">' +
      '<div class="big-stat"><div class="v">' + DS.mins(s.duration) + '<span class="unit"> мин</span></div>' +
      '<div class="l">' + DS.esc(s.name) + '</div></div>' +
      '<div class="stats3">' +
      '<div><b>' + s.sets + '</b><span>подходов</span></div>' +
      '<div><b>' + (s.volume ? Math.round(s.volume).toLocaleString('ru-RU') : '—') + '</b><span>тоннаж, кг</span></div>' +
      '<div><b>' + s.bumps.length + '</b><span>новых весов</span></div>' +
      '</div>' +
      bumps +
      '<div class="actions"><button class="btn" data-act="nav" data-to="program">К программе</button></div>' +
      '</div>';
  }

  /* ---------------- sheet ---------------- */

  function sheetHtml() {
    if (!UI.sheet) return '';
    var sh = UI.sheet;
    var title = sh.type === 'swap' ? 'Заменить упражнение' : 'Добавить упражнение';
    var body = '';

    if (sh.type === 'swap') {
      var dayS = currentDay();
      var curItem = dayS && dayS.items[sh.idx];
      var curEx = curItem && DS.byId(curItem.exId);
      var alts = DS.pool().filter(function (ex) { return sh.exclude.indexOf(ex.id) === -1; });
      alts.sort(function (a, b) {
        function score(ex) {
          return (sh.pats.indexOf(ex.pat) !== -1 ? 0 : 10) + (curEx && ex.g === curEx.g ? 0 : 4);
        }
        return score(a) - score(b) || a.n.localeCompare(b.n, 'ru');
      });
      body = alts.map(function (ex) {
        var tag = D.GROUP[ex.g] + ' · ' + D.EQUIP[ex.eq];
        if (curEx && ex.g === curEx.g && sh.pats.indexOf(ex.pat) === -1) tag += ' · другой вариант';
        return '<button class="pick" data-act="pickSwap" data-id="' + ex.id + '">' +
          '<span class="pick-t"><b>' + DS.esc(ex.n) + '</b><i>' + tag + '</i></span>' +
          '<span class="pick-ic">' + IC.chev + '</span></button>';
      }).join('');
      if (!body) body = '<div class="empty"><p>Нет подходящих упражнений.</p></div>';
    } else {
      var list = DS.pool().filter(function (ex) { return sh.exclude.indexOf(ex.id) === -1; });
      body = list.map(function (ex) {
        return '<button class="pick" data-act="pickAdd" data-id="' + ex.id + '">' +
          '<span class="pick-t"><b>' + DS.esc(ex.n) + '</b><i>' + D.GROUP[ex.g] + ' · ' + D.EQUIP[ex.eq] + '</i></span>' +
          '<span class="pick-ic">' + IC.plus + '</span></button>';
      }).join('');
      if (!body) body = '<div class="empty"><p>Все твои упражнения уже добавлены.</p></div>';
    }

    return '<div class="sheet-bg" data-act="sheetClose"></div>' +
      '<div class="sheet"><button class="sheet-grab" data-act="sheetClose" aria-label="Закрыть"></button>' +
      '<div class="sheet-h"><h3>' + title + '</h3>' +
      '<button class="iconbtn" data-act="sheetClose">' + IC.x + '</button></div>' +
      '<div class="sheet-b">' + body + '</div></div>';
  }

  /* ---- шторка: перетаскивание с инерцией ---- */
  var RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var suppressClick = false;

  /* куда «долетит» жест по скорости — как в iOS */
  function project(v) { return (v / 1000) * 0.998 / (1 - 0.998); }

  /* мягкое сопротивление за границей */
  function rubber(x, dim) { return (x * dim * 0.55) / (dim + 0.55 * Math.abs(x)); }

  /* кадр: rAF для плавности, таймер — если кадры не приходят */
  function nextFrame(fn) {
    var done = false, rid = 0, tid = 0;
    rid = requestAnimationFrame(function (t) { if (done) return; done = true; clearTimeout(tid); fn(t); });
    tid = setTimeout(function () { if (done) return; done = true; cancelAnimationFrame(rid); fn(performance.now()); }, 32);
    return function () { done = true; cancelAnimationFrame(rid); clearTimeout(tid); };
  }

  /* пружина: damping 1 — без отскока, <1 — с инерцией */
  function spring(from, to, velocity, damping, response, onFrame, onDone) {
    var omega = (2 * Math.PI) / response;
    var k = omega * omega, c = 2 * damping * omega;
    var x = from, v = velocity || 0, last = performance.now(), dead = false, cancelNext = null;
    function step(now) {
      if (dead) return;
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      var n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n;
      for (var i = 0; i < n; i++) {
        var a = -k * (x - to) - c * v;
        v += a * h;
        x += v * h;
      }
      if (Math.abs(x - to) < 0.5 && Math.abs(v) < 10) {
        onFrame(to, 0);
        if (onDone) onDone();
        return;
      }
      onFrame(x, v);
      cancelNext = nextFrame(step);
    }
    cancelNext = nextFrame(step);
    return function () { dead = true; if (cancelNext) cancelNext(); };
  }

  function initSheet() {
    var sheet = app.querySelector('.sheet');
    if (!sheet) return;
    var bg = app.querySelector('.sheet-bg');
    var h = Math.max(320, Math.round(sheet.getBoundingClientRect().height) || 600);
    var cur = 0, drag = null, stopAnim = null;

    function apply(y) {
      cur = y;
      sheet.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
      if (bg) bg.style.opacity = String(Math.max(0, Math.min(1, 1 - y / h)));
    }

    function closeNow() {
      UI.sheet = null;
      render();
    }

    function run(to, velocity, damping, response, done) {
      if (stopAnim) stopAnim();
      stopAnim = null;
      if (RM.matches) { apply(to); if (done) done(); return; }
      stopAnim = spring(cur, to, velocity, damping, response, apply, function () {
        stopAnim = null;
        if (done) done();
      });
    }

    function onDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (stopAnim) { stopAnim(); stopAnim = null; }
      drag = { id: e.pointerId, base: cur, y0: e.clientY, ly: e.clientY, lt: performance.now(), v: 0, moved: 0 };
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    }

    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dy = e.clientY - drag.y0;
      drag.moved = Math.max(drag.moved, Math.abs(dy));
      apply(drag.base + (dy > 0 ? dy : rubber(dy, h)));
      var now = performance.now(), dt = Math.max(1, now - drag.lt);
      drag.v = ((e.clientY - drag.ly) / dt) * 1000;
      drag.ly = e.clientY;
      drag.lt = now;
      if (drag.moved > 8 && e.cancelable) e.preventDefault();
    }

    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (d.moved > 8) {
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 400);
      }
      var projected = cur + project(d.v);
      if (d.v > 480 || projected > h * 0.35) run(h + 60, d.v, 0.82, 0.3, closeNow);
      else run(0, d.v, 1, 0.35);
    }

    function onCancel(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      run(0, 0, 1, 0.35);
    }

    [sheet.querySelector('.sheet-grab'), sheet.querySelector('.sheet-h')].forEach(function (el) {
      if (!el) return;
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onCancel);
    });
  }


  /* ---------------- history ---------------- */

  function spark(vals, w, h, cls) {
    if (vals.length < 2) return '';
    w = w || 76; h = h || 26;
    var p = 3;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var rng = (max - min) || 1;
    var pts = vals.map(function (v, i) {
      return [p + (i * (w - 2 * p)) / (vals.length - 1), h - p - ((v - min) / rng) * (h - 2 * p)];
    });
    var d = pts.map(function (pt, i) { return (i ? 'L' : 'M') + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1); }).join('');
    var last = pts[pts.length - 1];
    return '<svg class="spark' + (cls ? ' ' + cls : '') + '" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
      '<path d="' + d + '" fill="none" stroke="var(--acc)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.2" fill="var(--acc)"/></svg>';
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function monthTitle(ts) {
    return cap(new Date(ts).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', ''));
  }

  function weekdayShort(ts) {
    return new Date(ts).toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '');
  }

  function fullDate(ts) {
    var d = new Date(ts);
    var o = { weekday: 'short', day: 'numeric', month: 'long' };
    if (d.getFullYear() !== new Date().getFullYear()) o.year = 'numeric';
    return d.toLocaleDateString('ru-RU', o).replace(' г.', '');
  }

  function dayMonth(ts) {
    var d = new Date(ts);
    var o = { day: 'numeric', month: 'short' };
    if (d.getFullYear() !== new Date().getFullYear()) o.year = 'numeric';
    return d.toLocaleDateString('ru-RU', o).replace('.', '').replace(' г.', '');
  }

  function numRu(v) { return Math.round(v).toLocaleString('ru-RU'); }

  function monthGroups(list) {
    var out = [], map = {};
    list.forEach(function (h) {
      var d = new Date(h.ts);
      var k = d.getFullYear() + '-' + d.getMonth();
      if (!map[k]) { map[k] = { ts: h.ts, items: [] }; out.push(map[k]); }
      map[k].items.push(h);
    });
    return out;
  }

  function exEntry(h, exId) {
    var es = (h.entries || []).filter(function (e) { return e.exId === exId; });
    return es[0] || null;
  }

  function entryStats(e) {
    var volume = 0, best = null, sets = (e && e.sets) || [];
    sets.forEach(function (s) {
      volume += (s.w || 0) * (s.r || 0);
      if (!best || s.w > best.w || (s.w === best.w && s.r > best.r)) best = s;
    });
    return { volume: volume, best: best, bestW: best ? best.w : 0, sets: sets.length };
  }

  function setLabel(s) {
    return s.w ? DS.kg(s.w).replace(' кг', '') + '×' + s.r : s.r + ' повт';
  }

  function sessionExNames(h, max) {
    var names = (h.entries || []).map(function (e) {
      var ex = DS.byId(e.exId);
      return ex ? ex.n : null;
    }).filter(Boolean);
    var shown = names.slice(0, max || 3);
    return shown.join(' · ') + (names.length > shown.length ? ' +' + (names.length - shown.length) : '');
  }

  function historyItem(h) {
    var d = new Date(h.ts);
    var count = (h.entries || []).length;
    return '<button class="hitem" data-act="detailOpen" data-id="' + h.id + '">' +
      '<span class="d"><span>' + d.getDate() + '<br>' + weekdayShort(h.ts) + '</span></span>' +
      '<span class="n"><b>' + DS.esc(h.dayName) + '</b>' +
      '<span>' + DS.mins(h.duration) + ' мин · ' + count + ' ' + DS.plural(count, 'упражнение', 'упражнения', 'упражнений') + '</span>' +
      '<span class="ex">' + DS.esc(sessionExNames(h, 3)) + '</span></span>' +
      '<span class="v">' + (h.volume ? '<b>' + numRu(h.volume) + '</b><i>кг</i>' : '<b>—</b>') + '</span></button>';
  }

  function screenHistory() {
    if (!S.history.length) {
      return hdr({ mark: true, right: '<button class="iconbtn" data-act="nav" data-to="settings">' + IC.gear + '</button>' }) +
        '<div class="wrap"><div class="proghead"><h1>История</h1></div>' +
        '<div class="empty"><b>Пока пусто</b><p>Проведи первую тренировку — здесь появятся результаты и прогресс весов.</p></div></div>';
    }

    var totalVol = 0;
    S.history.forEach(function (h) { totalVol += h.volume || 0; });

    var limit = UI.histLimit || 60;
    var shown = S.history.slice(0, limit);
    var list = monthGroups(shown).map(function (g) {
      var vol = 0;
      g.items.forEach(function (h) { vol += h.volume || 0; });
      return '<div class="mhead"><b>' + monthTitle(g.ts) + '</b><span>' +
        g.items.length + ' ' + DS.plural(g.items.length, 'тренировка', 'тренировки', 'тренировок') +
        (vol ? ' · ' + numRu(vol) + ' кг' : '') + '</span></div>' +
        '<div class="stack-s">' + g.items.map(historyItem).join('') + '</div>';
    }).join('');

    var seen = {}, rows = [];
    S.history.forEach(function (h) {
      (h.entries || []).forEach(function (e) {
        if (seen[e.exId]) return;
        seen[e.exId] = true;
        var ex = DS.byId(e.exId);
        if (!ex) return;
        var series = DS.exerciseSeries(e.exId);
        if (!series.length) return;
        var vals = series.filter(function (v) { return v > 0; });
        var last = vals.length ? vals[vals.length - 1] : 0;
        var first = vals.length ? vals[0] : 0;
        var diff = DS.roundW(last - first);
        rows.push('<button class="prow" data-act="exOpen" data-id="' + e.exId + '">' +
          '<span class="n"><b>' + DS.esc(ex.n) + '</b>' +
          '<span>' + series.length + ' ' + DS.plural(series.length, 'тренировка', 'тренировки', 'тренировок') + '</span></span>' +
          (vals.length > 1 ? spark(vals) : '') +
          '<span class="w">' + (last > 0 ? DS.kg(last).replace(' кг', '') : 'с.в.') +
          (diff > 0 ? '<i>+' + DS.kg(diff) + '</i>' : '') + '</span>' +
          '<span class="chev">' + IC.chev + '</span></button>');
      });
    });

    return hdr({ mark: true, right: '<button class="iconbtn" data-act="nav" data-to="settings">' + IC.gear + '</button>' }) +
      '<div class="wrap"><div class="proghead"><h1>История</h1>' +
      '<p class="sub">' + S.history.length + ' ' + DS.plural(S.history.length, 'тренировка', 'тренировки', 'тренировок') +
      (totalVol ? ' · ' + numRu(totalVol) + ' кг тоннажа' : '') + '</p></div>' +
      '<div class="sect"><span class="eyebrow">Дневник</span>' + list +
      (S.history.length > shown.length
        ? '<div class="actions tight"><button class="btn ghost" data-act="histMore">Показать ещё</button></div>' : '') +
      '</div>' +
      (rows.length ? '<div class="sect"><div class="sect-h"><span class="eyebrow">Архив по упражнениям</span>' +
        '<span class="mini">все подходы по датам</span></div>' +
        '<div class="card list">' + rows.slice(0, 30).join('') + '</div></div>' : '') +
      '</div>';
  }

  function screenExercise() {
    var ex = DS.byId(UI.exId);
    if (!ex) return screenHistory();
    var sessions = S.history.filter(function (h) { return !!exEntry(h, ex.id); });
    if (!sessions.length) return screenHistory();

    var chrono = sessions.slice().reverse();
    var prevMax = {}, running = null, totalSets = 0, totalVol = 0, bestW = 0, series = [];
    chrono.forEach(function (h) {
      var st = entryStats(exEntry(h, ex.id));
      prevMax[h.id] = running;
      running = st.bestW;
      if (st.bestW > 0) {
        series.push(st.bestW);
        if (st.bestW > bestW) bestW = st.bestW;
      }
      totalSets += st.sets;
      totalVol += st.volume;
    });

    var list = monthGroups(sessions).map(function (g) {
      return '<div class="mhead"><b>' + monthTitle(g.ts) + '</b><span>' +
        g.items.length + ' ' + DS.plural(g.items.length, 'тренировка', 'тренировки', 'тренировок') + '</span></div>' +
        g.items.map(function (h) {
          var e = exEntry(h, ex.id), st = entryStats(e);
          var d = st.bestW > 0 && prevMax[h.id] ? DS.roundW(st.bestW - prevMax[h.id]) : 0;
          var chips = (e.sets || []).map(function (s) {
            var isBest = st.best && s.w === st.best.w && s.r === st.best.r;
            return '<span class="setchip' + (isBest ? ' best' : '') + '">' + setLabel(s) + '</span>';
          }).join('');
          return '<button class="aitem" data-act="detailOpen" data-id="' + h.id + '">' +
            '<span class="aitem-h"><b>' + fullDate(h.ts) + '</b><span>' + DS.esc(h.dayName) + '</span></span>' +
            '<span class="aitem-s">' + chips + '</span>' +
            '<span class="aitem-f"><span>' + st.sets + ' ' + DS.plural(st.sets, 'подход', 'подхода', 'подходов') +
            (st.volume ? ' · ' + numRu(st.volume) + ' кг' : '') + '</span>' +
            (d > 0 ? '<span class="up">+' + DS.kg(d) + '</span>' : d < 0 ? '<span class="down">−' + DS.kg(-d) + '</span>' : '') +
            '</span></button>';
        }).join('');
    }).join('');

    return hdr({ back: UI.exBack === 'detail' ? 'Тренировка' : 'История' }) +
      '<div class="wrap"><div class="head-block"><h1>' + DS.esc(ex.n) + '</h1>' +
      '<p class="sub">' + D.GROUP[ex.g] + ' · ' + D.EQUIP[ex.eq] + '</p></div>' +
      '<div class="stats3">' +
      '<div><b>' + sessions.length + '</b><span>Тренировок</span></div>' +
      '<div><b>' + (bestW > 0 ? DS.kg(bestW).replace(' кг', '') : '—') + '</b><span>Лучший, кг</span></div>' +
      '<div><b>' + (totalVol ? numRu(totalVol) : '—') + '</b><span>Тоннаж, кг</span></div>' +
      '</div>' +
      '<p class="sub">' + totalSets + ' ' + DS.plural(totalSets, 'подход', 'подхода', 'подходов') +
      ' · впервые ' + dayMonth(chrono[0].ts) + ' · последний раз ' + dayMonth(sessions[0].ts) + '</p>' +
      (series.length > 1 ? '<div class="sect"><div class="sect-h"><span class="eyebrow">Вес по тренировкам</span>' +
        '<span class="mini">максимум за день</span></div><div class="card">' + spark(series, 480, 72, 'wide') + '</div></div>' : '') +
      '<div class="sect"><span class="eyebrow">Все тренировки</span>' + list + '</div>' +
      '</div>';
  }

  function screenDetail() {
    var h = S.history.filter(function (x) { return x.id === UI.detailId; })[0];
    if (!h) return screenHistory();
    var body = h.entries.map(function (e) {
      var ex = DS.byId(e.exId);
      var sets = e.sets.map(function (s, i) {
        return '<div class="set ro"><span class="idx num">' + (i + 1) + '</span>' +
          '<div class="inp"><span class="ro-v">' + DS.kg(s.w) + '</span></div>' +
          '<div class="inp"><span class="ro-v">' + s.r + ' повт</span></div>' +
          '<span class="chk-space"></span></div>';
      }).join('');
      return '<section class="ex-block"><button class="ex-head" data-act="exOpen" data-id="' + e.exId + '">' +
        '<span class="ex-head-t"><span class="ex-name">' + DS.esc(ex ? ex.n : e.exId) + '</span>' +
        '<span class="meta">' + e.sets.length + ' ' + DS.plural(e.sets.length, 'подход', 'подхода', 'подходов') + '</span></span>' +
        IC.chev + '</button>' + sets + '</section>';
    }).join('');

    return hdr({ back: 'История', title: h.dayName }) +
      '<div class="wrap"><div class="head-block"><h1>' + DS.dateLong(h.ts) + '</h1>' +
      '<p class="sub">' + DS.mins(h.duration) + ' мин · тоннаж ' + (h.volume ? Math.round(h.volume).toLocaleString('ru-RU') + ' кг' : 'без веса') + '</p></div>' +
      body + '</div>';
  }

  /* ---------------- settings ---------------- */

  function screenSettings() {
    var goals = ['mass', 'maintain', 'cut'].map(function (k) {
      return '<button class="' + (S.goal === k ? 'on' : '') + '" data-act="setGoal" data-v="' + k + '">' + D.GOALS[k].t + '</button>';
    }).join('');
    var days = [2, 3, 4].map(function (n) {
      return '<button class="' + (S.daysPerWeek === n ? 'on' : '') + '" data-act="setDays" data-v="' + n + '">' + n + '</button>';
    }).join('');

    return hdr({ back: 'Программа' }) +
      '<div class="wrap pb-nav">' +
      '<div class="head-block"><h1>Настройки</h1><p class="sub">Всё хранится только на этом устройстве.</p></div>' +

      '<div class="sect"><span class="eyebrow">Цель</span><div class="seg">' + goals + '</div></div>' +
      '<div class="sect"><span class="eyebrow">Тренировок в неделю</span><div class="seg">' + days + '</div></div>' +

      '<div class="sect"><span class="eyebrow">Данные</span><div class="card list">' +
      '<button class="srow" data-act="openPick"><span class="n">Упражнения</span><span class="v">' + S.selected.length + '</span>' + IC.chev + '</button>' +
      '<button class="srow" data-act="openWeights"><span class="n">Рабочие веса</span><span class="v">изменить</span>' + IC.chev + '</button>' +
      '<button class="srow" data-act="openGoal"><span class="n">Цель и дни</span><span class="v">' + D.GOALS[S.goal].t + ' · ' + S.daysPerWeek + '</span>' + IC.chev + '</button>' +
      '</div></div>' +

      '<div class="sect"><span class="eyebrow">Программа</span><div class="card list">' +
      '<button class="srow" data-act="openBuilder"><span class="n">Сборка дней</span><span class="v">' +
      (S.buildMode === 'custom' ? 'свои группы' : 'авто') + '</span>' + IC.chev + '</button>' +
      '<button class="srow" data-act="regen"><span class="n">Пересобрать программу</span>' + IC.swap + '</button>' +
      '<button class="srow" data-act="export"><span class="n">Экспорт данных</span>' + IC.down + '</button>' +
      '<button class="srow" data-act="importClick"><span class="n">Импорт данных</span>' + IC.up + '</button>' +
      '</div></div>' +

      '<div class="sect"><button class="btn dan" data-act="reset">Сбросить всё</button></div>' +

      '<div class="sect"><p class="sub center">Disciplina · версия 0.1<br>Данные не покидают устройство</p></div>' +
      '<input type="file" id="impfile" accept="application/json,.json" class="hidden">' +
      '</div>';
  }

  /* ---------------- router ---------------- */

  function render() {
    var scroll = window.scrollY;
    var ae = document.activeElement;
    var fk = null;
    if (ae && ae.tagName === 'INPUT') {
      if (ae.id === 'exq') fk = { exq: true, sel: ae.selectionStart };
      else fk = { si: ae.dataset.si, ri: ae.dataset.ri, k: ae.dataset.k, wid: ae.dataset.wid, sel: ae.selectionStart };
    }

    if (!S.onboarded && UI.route.name !== 'onboarding') UI.route = { name: 'onboarding', step: 1 };
    if (S.onboarded && UI.route.name === 'onboarding') UI.route = { name: 'program' };
    if (UI.route.name === 'session' && !S.active) UI.route = { name: 'program' };
    if (UI.route.name === 'finish' && !UI.summary) UI.route = { name: 'program' };

    var r = UI.route, html = '';
    switch (r.name) {
      case 'onboarding':
        html = r.step === 1 ? screenPick(false) : r.step === 2 ? screenWeights(false) : screenGoal(false);
        break;
      case 'program': html = screenProgram(); break;
      case 'day': html = screenDay(); break;
      case 'session': html = screenSession(); break;
      case 'finish': html = screenFinish(); break;
      case 'history': html = screenHistory(); break;
      case 'detail': html = screenDetail(); break;
      case 'exercise': html = screenExercise(); break;
      case 'settings': html = screenSettings(); break;
      case 'pick': html = screenPick(true); break;
      case 'weights': html = screenWeights(true); break;
      case 'goal': html = screenGoal(true); break;
      case 'builder': html = screenBuilder(); break;
      default: html = screenProgram();
    }

    var key = r.name + ':' + (r.step || '');
    var still = UI.lastKey === key;
    UI.lastKey = key;

    app.innerHTML = '<div class="view' + (still ? ' still' : '') + '">' + html + '</div>' +
      (showNav(r.name) ? nav() : '') +
      (r.name !== 'session' ? sheetHtml() : '');

    if (fk) {
      var nel = fk.exq
        ? document.getElementById('exq')
        : app.querySelector(fk.wid
          ? '[data-wid="' + fk.wid + '"][data-k="' + fk.k + '"]'
          : '[data-si="' + fk.si + '"][data-ri="' + fk.ri + '"][data-k="' + fk.k + '"]');
      if (nel) {
        nel.focus();
        try { nel.setSelectionRange(fk.sel, fk.sel); } catch (err) {}
      } else {
        window.scrollTo(0, scroll);
      }
    } else {
      window.scrollTo(0, scroll);
    }
    DS.startTick();
    initSheet();
  }

  /* ---------------- events ---------------- */

  function startRest(sec) {
    UI.rest = { end: Date.now() + sec * 1000, total: sec, animated: !!UI.rest };
    render();
  }

  function toggleSet(si, ri) {
    var e = S.active.entries[si];
    if (!e) return;
    var row = e.rows[ri];
    row.done = !row.done;
    if (!row.w) row.w = DS.weightFor(e.exId);
    if (!row.r) row.r = e.hi;
    DS.save();
    if (row.done) startRest(e.rest);
    else render();
    if (row.done) haptic(12);
  }

  function sheetFor(kind) {
    var day = currentDay();
    if (!day) return;
    var exclude = day.items.map(function (it) { return it.exId; });
    if (kind === 'swap') {
      var idx = UI.swapIdx;
      var it = day.items[idx];
      if (!it) return;
      UI.sheet = { type: 'swap', pats: it.pats || [DS.byId(it.exId).pat], exclude: exclude, idx: idx };
    } else {
      UI.sheet = { type: 'add', exclude: exclude };
    }
  }

  function exportData() {
    var blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'disciplina-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    DS.toast('Файл с данными сохранён');
  }

  function importFile(file) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var data = JSON.parse(String(fr.result));
        if (!data || typeof data !== 'object' || !('selected' in data)) throw new Error('bad');
        Object.keys(S).forEach(function (k) { delete S[k]; });
        Object.assign(S, data);
        S.onboarded = !!S.onboarded;
        if (!Array.isArray(S.history)) S.history = [];
        if (!S.weights) S.weights = {};
        DS.save();
        UI.route = { name: S.onboarded ? 'program' : 'onboarding', step: 1 };
        render();
        DS.toast('Данные загружены');
      } catch (e) {
        DS.toast('Не удалось прочитать файл');
      }
    };
    fr.readAsText(file);
  }

  /* после перетаскивания шторки гасим случайный клик */
  app.addEventListener('click', function (ev) {
    if (!suppressClick) return;
    suppressClick = false;
    ev.preventDefault();
    ev.stopPropagation();
  }, true);

  app.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-act]');
    if (!t) return;
    var act = t.dataset.act;

    switch (act) {
      case 'nav':
        DS.go(t.dataset.to);
        break;

      case 'back':
        if (UI.route.name === 'pick' || UI.route.name === 'weights' || UI.route.name === 'goal') DS.go('settings');
        else if (UI.route.name === 'builder') DS.go(UI.builderBack || 'settings');
        else if (UI.route.name === 'day') DS.go('program');
        else if (UI.route.name === 'onboarding') {
          UI.route.step = Math.max(1, UI.route.step - 1);
          render();
        } else if (UI.route.name === 'detail') DS.go('history');
        else if (UI.route.name === 'exercise') DS.go(UI.exBack || 'history');
        else DS.go('program');
        break;

      case 'eq': {
        var v = t.dataset.v, i = S.equipment.indexOf(v);
        if (i === -1) S.equipment.push(v); else S.equipment.splice(i, 1);
        S.selected = S.selected.filter(function (id) {
          var ex = DS.byId(id);
          return ex && DS.isAvailable(ex);
        });
        if (S.program) DS.pruneProgram();
        DS.save(); render();
        break;
      }

      case 'filter':
        UI.filter = t.dataset.v;
        render();
        break;

      case 'toggleEx': {
        var id = t.dataset.id, k = S.selected.indexOf(id);
        if (k === -1) {
          S.selected.push(id);
          if (!S.weights[id]) {
            var ex = DS.byId(id);
            S.weights[id] = { w: D.DEFAULT_W[ex.eq] || 0, r: 10 };
          }
        } else S.selected.splice(k, 1);
        DS.save(); render();
        break;
      }

      case 'obNext':
        UI.route.step = UI.route.step === 1 ? 2 : 3;
        render();
        window.scrollTo(0, 0);
        break;

      case 'buildProgram': {
        if (S.selected.length < 5) { DS.toast('Выбери хотя бы 5 упражнений'); break; }
        if (!builderValid()) { DS.toast('Выбери группы для каждого дня'); break; }
        S.onboarded = true;
        DS.generateProgram();
        DS.go('program');
        DS.toast(S.buildMode === 'custom' ? 'Дни собраны по твоим группам' : 'Программа собрана');
        break;
      }

      case 'goal': S.goal = t.dataset.v; DS.save(); render(); break;
      case 'days':
        S.daysPerWeek = parseInt(t.dataset.v, 10);
        if (S.buildMode === 'custom') DS.ensureCustomDays();
        DS.save(); render();
        break;

      case 'setMode': {
        S.buildMode = t.dataset.v === 'custom' ? 'custom' : 'auto';
        if (S.buildMode === 'custom') DS.ensureCustomDays();
        DS.save();
        if (S.buildMode === 'auto' && S.program) DS.generateProgram();
        render();
        break;
      }

      case 'dayGroup': {
        var di = parseInt(t.dataset.day, 10), gk = t.dataset.g;
        var plan = DS.customDaysPlan();
        var target = plan[di];
        if (!target) break;
        var at = target.groups.indexOf(gk);
        if (at === -1) target.groups.push(gk); else target.groups.splice(at, 1);
        S.customDays = plan;
        S.buildMode = 'custom';
        DS.save(); render();
        break;
      }

      case 'openBuilder':
        UI.builderBack = UI.route.name === 'program' ? 'program' : 'settings';
        DS.go('builder');
        break;

      case 'builderDone': {
        if (!builderValid()) { DS.toast('Выбери группы для каждого дня'); break; }
        DS.save();
        DS.generateProgram();
        DS.go(UI.builderBack || 'settings');
        DS.toast(S.buildMode === 'custom' ? 'Дни собраны по группам' : 'Программа пересобрана');
        break;
      }

      case 'setGoal':
        S.goal = t.dataset.v; DS.save();
        if (S.program) DS.generateProgram();
        DS.toast('Цель обновлена — программа пересобрана');
        render();
        break;

      case 'setDays':
        S.daysPerWeek = parseInt(t.dataset.v, 10);
        if (S.buildMode === 'custom') DS.ensureCustomDays();
        DS.save();
        if (S.program) DS.generateProgram();
        DS.toast('Программа пересобрана на ' + S.daysPerWeek + ' дня');
        render();
        break;

      case 'start': {
        var day = S.program && S.program.days.filter(function (d) { return d.key === t.dataset.key; })[0];
        if (!day) break;
        if (S.active && !confirm('Есть незавершённая тренировка. Начать новую?')) break;
        DS.startSession(day);
        break;
      }

      case 'editDay':
        UI.dayKey = t.dataset.key;
        DS.go('day');
        break;

      case 'swapOpen':
        UI.swapIdx = parseInt(t.dataset.idx, 10);
        sheetFor('swap');
        render();
        break;

      case 'addOpen':
        sheetFor('add');
        render();
        break;

      case 'sheetClose':
        UI.sheet = null;
        render();
        break;

      case 'pickSwap': {
        var dayS = currentDay();
        if (!dayS || !UI.sheet) break;
        var idx = UI.sheet.idx;
        var exS = DS.byId(t.dataset.id);
        if (!exS) break;
        dayS.items[idx] = DS.itemFrom(exS, dayS.items[idx].pats);
        UI.sheet = null;
        DS.save(); render();
        DS.toast('Упражнение заменено');
        break;
      }

      case 'pickAdd': {
        var dayA = currentDay();
        var exA = DS.byId(t.dataset.id);
        if (!dayA || !exA) break;
        dayA.items.push(DS.itemFrom(exA));
        UI.sheet = null;
        DS.save(); render();
        break;
      }

      case 'delEx': {
        var dayD = currentDay();
        if (!dayD) break;
        dayD.items.splice(parseInt(t.dataset.idx, 10), 1);
        if (!dayD.items.length) { DS.toast('В дне не осталось упражнений'); }
        DS.save(); render();
        break;
      }

      case 'regenDay':
        if (!confirm('Пересобрать этот день? Текущие замены сбросятся.')) break;
        DS.regenerateDay(UI.dayKey);
        render();
        DS.toast('День пересобран');
        break;

      case 'regen':
        if (!confirm('Пересобрать программу? Ручные замены сбросятся, веса и история сохранятся.')) break;
        DS.generateProgram();
        render();
        DS.toast('Программа пересобрана');
        break;

      case 'toggleSet':
        toggleSet(parseInt(t.dataset.si, 10), parseInt(t.dataset.ri, 10));
        break;

      case 'restSkip':
        UI.rest = null;
        render();
        break;

      case 'restAdd':
        if (UI.rest) { UI.rest.end += 15000; UI.rest.total += 15; render(); }
        break;

      case 'finishSession':
        DS.finishSession();
        break;

      case 'cancelSession':
        if (confirm('Завершить без сохранения? Отмеченные подходы пропадут.')) {
          S.active = null; UI.rest = null; DS.save(); DS.go('program');
        }
        break;

      case 'openPick': UI.pickQuery = ''; DS.go('pick'); break;

      case 'pickClear':
        UI.pickQuery = '';
        render();
        break;
      case 'openWeights': DS.go('weights'); break;
      case 'openGoal': DS.go('goal'); break;

      case 'pickDone':
        UI.pickQuery = '';
        DS.pruneProgram();
        if (!S.program && S.selected.length >= 5) DS.generateProgram();
        DS.go('settings');
        break;

      case 'weightsDone':
        DS.go('settings');
        break;

      case 'goalDone':
        if (!builderValid()) { DS.toast('Выбери группы для каждого дня'); break; }
        DS.save();
        if (S.program) DS.generateProgram();
        DS.go('settings');
        break;

      case 'detailOpen':
        UI.detailId = t.dataset.id;
        DS.go('detail');
        break;

      case 'exOpen':
        UI.exId = t.dataset.id;
        UI.exBack = UI.route.name === 'detail' ? 'detail' : 'history';
        DS.go('exercise');
        break;

      case 'histMore':
        UI.histLimit = (UI.histLimit || 60) + 60;
        render();
        break;

      case 'export':
        exportData();
        break;

      case 'importClick':
        var f = document.getElementById('impfile');
        if (f) f.click();
        break;

      case 'reset':
        if (confirm('Удалить все данные: упражнения, веса, программу и историю?')) {
          try { localStorage.removeItem('disciplina.v1'); } catch (e) {}
          location.reload();
        }
        break;
    }
  });

  app.addEventListener('input', function (ev) {
    var el = ev.target;
    if (!el || el.tagName !== 'INPUT') return;

    if (el.id === 'exq') {
      UI.pickQuery = el.value;
      var box = document.getElementById('picklist');
      if (box) box.innerHTML = pickList();
      var clr = app.querySelector('.pick-search .pick-clear');
      if (clr) clr.style.display = el.value ? '' : 'none';
      return;
    }

    if (el.dataset.wid) {
      var id = el.dataset.wid, k = el.dataset.k;
      S.weights[id] = S.weights[id] || { w: 0, r: 10 };
      S.weights[id][k] = k === 'w' ? DS.num(el.value, 0) : Math.round(DS.num(el.value, 10));
      DS.save();
      return;
    }

    if (el.dataset.si !== undefined && S.active) {
      var si = parseInt(el.dataset.si, 10), ri = parseInt(el.dataset.ri, 10), kk = el.dataset.k;
      var entry = S.active.entries[si];
      if (!entry || !entry.rows[ri]) return;
      entry.rows[ri][kk] = kk === 'w' ? DS.num(el.value, 0) : Math.round(DS.num(el.value, 0));
      DS.save();
    }
  });

  app.addEventListener('change', function (ev) {
    if (ev.target && ev.target.id === 'impfile' && ev.target.files && ev.target.files[0]) {
      importFile(ev.target.files[0]);
    }
  });

  /* KEY is not exposed; reset uses its own literal above */
  window.UIrender = render;
  render();

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();


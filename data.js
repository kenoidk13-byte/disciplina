/* Disciplina — справочник упражнений и константы */
var D = (function () {
  'use strict';

  var EQUIP = {
    barbell: 'Штанга',
    dumbbell: 'Гантели',
    machine: 'Тренажёры',
    cable: 'Блоки',
    bodyweight: 'Свой вес',
    smith: 'Смит',
    kettlebell: 'Гиря',
    bands: 'Резинки'
  };

  var GROUP = {
    chest: 'Грудь',
    back: 'Спина',
    shoulders: 'Плечи',
    biceps: 'Бицепс',
    triceps: 'Трицепс',
    quads: 'Квадрицепс',
    ham: 'Бицепс бедра',
    glutes: 'Ягодицы',
    calves: 'Икры',
    abs: 'Пресс',
    traps: 'Трапеции'
  };

  var GORDER = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'ham', 'glutes', 'calves', 'abs', 'traps'];

  /* фильтры в выборе упражнений */
  var FILTERS = [
    { k: 'all', t: 'Все', g: null },
    { k: 'chest', t: 'Грудь', g: ['chest'] },
    { k: 'back', t: 'Спина', g: ['back', 'traps'] },
    { k: 'shoulders', t: 'Плечи', g: ['shoulders'] },
    { k: 'arms', t: 'Руки', g: ['biceps', 'triceps'] },
    { k: 'legs', t: 'Ноги', g: ['quads', 'ham', 'glutes', 'calves'] },
    { k: 'abs', t: 'Пресс', g: ['abs'] }
  ];

  /* [id, название, группа, паттерн, инвентарь, уровень] */
  var RAW = [
    ['bench', 'Жим штанги лёжа', 'chest', 'hpush', 'barbell', 1],
    ['bench_incline', 'Жим штанги на наклонной', 'chest', 'hpush', 'barbell', 2],
    ['db_bench', 'Жим гантелей лёжа', 'chest', 'hpush', 'dumbbell', 1],
    ['db_incline', 'Жим гантелей на наклонной', 'chest', 'hpush', 'dumbbell', 1],
    ['machine_press', 'Жим в тренажёре', 'chest', 'hpush', 'machine', 1],
    ['pushup', 'Отжимания от пола', 'chest', 'hpush', 'bodyweight', 1],
    ['dip_chest', 'Отжимания на брусьях', 'chest', 'hpush', 'bodyweight', 2],
    ['db_fly', 'Разведение гантелей лёжа', 'chest', 'chest_iso', 'dumbbell', 1],
    ['db_fly_incline', 'Разведение гантелей на наклонной', 'chest', 'chest_iso', 'dumbbell', 1],
    ['cable_fly', 'Сведение в кроссовере', 'chest', 'chest_iso', 'cable', 1],
    ['pec_deck', 'Бабочка', 'chest', 'chest_iso', 'machine', 1],
    ['bench_decline', 'Жим штанги на наклонной вниз', 'chest', 'hpush', 'barbell', 2],

    ['deadlift', 'Становая тяга', 'back', 'hinge', 'barbell', 2],
    ['rdl', 'Румынская тяга', 'back', 'hinge', 'barbell', 1],
    ['bb_row', 'Тяга штанги в наклоне', 'back', 'hpull', 'barbell', 2],
    ['db_row', 'Тяга гантели в наклоне', 'back', 'hpull', 'dumbbell', 1],
    ['pulldown', 'Тяга верхнего блока', 'back', 'vpull', 'cable', 1],
    ['pullup', 'Подтягивания', 'back', 'vpull', 'bodyweight', 2],
    ['gravitron', 'Подтягивания в гравитроне', 'back', 'vpull', 'machine', 1],
    ['seated_row', 'Тяга горизонтального блока', 'back', 'hpull', 'cable', 1],
    ['tbar_row', 'Тяга Т-грифа', 'back', 'hpull', 'barbell', 2],
    ['bb_row_rev', 'Тяга штанги обратным хватом', 'back', 'hpull', 'barbell', 2],
    ['db_row_sup', 'Тяга гантелей лёжа на наклонной', 'back', 'hpull', 'dumbbell', 1],
    ['pullup_rev', 'Подтягивания обратным хватом', 'back', 'vpull', 'bodyweight', 2],
    ['shrug_bb', 'Шраги со штангой', 'traps', 'traps', 'barbell', 1],
    ['shrug_db', 'Шраги с гантелями', 'traps', 'traps', 'dumbbell', 1],
    ['shrug_machine', 'Шраги в тренажёре', 'traps', 'traps', 'machine', 1],
    ['hyperext', 'Гиперэкстензия', 'back', 'hinge', 'bodyweight', 1],
    ['pullover', 'Пуловер на блоке', 'back', 'lat_iso', 'cable', 1],
    ['pullover_db', 'Пуловер с гантелью', 'back', 'lat_iso', 'dumbbell', 1],

    ['ohp', 'Жим штанги стоя', 'shoulders', 'vpush', 'barbell', 2],
    ['db_ohp', 'Жим гантелей сидя', 'shoulders', 'vpush', 'dumbbell', 1],
    ['machine_ohp', 'Жим в тренажёре на плечи', 'shoulders', 'vpush', 'machine', 1],
    ['lat_raise', 'Махи гантелями в стороны', 'shoulders', 'delt_iso', 'dumbbell', 1],
    ['cable_lat', 'Махи в кроссовере', 'shoulders', 'delt_iso', 'cable', 1],
    ['rear_fly', 'Разведения в наклоне', 'shoulders', 'rear_delt', 'dumbbell', 1],
    ['reverse_pec', 'Обратная бабочка', 'shoulders', 'rear_delt', 'machine', 1],
    ['rear_cable', 'Разведения на заднюю дельту в кроссовере', 'shoulders', 'rear_delt', 'cable', 1],
    ['face_pull', 'Тяга к лицу', 'shoulders', 'rear_delt', 'cable', 1],
    ['arnold', 'Жим Арнольда', 'shoulders', 'vpush', 'dumbbell', 2],
    ['front_raise', 'Подъём гантелей перед собой', 'shoulders', 'delt_iso', 'dumbbell', 1],

    ['bb_curl', 'Подъём штанги на бицепс', 'biceps', 'biceps', 'barbell', 1],
    ['db_curl', 'Подъём гантелей на бицепс', 'biceps', 'biceps', 'dumbbell', 1],
    ['hammer', 'Молотки', 'biceps', 'biceps', 'dumbbell', 1],
    ['scott', 'Подъём на скамье Скотта', 'biceps', 'biceps', 'machine', 2],
    ['cable_curl', 'Сгибания в кроссовере', 'biceps', 'biceps', 'cable', 1],
    ['bb_curl_rev', 'Подъём штанги обратным хватом', 'biceps', 'biceps', 'barbell', 2],
    ['incline_curl', 'Сгибания на наклонной скамье', 'biceps', 'biceps', 'dumbbell', 1],
    ['conc_curl', 'Концентрированные сгибания', 'biceps', 'biceps', 'dumbbell', 1],

    ['cg_bench', 'Жим узким хватом', 'triceps', 'triceps', 'barbell', 2],
    ['french', 'Французский жим', 'triceps', 'triceps', 'barbell', 2],
    ['pushdown', 'Разгибания на блоке', 'triceps', 'triceps', 'cable', 1],
    ['oh_ext', 'Разгибания гантели из-за головы', 'triceps', 'triceps', 'dumbbell', 1],
    ['dip_tri', 'Отжимания на брусьях (трицепс)', 'triceps', 'triceps', 'bodyweight', 2],
    ['diamond_pushup', 'Бриллиантовые отжимания', 'triceps', 'triceps', 'bodyweight', 1],
    ['rope_pushdown', 'Разгибания на блоке верёвкой', 'triceps', 'triceps', 'cable', 1],
    ['kickback', 'Разгибания гантели в наклоне', 'triceps', 'triceps', 'dumbbell', 1],

    ['squat', 'Приседания со штангой', 'quads', 'squat', 'barbell', 1],
    ['smith_squat', 'Приседания в Смите', 'quads', 'squat', 'smith', 1],
    ['goblet', 'Гоблет-приседания', 'quads', 'squat', 'dumbbell', 1],
    ['leg_press', 'Жим ногами', 'quads', 'squat', 'machine', 1],
    ['leg_ext', 'Разгибания ног', 'quads', 'quad_iso', 'machine', 1],
    ['lunge', 'Выпады с гантелями', 'quads', 'lunge', 'dumbbell', 1],
    ['bulgarian', 'Болгарские выпады', 'quads', 'lunge', 'dumbbell', 2],
    ['step_up', 'Зашагивания на платформу', 'quads', 'lunge', 'dumbbell', 2],
    ['front_squat', 'Фронтальные приседания', 'quads', 'squat', 'barbell', 3],
    ['hack_squat', 'Гакк-приседания', 'quads', 'squat', 'machine', 1],
    ['rev_lunge', 'Обратные выпады', 'quads', 'lunge', 'dumbbell', 1],
    ['bb_lunge', 'Выпады со штангой', 'quads', 'lunge', 'barbell', 2],

    ['db_rdl', 'Румынская тяга с гантелями', 'ham', 'hinge', 'dumbbell', 1],
    ['leg_curl', 'Сгибания ног лёжа', 'ham', 'ham_iso', 'machine', 1],
    ['leg_curl_sit', 'Сгибания ног сидя', 'ham', 'ham_iso', 'machine', 1],
    ['goodmorning', 'Наклоны со штангой', 'ham', 'hinge', 'barbell', 2],
    ['hip_bridge', 'Ягодичный мост со штангой', 'glutes', 'hinge', 'barbell', 1],
    ['hip_thrust', 'Хип-траст', 'glutes', 'hinge', 'barbell', 1],
    ['hip_thrust_m', 'Хип-траст в тренажёре', 'glutes', 'hinge', 'machine', 1],
    ['sumo_dl', 'Становая тяга сумо', 'glutes', 'hinge', 'barbell', 2],
    ['cable_kick', 'Отведение ноги в кроссовере', 'glutes', 'glute_iso', 'cable', 1],
    ['hip_abduct', 'Разведение ног в тренажёре', 'glutes', 'glute_iso', 'machine', 1],

    ['calf_stand', 'Подъём на носки стоя', 'calves', 'calves', 'machine', 1],
    ['calf_sit', 'Подъём на носки сидя', 'calves', 'calves', 'machine', 1],
    ['calf_press', 'Подъём на носки в жиме ногами', 'calves', 'calves', 'machine', 1],
    ['calf_bb', 'Подъём на носки со штангой', 'calves', 'calves', 'barbell', 2],

    ['crunch_cable', 'Скручивания на блоке', 'abs', 'core', 'cable', 1],
    ['leg_raise', 'Подъём ног в висе', 'abs', 'core', 'bodyweight', 2],
    ['plank', 'Планка', 'abs', 'core', 'bodyweight', 1],
    ['ab_wheel', 'Ролик для пресса', 'abs', 'core', 'bodyweight', 2],
    ['bicycle', 'Велосипед', 'abs', 'core', 'bodyweight', 1],
    ['crunch', 'Скручивания', 'abs', 'core', 'bodyweight', 1],
    ['knee_raise', 'Подъём коленей в висе', 'abs', 'core', 'bodyweight', 1],
    ['side_plank', 'Боковая планка', 'abs', 'core', 'bodyweight', 1],
    ['russian_twist', 'Русский твист', 'abs', 'core', 'bodyweight', 1],

    ['kb_swing', 'Кетлбелл-свинг', 'ham', 'hinge', 'kettlebell', 2],
    ['farmer', 'Фермерская прогулка', 'back', 'core', 'dumbbell', 1],
    ['sl_rdl', 'Становая на одной ноге', 'ham', 'hinge', 'dumbbell', 3],
    ['sl_bridge', 'Ягодичный мостик на одной ноге', 'glutes', 'hinge', 'bodyweight', 1],
    ['band_row', 'Тяга резинки', 'back', 'hpull', 'bands', 1],
    ['band_press', 'Жим резинки стоя', 'shoulders', 'vpush', 'bands', 1],
    ['band_curl', 'Сгибания с резинкой', 'biceps', 'biceps', 'bands', 1],
    ['band_pull_apart', 'Разведения резинки', 'shoulders', 'rear_delt', 'bands', 1],
    ['band_squat', 'Приседания с резинкой', 'quads', 'squat', 'bands', 1]
  ];

  var EXERCISES = RAW.map(function (r) {
    return { id: r[0], n: r[1], g: r[2], pat: r[3], eq: r[4], lvl: r[5] };
  });

  var BY_ID = {};
  EXERCISES.forEach(function (e) { BY_ID[e.id] = e; });

  /* шаблоны тренировочных дней: слоты по паттернам */
  var DAY_TEMPLATES = [
    { key: 'A', name: 'Всё тело A', slots: [
      { pats: ['squat'], t: 'Приседание' },
      { pats: ['hpush'], t: 'Жим' },
      { pats: ['hpull'], t: 'Тяга' },
      { pats: ['hinge'], t: 'Таз' },
      { pats: ['core'], t: 'Пресс' },
      { pats: ['calves'], t: 'Икры' }
    ] },
    { key: 'B', name: 'Тяга и плечи', slots: [
      { pats: ['hinge'], t: 'Таз' },
      { pats: ['vpush'], t: 'Жим' },
      { pats: ['vpull'], t: 'Тяга' },
      { pats: ['quad_iso', 'lunge'], t: 'Ноги' },
      { pats: ['biceps', 'triceps'], t: 'Руки' },
      { pats: ['core'], t: 'Пресс' }
    ] },
    { key: 'C', name: 'Всё тело C', slots: [
      { pats: ['lunge', 'squat'], t: 'Ноги' },
      { pats: ['hpush', 'vpush'], t: 'Жим' },
      { pats: ['hpull', 'vpull'], t: 'Тяга' },
      { pats: ['delt_iso', 'rear_delt'], t: 'Плечи' },
      { pats: ['ham_iso', 'glute_iso'], t: 'Таз' },
      { pats: ['core'], t: 'Пресс' }
    ] },
    { key: 'D', name: 'Объём', slots: [
      { pats: ['squat'], t: 'Приседание' },
      { pats: ['hpush'], t: 'Жим' },
      { pats: ['vpull'], t: 'Тяга' },
      { pats: ['chest_iso', 'delt_iso'], t: 'Изоляция' },
      { pats: ['biceps', 'triceps'], t: 'Руки' },
      { pats: ['core'], t: 'Пресс' }
    ] }
  ];

  /* крупные группы для конструктора дней */
  var BUILD_GROUPS = [
    { k: 'legs', t: 'Ноги', g: ['quads', 'ham', 'glutes', 'calves'] },
    { k: 'back', t: 'Спина', g: ['back', 'traps'] },
    { k: 'chest', t: 'Грудь', g: ['chest'] },
    { k: 'shoulders', t: 'Плечи', g: ['shoulders'] },
    { k: 'biceps', t: 'Бицепс', g: ['biceps'] },
    { k: 'triceps', t: 'Трицепс', g: ['triceps'] },
    { k: 'abs', t: 'Пресс', g: ['abs'] }
  ];

  /* порядок паттернов внутри группы: сначала база, потом изоляция */
  var GROUP_PATS = {
    legs: ['squat', 'hinge', 'lunge', 'quad_iso', 'ham_iso', 'glute_iso', 'calves'],
    back: ['vpull', 'hpull', 'hinge', 'lat_iso', 'traps'],
    chest: ['hpush', 'chest_iso'],
    shoulders: ['vpush', 'delt_iso', 'rear_delt'],
    biceps: ['biceps'],
    triceps: ['triceps'],
    abs: ['core']
  };

  var GOALS = {
    mass: { t: 'Масса', short: 'Масса', d: 'Базовые упражнения, 4 подхода, вес растёт каждую неделю.' },
    maintain: { t: 'Форма', short: 'Форма', d: 'Поддержание силы и тонуса без гонки за весами.' },
    cut: { t: 'Сушка', short: 'Сушка', d: 'Больше повторов, короткий отдых, меньше объёма.' }
  };

  var STEP = { barbell: 2.5, smith: 2.5, dumbbell: 2, machine: 5, cable: 2.5, kettlebell: 4, bodyweight: 0, bands: 0 };

  var DEFAULT_W = {
    barbell: 40, smith: 40, dumbbell: 12, machine: 30,
    cable: 20, kettlebell: 16, bodyweight: 0, bands: 0
  };

  return {
    EQUIP: EQUIP, GROUP: GROUP, GORDER: GORDER, FILTERS: FILTERS,
    EXERCISES: EXERCISES, BY_ID: BY_ID, DAY_TEMPLATES: DAY_TEMPLATES,
    BUILD_GROUPS: BUILD_GROUPS, GROUP_PATS: GROUP_PATS,
    GOALS: GOALS, STEP: STEP, DEFAULT_W: DEFAULT_W
  };
})();

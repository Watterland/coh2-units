import type { WeaponIssueMap } from './weapon-issue';

// unit.id (из src/data/units.json) → имя ствола → статус выдачи.
// Статусы подтверждены по RGD: sbps/squad_upgrade_ext + файлы upgrade/west_german
// (требования requirements) + abilities/ebps (штатные способности и хардпойнты).
export const weaponIssueOkw: WeaponIssueMap = {
  // ------------------------------------------------------------------
  // Пехота
  // ------------------------------------------------------------------

  assault_pioneer_squad_mp: {
    // Штатная граната отряда: способность pioneer_stun_grenade_mp («Светошумовая
    // граната», 30 боеп.) есть в squad_ability_ext; слот-итем бросает eihandgranate_grenade_mp.
    eihandgranate_grenade_mp: 'base',
    // Миноискатель — штатные способности minesweeper_deploy/put_away_mp, без покупки.
    fake_minesweeper_weapon: 'base',
    // Огнемёт FmW.35: апгрейд volks_flamethrower_mp (60 боеп.) требует пассив
    // pyro_volks «Танковые штурмовые отряды» доктрины «Огненный шторм».
    pioneer_flamethrower_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина «Огненный шторм»'],
    },
    // Панцершрек — боевой пакет assault_pioneer_combat_upgrade (60 боеп.),
    // требований к доктрине нет (только состав отряда и очерёдность с огнемётом).
    panzerschreck_atw_mp: 'upgrade',
  },

  fallschirmjager_squad_mp: {
    // «Химическая граната Блендкерпер 2H» (30 боеп.) — штатная способность
    // blendkorper_2h_waffen_elite (доступна с 1-й ветки), доктрина не нужна.
    blendkorper_2h_smoke_grenade_mp: 'base',
    // Винтовка FG42 — улучшение fallschirmjager_gewhr_42 (60 боеп.),
    // требуются здания/Battle Phase, доктрины нет.
    fallschirmjager_gewehr_42_mp: 'upgrade',
    // «Связка гранат Model 24» (35 боеп.) — штатная способность отряда
    // fallschirmjaeger_greande при вызове, без покупки и доктрины.
    panzer_grenadier_bundled_stielgranate_mp: 'base',
  },

  terror_officer_squad_mp: {
    // «Дымовая граната Model 24» (15 боеп.) — штатная способность офицера
    // (model_24_smoke_grenade_terror_officer_mp), требований нет.
    model_24_smoke_mp: 'base',
    // Офицерский MP44 — в хардпойнте отряда при вызове, не покупка.
    panzer_grenadier_mp44_smg_mp: 'base',
    // Карабины конвоя (терр-офицер идёт с 3 конвойными) — базовое снаряжение.
    waffen_wlite_kar_98k_rifle_mp: 'base',
    // «Скрытная атака гранатами» (20 боеп.) требует пассив infiltration_tactics
    // («Инфильтрация») — он есть только у доктрин «Сбор трофеев» и «Спецоперации».
    assault_grenadier_stielgranate_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина сбора трофеев', 'Доктрина специальных операций'],
    },
  },

  jaeger_light_infantry_recon_squad_mp: {
    // «Скрытная атака гранатами» — пассив infiltration_tactics («Сбор трофеев»/«Спецоперации»).
    assault_grenadier_stielgranate_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина сбора трофеев', 'Доктрина специальных операций'],
    },
    // G43 из «Егерского пехотного набора» (light_infantry_package) — командирский
    // пакет; сам отряд вызывается доктринами «Прикрытие»/«Сбор трофеев».
    // Автоподстановка по имени даёт ост-германскую «Доктрину немецкой пехоты»
    // (weaponDoctrineOverrides) — для OKW эта метка ложна, поэтому список явный.
    jaeger_g43_rifle_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина прикрытия', 'Доктрина сбора трофеев'],
    },
    // «Снайперская винтовка G43» — покупное улучшение light_infantry_sniper_g43_mp
    // (60 боеп.), требуется только «штаб» (panzerschreck_unlocked), доктрины нет.
    jaeger_light_recon_g43: 'upgrade',
  },

  obersoldaten_squad_mp: {
    // «Химическая граната Блендкерпер 2H» — штатная способность с 1-й ветки.
    blendkorper_2h_smoke_grenade_mp: 'base',
    // «Связка гранат» (35 боеп.) — базовая способность waffen_elite_bundled_assault_grenade
    // в entity ability_ext; требований к доктрине НЕТ (ранее ошибочно помечалась doctrine).
    waffen_bundled_assault_stielgranate: 'base',
    // StG44 с ИК-прицелом — апгрейд waffen_infrared_stg44 требует пассив infrared_stg44
    // («Большое наступление»/«Спецоперации»).
    waffen_mp44_infrared: {
      issue: 'doctrine',
      doctrines: ['Доктрина большого наступления', 'Доктрина специальных операций'],
    },
    // «Скрытная атака гранатами» — пассив infiltration_tactics («Сбор трофеев»/«Спецоперации»).
    assault_grenadier_stielgranate_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина сбора трофеев', 'Доктрина специальных операций'],
    },
    // Ручной MG34 — улучшение waffen_mg34_lmg_mp (80 боеп.), доктрина не нужна.
    obersoldaten_mg34_lmg_moving_no_prone_mp: 'upgrade',
  },

  panzerfusilier_squad_mp: {
    // Противотанковая винтовочная граната (25 боеп.) — штатная способность отряда
    // (скрывается после покупки панцершрека, но не требует ни доктрины, ни покупки).
    panzerfusilier_at_rifle_grenade: 'base',
    // Ракетница — штатная способность panzerfusiliers_flare (с 1-й ветки).
    panzerfusilier_flare_mp: 'base',
    // Фугасная граната (30 боеп.) — штатная способность panzerfusilier_grenade.
    panzerfusilier_grenade: 'base',
    // Винтовка G43 — улучшение panzerfusilier_g43 (80 боеп.), без доктрины.
    panzerfusilier_g43: 'upgrade',
    // Панцершрек — улучшение panzerfusillier_panzershreck_atw_item_mp (100 боеп.),
    // требуется только player-research panzerschreck_unlocked.
    panzerschreck_atw_mp: 'upgrade',
  },

  volksgrenadier_squad_mp: {
    // Фаустпатрон — штатная способность volksgrenadier_panzerfaust_mp (нужен tech-здание).
    volksgrenadier_panzerfaust_atw_mp: 'base',
    // MP44 (STG44) — покупное улучшение volks_stg44_upgrade (60 боеп.), без доктрины.
    volksgrenadier_mp44_smg_mp: 'upgrade',
    // «Зажигательная граната» (30 боеп.) открывается player-апгрейдом volk_fire_grenade,
    // который ставит SWS на поле (юр. «Нужен бронетранспортер снабжения sWS»);
    // доктрина не требуется.
    fire_grenade_weapon_mp: 'upgrade',
    // Дым и осколочная Model 24 доступны только с «Штурмовыми наборами»
    // (volks_cqc_upgrade требует пассив pyro_volks доктрины «Огненный шторм»).
    model_24_smoke_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина «Огненный шторм»'],
    },
    stielgranate_grenade_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина «Огненный шторм»'],
    },
    // MP40-пакет — тот же doctrinal volks_cqc_upgrade (45 боеп., pyro_volks).
    assault_grenadier_mp40: {
      issue: 'doctrine',
      doctrines: ['Доктрина «Огненный шторм»'],
    },
    // «Скрытная атака гранатами» — пассив infiltration_tactics («Сбор трофеев»/«Спецоперации»).
    assault_grenadier_stielgranate_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина сбора трофеев', 'Доктрина специальных операций'],
    },
  },

  // ------------------------------------------------------------------
  // Техника: зенитные/командирские пулемёты ставятся только пассивкой
  // «Танковые командиры» (tank_commander_unlock) — она есть в доктринах
  // «Элитная бронетехника» и «Большое наступление».
  // ------------------------------------------------------------------

  king_tiger_squad_mp: {
    // Пулемёт на башне — king_tiger_top_gunner_mp (50 боеп.) требует squad-апгрейд tank_commander.
    mg42_turret_mounted_king_tiger_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина элитной бронетехники', 'Доктрина большого наступления'],
    },
  },

  panther_ausf_g_squad_mp: {
    // Верхний MG42 — wg_panther_top_gunner_mp требует tank_commander.
    mg42_turret_mounted_panther_wg_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина элитной бронетехники', 'Доктрина большого наступления'],
    },
  },

  panther_commander_squad_mp: {
    // Верхний MG42 — тот же wg_panther_top_gunner_mp.
    mg42_turret_mounted_panther_wg_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина элитной бронетехники', 'Доктрина большого наступления'],
    },
  },

  panzer_iv_ausf_j_battle_group_mp: {
    // Верхний MG42 — panzer_top_gunner_panzer_iv_jmp требует tank_commander.
    mg42_turret_mounted_pziv_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина элитной бронетехники', 'Доктрина большого наступления'],
    },
  },

  hetzer_squad_mp: {
    // Зенитный MG34 — wg_hetzer_top_gunner_mp требует tank_commander.
    hetzer_mg34_pintle_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина элитной бронетехники', 'Доктрина большого наступления'],
    },
  },

  west_german_tiger_squad_mp: {
    // Верхний MG42 «Тигра» — west_german_top_gunner_mp требует tank_commander.
    mg42_turret_mounted_panther_mp: {
      issue: 'doctrine',
      doctrines: ['Доктрина элитной бронетехники', 'Доктрина большого наступления'],
    },
  },
};

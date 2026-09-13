import type { WeaponIssueMap } from './weapon-issue';

// unit.id (из src/data/units.json) → имя ствола → статус выдачи.
// Проверено по RGD игры: squad_upgrade_ext / squad_upgrade_apply_ext отрядов,
// файлы upgrade/british (cost + requirements), требования файлов abilities,
// а также оружейные стойки (ebps brit_weapon_rack_*, слотовый подбор).
// Особенность British: Брен и PIAT выдаются подбором со стоек у HQ после
// разработки «Оружейные стойки» (weapon_rack_unlock_mp) — это тех., не доктрина,
// поэтому у пехоты фракции нет ни одного доктринного ствола.
export const weaponIssueBritish: WeaponIssueMap = {
  // ─────────── Пехота ───────────

  // Медики: единственный ствол — штатный пистолет (основной), доп. стволов нет.
  brit_medic_squad_mp: {},

  // Офицер авиаподдержки + 3 телохранителя (модель tommy_officer_guard_mp).
  air_support_officer_squad_mp: {
    // Брен Mk.II — подбор со стойки у HQ (разработка «Оружейные стойки», 45 боеп. за подбор), без доктрины.
    tommy_bren_light_machine_gun_mp: 'upgrade',
    // PIAT — подбор со стойки (та же разработка стоек), без доктрины.
    piat_launcher_mp: 'upgrade',
    // Граната No.82 — штатная способность отряда (tommy_gammon_bomb_medium_mp, требований нет).
    tommy_gammon_bomb_medium: 'base',
    // Виккерс K — апгрейд отряда vickers_k_lmg_officer_1_mp (60 боеп., требует тех. «Оружейные стойки»).
    infantry_vickers_k_machine_gun_mp: 'upgrade',
    // Sten — штатное оружие телохранителей (2-й дефолт-ствол tommy_officer_guard_mp).
    tommy_9mm_sten_gun_mp: 'base',
    // Артефакт данных сайта: «сапёрский» Виккерс офицеру недоступен (ствол тяжёлых сапёров);
    // ближайший статус — улучшение: в игре ствол существует только как бездоктринный апгрейд.
    sapper_vickers_k_machine_gun_mp: 'upgrade',
  },

  // Коммандос (и инфильтрационный вариант): в штате «Эксперты по тяжёлому вооружению»
  // (ability elite_bren_guns без требований) — Брен-пулемёты вместо Sten.
  commando_squad_mp: {
    // Брен — штатный (пассив elite_bren_guns, требований нет).
    commando_bren_lmg_moving_mp: 'base',
    // PIAT — подбор со стойки, без доктрины.
    piat_launcher_mp: 'upgrade',
    // Граната No.82 — штатная способность (без требований).
    tommy_gammon_bomb_medium: 'base',
    // Лёгкая дымовая граната — способность с vet1 (без покупки, cover_smoke_grenades).
    smoke_cover_grenade: 'base',
  },
  infiltration_commando_squad_mp: {
    commando_bren_lmg_moving_mp: 'base',
    piat_launcher_mp: 'upgrade',
    tommy_gammon_bomb_medium: 'base',
    smoke_cover_grenade: 'base',
  },

  // Сапёры.
  sapper_squad_mp: {
    // Брен — подбор со стойки (губернатор-апгрейд выдаёт Брен именно инженерным отрядам).
    tommy_bren_light_machine_gun_mp: 'upgrade',
    // Виккерс K — апгрейд «Тяжёлые сапёры» (sappers_heavy_squad_mp, 60 боеп., требует роту «Наковальня» — тех., не доктрина).
    sapper_vickers_k_machine_gun_mp: 'upgrade',
    // PIAT — подбор со стойки.
    piat_launcher_mp: 'upgrade',
    // Противотанковая граната — штатная способность (sapper_heat_grenade_mp, требований нет).
    heat_grenade: 'base',
    // Миноискатель — апгрейд «Набор для разминирования» (30 боеп., без доктрины).
    fake_minesweeper_weapon: 'upgrade',
    // Тот же Виккерс K тяжёлых сапёров под другим именем ствола в данных сайта.
    infantry_vickers_k_machine_gun_mp: 'upgrade',
  },

  // Восстановительные сапёры.
  sapper_squad_recovery_mp: {
    tommy_bren_light_machine_gun_mp: 'upgrade',
    piat_launcher_mp: 'upgrade',
    // Дымовая граната — штатная (cover_smoke_grenades_sappers; недоступна лишь после покупки огнемёта).
    rgd_1_smoke_mp: 'base',
    heat_grenade: 'base',
    // Виккерс K — апгрейд «Тяжёлые сапёры» (sappers_heavy_squad_recovery_mp, 60 боеп., рота «Наковальня»).
    infantry_vickers_k_machine_gun_mp: 'upgrade',
    // Миноискатель — апгрейд (30 боеп., без доктрины).
    fake_minesweeper_weapon: 'upgrade',
    // Огнемёт M2 — апгрейд sapper_flamethrower (60 боеп., без доктрины).
    assault_engineer_flamethrower: 'upgrade',
  },

  // Снайпер.
  sniper_british_squad_mp: {
    // Крит-выстрел из Бойса — штатный пассив снайпера (sniper_boys_anti_tank_critical_shot_mp).
    boys_at_rifle_sniper_critical_shot_mp: 'base',
    // Дымовой маркер для «Координации огня» — способность без требований.
    sniper_smoke_marker_grenade: 'base',
  },

  // Пехотное отделение (основной ствол — Ли-Энфилд; Sten — штатный ствол сержанта).
  tommy_squad_mp: {
    tommy_bren_light_machine_gun_mp: 'upgrade',
    piat_launcher_mp: 'upgrade',
    // Граната No.36M — НЕ штатная: требует исследования «Выдача гранат No.36M» (100 зп + 10 топлива).
    tommy_mills_bomb: 'upgrade',
    // Дымовая шашка офицера — требует апгрейд «Пиротехника» (40 боеп.; требование в файле способности).
    tommy_officer_smoke_marker_grenade: 'upgrade',
    // Тяжёлая граната No.82 — требует выбора роты «Молот» (company_hammer_mp, тех., не доктрина).
    tommy_gammon_bomb_heavy: 'upgrade',
    // Sten сержанта — штатный 2-й дефолт-ствол модели tommy_mp.
    tommy_9mm_sten_gun_mp: 'base',
    // Артефакт данных сайта: сапёрский Виккерс отделению недоступен (см. комментарий у офицера).
    sapper_vickers_k_machine_gun_mp: 'upgrade',
  },

  // Танко-охотничье отделение (Бойс выдаётся на спавне авто-апгрейдом tommy_boys_at_rifles).
  tommy_squad_tank_hunter_mp: {
    // ПТР Бойса — штатно при спавне (squad_upgrade_apply_ext).
    boys_at_rifle_mp: 'base',
    // Противотанковая граната — штатная способность (tommy_heat_grenade_mp, без требований).
    heat_grenade: 'base',
    tommy_mills_bomb: 'upgrade',
    tommy_gammon_bomb_heavy: 'upgrade',
    // Дымовой маркер требует «Пиротехнику», которую это отделение купить не может
    // (в squad_upgrade_ext только «Набор PIAT») — фактически мёртвый ствол из данных сайта.
    tommy_officer_smoke_marker_grenade: 'upgrade',
    // Sten сержанта — штатный 2-й дефолт-ствол модели tommy_mp.
    tommy_9mm_sten_gun_mp: 'base',
  },

  // Штурмовое отделение (доктринный колл-ин; основной ствол — Sten).
  tommy_squad_assault_mp: {
    tommy_mills_bomb: 'upgrade',
    // Тяжёлая граната No.82 — способность tommy_gammon_bomb_heavy_assault_section_mp, требует роту «Молот».
    tommy_gammon_bomb_heavy: 'upgrade',
    // Граната No.77 WP — способность с vet1, без покупки.
    no77_wp_grenade_mp: 'base',
    // Дымовая граната — требует апгрейд «Улучшение штурмового отделения» (60 боеп. + тех. tommy_assault_package_unlock).
    rgd_1_smoke_mp: 'upgrade',
  },

  // Рейдовое отделение (доктринный колл-ин; основной ствол — Ли-Энфилд рейда).
  tommy_squad_raid_mp: {
    tommy_bren_light_machine_gun_mp: 'upgrade',
    piat_launcher_mp: 'upgrade',
    // Виккерс K — апгрейд vickers_k_lmg_mp (2 шт, 120 боеп., требует тех. «Оружейные стойки»).
    infantry_vickers_k_machine_gun_mp: 'upgrade',
    // Коктейль Молотова — штатная способность (tommy_molotov_grenade_mp, без требований).
    riflemen_molotov_weapon_mp: 'base',
    // Sten — штатный 2-й дефолт-ствол модели tommy_raid_mp.
    tommy_9mm_sten_gun_mp: 'base',
    // Артефакт данных сайта: сапёрский Виккерс рейдерам недоступен (см. комментарий у офицера).
    sapper_vickers_k_machine_gun_mp: 'upgrade',
  },
};

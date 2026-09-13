import type { WeaponIssueMap } from './weapon-issue';

// unit.id (из src/data/units.json) → имя ствола → статус выдачи.
// Проверено по RGD: squad_upgrade_ext / squad_upgrade_apply_ext отрядов,
// upgrade/soviet/items и requirements командирских passive-апгрейдов.
export const weaponIssueSoviet: WeaponIssueMap = {
  combat_engineer_squad_mp: {
    // РОКС-3 и миноискатель — обычные squad-апгрейды (по 60/30 боеп.).
    flamethrower_roks3_mp: 'upgrade',
    fake_minesweeper_weapon: 'upgrade',
    // СВТ-40 приходит только в ящике с оружием «Тактики воздушного десанта».
    penal_troops_svt_rifle_mp: {
      issue: 'doctrine',
      doctrines: ['Тактика воздушного десанта'],
    },
  },

  conscript_squad_mp: {
    // Молотов и РПГ-43 открываются штатными исследованиями HQ, не доктриной.
    molotov_cocktail_weapon_mp: 'upgrade',
    molotov_cocktail_weapon_vet_mp: 'upgrade',
    rpg_43_anti_tank_grenade_mp: 'upgrade',
    // Штурмовой набор: «Тактика передовой войны», «Тактика поддержки
    // новобранцев» либо «Тактика резервной армии».
    'conscript_ppsh-41_sub_machine_gun_mp': {
      issue: 'doctrine',
      doctrines: [
        'Тактика передовой войны',
        'Тактика поддержки новобранцев',
        'Тактика резервной армии',
      ],
    },
    'conscript_rpg_40_anti_tank_grenade_assault_mp': {
      issue: 'doctrine',
      doctrines: [
        'Тактика передовой войны',
        'Тактика поддержки новобранцев',
        'Тактика резервной армии',
      ],
    },
    conscipt_ptrs_41_mp: {
      issue: 'doctrine',
      doctrines: ['Противотанковая тактика'],
    },
  },

  partisans_panzerschreck_mp: {
    // РПГ-43 — штатная способность anti_tank_grenade_mp.
    rpg_43_anti_tank_grenade_mp: 'base',
  },

  partisans_squad_mp: {
    'partisan_ppsh-41_sub_machine_gun_mp': 'upgrade',
    panzerschreck_atw_mp: 'upgrade',
    rpg_43_anti_tank_grenade_mp: 'base',
    guard_troop_rgd_33_sleeved_mp: 'base',
    molotov_cocktail_weapon_vet_mp: 'base',
  },

  sniper_team_mp: {
    flare_mp: 'base',
  },

  guards_troops_assault_mp: {
    guard_troop_rgd_33_sleeved_mp: 'base',
    // Базука выдаётся при вызове; покупка guards_bazooka_upgrade_rebuy_mp
    // лишь возвращает потерянную базовую базуку.
    m9_bazooka_paratrooper_mp: 'base',
    paratrooper_m1_thompson_mp: 'upgrade',
  },

  guards_troops_mp: {
    guard_troop_rgd_33_sleeved_mp: 'base',
    'guard_troop_dp-28_light_machine_gun_mp': 'base',
    guard_troop_ptrs_41_mp: 'upgrade',
  },

  penal_battalion_mp: {
    // Взрывпакеты — врождённые способности; ПТРС — обычный апгрейд.
    penal_troop_satchel_charge_at_mp: 'base',
    penal_troop_satchel_charge_at_skillshot_mp: 'base',
    penal_ptrs_41_mp: 'upgrade',
    'shock troops_ppsh-41_sub_machine_gun_mp': 'base',
  },

  shock_troops_mp: {
    rg_42_mp: 'base',
    rgd_1_smoke_mp: 'base',
  },

  commissar_commander_squad_mp: {
    guard_troop_rgd_33_sleeved_mp: 'base',
    nagant_m1895_revolver_mp: 'base',
    // Единственная модель отряда, commissar_medic_mp, имеет СВТ-40 в
    // default hardpoint; squad_upgrade_ext пуст.
    penal_troops_svt_rifle_mp: 'base',
  },

  guards_airbourne_mp: {
    guard_troop_rgd_33_sleeved_mp: 'base',
    rgd_1_smoke_mp: 'base',
    'guard_troop_dp-28_light_machine_gun_moving_mp': 'upgrade',
    'shock troops_ppsh-41_sub_machine_gun_mp': 'upgrade',
  },

  // Зенитный ДШК на башне ИС-2 — покупное улучшение «верхний стрелок» (60 боеп.),
  // в базовый набор танка не входит.
  '2_mp': {
    dshk_38_pintle_mounted_tank_mp: 'upgrade',
  },

  // То же для ИСУ-152: ДШК ставится улучшением isu152_top_gunner (60 боеп.).
  '152_mp': {
    dshk_38_pintle_mounted_tank_mp: 'upgrade',
  },

  // Верхний М2HB «Шермана» из ленд-лиза — улучшение sherman_soviet_top_gunner (60 боеп.).
  soviet_76mm_sherman_mp: {
    sherman_top_gunner: 'upgrade',
  },
};

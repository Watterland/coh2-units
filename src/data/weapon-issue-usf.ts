import type { WeaponIssueMap } from './weapon-issue';

// unit.id (из src/data/units.json) → каждый ствол кроме основного → статус выдачи.
// Аудит 14 пехотных отрядов USF по squad/loadout/upgrade RGD.
export const weaponIssueUsf: WeaponIssueMap = {
  assault_engineer_squad_mp: {
    assault_engineer_flamethrower: 'base',
  },
  captain_squad_mp: {
    m23_smoke_at_mp: 'base',
    riflemen_bar_30_06_light_machine_gun_mp: 'upgrade',
    captain_m1_thompson_mp: 'base',
  },
  lieutenant_squad_mp: {
    mk2_mp: 'upgrade',
    m23_smoke_at_mp: 'base',
    m9_bazooka_mp: 'upgrade',
    captain_m1_thompson_mp: 'base',
  },
  major_squad_mp: {
    m23_smoke_at_mp: 'base',
    m1_carbine_rear_echelon_mp: 'base',
  },
  paratrooper_squad_mp: {
    m9_bazooka_paratrooper_mp: 'upgrade',
    riflemen_bar_30_06_light_machine_gun_mp: 'base',
    mk2_paratrooper_mp: 'base',
    paratrooper_m1_thompson_mp: 'upgrade',
    paratrooper_m1919a6_lmg_moving_mp: 'upgrade',
  },
  paratrooper_squad_support_mp: {
    m9_bazooka_paratrooper_mp: 'upgrade',
    riflemen_bar_30_06_light_machine_gun_mp: 'base',
    mk2_paratrooper_mp: 'base',
    paratrooper_m1919a6_lmg_moving_mp: 'upgrade',
    paratrooper_m1_thompson_mp: 'upgrade',
  },
  pathfinder_squad_mp: {
    m1a1_carbine_snipe_pathfinder_mp: 'base',
  },
  pathfinder_squad_recon_mp: {},
  ranger_squad_commander_mp: {
    mk2_paratrooper_mp: 'base',
    m9_bazooka_paratrooper_mp: 'base',
    riflemen_bar_30_06_light_machine_gun_mp: 'base',
    paratrooper_m1_thompson_mp: 'upgrade',
  },
  rear_echelon_squad_mp: {
    m23_smoke_at_mp: 'upgrade',
    fake_minesweeper_weapon: 'upgrade',
    assault_engineer_flamethrower: { issue: 'doctrine', doctrines: ['Стрелковая рота'] },
    rear_echelon_m17_rifle_grenade_commander_mp: {
      issue: 'doctrine',
      doctrines: ['Рота городского штурма'],
    },
  },
  riflemen_squad_mp: {
    mk2_mp: 'upgrade',
    rifleman_at_rifle_grenade: 'base',
    riflemen_flare: { issue: 'doctrine', doctrines: ['Рота разведподдержки'] },
    riflemen_molotov_weapon_mp: { issue: 'doctrine', doctrines: ['Рота городского штурма'] },
    m9_bazooka_mp: 'upgrade',
    riflemen_30cal_lmg_mp: {
      issue: 'doctrine',
      doctrines: ['Пехотная рота', 'Рота тактической поддержки'],
    },
    riflemen_bar_30_06_light_machine_gun_mp: 'upgrade',
  },
  usf_medic_squad_mp: {},
  vehicle_crew_squad_mp: {},
  riflemen_cavalry_squad_mp: {
    m23_smoke_at_mp: 'base',
    penal_troop_satchel_charge_at_mp: 'base',
  },

  // Непехотные стволы, уже показываемые панелью оружия.
  m8_greyhound_squad_mp: {
    m8_greyhound_m2hb_50cal_mounted_mp: 'upgrade',
  },
  aef_halftrack_squad_mp: {
    m5_halftrack_quad_50_cal_m2hb_mp: 'upgrade',
  },
};

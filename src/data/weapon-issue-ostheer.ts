import type { WeaponIssueMap } from './weapon-issue';

// unit.id (из src/data/units.json) → имя ствола → статус выдачи.
// Пехота проверена по squad/loadout/upgrade RGD; явные доктрины нужны там,
// где имя ствола не позволяет надёжно определить источник.
export const weaponIssueOstheer: WeaponIssueMap = {
  assault_grenadier_squad_mp: {
    bk_2h_frangible_blinding_grenade: { issue: 'doctrine', doctrines: ['Доктрина элитных войск'] },
    grenadier_kar_98k_antitank_rifle_grenade_mp: { issue: 'doctrine', doctrines: ['Доктрина егерей: пехота'] },
    assault_grenadier_squad_stielgranate_mp: 'upgrade',
  },
  grenadier_squad_mg42lmg_mp: {
    panzerfaust_atw_mp: 'upgrade',
    bk_2h_frangible_blinding_grenade: { issue: 'doctrine', doctrines: ['Доктрина элитных войск'] },
    grenadier_kar_98k_antitank_rifle_grenade_mp: { issue: 'doctrine', doctrines: ['Доктрина егерей: пехота'] },
    grenadier_kar_98k_rifle_grenade_mp: 'upgrade',
    stielgranate_grenade_mp: 'base',
  },
  grenadier_squad_mp: {
    panzerfaust_atw_mp: 'upgrade',
    bk_2h_frangible_blinding_grenade: { issue: 'doctrine', doctrines: ['Доктрина элитных войск'] },
    grenadier_kar_98k_antitank_rifle_grenade_mp: { issue: 'doctrine', doctrines: ['Доктрина егерей: пехота'] },
    grenadier_kar_98k_rifle_grenade_mp: 'upgrade',
    stielgranate_grenade_mp: 'base',
    grenadier_mg42lmg_mp: 'upgrade',
    jaeger_g43_rifle_mp: { issue: 'doctrine', doctrines: ['Доктрина егерей: пехота'] },
    grenadier_mp44_smg_mp: { issue: 'doctrine', doctrines: ['Доктрина немецкой пехоты'] },
  },
  assault_officer_squad_mp: {
    assault_grenadier_mp40: 'base',
    luger_p08_victor_target_flare_pistol_mp: 'base',
  },
  jaeger_officer_squad_mp: {
    panzerfaust_atw_mp: 'upgrade',
    bk_2h_frangible_blinding_grenade: { issue: 'doctrine', doctrines: ['Доктрина элитных войск'] },
    grenadier_kar_98k_rifle_grenade_mp: 'upgrade',
    model_24_smoke_mp: 'base',
    panzerfusilier_flare_mp: 'base',
    luger_p08_victor_target_flare_pistol_mp: 'base',
  },
  ostruppen_squad_mp: {
    panzerfaust_atw_mp: 'base',
    grenadier_mg42lmg_mp: 'upgrade',
  },
  ostruppen_squad_reserves_mp: {
    panzerfaust_atw_mp: 'base',
    grenadier_mg42lmg_mp: 'upgrade',
  },
  panzer_grenadier_squad_mp: {
    bk_2h_frangible_blinding_grenade: { issue: 'doctrine', doctrines: ['Доктрина элитных войск'] },
    panzer_grenadier_bundled_stielgranate_mp: 'upgrade',
    model_24_smoke_mp: 'base',
    jaeger_panzergren_g43_rifle_mp: { issue: 'doctrine', doctrines: ['Доктрина егерей: пехота'] },
    panzerbusche_39_mp: 'upgrade',
    panzerschreck_atw_mp: 'upgrade',
  },
  pioneer_squad_mp: {
    penal_troop_satchel_charge_at_skillshot_mp: { issue: 'doctrine', doctrines: ['Доктрина егерей: бронетехника'] },
    fake_minesweeper_weapon: 'upgrade',
    pioneer_flamethrower_mp: 'upgrade',
  },
  sniper_squad_mp: {
    g43_sniper_incendiary_mp: 'base',
  },
  stormtrooper_squad_mp: {
    model_24_smoke_mp: 'base',
    bk_2h_frangible_blinding_grenade: { issue: 'doctrine', doctrines: ['Доктрина элитных войск'] },
    fire_grenade_stormtrooper_weapon_mp: 'base',
    panzerschreck_atw_mp: 'upgrade',
    jaeger_panzergren_g43_rifle_mp: { issue: 'doctrine', doctrines: ['Доктрина егерей: пехота'] },
    stormtrooper_mp40_smg_mp: 'upgrade',
  },
  assault_officer_squad_luftwaffe_variant_mp: {
    assault_grenadier_mp40: 'base',
    luger_p08_victor_target_flare_pistol_mp: 'base',
  },

  panzer_iv_squad_mp: { mg42_turret_mounted_pziv_mp: 'upgrade' },
  panzer_iv_ausf_j_ostheer_mp: { mg42_turret_mounted_pziv_mp: 'upgrade' },
  panther_squad_mp: { mg42_turret_mounted_panther_wg_mp: 'upgrade' },
  tiger_squad_mp: { mg42_turret_mounted_panther_mp: 'upgrade' },
  stug_iii_squad_mp: { mg42_turret_mounted_stugiv_mp: 'upgrade' },
  stug_iii_e_commander_squad_mp: { mg42_turret_mounted_stugiv_mp: 'upgrade' },
  brummbar_squad_mp: { mg42_turret_mounted_brummbar_mp: 'upgrade' },
};

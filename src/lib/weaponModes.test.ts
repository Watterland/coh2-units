import { describe, expect, it } from 'vitest';
import type { Weapon } from '../types';
import { baseWeaponKey, groupWeapons, isCrewSmallArm, veteranWeaponBonuses, weaponMode } from './weaponModes';

describe('isCrewSmallArm', () => {
  it('detects crew self-defense weapons', () => {
    expect(isCrewSmallArm('m1_garand_rifle_mortar_crew_mp')).toBe(true);
    expect(isCrewSmallArm('mosin_nagant_rifle_weapon_crew_mp')).toBe(true);
    expect(isCrewSmallArm('weapon_crew_kar_98k_rifle_mp')).toBe(true);
    expect(isCrewSmallArm('weapon_crew_lee_enfield_rifle_mp')).toBe(true);
    expect(isCrewSmallArm('weapon_crew_&_pioneer_mp40_smg_mp')).toBe(true);
    expect(isCrewSmallArm('m3_grease_gun_vehicle_crew_mp')).toBe(true);
  });

  it('keeps real guns and grenades', () => {
    expect(isCrewSmallArm('m1_81mm_mortar_team_mp')).toBe(false);
    expect(isCrewSmallArm('152mm_m-30_mp')).toBe(false);
    expect(isCrewSmallArm('churchill_crew_grenades')).toBe(false);
    expect(isCrewSmallArm('m1_garand_rifle_mp')).toBe(false);
    expect(isCrewSmallArm(null)).toBe(false);
  });
});

describe('weaponMode', () => {
  it('classifies barrage variants', () => {
    expect(weaponMode('m1_81mm_mortar_team_barrage_mp')?.kind).toBe('barrage');
    expect(weaponMode('su76_zis-3sh_gun_barrage_mp')?.kind).toBe('barrage');
    expect(weaponMode('m1_81mm_mortar_team_barrage_mp')?.label).toBe('Залп');
  });

  it('classifies creeping and counter barrage', () => {
    expect(weaponMode('m7b1_priest_m2a1_105mm_creeping_barrage_mp')?.kind).toBe('creeping_barrage');
    expect(weaponMode('m1_81mm_mortar_counter_barrage_mp')?.kind).toBe('counter_barrage');
  });

  it('classifies heavy and light barrage before generic rules', () => {
    expect(weaponMode('brit_3_inch_mortar_1_heavy_barrage_10lb_he_mp')?.kind).toBe('heavy_barrage');
    expect(weaponMode('brit_3_inch_mortar_1_barrage_light_he_mp')?.kind).toBe('light_barrage');
    // light_barrage проверяется раньше auto_fire: auto_light_he — это лёгкий залп.
    expect(weaponMode('brit_3_inch_mortar_1_auto_light_he_mp')?.kind).toBe('light_barrage');
  });

  it('classifies smoke variants including smoke_shot and barrage_smoke', () => {
    expect(weaponMode('m1_81mm_mortar_team_smoke_mp')?.kind).toBe('smoke');
    expect(weaponMode('churchill_smoke_shot_mp')?.kind).toBe('smoke');
    expect(weaponMode('panzer_iv_smoke_shot_mp')?.kind).toBe('smoke');
    expect(weaponMode('le_ig_18_howitzer_75mm_barrage_smoke_mp')?.kind).toBe('smoke');
    expect(weaponMode('stug_75mm_short_commander_smoke_mp')?.kind).toBe('smoke');
    expect(weaponMode('sherman_m3_2inch_mortar_smoke_mp')?.kind).toBe('smoke');
  });

  it('prefers white phosphorous over smoke', () => {
    expect(weaponMode('m1_81mm_mortar_white_phosphorous_barrage_mp')?.kind).toBe('white_phosphorous');
    expect(weaponMode('comet_smoke_wp_shot_mp')?.kind).toBe('white_phosphorous');
  });

  it('classifies incendiary and delayed fuse', () => {
    expect(weaponMode('grw34_81mm_incendiary_mortar_barrage_mp')?.kind).toBe('incendiary');
    expect(weaponMode('hm_38_120mm_mortar_delayed_fuse_barrage_mp')?.kind).toBe('delayed_fuse');
    expect(weaponMode('m1_81mm_mortar_short_delay_barrage_mp')?.kind).toBe('delayed_fuse');
  });

  it('classifies precise targeting', () => {
    expect(weaponMode('hm_38_120mm_mortar_barrage_victortarget_mp')?.kind).toBe('precise');
    expect(weaponMode('203mm_b-4_commander_precise_mp')?.kind).toBe('precise');
    expect(weaponMode('katyusha_bm_13_16_precision_rocket_mp')?.kind).toBe('precise');
  });

  it('classifies heat and he shell', () => {
    expect(weaponMode('pack_howitzer_75mm_barrage_heat_mp')?.kind).toBe('heat');
    expect(weaponMode('sherman_m3_75mm_he_shell_mp')?.kind).toBe('he_shell');
  });

  it('classifies flares, direct fire and auto fire', () => {
    expect(weaponMode('hm_38_120mm_mortar_flares_mp')?.kind).toBe('flares');
    // flare в единственном числе и ракетница с victor_target в имени — тоже flares.
    expect(weaponMode('pm41_82mm_mortar_flare_mp')?.kind).toBe('flares');
    expect(weaponMode('luger_p08_victor_target_flare_pistol_mp')?.kind).toBe('flares');
    expect(weaponMode('b4_203_direct_fire')?.kind).toBe('direct_fire');
    expect(weaponMode('pack_howitzer_75mm_auto_attack_mp')?.kind).toBe('auto_fire');
  });

  it('classifies canister, airburst and phosphorus rockets', () => {
    expect(weaponMode('53k_45mm_m1937_at_gun_canister_mp')?.kind).toBe('canister');
    // valentine_canister_smoke — дымовой миномёт, smoke важнее canister.
    expect(weaponMode('valentine_canister_smoke_mp')?.kind).toBe('smoke');
    expect(weaponMode('howitzer_105mm_gun_airburst_mp')?.kind).toBe('airburst');
    expect(weaponMode('land_mattress_phosphorus_rocket_mp')?.kind).toBe('white_phosphorous');
  });

  it('hides vet copies and other non-fire weapons', () => {
    // Ветеранские копии основного ствола — не режим огня; их улучшения
    // показываются в блоке «Ветеранство».
    expect(weaponMode('152mm_m-30_vet3_mp')?.kind).toBe('hidden');
    expect(weaponMode('152mm_m-30_disabled_mp')?.kind).toBe('hidden');
    expect(weaponMode('m7b1_priest_m2a1_105mm_dummy_mp')?.kind).toBe('hidden');
    expect(weaponMode('katyusha_bm_13_16_rocket_no_fire_mp')?.kind).toBe('hidden');
    expect(weaponMode('m1_57mm_at_gun_vet_mp')?.kind).toBe('hidden');
    expect(weaponMode('molotov_cocktail_weapon_vet_mp')?.kind).toBe('hidden');
    expect(weaponMode('churchill_avre_spigot_mortar_vet_3_mp')?.kind).toBe('hidden');
    // Маркерные стволы со слотом тоже скрываются.
    expect(weaponMode('m5_stuart_shell_shock_shot_mp')?.kind).toBe('hidden');
    expect(weaponMode('pak43_critical_shot_mp')?.kind).toBe('hidden');
    expect(weaponMode('sdkfz_234_puma_aimed_shot_mp')?.kind).toBe('hidden');
    expect(weaponMode('boys_at_rifle_sniper_critical_shot_mp')?.kind).toBe('hidden');
  });

  it('returns null for plain weapons', () => {
    expect(weaponMode('m1_garand_rifle_mortar_crew_mp')).toBeNull();
    expect(weaponMode('sherman_m3_75mm_mp')).toBeNull();
    expect(weaponMode(null)).toBeNull();
    expect(weaponMode(undefined)).toBeNull();
  });
});

describe('baseWeaponKey', () => {
  it('strips mp tail and mode suffixes', () => {
    expect(baseWeaponKey('m1_81mm_mortar_team_barrage_mp')).toBe('m1_81mm_mortar_team');
    expect(baseWeaponKey('m1_81mm_mortar_counter_barrage_mp')).toBe('m1_81mm_mortar');
    expect(baseWeaponKey('hm_38_120mm_mortar_barrage_victortarget_mp')).toBe('hm_38_120mm_mortar');
    expect(baseWeaponKey('203mm_b-4_commander_precise_mp')).toBe('203mm_b-4_commander');
    expect(baseWeaponKey('m7b1_priest_m2a1_105mm_creeping_barrage_mp')).toBe('m7b1_priest_m2a1_105mm');
    expect(baseWeaponKey('brit_3_inch_mortar_1_barrage_10lb_he_victor_target_mp')).toBe('brit_3_inch_mortar_1');
  });
});

describe('groupWeapons', () => {
  const usfMortar: Weapon[] = [
    { name: 'm1_81mm_mortar_team_mp', hardpoint: 1 },
    { name: 'm1_garand_rifle_mortar_crew_mp', hardpoint: 1, count: 4 },
    { name: 'm1_81mm_mortar_team_barrage_mp', hardpoint: 2 },
    { name: 'm1_81mm_mortar_team_smoke_mp', hardpoint: 3 },
    { name: 'm1_81mm_mortar_counter_barrage_mp', hardpoint: 4 },
  ];

  it('attaches modes to their base and keeps base order', () => {
    const groups = groupWeapons(usfMortar);
    expect(groups).toHaveLength(2);
    expect(groups[0].base.name).toBe('m1_81mm_mortar_team_mp');
    expect(groups[0].modes.map((m) => m.mode.kind)).toEqual(['barrage', 'smoke', 'counter_barrage']);
    expect(groups[1].base.name).toBe('m1_garand_rifle_mortar_crew_mp');
    expect(groups[1].modes).toHaveLength(0);
  });

  it('excludes hidden weapons entirely', () => {
    const groups = groupWeapons([
      { name: 'm1_81mm_mortar_team_mp' },
      { name: 'm7b1_priest_m2a1_105mm_dummy_mp' },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].modes).toHaveLength(0);
  });

  it('attaches smoke_shot to the churchill base by one shared token', () => {
    const groups = groupWeapons([{ name: 'churchill_x_mp' }, { name: 'churchill_smoke_shot_mp' }]);
    expect(groups).toHaveLength(1);
    expect(groups[0].base.name).toBe('churchill_x_mp');
    expect(groups[0].modes.map((m) => m.mode.kind)).toEqual(['smoke']);
  });

  it('falls back to mainWeaponIndex group when no tokens match', () => {
    const groups = groupWeapons([{ name: 'churchill_x_mp' }, { name: 'm1_81mm_mortar_team_smoke_mp' }], 0);
    expect(groups).toHaveLength(1);
    expect(groups[0].base.name).toBe('churchill_x_mp');
    expect(groups[0].modes).toHaveLength(1);
  });

  it('creates its own group for a mode without base or mainWeaponIndex', () => {
    const groups = groupWeapons([{ name: 'churchill_x_mp' }, { name: 'm1_81mm_mortar_team_smoke_mp' }]);
    expect(groups).toHaveLength(2);
    expect(groups[1].base.name).toBe('m1_81mm_mortar_team_smoke_mp');
    expect(groups[1].modes).toHaveLength(0);
  });

  it('skips weapons without a name', () => {
    const groups = groupWeapons([{ name: null }, { name: 'sherman_m3_75mm_mp' }]);
    expect(groups).toHaveLength(1);
    expect(groups[0].base.name).toBe('sherman_m3_75mm_mp');
  });

  it('skips ability-delivered weapons (hardpoint -1, count -1)', () => {
    const groups = groupWeapons([
      { name: 'm1_81mm_mortar_team_mp', hardpoint: 1, count: 1 },
      { name: 'churchill_smoke_shot_mp', hardpoint: -1, count: -1 },
      { name: '17_pounder_atg_he_barrage_mp', hardpoint: -1, count: -1 },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].modes).toHaveLength(0);
  });

  it('deduplicates repeated modes from veteran weapon copies', () => {
    const groups = groupWeapons([
      { name: 'm7b1_priest_m2a1_105mm_mp', hardpoint: 2, count: 1 },
      { name: 'm7b1_priest_m2a1_105mm_creeping_barrage_mp', hardpoint: 4, count: 1 },
      { name: 'm7b1_priest_m2a1_105mm_victor_target_mp', hardpoint: 5, count: 1 },
      { name: 'm7b1_priest_m2a1_105mm_creeping_barrage_mp', hardpoint: 4, count: 1 },
      { name: 'm7b1_priest_m2a1_105mm_victor_target_mp', hardpoint: 5, count: 1 },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].modes.map((m) => m.mode.kind)).toEqual(['creeping_barrage', 'precise']);
  });

  it('uses a mode weapon as base when it is the main weapon', () => {
    const groups = groupWeapons(
      [
        { name: 'm7b1_priest_m2a1_105mm_dummy_mp', hardpoint: 1, count: 1 },
        { name: 'sherman_m3_105mm_he_shell_mp', hardpoint: 1, count: 1 },
        { name: 'sherman_m3_105mm_he_shell_barrage_mp', hardpoint: 5, count: 1 },
      ],
      1,
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].base.name).toBe('sherman_m3_105mm_he_shell_mp');
    expect(groups[0].baseMode?.kind).toBe('he_shell');
    expect(groups[0].modes).toHaveLength(0);
  });

  it('caps modes at smoke plus two highest-priority abilities', () => {
    const groups = groupWeapons([
      { name: 'hm_38_120mm_mortar_mp', hardpoint: 1, count: 1 },
      { name: 'hm_38_120mm_mortar_barrage_mp', hardpoint: 2, count: 1 },
      { name: 'hm_38_120mm_mortar_smoke_mp', hardpoint: 3, count: 1 },
      { name: 'hm_38_120mm_mortar_flares_mp', hardpoint: 4, count: 1 },
      { name: 'hm_38_120mm_mortar_barrage_victortarget_mp', hardpoint: 5, count: 1 },
      { name: 'hm_38_120mm_mortar_delayed_fuse_barrage_mp', hardpoint: 6, count: 1 },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].modes.map((m) => m.mode.kind)).toEqual(['smoke', 'barrage', 'precise']);
  });
});

describe('veteranWeaponBonuses', () => {
  it('diffs vet weapon copies against their base', () => {
    const unit = {
      weapons: [
        {
          name: '152mm_m-30_mp',
          hardpoint: 2,
          count: 1,
          range: { max: 250, min: 35 },
          damage: { near: 200, mid: 200, far: 200 },
          accuracy: { near: 0.8, mid: 0.6, far: 0.4 },
        },
        {
          name: '152mm_m-30_vet3_mp',
          hardpoint: 4,
          count: 1,
          range: { max: 332.5, min: 35 },
          damage: { near: 200, mid: 200, far: 200 },
          accuracy: { near: 1, mid: 0.75, far: 0.5 },
        },
      ],
    } as never;
    const bonuses = veteranWeaponBonuses(unit);
    expect(bonuses[3]).toContain('Дальность 250 → 332.5');
    expect(bonuses[3].some((line) => line.startsWith('Точность'))).toBe(true);
    expect(bonuses[1]).toBeUndefined();
  });
});

import type { Unit, Weapon } from '../types';
import { fmtNearMidFar, weaponDps } from '../lib/units';
import { useState } from 'react';
import { tWeapon } from '../lib/translations';
import { gameWeaponMeta } from '../data/game-weapon-meta';
import { gameAbilityIcons } from '../data/game-ability-icons';
import { assetUrl } from '../lib/assets';
import { weaponAvailableIn } from '../data';

const WEAPON_ROWS: { label: string; get: (w: Weapon) => string }[] = [
  { label: 'Урон', get: (w) => fmtNearMidFar(w.damage) },
  { label: 'Дальность', get: (w) => fmtNearMidFar(w.range) },
  { label: 'Пробитие', get: (w) => fmtNearMidFar(w.penetration) },
  { label: 'Точность', get: (w) => fmtNearMidFar(w.accuracy) },
  { label: 'Подавление', get: (w) => fmtNearMidFar(w.suppression) },
  { label: 'УВС*', get: (w) => weaponDps(w) },
];

function displayWeapons(weapons: Weapon[]): Weapon[] {
  const seen = new Set<string>();
  return weapons.filter((weapon) => {
    const name = weapon.name ?? '';
    if (/dummy|damage_engine_shot|shell_shock_shot|aimed_shot|critical_shot/i.test(name))
      return false;
    // Weapons with no hardpoint and no count are ability-delivered (grenades,
    // flares, smoke) and already appear in the ability list.
    if (weapon.hardpoint === -1 && weapon.count === -1) return false;
    const key = `${tWeapon(name)}-${JSON.stringify(weapon.damage)}-${JSON.stringify(weapon.range)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function WeaponPanel({ unit }: { unit: Unit }) {
  const weapons = displayWeapons(unit.weapons);
  if (weapons.length === 0) return null;

  const mainName = unit.weapons[unit.mainWeaponIndex ?? -1]?.name;
  // Base loadout comes first, issued/upgraded weapons after. The "issued"
  // label applies to infantry only: for vehicles and crews the extra slots
  // are turret/hull guns and alternate fire modes.
  const isInfantry = unit.category === 'Infantry';
  const sorted = [...weapons].sort((a, b) => {
    const issuedA = isInfantry && isIssued(a, mainName);
    const issuedB = isInfantry && isIssued(b, mainName);
    if (issuedA !== issuedB) return issuedA ? 1 : -1;
    return (b.count ?? 0) - (a.count ?? 0);
  });

  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <section className="rounded-xl border border-white/10 bg-panel p-5">
      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Вооружение
      </h2>
      <div className="flex flex-col gap-4">
        {sorted.map((w, i) => (
          <WeaponRow
            key={i}
            weapon={w}
            isMain={w.name === mainName}
            issued={isInfantry && isIssued(w, mainName)}
            doctrines={isInfantry ? weaponAvailableIn(unit.faction, w.name ?? '') : []}
            expanded={expanded === i}
            onToggle={() => setExpanded(expanded === i ? null : i)}
          />
        ))}
      </div>
      <p className="mt-4 text-[11px] text-zinc-600">
        Оружие с отметкой «выдаётся» ставится на отряд улучшением, а не входит в базовый
        состав. * УВС: приблизительный урон в секунду по среднему времени перезарядки, в
        порядке ближняя / средняя / дальняя дистанция. Не учитывает очередь, точность и
        броню цели.
      </p>
    </section>
  );
}

function isIssued(weapon: Weapon, mainName: string | null | undefined): boolean {
  if (weapon.name === mainName) return false;
  // Slot weapons carried by exactly one soldier are usually upgrade choices.
  return Number(weapon.hardpoint ?? 0) >= 1 && (weapon.count ?? 0) <= 1;
}

function weaponIcon(name: string | null): string | undefined {
  if (!name) return undefined;
  const symbol = gameWeaponMeta[name]?.icon_name;
  const path = symbol ? gameAbilityIcons[symbol] : undefined;
  return path ? assetUrl(path) : undefined;
}

function WeaponRow({
  weapon: w,
  isMain,
  issued,
  doctrines,
  expanded,
  onToggle,
}: {
  weapon: Weapon;
  isMain: boolean;
  issued: boolean;
  doctrines: string[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const type = w.name ? gameWeaponMeta[w.name]?.type : undefined;
  const icon = weaponIcon(w.name);
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <div className="flex min-w-0 items-center gap-2">
          {icon ? (
            <img
              src={icon}
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
              className="h-8 w-12 shrink-0 rounded border border-white/10 object-contain"
            />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/10 bg-white/5 text-sm text-zinc-500">
              ⌖
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate font-medium text-zinc-100">
              {tWeapon(w.name)}
              {isMain && (
                <span className="ml-2 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent">
                  Основное
                </span>
              )}
              {doctrines.length > 0 ? (
                <span
                  className="ml-2 rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-orange-400"
                  title={`Выдаётся доктриной${doctrines.length > 1 ? 'ами' : ''}: ${doctrines.join(', ')}`}
                >
                  Доктрина: {doctrines.join(', ')}
                </span>
              ) : (
                issued && (
                  <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-400">
                    Выдаётся
                  </span>
                )
              )}
            </h3>
            {type && <p className="text-[11px] text-zinc-500">{type}</p>}
          </div>
        </div>
        <span className="shrink-0 text-xs text-zinc-500">
          {w.count != null && w.count > 0 ? `×${w.count} ` : ''}
          {expanded ? '−' : '+'}
        </span>
      </button>
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-6">
        {WEAPON_ROWS.map((r) => (
          <div key={r.label} className="text-xs">
            <div className="text-zinc-500">{r.label}</div>
            <div className="font-medium text-zinc-300">{r.get(w)}</div>
          </div>
        ))}
      </div>
      {expanded && <WeaponDetails weapon={w} />}
    </div>
  );
}

function fmtRange(r: { min?: number; max?: number } | undefined): string {
  if (!r) return '—';
  const min = r.min ?? 0;
  const max = r.max ?? 0;
  return min === max ? String(min) : `${min}–${max}`;
}

function WeaponDetails({ weapon }: { weapon: Weapon }) {
  const rows: { label: string; value: string }[] = [];

  if (weapon.aim) {
    const fireAim = (weapon.aim as { fire_aim_time?: { min?: number; max?: number } })
      .fire_aim_time;
    const readyAim = (weapon.aim as { ready_aim_time?: { min?: number; max?: number } })
      .ready_aim_time;
    if (fireAim || readyAim) {
      const fa = fireAim ? fmtRange(fireAim) : '—';
      const ra = readyAim ? fmtRange(readyAim) : '—';
      rows.push({ label: 'Наведение', value: `огонь ${fa} с · готовность ${ra} с` });
    }
  }

  if (weapon.burst) {
    const b = weapon.burst as {
      can_burst?: boolean;
      rate_of_fire?: { min?: number; max?: number };
      duration?: { min?: number; max?: number };
    };
    if (b.can_burst) {
      const rof = b.rate_of_fire ? fmtRange(b.rate_of_fire) : '—';
      const dur = b.duration ? fmtRange(b.duration) : '—';
      rows.push({ label: 'Очередь', value: `темп ${rof} · ${dur} с` });
    }
  }

  if (weapon.cooldown) {
    const d = (weapon.cooldown as { duration?: { min?: number; max?: number } }).duration;
    if (d) rows.push({ label: 'Перезарядка', value: `${fmtRange(d)} с` });
  }

  if (weapon.reload) {
    const d = (weapon.reload as { duration?: { min?: number; max?: number } }).duration;
    if (d) rows.push({ label: 'Перезарядка магазина', value: `${fmtRange(d)} с` });
  }

  if (weapon.scatter) {
    const s = weapon.scatter as { angle_scatter?: number; distance_scatter_max?: number };
    if (s.angle_scatter != null) rows.push({ label: 'Разброс', value: `${s.angle_scatter}°` });
  }

  if (weapon.moving) {
    const m = weapon.moving as { accuracy_multiplier?: number; disable_moving_firing?: boolean };
    if (m.disable_moving_firing) rows.push({ label: 'Стрельба в движении', value: 'недоступна' });
    else if (m.accuracy_multiplier != null)
      rows.push({ label: 'Точность при движении', value: `×${m.accuracy_multiplier}` });
  }

  if (weapon.area_effect) {
    const a = weapon.area_effect as { area_info?: { radius?: number } };
    if (a.area_info?.radius)
      rows.push({ label: 'Площадь поражения', value: `радиус ${a.area_info.radius}` });
  }

  if (weapon.deflection) {
    const d = weapon.deflection as {
      has_deflection_damage?: boolean;
      deflection_damage_multiplier?: number;
    };
    if (d.has_deflection_damage)
      rows.push({ label: 'Рикошет', value: `урон ×${d.deflection_damage_multiplier ?? 0}` });
  }

  if (weapon.tracking) {
    const t = weapon.tracking as {
      fire_cone_angle?: number;
      normal?: { speed_horizontal?: number };
    };
    if (t.fire_cone_angle != null || t.normal?.speed_horizontal != null) {
      rows.push({
        label: 'Сопровождение цели',
        value: `${t.fire_cone_angle ?? '—'}° · ${t.normal?.speed_horizontal ?? '—'}°/с`,
      });
    }
  }

  if (weapon.target_type_table) {
    const tbl = weapon.target_type_table as unknown as {
      unit_type?: string;
      weapon_multipliers?: { damage_multiplier?: number };
    }[];
    if (Array.isArray(tbl) && tbl.length) {
      const parts = tbl
        .map((t) => `${t.unit_type ?? '?'} ×${t.weapon_multipliers?.damage_multiplier ?? 1}`)
        .join(', ');
      rows.push({ label: 'Урон по целям', value: parts });
    }
  }

  if (rows.length === 0) {
    return (
      <p className="mt-3 border-t border-white/5 pt-3 text-xs text-zinc-600">
        Дополнительные параметры отсутствуют.
      </p>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-2 border-t border-white/5 pt-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <div key={r.label} className="min-w-0">
          <div className="text-zinc-500">{r.label}</div>
          <div className="text-zinc-400">{r.value}</div>
        </div>
      ))}
    </div>
  );
}

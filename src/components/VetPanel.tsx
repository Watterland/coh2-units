import type { Unit } from '../types';
import { round, vetBonuses } from '../lib/units';
import { veterancyEffects, veterancyXp } from '../data/veterancy';
import { veteranWeaponBonuses } from '../lib/weaponModes';
import { unitHasVeterancy, unitVetLevels, veteranAbilityUnlocks } from '../lib/veterancy';

// Легаси-строка «имя · цель ×» не содержит числа — показываем только имя.
function splitEffect(line: string): { label: string; num?: string } {
  const text = (line.includes(' · ') ? line.split(' · ')[0] : line).trim();
  const match = text.match(/^(.+?)([×+]\d[\d.]*)$/);
  if (!match) return { label: text };
  return { label: match[1].trim(), num: match[2] };
}

export default function VetPanel({ unit }: { unit: Unit }) {
  const weaponBonuses = veteranWeaponBonuses(unit);
  const abilityUnlocks = veteranAbilityUnlocks(unit);
  const levels = unitVetLevels(unit);
  const hasVet = unitHasVeterancy(unit);

  if (levels === 0 || !hasVet) {
    return (
      <section className="rounded-xl border border-white/10 bg-panel p-5">
        <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Ветеранство
        </h2>
        <p className="text-xs text-zinc-600">У этого юнита нет ветеранства</p>
      </section>
    );
  }

  const isVeh = unit.category === 'Vehicles';

  const columns: { key: keyof NonNullable<(typeof unit.vetStats)[0]>; label: string }[] = [
    { key: 'health', label: 'HP' },
    { key: 'target_size', label: 'Размер' },
    { key: 'sight', label: 'Обзор' },
    { key: 'speed', label: 'Скорость' },
    { key: 'accel', label: 'Ускор.' },
    { key: 'rotate', label: 'Поворот' },
    { key: 'front_armor', label: isVeh ? 'Лоб. броня' : 'Броня' },
    { key: 'rear_armor', label: 'Корм. броня' },
    { key: 'population', label: 'Насел.' },
  ];

  return (
    <section className="rounded-xl border border-white/10 bg-panel p-5">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Ветеранство
        </h2>
        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-zinc-400">
          Уровни: {levels}
        </span>
        {unit.faction === 'OKW' && (
          <span className="text-[11px] text-zinc-500">Общее ветеранство фракции</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="py-2 pr-3">Уровень</th>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2 font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: levels + 1 }, (_, i) => i).map((i) => {
              const v = unit.vetStats[i];
              if (!v) return null;
              return (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2 pr-3 font-display font-semibold text-accent">
                    {i === 0 ? 'Базовый' : `Vet ${i}`}
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2 text-zinc-300">
                      <span>{round(v[c.key])}</span>
                      {i > 0 &&
                        unit.vetStats[i - 1]?.[c.key] != null &&
                        v[c.key] != null &&
                        v[c.key] !== unit.vetStats[i - 1]?.[c.key] && (
                          <span className="ml-1 text-[10px] text-emerald-400">
                            {Number(v[c.key]) - Number(unit.vetStats[i - 1]?.[c.key]) > 0
                              ? '+'
                              : ''}
                            {round(Number(v[c.key]) - Number(unit.vetStats[i - 1]?.[c.key]))}
                          </span>
                        )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {Array.from({ length: levels }, (_, i) => i + 1).map((level) => {
          const effects = veterancyEffects[unit.index]?.[level] ?? [];
          const unlocks = abilityUnlocks[level] ?? [];
          const weapons = weaponBonuses[level] ?? [];
          const fallback = effects.length ? [] : vetBonuses(unit, level);
          const xp = veterancyXp[unit.index]?.[level - 1];
          const empty = !effects.length && !unlocks.length && !weapons.length && !fallback.length;
          return (
            <div key={level} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="font-display text-sm font-semibold text-accent">Vet {level}</div>
              {empty ? (
                <p className="mt-1 text-xs text-zinc-600">Нет данных</p>
              ) : (
                <>
                  {effects.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-xs text-zinc-300">
                      {effects.map((line) => {
                        const { label, num } = splitEffect(line);
                        return (
                          <li key={line}>
                            {label}
                            {num && <span className="ml-0.5 text-accent">{num}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {unlocks.length > 0 && (
                    <div className="mt-1.5 text-[11px] text-emerald-400/90">
                      <span className="text-zinc-500">Открывает:</span>
                      {unlocks.map((name) => (
                        <div key={name}>↳ {name}</div>
                      ))}
                    </div>
                  )}
                  {weapons.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-xs text-zinc-400">
                      {weapons.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                  {fallback.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-xs text-zinc-400">
                      {fallback.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              {xp != null && <div className="mt-1.5 text-[10px] text-zinc-600">XP: {xp}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

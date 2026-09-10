import type { Unit } from '../types';
import { round, vetBonuses } from '../lib/units';
import { veterancyEffects } from '../data/veterancy';
import { veteranWeaponBonuses } from '../lib/weaponModes';

export default function VetPanel({ unit }: { unit: Unit }) {
  const maxLevel = unit.faction === 'OKW' ? 5 : 3;
  const levels = unit.vetStats.slice(0, maxLevel + 1).filter((v) => v !== null);
  if (levels.length === 0) return null;
  const weaponBonuses = veteranWeaponBonuses(unit);

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
      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Ветеранство
      </h2>
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
            {unit.vetStats.slice(0, maxLevel + 1).map((v, i) => {
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
        {Array.from({ length: maxLevel }, (_, index) => index + 1).map((level) => {
          const effects = veterancyEffects[unit.index]?.[level];
          const bonuses = [
            ...(effects?.length ? effects : vetBonuses(unit, level)),
            ...(weaponBonuses[level] ?? []),
          ];
          return (
            <div key={level} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="font-display text-sm font-semibold text-accent">Vet {level}</div>
              {bonuses.length ? (
                <ul className="mt-1 space-y-0.5 text-xs text-zinc-400">
                  {bonuses.map((bonus) => (
                    <li key={bonus}>{bonus}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-zinc-600">Нет данных</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { useState } from 'react';
import type { VetStats, Category } from '../types';
import { round } from '../lib/units';

interface Props {
  vet: VetStats | null;
  category: Category;
  entityNames: string[];
}

export default function StatTable({ vet, category, entityNames }: Props) {
  const [detailed, setDetailed] = useState(false);
  if (!vet) return null;
  const isVeh = category === 'Vehicles';

  const rows: [string, string][] = [
    ['Здоровье', round(vet.health, 0)],
    ['Размер цели', round(vet.target_size, 2)],
    ['Обзор', round(vet.sight)],
    ['Скорость', round(vet.speed, 2)],
    ...(detailed
      ? ([
          ['Ускорение', round(vet.accel, 2)],
          ['Разворот', round(vet.rotate, 2)],
        ] as [string, string][])
      : []),
    ...(isVeh
      ? ([
          ['Лобовая броня', round(vet.front_armor, 2)],
          ['Кормовая броня', round(vet.rear_armor, 2)],
        ] as [string, string][])
      : ([['Броня', round(vet.front_armor, 2)]] as [string, string][])),
    ['Население', round(vet.population, 0)],
    ['Бойцы', round(vet.num_entities, 0)],
  ];

  return (
    <section className="rounded-xl border border-white/10 bg-panel p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Характеристики
        </h2>
        <button
          onClick={() => setDetailed(!detailed)}
          className="text-xs text-accent hover:text-zinc-100"
        >
          {detailed ? 'Кратко' : 'Все статы'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between border-b border-white/5 py-1.5 text-sm"
          >
            <span className="text-zinc-500">{label}</span>
            <span className="font-medium text-zinc-200">{value}</span>
          </div>
        ))}
      </div>
      {entityNames.length > 0 && (
        <div className="mt-4">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-zinc-500">
            Состав отряда
          </div>
          <div className="flex flex-wrap gap-1.5">
            {entityNames.map((n, i) => (
              <span key={i} className="rounded bg-white/5 px-2 py-0.5 text-xs text-zinc-300">
                {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

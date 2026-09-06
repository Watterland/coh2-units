import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { loadFactionUnits, unitLiteByIndex, unitsLite } from '../data';
import { factionInfo } from '../lib/factions';
import { classifyUnit, tUnit } from '../lib/translations';
import { round } from '../lib/units';
import type { Unit } from '../types';
import { assetUrl } from '../lib/assets';

const NO_IMAGE = assetUrl('/units/no-image.svg');

export default function Compare() {
  const { first, second } = useParams();
  const firstIndex = Number(first);
  const secondIndex = second == null ? null : Number(second);
  const firstLite = unitLiteByIndex(firstIndex);
  const secondLite = secondIndex == null ? undefined : unitLiteByIndex(secondIndex);
  const navigate = useNavigate();
  const [firstUnit, setFirstUnit] = useState<Unit | null>(null);
  const [secondUnit, setSecondUnit] = useState<Unit | null>(null);

  useEffect(() => {
    if (firstLite)
      loadFactionUnits(firstLite.faction).then((units) =>
        setFirstUnit(units.find((unit) => unit.index === firstIndex) ?? null),
      );
  }, [firstIndex, firstLite?.faction]);
  useEffect(() => {
    if (secondLite && secondIndex != null)
      loadFactionUnits(secondLite.faction).then((units) =>
        setSecondUnit(units.find((unit) => unit.index === secondIndex) ?? null),
      );
    else setSecondUnit(null);
  }, [secondIndex, secondLite?.faction]);

  if (!firstLite || (second != null && !secondLite)) return <Navigate to="/" replace />;
  if (secondLite && classifyUnit(firstLite) !== classifyUnit(secondLite))
    return <Navigate to={`/compare/${firstIndex}`} replace />;
  const options = unitsLite.filter(
    (unit) => unit.index !== firstIndex && classifyUnit(unit) === classifyUnit(firstLite),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to={`/units/${firstIndex}`} className="text-sm text-zinc-400 hover:text-accent">
          ← {tUnit(firstLite.name)}
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-zinc-100">Сравнение юнитов</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Сравниваются только юниты одной боевой группы: {classifyUnit(firstLite)}.
        </p>
      </div>
      <select
        value={secondIndex ?? ''}
        onChange={(event) => {
          const value = event.target.value;
          navigate(value ? `/compare/${firstIndex}/${value}` : `/compare/${firstIndex}`);
        }}
        className="max-w-lg rounded-lg border border-white/10 bg-panel px-3 py-2 text-sm text-zinc-200"
      >
        <option value="">Выберите второго юнита</option>
        {options.map((unit) => (
          <option key={unit.index} value={unit.index}>
            {tUnit(unit.name)} · {factionInfo(unit.faction).short}
          </option>
        ))}
      </select>
      {firstUnit && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UnitColumn unit={firstUnit} />
          <UnitColumn unit={secondUnit} placeholder />
        </div>
      )}
    </div>
  );
}

function UnitColumn({ unit, placeholder = false }: { unit: Unit | null; placeholder?: boolean }) {
  if (!unit)
    return placeholder ? (
      <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-white/10 bg-panel/40 p-8 text-center text-sm text-zinc-600">
        Выберите совместимый юнит для сравнения
      </div>
    ) : null;
  const base = unit.vetStats[0];
  const info = factionInfo(unit.faction);
  const rows = [
    ['Здоровье', round(base?.health, 0)],
    ['Броня', round(base?.front_armor, 2)],
    ['Скорость', round(base?.speed)],
    ['Обзор', round(base?.sight)],
    ['Население', round(unit.population, 0)],
    ['Бойцы', round(base?.num_entities, 0)],
  ];
  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-panel">
      <div className="flex gap-4 p-4">
        <img
          src={unit.imageUrl ?? NO_IMAGE}
          onError={(event) => {
            event.currentTarget.src = NO_IMAGE;
          }}
          alt=""
          className="h-28 w-24 rounded object-cover"
        />
        <div>
          <span className="text-xs font-semibold" style={{ color: info.color }}>
            {info.name}
          </span>
          <h2 className="mt-1 font-display text-xl font-bold text-zinc-100">{tUnit(unit.name)}</h2>
          <p className="mt-1 text-sm text-zinc-500">{classifyUnit(unit)}</p>
          <Link
            to={`/units/${unit.index}`}
            className="mt-3 inline-block text-xs text-accent hover:text-zinc-100"
          >
            Открыть карточку →
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 border-t border-white/5">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between border-b border-r border-white/5 px-3 py-2 text-sm"
          >
            <span className="text-zinc-500">{label}</span>
            <span className="font-medium text-zinc-200">{value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

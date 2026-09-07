import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Unit } from '../types';
import { factionInfo } from '../lib/factions';
import { round } from '../lib/units';
import { abilitiesForUnit, unitRussianName } from '../data';
import { tRole, tUnit } from '../lib/translations';
import { assetUrl } from '../lib/assets';

const NO_IMAGE = assetUrl('/units/no-image.svg');

export default function UnitCard({ unit }: { unit: Unit }) {
  const [src, setSrc] = useState(unit.imageUrl ?? NO_IMAGE);
  const info = factionInfo(unit.faction);
  const base = unit.vetStats[0];
  const isVeh = unit.category === 'Vehicles';
  const abilityCount = abilitiesForUnit(unit.index).length;
  const displayName = unitRussianName(unit.index) ?? tUnit(unit.name);

  return (
    <Link
      to={`/units/${unit.index}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-panel transition duration-200 hover:-translate-y-1 hover:border-white/30 hover:bg-panel-hover"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-panel-light">
        <img
          src={src}
          alt={displayName}
          loading="lazy"
          onError={() => setSrc(NO_IMAGE)}
          className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
        />
        <span
          className="absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: `${info.color}cc`, color: '#fff' }}
        >
          {info.short}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm font-semibold leading-tight text-zinc-100">
            {displayName}
          </h3>
          {abilityCount > 0 && (
            <span
              title="Способности"
              className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400"
            >
              ⚡ {abilityCount}
            </span>
          )}
        </div>
        {unit.build?.role && (
          <p className="truncate text-[11px] text-zinc-500">{tRole(unit.build.role)}</p>
        )}
        {(unit.cost?.manpower || unit.cost?.fuel || unit.cost?.munitions) && (
          <div className="flex flex-wrap gap-1 text-[10px] font-medium">
            <Cost label="MP" value={unit.cost.manpower} />
            <Cost label="MU" value={unit.cost.munitions} />
            <Cost label="F" value={unit.cost.fuel} />
          </div>
        )}
        <div className="mt-auto grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-zinc-400">
          <Stat label="HP" value={round(base?.health, 0)} />
          <Stat
            label={isVeh ? 'Armor' : 'Pop'}
            value={isVeh ? round(base?.front_armor) : round(unit.population, 0)}
          />
          <Stat label="Speed" value={round(base?.speed)} />
          <Stat label="Sight" value={round(base?.sight)} />
        </div>
      </div>
    </Link>
  );
}

function Cost({ label, value }: { label: string; value?: number }) {
  return value != null ? (
    <span className="rounded bg-white/5 px-1 text-zinc-400">
      {label} {value}
    </span>
  ) : null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-1">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-300">{value}</span>
    </div>
  );
}

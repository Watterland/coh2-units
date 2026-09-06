import { useState } from 'react';
import type { Unit } from '../types';
import { factionInfo } from '../lib/factions';
import { round } from '../lib/units';
import { abilitiesForUnit } from '../data';
import StatTable from './StatTable';
import WeaponPanel from './WeaponPanel';
import VetPanel from './VetPanel';
import AbilityList from './AbilityList';
import { tCategory, tRole, tUnit } from '../lib/translations';
import { assetUrl } from '../lib/assets';

const NO_IMAGE = assetUrl('/units/no-image.svg');

export default function UnitDetail({ unit }: { unit: Unit }) {
  const info = factionInfo(unit.faction);
  const [src, setSrc] = useState(unit.imageUrl ?? NO_IMAGE);
  const base = unit.vetStats[0];
  const abilities = abilitiesForUnit(unit.index);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-panel">
          <div className="relative aspect-[4/3] w-full bg-panel-light">
            <img
              src={src}
              alt={tUnit(unit.name)}
              onError={() => setSrc(NO_IMAGE)}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1a1d22] to-transparent" />
          </div>
          <div className="p-4">
            <div
              className="mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: `${info.color}cc`, color: '#fff' }}
            >
              {info.name}
            </div>
            <h1 className="font-display text-2xl font-bold text-zinc-100">{tUnit(unit.name)}</h1>
            <div className="mt-1 text-sm text-zinc-400">
              {tRole(unit.build?.role) ?? tCategory(unit.category)}
            </div>
            {unit.description && (
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{unit.description}</p>
            )}

            {(unit.cost?.manpower || unit.cost?.munitions || unit.cost?.fuel) && (
              <div className="mt-4 border-y border-white/5 py-3">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Стоимость
                </div>
                <div className="flex flex-wrap gap-2">
                  <Cost label="Люди" value={unit.cost.manpower} />
                  <Cost label="Муници" value={unit.cost.munitions} />
                  <Cost label="Топливо" value={unit.cost.fuel} />
                </div>
              </div>
            )}
            {(unit.build?.structure || unit.build?.prerequisite) && (
              <div className="mt-3 space-y-1 text-xs text-zinc-500">
                {unit.build.structure && (
                  <p>
                    Производство: <span className="text-zinc-300">{unit.build.structure}</span>
                  </p>
                )}
                {unit.build.prerequisite && (
                  <p>
                    Требования: <span className="text-zinc-300">{unit.build.prerequisite}</span>
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <KeyStat label="Health" value={round(base?.health, 0)} />
              <KeyStat label="Population" value={round(unit.population, 0)} />
              <KeyStat
                label={unit.category === 'Vehicles' ? 'Front armor' : 'Sight'}
                value={round(unit.category === 'Vehicles' ? base?.front_armor : base?.sight)}
              />
              <KeyStat label="Speed" value={round(base?.speed)} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <StatTable vet={base} category={unit.category} entityNames={unit.entityNames} />
          {abilities.length > 0 && <AbilityList abilities={abilities} color={info.color} />}
        </div>
      </div>

      <VetPanel unit={unit} />
      <WeaponPanel unit={unit} />
    </div>
  );
}

function Cost({ label, value }: { label: string; value?: number }) {
  return value != null ? (
    <span className="rounded bg-white/5 px-2 py-1 text-xs text-zinc-300">
      <span className="text-zinc-500">{label}</span> {value}
    </span>
  ) : null;
}

function KeyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/5 p-2.5">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="font-display text-lg font-semibold text-zinc-100">{value}</div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import type { Faction } from '../types';
import { factionInfo } from '../lib/factions';
import { unitsByFaction } from '../lib/units';
import { unitsLite } from '../data';
import { doctrinesForFaction } from '../data';
import FactionEmblem from './FactionEmblem';

interface Props {
  faction: Faction;
}

export default function FactionCard({ faction }: Props) {
  const info = factionInfo(faction);
  const list = unitsByFaction(unitsLite, faction);
  const infantry = list.filter((u) => u.category === 'Infantry').length;
  const vehicles = list.filter((u) => u.category === 'Vehicles').length;
  const team = list.filter((u) => u.category === 'Team weapons').length;
  const doctrineCount = doctrinesForFaction(faction).length;

  return (
    <Link
      to={`/nations/${faction}`}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-panel p-5 transition hover:-translate-y-0.5 hover:border-white/25"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px 200px at 50% 0%, ${info.color}22, transparent 70%)`,
        }}
      />
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-white/10"
          style={{ backgroundColor: `${info.color}22` }}
        >
          <FactionEmblem faction={faction} className="h-8 w-auto" />
        </span>
        <h2 className="font-display text-xl font-bold text-zinc-100">{info.name}</h2>
      </div>
      <div className="mt-4 flex gap-4 text-sm text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: info.color }} />
          {list.length} юнитов · {doctrineCount} доктрин
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
        {[
          ['Infantry', infantry],
          ['Team', team],
          ['Vehicles', vehicles],
        ].map(([label, count]) => (
          <div key={label as string} className="rounded-md bg-white/5 py-1.5">
            <div className="font-semibold text-zinc-200">{count}</div>
            <div className="text-zinc-500">{label}</div>
          </div>
        ))}
      </div>
    </Link>
  );
}

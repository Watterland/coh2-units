import { useParams, Link } from 'react-router-dom';
import UnitDetail from '../components/UnitDetail';
import NotFound from './NotFound';
import { loadFactionUnits, unitLiteByIndex, unitAvailability, unitRussianName } from '../data';
import { unitByIndex } from '../lib/units';
import { factionInfo } from '../lib/factions';
import { useEffect, useState } from 'react';
import { tUnit } from '../lib/translations';

export default function UnitPage() {
  const { index } = useParams();
  const idx = Number(index);
  const lite = unitLiteByIndex(idx);
  const [unit, setUnit] = useState<import('../types').Unit | null>(null);
  useEffect(() => {
    if (!lite) return;
    setUnit(null);
    loadFactionUnits(lite.faction).then((loaded) => setUnit(unitByIndex(loaded, idx) ?? null));
  }, [idx, lite?.faction]);
  if (Number.isNaN(idx) || !lite) return <NotFound />;
  if (!unit)
    return <div className="py-16 text-center text-zinc-500">Загружаем характеристики юнита...</div>;
  const info = factionInfo(unit.faction);
  const availability = unitAvailability(unit.index);
  const displayName = unitRussianName(unit.index) ?? tUnit(unit.name);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <Link to={`/nations/${unit.faction}`} className="hover:text-accent">
          {info.name}
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-200">{displayName}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {availability.kind === 'nation' ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            Юнит нации
          </span>
        ) : (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            Доктринный юнит
            {availability.doctrines.length > 0 && `: ${availability.doctrines.join(', ')}`}
          </span>
        )}
      </div>
      <Link
        to={`/compare/${unit.index}`}
        className="self-start rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition hover:bg-accent hover:text-[#151515]"
      >
        Сравнить с другим юнитом
      </Link>
      <UnitDetail unit={unit} />
    </div>
  );
}

import { useParams, Link } from 'react-router-dom';
import UnitDetail from '../components/UnitDetail';
import NotFound from './NotFound';
import { loadFactionUnits, unitLiteByIndex } from '../data';
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <Link to={`/nations/${unit.faction}`} className="hover:text-accent">
          {info.name}
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-200">{tUnit(unit.name)}</span>
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

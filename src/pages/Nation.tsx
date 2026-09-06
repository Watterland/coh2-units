import { Link, useParams, Navigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import UnitCard from '../components/UnitCard';
import FactionEmblem from '../components/FactionEmblem';
import { factionInfo, FACTIONS } from '../lib/factions';
import { unitsByFaction } from '../lib/units';
import { loadFactionUnits } from '../data';
import type { Faction } from '../types';
import { classifyUnit, DISPLAY_CATEGORIES } from '../lib/translations';

export default function Nation() {
  const { faction } = useParams();
  if (!faction || !FACTIONS.some((f) => f.id === faction)) {
    return <Navigate to="/" replace />;
  }
  const id = faction as Faction;
  const info = factionInfo(id);
  const [list, setList] = useState<import('../types').Unit[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    loadFactionUnits(id)
      .then((loaded) => setList(unitsByFaction(loaded, id)))
      .finally(() => setLoading(false));
  }, [id]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('index');
  const filtered = useMemo(
    () =>
      list
        .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : a.index - b.index)),
    [list, query, sort],
  );
  const filteredGrouped = new Map(
    DISPLAY_CATEGORIES.map((category) => [category, [] as import('../types').Unit[]]),
  );
  for (const unit of filtered) filteredGrouped.get(classifyUnit(unit))?.push(unit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-white/10"
            style={{ backgroundColor: `${info.color}22` }}
          >
            <FactionEmblem faction={id} className="h-9 w-auto" />
          </span>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500">Nation</div>
            <h1 className="font-display text-3xl font-bold text-zinc-100">{info.name}</h1>
          </div>
        </div>
        <Link
          to={`/nations/${id}/doctrines`}
          className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
        >
          Доктрины →
        </Link>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти юнит в этой нации..."
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-panel px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-accent/60 focus:outline-none"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-white/10 bg-panel px-3 py-2 text-sm text-zinc-300 focus:border-accent/60 focus:outline-none"
        >
          <option value="index">Порядок игры</option>
          <option value="name">По названию</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-panel p-10 text-center text-zinc-500">
          Загружаем архив фракции...
        </div>
      ) : (
        DISPLAY_CATEGORIES.map((cat) => {
          const items = filteredGrouped.get(cat) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-zinc-400">
                {cat}
                <span className="ml-2 text-sm font-normal text-zinc-600">({items.length})</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((u) => (
                  <UnitCard key={u.index} unit={u} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

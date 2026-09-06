import { useParams, Navigate, Link } from 'react-router-dom';
import { factionInfo, FACTIONS } from '../lib/factions';
import { doctrinesForFaction } from '../data';
import type { Faction } from '../types';
import { abilitySlug } from '../lib/ability';

export default function Doctrines() {
  const { faction } = useParams();
  if (!faction || !FACTIONS.some((f) => f.id === faction)) {
    return <Navigate to="/" replace />;
  }
  const id = faction as Faction;
  const info = factionInfo(id);
  const list = doctrinesForFaction(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link to={`/nations/${id}`} className="text-sm text-zinc-400 hover:text-accent">
          ← {info.name}
        </Link>
        <span className="text-zinc-600">/</span>
        <h1 className="font-display text-2xl font-bold text-zinc-100">Доктрины</h1>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-panel p-10 text-center text-zinc-400">
          Доктрины для этой нации ещё не загружены. Скрипт <code>tools/fetch-wiki.mjs</code>{' '}
          заполнит их автоматически из Company of Heroes Wiki.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {list.map((d) => (
            <div
              key={d.name}
              className="rounded-xl border border-white/10 bg-panel p-5 transition hover:border-white/25 hover:bg-panel-hover"
            >
              <h2 className="font-display text-lg font-semibold text-zinc-100">{d.name}</h2>
              {d.description && <p className="mt-1 text-sm text-zinc-400">{d.description}</p>}
              {d.abilities.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {d.abilities.map((a) => (
                    <li key={a.name} className="text-sm">
                      <span
                        className="flex items-center gap-2 font-medium"
                        style={{ color: info.color }}
                      >
                        {a.icon ? (
                          <img src={a.icon} alt="" className="h-7 w-7 rounded object-cover" />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded bg-white/5 text-xs text-zinc-500">
                            ◆
                          </span>
                        )}
                        <Link to={`/abilities/${abilitySlug(a.name)}`} className="hover:underline">{a.name}</Link>
                      </span>
                      {a.description && <span className="text-zinc-400"> — {a.description}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

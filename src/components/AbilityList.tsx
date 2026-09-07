import type { Ability } from '../types';
import { Link } from 'react-router-dom';
import { abilitySlug } from '../lib/ability';

interface Props {
  abilities: Ability[];
  color: string;
}

export default function AbilityList({ abilities, color }: Props) {
  if (abilities.length === 0) return null;

  return (
    <section className="rounded-xl border border-white/10 bg-panel p-5">
      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Способности
      </h2>
      <ul className="space-y-3">
        {abilities.map((a, i) => (
          <li
            key={`${a.name}-${i}`}
            className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                {a.icon ? (
                  <img
                    src={a.icon}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                    className="h-8 w-8 rounded border border-white/10 object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/10 bg-white/5 text-sm text-zinc-500">
                    ◈
                  </span>
                )}
                <Link to={`/abilities/${abilitySlug(a.name)}`} className="font-medium text-zinc-100 hover:underline" style={{ color }}>
                  {a.nameRu ?? a.name}
                </Link>
              </div>
              {a.cost && (
                <span className="text-xs text-zinc-500">
                  {a.cost.munitions != null && `Ⓜ${a.cost.munitions}`}
                  {a.cost.manpower != null && ` ᛗ${a.cost.manpower}`}
                  {a.cost.fuel != null && ` ⛽${a.cost.fuel}`}
                </span>
              )}
            </div>
            {a.availableIn && a.availableIn.length > 0 && (
              <p className="mt-1 text-xs text-amber-400/80">
                Доступно только в доктрине{a.availableIn.length > 1 ? 'х' : ''}:{' '}
                {a.availableIn.join(', ')}
              </p>
            )}
            {a.description && <p className="mt-1 text-sm text-zinc-400">{a.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

import { Link, Navigate, useParams } from 'react-router-dom';
import { abilityBySlug } from '../lib/ability';

function Cost({ cost }: { cost: { manpower?: number; munitions?: number; fuel?: number } }) {
  const values = [
    cost.munitions != null && `${cost.munitions} боеприпасов`,
    cost.manpower != null && `${cost.manpower} люд. ресурса`,
    cost.fuel != null && `${cost.fuel} топлива`,
  ].filter(Boolean);
  return <>{values.length ? values.join(' · ') : 'Бесплатно'}</>;
}

export default function AbilityPage() {
  const { slug } = useParams();
  const ability = slug ? abilityBySlug(slug) : undefined;
  if (!ability) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/" className="text-sm text-zinc-400 hover:text-accent">
        ← На главную
      </Link>
      <header className="rounded-xl border border-white/10 bg-panel p-6">
        <div className="flex items-start gap-4">
          {ability.icon ? (
            <img src={ability.icon} alt="" className="h-16 w-16 rounded-lg border border-white/10 object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 text-zinc-500">◈</span>
          )}
          <div>
            <p className="text-sm text-zinc-500">Способность</p>
            <h1 className="font-display text-2xl font-bold text-zinc-100">{ability.name}</h1>
            {ability.factions.length > 0 && <p className="mt-1 text-sm text-zinc-400">{ability.factions.join(' · ')}</p>}
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-white/10 bg-panel p-5">
        <h2 className="font-display text-lg font-semibold text-zinc-100">Эффект</h2>
        <p className="mt-2 text-zinc-300">
          {ability.description || 'Точное описание этой способности ещё не извлечено из игровых данных.'}
        </p>
      </section>

      <section className="rounded-xl border border-white/10 bg-panel p-5">
        <h2 className="font-display text-lg font-semibold text-zinc-100">Стоимость</h2>
        <p className="mt-2 text-zinc-300">
          {ability.cost ? <Cost cost={ability.cost} /> : 'Стоимость ещё не извлечена из игровых данных.'}
        </p>
      </section>

      <section className="rounded-xl border border-white/10 bg-panel p-5">
        <h2 className="font-display text-lg font-semibold text-zinc-100">Историческая справка</h2>
        <p className="mt-2 text-zinc-300">
          Игровая способность вдохновлена тактикой, вооружением или подразделениями Второй мировой войны. Проверенная историческая справка для этой записи будет добавлена отдельно.
        </p>
      </section>

      {(ability.units.length > 0 || ability.doctrines.length > 0) && (
        <section className="rounded-xl border border-white/10 bg-panel p-5">
          <h2 className="font-display text-lg font-semibold text-zinc-100">Где доступна</h2>
          {ability.units.length > 0 && (
            <p className="mt-2 text-zinc-300">
              Юниты:{' '}
              {ability.units.map((unit, index) => (
                <span key={unit.index}>
                  {index > 0 && ', '}
                  <Link to={`/units/${unit.index}`} className="text-accent hover:underline">{unit.name}</Link>
                </span>
              ))}
            </p>
          )}
          {ability.doctrines.length > 0 && <p className="mt-2 text-zinc-300">Доктрины: {ability.doctrines.join(', ')}</p>}
        </section>
      )}
    </div>
  );
}

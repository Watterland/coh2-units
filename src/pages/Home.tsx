import FactionCard from '../components/FactionCard';
import { FACTIONS } from '../lib/factions';

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="text-center">
        <h1 className="font-display text-4xl font-bold text-zinc-100 md:text-5xl">
          Company of Heroes <span className="text-accent">2</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
          Полный справочник юнитов: боевые характеристики, вооружение, ветеранство, способности и
          доктрины всех пяти наций.
        </p>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold uppercase tracking-wide text-zinc-400">
          Выберите нацию
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACTIONS.map((f) => (
            <FactionCard key={f.id} faction={f.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

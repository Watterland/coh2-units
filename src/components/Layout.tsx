import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FACTIONS } from '../lib/factions';
import { unitsLite } from '../data';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const results =
    query.trim().length < 2
      ? []
      : unitsLite
          .filter((unit) =>
            `${unit.name} ${unit.faction} ${unit.category}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .slice(0, 7);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setQuery('');
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0e0f12]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <Link
            to="/"
            className="shrink-0 flex items-center gap-2 font-display text-lg font-bold tracking-wide text-zinc-100"
          >
            <span className="flex h-8 w-8 items-center justify-center text-accent text-xl">✠</span>
            <span>
              COH2 <span className="text-accent">Units</span>
            </span>
          </Link>
          <div ref={searchRef} className="relative ml-auto hidden w-full max-w-xs lg:block">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск юнита..."
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-accent/60 focus:outline-none"
            />
            {results.length > 0 && (
              <div className="absolute top-full mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-[#181b20] shadow-2xl">
                {results.map((unit) => (
                  <button
                    key={unit.index}
                    onClick={() => {
                      navigate(`/units/${unit.index}`);
                      setQuery('');
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-white/5"
                  >
                    <span className="text-zinc-200">{unit.name}</span>
                    <span className="text-xs text-zinc-500">{unit.faction}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-accent'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                }`
              }
            >
              Сравнение
            </NavLink>
            {FACTIONS.map((f) => (
              <NavLink
                key={f.id}
                to={`/nations/${f.id}`}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/10 text-accent'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                  }`
                }
              >
                {f.short}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-auto rounded-md border border-white/10 p-2 text-zinc-300 md:hidden"
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0e0f12] px-4 py-3 md:hidden">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
              <NavLink
                onClick={() => setMenuOpen(false)}
                to="/compare"
                className="col-span-2 rounded-md bg-white/5 px-3 py-2 text-center text-sm text-zinc-300 hover:bg-white/10"
              >
                ⇄ Сравнение юнитов
              </NavLink>
              {FACTIONS.map((f) => (
                <NavLink
                  key={f.id}
                  onClick={() => setMenuOpen(false)}
                  to={`/nations/${f.id}`}
                  className="rounded-md bg-white/5 px-3 py-2 text-center text-sm text-zinc-300 hover:bg-white/10"
                >
                  {f.short} · {f.name}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-zinc-500">
        Stats from{' '}
        <a
          href="https://coh2.serealia.ca/"
          className="text-zinc-400 hover:text-accent"
          target="_blank"
          rel="noreferrer"
        >
          coh2.serealia.ca
        </a>{' '}
        · Images &amp; doctrines from Company of Heroes Wiki (Fandom)
      </footer>
    </div>
  );
}

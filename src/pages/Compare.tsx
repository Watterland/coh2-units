import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  abilitiesForUnit,
  loadFactionUnits,
  unitLiteByIndex,
  unitRussianName,
  unitsLite,
} from '../data';
import { abilitySlug } from '../lib/ability';
import { unitVetLevels } from '../lib/veterancy';
import { FACTIONS, factionInfo } from '../lib/factions';
import { fmtNearMidFar, round, vetBonuses, weaponDps } from '../lib/units';
import { classifyUnit, tUnit } from '../lib/translations';
import type { DisplayCategory } from '../lib/translations';
import type { Unit, Weapon } from '../types';
import { assetUrl } from '../lib/assets';

const NO_IMAGE = assetUrl('/units/no-image.svg');

// Presets resolved at runtime by English name: exact match wins, then substring.
function findLite(needle: string) {
  const lower = needle.toLowerCase();
  return (
    unitsLite.find((unit) => unit.name.toLowerCase() === lower) ??
    unitsLite.find((unit) => unit.name.toLowerCase().includes(lower))
  );
}

const PRESETS = [
  { label: 'Стрелки USF vs Гренадеры', a: 'Riflemen', b: 'Grenadiers' },
  { label: 'T-34 vs Panzer IV', a: 'T-34/76', b: 'Panzer IV' },
  { label: 'Миномёт USF vs GrW 34', a: '81mm Mortar', b: 'GrW 34' },
  { label: 'Pak 40 vs ЗиС-3', a: 'Pak 40', b: 'ZiS-3' },
];

interface MetricValue {
  text: string;
  num: number | null;
}

interface MetricDef {
  label: string;
  better: 'high' | 'low' | 'none';
  get: (unit: Unit) => MetricValue;
}

const stat = (value: number | null | undefined, digits: number): MetricValue => ({
  text: round(value, digits),
  num: value ?? null,
});

const mainWeapon = (unit: Unit): Weapon | undefined =>
  unit.mainWeaponIndex != null ? unit.weapons[unit.mainWeaponIndex] : undefined;

// weaponDps() renders "near / mid / far"; compare by the average of parsed numbers.
function avgDps(weapon: Weapon | undefined): number | null {
  if (!weapon) return null;
  const parts = weaponDps(weapon)
    .split('/')
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  return parts.length ? parts.reduce((sum, n) => sum + n, 0) / parts.length : null;
}

const METRICS: MetricDef[] = [
  { label: 'Цена: люди', better: 'low', get: (u) => stat(u.cost?.manpower, 0) },
  { label: 'Цена: муни', better: 'low', get: (u) => stat(u.cost?.munitions, 0) },
  { label: 'Цена: топливо', better: 'low', get: (u) => stat(u.cost?.fuel, 0) },
  { label: 'Здоровье', better: 'high', get: (u) => stat(u.vetStats[0]?.health, 0) },
  { label: 'Броня лоб', better: 'high', get: (u) => stat(u.vetStats[0]?.front_armor, 2) },
  { label: 'Броня корм', better: 'high', get: (u) => stat(u.vetStats[0]?.rear_armor, 2) },
  { label: 'Размер цели', better: 'low', get: (u) => stat(u.vetStats[0]?.target_size, 2) },
  { label: 'Скорость', better: 'high', get: (u) => stat(u.vetStats[0]?.speed, 1) },
  { label: 'Обзор', better: 'high', get: (u) => stat(u.vetStats[0]?.sight, 1) },
  { label: 'Население', better: 'low', get: (u) => stat(u.population, 0) },
  { label: 'Бойцы', better: 'none', get: (u) => stat(u.vetStats[0]?.num_entities, 0) },
  {
    label: 'УВС осн. оружия',
    better: 'high',
    get: (u) => {
      const weapon = mainWeapon(u);
      return { text: weaponDps(weapon ?? {}), num: avgDps(weapon) };
    },
  },
  {
    label: 'Дальность осн. оружия',
    better: 'high',
    get: (u) => {
      const range = mainWeapon(u)?.range;
      if (!range) return { text: '—', num: null };
      if ('max' in range) return { text: round(range.max, 0), num: range.max };
      return { text: fmtNearMidFar(range), num: range.far };
    },
  },
  {
    label: 'Ветеранство',
    better: 'high',
    get: (u) => {
      const levels = unitVetLevels(u);
      return { text: String(levels), num: levels };
    },
  },
];

export default function Compare() {
  const { first, second } = useParams();
  const navigate = useNavigate();
  const [firstUnit, setFirstUnit] = useState<Unit | null>(null);
  const [secondUnit, setSecondUnit] = useState<Unit | null>(null);
  const [firstLoading, setFirstLoading] = useState(false);
  const [secondLoading, setSecondLoading] = useState(false);

  const firstIndex = first === undefined ? null : Number(first);
  const secondIndex = second === undefined ? null : Number(second);
  const firstLite = firstIndex != null ? unitLiteByIndex(firstIndex) : undefined;
  const secondLite = secondIndex != null ? unitLiteByIndex(secondIndex) : undefined;

  useEffect(() => {
    const lite = firstIndex != null ? unitLiteByIndex(firstIndex) : undefined;
    if (!lite) {
      setFirstUnit(null);
      setFirstLoading(false);
      return;
    }
    let cancelled = false;
    setFirstLoading(true);
    loadFactionUnits(lite.faction)
      .then((units) => {
        if (!cancelled) setFirstUnit(units.find((unit) => unit.index === firstIndex) ?? null);
      })
      .finally(() => {
        if (!cancelled) setFirstLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [firstIndex]);

  useEffect(() => {
    const lite = secondIndex != null ? unitLiteByIndex(secondIndex) : undefined;
    if (!lite) {
      setSecondUnit(null);
      setSecondLoading(false);
      return;
    }
    let cancelled = false;
    setSecondLoading(true);
    loadFactionUnits(lite.faction)
      .then((units) => {
        if (!cancelled) setSecondUnit(units.find((unit) => unit.index === secondIndex) ?? null);
      })
      .finally(() => {
        if (!cancelled) setSecondLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [secondIndex]);

  const mismatch = !!(
    firstLite &&
    secondLite &&
    classifyUnit(firstLite) !== classifyUnit(secondLite)
  );
  const warnings: string[] = [];
  if (first != null && !firstLite) warnings.push('Юнит из ссылки не найден — выберите юнитов вручную.');
  if (second != null && !secondLite) warnings.push('Второй юнит из ссылки не найден.');
  if (mismatch) warnings.push('Можно сравнивать только юнитов одной боевой группы.');

  const pickFirst = (index: number) =>
    navigate(secondLite ? `/compare/${index}/${secondLite.index}` : `/compare/${index}`);
  const pickSecond = (index: number) =>
    navigate(firstLite ? `/compare/${firstLite.index}/${index}` : `/compare/${index}`);
  const swap = () => {
    if (firstLite && secondLite) navigate(`/compare/${secondLite.index}/${firstLite.index}`);
  };

  const secondShown = mismatch ? null : secondUnit;
  const extras = [firstUnit, secondShown].filter((unit): unit is Unit => unit !== null);

  const firstPlaceholder =
    firstLite || firstIndex == null ? 'Юнит не выбран.' : 'Юнит не найден — выберите другого.';
  const secondPlaceholder = mismatch
    ? `Нужен юнит группы «${firstLite ? classifyUnit(firstLite) : '—'}».`
    : secondLite || secondIndex == null
      ? 'Выберите второго юнита.'
      : 'Юнит не найден — выберите другого.';

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-zinc-100">Сравнение юнитов</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Выберите двух юнитов одной боевой группы — лучшее значение в каждой строке подсвечено.
        </p>
      </header>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {warnings.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <div>
          <div className="mb-1.5 text-xs uppercase tracking-widest text-zinc-500">Юнит 1</div>
          <UnitPicker
            label="Выберите первого юнита"
            value={firstLite?.index ?? null}
            otherClass={secondLite ? classifyUnit(secondLite) : null}
            onPick={pickFirst}
          />
        </div>
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={swap}
            disabled={!firstLite || !secondLite}
            title="Поменять местами"
            className="rounded-lg border border-white/10 bg-panel px-3 py-2 text-lg text-zinc-300 transition enabled:hover:border-accent/60 enabled:hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            ⇄
          </button>
        </div>
        <div>
          <div className="mb-1.5 text-xs uppercase tracking-widest text-zinc-500">Юнит 2</div>
          <UnitPicker
            label="Выберите второго юнита"
            value={secondLite?.index ?? null}
            otherClass={firstLite ? classifyUnit(firstLite) : null}
            onPick={pickSecond}
          />
        </div>
      </div>

      {(firstIndex != null || secondIndex != null) && (
        <CompareTable
          first={firstUnit}
          second={secondShown}
          firstLoading={firstLoading}
          secondLoading={secondLoading}
          firstPlaceholder={firstPlaceholder}
          secondPlaceholder={secondPlaceholder}
        />
      )}

      {secondLite == null && (
        <section>
          <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Типовые пары
          </h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(({ label, a, b }) => {
              const unitA = findLite(a);
              const unitB = findLite(b);
              if (!unitA || !unitB) return null;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(`/compare/${unitA.index}/${unitB.index}`)}
                  className="rounded-lg border border-white/10 bg-panel px-3 py-1.5 text-sm text-zinc-300 transition hover:border-accent/60 hover:text-zinc-100"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {extras.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {extras.map((unit) => (
            <UnitExtras key={unit.index} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}

function UnitPicker({
  label,
  value,
  otherClass,
  onPick,
}: {
  label: string;
  value: number | null;
  otherClass: DisplayCategory | null;
  onPick: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = value != null ? unitLiteByIndex(value) : undefined;
  const q = query.trim().toLowerCase();
  const pool = unitsLite
    .filter((unit) => !otherClass || classifyUnit(unit) === otherClass)
    .filter(
      (unit) =>
        !q || `${unitRussianName(unit.index) ?? ''} ${unit.name}`.toLowerCase().includes(q),
    )
    .sort((x, y) => x.index - y.index);
  const groups = FACTIONS.map((info) => ({
    info,
    units: pool.filter((unit) => unit.faction === info.id),
  })).filter((group) => group.units.length > 0);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setQuery('');
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
          current ? 'border-accent/40 text-zinc-100' : 'border-white/10 text-zinc-500'
        } hover:border-white/25 focus:border-accent/60 focus:outline-none`}
      >
        <span className="truncate">
          {current
            ? `${unitRussianName(current.index) ?? tUnit(current.name)} · ${factionInfo(current.faction).short}`
            : label}
        </span>
        <span className="text-xs text-zinc-600">▾</span>
      </button>
      {open && (
        <div className="absolute top-full z-20 mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-[#181b20] shadow-2xl">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по русскому или английскому имени…"
            className="w-full border-b border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
          <div className="max-h-80 overflow-y-auto">
            {groups.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-zinc-600">Ничего не найдено</p>
            )}
            {groups.map(({ info, units }) => (
              <div key={info.id}>
                <div
                  className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: info.color }}
                >
                  {info.name}
                </div>
                {units.map((unit) => (
                  <button
                    key={unit.index}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                      onPick(unit.index);
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-white/5 ${
                      unit.index === value ? 'bg-white/10 text-accent' : 'text-zinc-200'
                    }`}
                  >
                    <span className="truncate">
                      {unitRussianName(unit.index) ?? tUnit(unit.name)}
                    </span>
                    {unit.index === value && (
                      <span className="shrink-0 text-[10px] uppercase tracking-wide">выбран</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareTable({
  first,
  second,
  firstLoading,
  secondLoading,
  firstPlaceholder,
  secondPlaceholder,
}: {
  first: Unit | null;
  second: Unit | null;
  firstLoading: boolean;
  secondLoading: boolean;
  firstPlaceholder: string;
  secondPlaceholder: string;
}) {
  return (
    <section className="overflow-x-auto rounded-xl border border-white/10 bg-panel">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="w-32 p-3 text-left align-bottom text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Метрика
            </th>
            <th className="min-w-[240px] p-3 text-left align-bottom">
              {firstLoading ? (
                <SlotSkeleton />
              ) : first ? (
                <MiniCard unit={first} />
              ) : (
                <SlotNote text={firstPlaceholder} />
              )}
            </th>
            <th className="min-w-[240px] p-3 text-left align-bottom">
              {secondLoading ? (
                <SlotSkeleton />
              ) : second ? (
                <MiniCard unit={second} />
              ) : (
                <SlotNote text={secondPlaceholder} />
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {METRICS.map((def) => (
            <MetricRow key={def.label} def={def} a={first} b={second} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function MetricRow({ def, a, b }: { def: MetricDef; a: Unit | null; b: Unit | null }) {
  const va = a ? def.get(a) : null;
  const vb = b ? def.get(b) : null;
  const na = va?.num ?? null;
  const nb = vb?.num ?? null;
  let winner: 'a' | 'b' | null = null;
  let delta: number | null = null;
  if (def.better !== 'none' && na != null && nb != null && na !== nb) {
    const aWins = def.better === 'high' ? na > nb : na < nb;
    winner = aWins ? 'a' : 'b';
    delta = aWins ? na - nb : nb - na;
  }
  const cell = (value: MetricValue | null, isWinner: boolean, isLoser: boolean) => (
    <td className="px-3 py-2">
      <span
        className={
          isWinner ? 'font-medium text-emerald-400' : isLoser ? 'text-zinc-500' : 'text-zinc-200'
        }
      >
        {value?.text ?? '—'}
      </span>
      {isWinner && delta != null && (
        <span className="ml-1.5 text-[10px] text-emerald-400/70">
          {delta > 0 ? '+' : ''}
          {round(delta, 1)}
        </span>
      )}
    </td>
  );
  return (
    <tr className="border-b border-white/5 last:border-0">
      <th className="px-3 py-2 text-left align-top font-normal text-zinc-500">{def.label}</th>
      {cell(va, winner === 'a', winner === 'b')}
      {cell(vb, winner === 'b', winner === 'a')}
    </tr>
  );
}

function MiniCard({ unit }: { unit: Unit }) {
  const [src, setSrc] = useState(unit.imageUrl ?? NO_IMAGE);
  const info = factionInfo(unit.faction);
  return (
    <div className="flex items-center gap-3">
      <img
        src={src}
        onError={() => setSrc(NO_IMAGE)}
        alt=""
        className="h-16 w-16 shrink-0 rounded-lg border border-white/10 object-cover"
      />
      <div className="min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: info.color }}>
          {info.short}
        </span>
        <div className="truncate font-display text-sm font-bold text-zinc-100">
          {unitRussianName(unit.index) ?? tUnit(unit.name)}
        </div>
        <div className="text-xs text-zinc-500">{classifyUnit(unit)}</div>
        <Link to={`/units/${unit.index}`} className="text-xs text-accent hover:text-zinc-100">
          Открыть →
        </Link>
      </div>
    </div>
  );
}

function SlotSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3">
      <div className="h-16 w-16 rounded-lg bg-white/5" />
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-white/5" />
        <div className="h-3 w-20 rounded bg-white/5" />
      </div>
      <span className="ml-2 text-xs text-zinc-500">Загружаем архив фракции…</span>
    </div>
  );
}

function SlotNote({ text }: { text: string }) {
  return (
    <div className="flex min-h-[64px] items-center rounded-lg border border-dashed border-white/10 px-3 text-sm text-zinc-600">
      {text}
    </div>
  );
}

function UnitExtras({ unit }: { unit: Unit }) {
  const abilities = abilitiesForUnit(unit.index);
  const vetLevels = unit.vetStats.slice(1).filter(Boolean).length;
  const firstBonus = vetBonuses(unit, 1)[0];
  return (
    <section className="rounded-xl border border-white/10 bg-panel p-4">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-zinc-400">
        {unitRussianName(unit.index) ?? tUnit(unit.name)}
      </h3>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Способности
          </div>
          {abilities.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600">Нет данных</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {abilities.slice(0, 6).map((ability) => (
                <li key={ability.name}>
                  <Link
                    to={`/abilities/${abilitySlug(ability.name)}`}
                    className="flex items-center gap-2 text-sm text-zinc-300 transition hover:text-accent"
                  >
                    {ability.icon ? (
                      <img
                        src={ability.icon}
                        alt=""
                        className="h-6 w-6 shrink-0 rounded border border-white/10 object-cover"
                      />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/5 text-xs text-zinc-500">
                        ◈
                      </span>
                    )}
                    <span className="truncate">{ability.nameRu ?? ability.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Ветеранство
          </div>
          <p className="mt-2 text-sm text-zinc-300">
            {vetLevels > 0 ? `${vetLevels} ур. после базового` : 'Нет ветеранства'}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Vet 1: {firstBonus ?? 'нет данных'}</p>
          <Link
            to={`/units/${unit.index}`}
            className="mt-2 inline-block text-xs text-accent hover:text-zinc-100"
          >
            Полный разбор →
          </Link>
        </div>
      </div>
    </section>
  );
}

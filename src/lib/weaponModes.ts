import type { Unit, Weapon } from '../types';

export type WeaponModeKind =
  | 'barrage'
  | 'heavy_barrage'
  | 'light_barrage'
  | 'smoke'
  | 'white_phosphorous'
  | 'incendiary'
  | 'counter_barrage'
  | 'creeping_barrage'
  | 'precise'
  | 'delayed_fuse'
  | 'heat'
  | 'he_shell'
  | 'flares'
  | 'canister'
  | 'airburst'
  | 'direct_fire'
  | 'auto_fire'
  | 'hidden';

export interface WeaponModeInfo {
  kind: WeaponModeKind;
  label: string;
  hint?: string;
}

interface Rule {
  re: RegExp;
  kind: WeaponModeKind;
  label: string;
  hint?: string;
  guard?: RegExp;
}

// Порядок важен: от специфичных правил к общим.
const RULES: Rule[] = [
  {
    re: /dummy|disabled|no_fire|critical_shot|damage_engine_shot|shell_shock_shot|aimed_shot|vet\d|_vet(_|$)/,
    kind: 'hidden',
    label: 'Не используется',
    hint: 'Служебный ствол; улучшения от ветеранства показаны в блоке «Ветеранство»',
  },
  {
    re: /creeping/,
    kind: 'creeping_barrage',
    label: 'Ползучий заградогонь',
    hint: 'Доктринный залп с растянутой очередью по площади',
  },
  {
    re: /counter_barrage|counter_barr/,
    kind: 'counter_barrage',
    label: 'Контрбатарейный залп',
    hint: 'Ответный залп по обнаруженной стреляющей артиллерии',
  },
  { re: /heavy_barrage/, kind: 'heavy_barrage', label: 'Тяжёлый залп' },
  { re: /barrage_light_he|light_he/, kind: 'light_barrage', label: 'Лёгкий залп' },
  {
    re: /phosphor|_wp_|wp_shot|_wp$/,
    kind: 'white_phosphorous',
    label: 'Белый фосфор',
    hint: 'Дым плюс урон и ослепление по площади',
  },
  { re: /incendiary/, kind: 'incendiary', label: 'Зажигательный залп', hint: 'Поджигает площадь' },
  {
    re: /delayed_fuse|short_delay/,
    kind: 'delayed_fuse',
    label: 'Замедленный взрыватель',
    hint: 'Снаряд пробивает крышу техники/укрытия перед подрывом',
  },
  { re: /flare/, kind: 'flares', label: 'Осветительный заряд' },
  {
    re: /victortarget|victor_target|precise|precision/,
    kind: 'precise',
    label: 'Точная наводка',
    hint: 'Прицельный залп по видимой цели с повышенной точностью',
  },
  { re: /smoke/, kind: 'smoke', label: 'Дымовой залп', hint: 'Ставит дымовую завесу, урона нет' },
  { re: /canister/, kind: 'canister', label: 'Картечь', hint: 'Выстрел пучком пуль по пехоте в упор' },
  {
    re: /airburst/,
    kind: 'airburst',
    label: 'Воздушный разрыв',
    hint: 'Снаряды взрываются в воздухе, накрывая укрытия',
  },
  {
    re: /direct_fire/,
    kind: 'direct_fire',
    label: 'Прямой наводкой',
    hint: 'Стрельба настильным огнём по видимой цели',
  },
  { re: /heat/, kind: 'heat', label: 'Кумулятивный залп (HEAT)' },
  {
    re: /he_shell|he_barrage|10lb_he/,
    kind: 'he_shell',
    label: 'Осколочно-фугасный (HE)',
    guard: /barrage|shell/,
  },
  { re: /auto_attack|autocannon_barrage/, kind: 'auto_fire', label: 'Автоматический огонь' },
  { re: /barrage/, kind: 'barrage', label: 'Залп', hint: 'Серия выстрелов по указанной площади' },
];

export function weaponMode(name: string | null | undefined): WeaponModeInfo | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const rule of RULES) {
    if (!rule.re.test(lower)) continue;
    if (rule.guard && !rule.guard.test(lower)) continue;
    return { kind: rule.kind, label: rule.label, hint: rule.hint };
  }
  return null;
}

const TAIL_RE = /_(mp|sp|tow)$/;

// Составные суффиксы до простых — порядок в цикле не критичен, но так короче.
const MODE_SUFFIXES = [
  '_smoke_wp_shot',
  '_barrage_victor_target',
  '_white_phosphorous_barrage',
  '_white_phos_barrage',
  '_short_delay_barrage',
  '_delayed_fuse_barrage',
  '_barrage_light_he',
  '_barrage_smoke',
  '_smoke_barrage',
  '_creeping_barrage',
  '_counter_barrage',
  '_heavy_barrage',
  '_precision_rocket',
  '_victor_target',
  '_victortarget',
  '_auto_light_he',
  '_auto_attack',
  '_10lb_he',
  '_he_barrage',
  '_he_shell',
  '_wp_barrage',
  '_wp_shot',
  '_smoke_shot',
  '_flare_pistol',
  '_flare',
  '_phosphorus_rocket',
  '_canister_shot',
  '_canister',
  '_airburst',
  '_incendiary',
  '_direct_fire',
  '_flares',
  '_precision',
  '_precise',
  '_disabled',
  '_no_fire',
  '_dummy',
  '_vet_3',
  '_vet2',
  '_vet3',
  '_vet',
  '_heat',
  '_smoke',
  '_light_he',
  '_barrage',
];

export function baseWeaponKey(name: string): string {
  let key = name.toLowerCase().trim().replace(/\s+/g, '_');
  let changed = true;
  while (changed) {
    changed = false;
    if (TAIL_RE.test(key)) {
      key = key.replace(TAIL_RE, '');
      changed = true;
    }
    for (const suffix of MODE_SUFFIXES) {
      if (key.endsWith(suffix)) {
        key = key.slice(0, key.length - suffix.length);
        changed = true;
      }
    }
  }
  return key;
}

export interface WeaponModeEntry {
  weapon: Weapon;
  mode: WeaponModeInfo;
}

export interface WeaponGroup {
  base: Weapon;
  modes: WeaponModeEntry[];
  // Заполнено, если базовый ствол сам является режимным вариантом
  // (например ОФ-снаряд «Бульдозера» Шермана как основное орудие).
  baseMode?: WeaponModeInfo;
}

function sharedTokens(a: string[], b: string[]): number {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
}

// Какие режимы важнее, когда их больше трёх: дым показываем всегда,
// сверх него — не более двух ключевых способностей.
const MODE_PRIORITY: WeaponModeKind[] = [
  'barrage',
  'creeping_barrage',
  'precise',
  'incendiary',
  'counter_barrage',
  'delayed_fuse',
  'white_phosphorous',
  'heavy_barrage',
  'he_shell',
  'light_barrage',
  'heat',
  'direct_fire',
  'airburst',
  'canister',
  'auto_fire',
  'flares',
];

function priorityRank(kind: WeaponModeKind): number {
  const index = MODE_PRIORITY.indexOf(kind);
  return index < 0 ? MODE_PRIORITY.length : index;
}

function capModes(modes: WeaponModeEntry[]): WeaponModeEntry[] {
  if (modes.length <= 3) return modes;
  const smoke = modes.filter((entry) => entry.mode.kind === 'smoke');
  const rest = modes
    .filter((entry) => entry.mode.kind !== 'smoke')
    .sort((a, b) => priorityRank(a.mode.kind) - priorityRank(b.mode.kind))
    .slice(0, 2);
  return [...smoke, ...rest];
}

function isAbilityDelivered(weapon: Weapon): boolean {
  return weapon.hardpoint === -1 && weapon.count === -1;
}

// Личное оружие расчёта (винтовки, ПП экипажа) — не вооружение орудия.
export function isCrewSmallArm(name: string | null | undefined): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return /crew/.test(lower) && /rifle|smg|pistol|grease_gun|garand|mosin|kar_98|enfield/.test(lower);
}

export function groupWeapons(weapons: Weapon[], mainWeaponIndex?: number | null): WeaponGroup[] {
  const groups: WeaponGroup[] = [];
  const baseIndexes: number[] = [];
  const modes: WeaponModeEntry[] = [];
  const seen = new Set<string>();

  weapons.forEach((weapon, index) => {
    if (!weapon.name || isAbilityDelivered(weapon)) return;
    const mode = weaponMode(weapon.name);
    if (mode?.kind === 'hidden') return;
    const key = baseWeaponKey(weapon.name);
    const asMain = index === mainWeaponIndex;
    if (!mode || asMain) {
      if (seen.has(key)) return;
      seen.add(key);
      groups.push({ base: weapon, modes: [], ...(mode && asMain ? { baseMode: mode } : {}) });
      baseIndexes.push(index);
    } else {
      modes.push({ weapon, mode });
    }
  });

  for (const entry of modes) {
    const modeKey = baseWeaponKey(entry.weapon.name as string);
    const modeTokens = modeKey.split('_');
    let bestGroup = -1;
    let bestScore = 0;
    groups.forEach((group, gi) => {
      const score = sharedTokens(modeTokens, baseWeaponKey(group.base.name as string).split('_'));
      if (score > bestScore) {
        bestScore = score;
        bestGroup = gi;
      }
    });
    if (bestGroup < 0) {
      const mainGroup = mainWeaponIndex == null ? -1 : baseIndexes.indexOf(mainWeaponIndex);
      if (mainGroup >= 0) bestGroup = mainGroup;
      else {
        groups.push({ base: entry.weapon, modes: [], baseMode: entry.mode });
        continue;
      }
    }
    const group = groups[bestGroup];
    // Ветеранские наборы дублируют стволы с теми же режимами — оставляем первый.
    if (group.modes.some((existing) => existing.mode.kind === entry.mode.kind)) continue;
    if (
      group.baseMode &&
      group.baseMode.kind === entry.mode.kind &&
      baseWeaponKey(group.base.name as string) === modeKey
    )
      continue;
    group.modes.push(entry);
  }

  for (const group of groups) group.modes = capModes(group.modes);

  return groups;
}

const fmtNum = (n: number): string => String(Math.round(n * 100) / 100);

function field(
  weapon: Weapon,
  path: 'rangeMax' | 'damage' | 'cooldown' | 'radius' | 'accuracy',
): number | null {
  const record = weapon as unknown as Record<string, unknown>;
  if (path === 'rangeMax') {
    const range = record.range as { max?: number } | undefined;
    return typeof range?.max === 'number' ? range.max : null;
  }
  if (path === 'damage') {
    const damage = record.damage as { max?: number; near?: number } | undefined;
    if (typeof damage?.max === 'number') return damage.max;
    return typeof damage?.near === 'number' ? damage.near : null;
  }
  if (path === 'cooldown') {
    const cooldown = record.cooldown as { duration?: { max?: number } } | undefined;
    return typeof cooldown?.duration?.max === 'number' ? cooldown.duration.max : null;
  }
  if (path === 'radius') {
    const area = record.area_effect as { area_info?: { radius?: number } } | undefined;
    return typeof area?.area_info?.radius === 'number' ? area.area_info.radius : null;
  }
  const accuracy = record.accuracy as { near?: number; mid?: number; far?: number } | undefined;
  if (!accuracy) return null;
  const values = [accuracy.near, accuracy.mid, accuracy.far].filter(
    (v): v is number => typeof v === 'number',
  );
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

// Улучшения оружия от ветеранства: сравниваем вет-копию ствола с базовой
// (например 152mm_m-30_vet3_mp против 152mm_m-30_mp).
export function veteranWeaponBonuses(unit: Unit): Record<number, string[]> {
  const bases = new Map<string, Weapon>();
  for (const weapon of unit.weapons) {
    if (!weapon.name || weaponMode(weapon.name)) continue;
    const key = baseWeaponKey(weapon.name);
    // Берём первое вхождение: повторные копии в данных — уже улучшенные варианты.
    if (!bases.has(key)) bases.set(key, weapon);
  }

  const levels: Record<number, string[]> = {};
  const seenLevels = new Set<string>();
  for (const weapon of unit.weapons) {
    const name = weapon.name?.toLowerCase();
    const match = name?.match(/^(.+)_vet(?:_?(\d+))?(?:_mp|_sp|_tow)?$/);
    if (!name || !match) continue;
    const level = match[2] ? Number(match[2]) : 1;
    const baseKey = baseWeaponKey(name);
    const base = bases.get(baseKey);
    if (!base) continue;
    const seenKey = `${level}:${baseKey}`;
    if (seenLevels.has(seenKey)) continue;
    seenLevels.add(seenKey);

    const lines: string[] = [];
    const pairs: [string, number | null, number | null, string?][] = [
      ['Дальность', field(base, 'rangeMax'), field(weapon, 'rangeMax')],
      ['Урон', field(base, 'damage'), field(weapon, 'damage')],
      ['Перезарядка', field(base, 'cooldown'), field(weapon, 'cooldown'), 'с'],
      ['Радиус поражения', field(base, 'radius'), field(weapon, 'radius')],
    ];
    for (const [label, from, to, suffix] of pairs) {
      if (from == null || to == null || from === to) continue;
      lines.push(`${label} ${fmtNum(from)} → ${fmtNum(to)}${suffix ? ` ${suffix}` : ''}`);
    }
    const accFrom = field(base, 'accuracy');
    const accTo = field(weapon, 'accuracy');
    if (accFrom != null && accTo != null && accFrom > 0 && accFrom !== accTo) {
      lines.push(`Точность ×${fmtNum(accTo / accFrom)}`);
    }

    if (lines.length) levels[level] = [...(levels[level] ?? []), ...lines];
  }
  return levels;
}

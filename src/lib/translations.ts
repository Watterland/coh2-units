import type { Category, Unit, UnitLite } from '../types';

export type DisplayCategory = 'Пехота' | 'Расчёты' | 'Лёгкая техника' | 'САУ' | 'Танки';

export const DISPLAY_CATEGORIES: DisplayCategory[] = [
  'Пехота',
  'Расчёты',
  'Лёгкая техника',
  'САУ',
  'Танки',
];

export const UNIT_NAMES: Record<string, string> = {
  'Assault Engineer Squad': 'Штурмовые инженеры',
  Captain: 'Капитан',
  Lieutenant: 'Лейтенант',
  Major: 'Майор',
  Paratroopers: 'Парашютисты',
  Pathfinders: 'Следопыты',
  Rangers: 'Рейнджеры',
  'Rear Echelon Troops': 'Тыловой эшелон',
  Riflemen: 'Стрелки',
  Medics: 'Медики',
  'Vehicle Crew': 'Экипаж техники',
  Commandos: 'Коммандос',
  'Royal Engineers': 'Королевские инженеры',
  'Infantry Section': 'Пехотное отделение',
  Grenadiers: 'Гренадеры',
  Panzergrenadiers: 'Панцергренадеры',
  'Pioneer Squad': 'Пионеры',
  Sniper: 'Снайпер',
  Stormtroopers: 'Штурмовики',
  'Combat Engineer Squad': 'Боевые инженеры',
  'Conscript Infantry Squad': 'Отделение призывников',
  'Penal Battalion': 'Штрафной батальон',
  'Shock Troops': 'Ударные войска',
  Sturmpioneer: 'Штурмовые пионеры',
  'Sturmpioneer Squad': 'Штурмовые пионеры',
  Fallschirmjäger: 'Фальшермъегери',
  Obersoldaten: 'Оберсолдаты',
  Volksgrenadiers: 'Фольксгренадеры',
  'M1 57mm AT Gun': '57-мм противотанковая пушка M1',
  'M1 Pack Howitzer': '75-мм гаубица M1',
  'M1 81mm Mortar Team': 'Расчёт 81-мм миномёта M1',
  'M2HB .50 cal HMG Team': 'Расчёт пулемёта M2HB',
  'MG42 HMG Team': 'Расчёт пулемёта MG42',
  'GrW 34 Mortar Team': 'Расчёт миномёта GrW 34',
  'Pak 40 AT Gun': '75-мм противотанковая пушка Pak 40',
  'Pak 43 AT Gun': '88-мм противотанковая пушка Pak 43',
  'DShK 38 HMG': 'Расчёт ДШК 38',
  'M1910 Maxim HMG': 'Расчёт пулемёта Максим',
  'HM-38 Mortar Squad': 'Расчёт 120-мм миномёта ПМ-38',
  'PM-41 Mortar Squad': 'Расчёт 82-мм миномёта ПМ-41',
  'ZiS-3 Field Gun': '76-мм дивизионная пушка ЗиС-3',
  'M-42 AT Gun': '45-мм противотанковая пушка М-42',
  'WC51 Military Truck': 'Военный грузовик WC51',
  'M10 TD': 'Истребитель танков M10',
  'M20 Utility Car': 'Бронеавтомобиль M20',
  'M26 Pershing Heavy Tank': 'Тяжёлый танк M26 «Першинг»',
  "M36 'Jackson' Tank Destroyer": 'Истребитель танков M36 «Джексон»',
  'M15A1 AA Half-track': 'Зенитный полугусеничный M15A1',
  'M21 Mortar Half-track': 'Миномётный полугусеничный M21',
  'M3 Half-track': 'Полугусеничный бронетранспортёр M3',
  "Sherman 'Easy Eight'": 'Танк M4A3E8 «Шерман»',
  '105mm Bulldozer Sherman': '105-мм «Шерман» Bulldozer',
  '76mm Sherman': '76-мм «Шерман»',
  'M4A3 Sherman Medium Tank': 'Средний танк M4A3 «Шерман»',
  'M5A1 Stuart': 'Лёгкий танк M5A1 «Стюарт»',
  "M7B1 'Priest' Howitzer": 'САУ M7B1 «Прист»',
  'M8A1 Howitzer Motor Carriage': 'САУ M8A1',
  'M8 Greyhound': 'Бронеавтомобиль M8 «Грейхаунд»',
  'M4 Sherman Calliope': 'РСЗО M4 «Каллиопа»',
  'AEC Mk. III 75mm Armored Car': 'Бронеавтомобиль AEC Mk. III',
  'Churchill AVRE': 'Инженерный танк «Черчилль» AVRE',
  'Churchill Crocodile': 'Огнемётный танк «Черчилль Крокодайл»',
  'Churchill Mk. VII': 'Тяжёлый танк «Черчилль» Mk. VII',
  'Comet Tank': 'Средний танк «Комета»',
  'Cromwell Mk. IV Cruiser': 'Крейсерский танк «Кромвель»',
  'Sexton Self-Propelled Artillery': 'САУ «Секстон»',
  'Sherman Firefly': 'Танк «Шерман Файрфлай»',
  'Universal Carrier': 'Бронетранспортёр Universal Carrier',
  'Valentine Tank': 'Лёгкий танк «Валентайн»',
  Elefant: 'Истребитель танков «Элефант»',
  'Panther PzKpfw V': 'Средний танк «Пантера»',
  'Panzer IV': 'Средний танк Panzer IV',
  'Tiger PzKpfw VI': 'Тяжёлый танк «Тигр»',
  'IS-2 Heavy Tank': 'Тяжёлый танк ИС-2',
  'ISU-152 Assault Gun': 'САУ ИСУ-152',
  'BM-13 Katyusha': 'РСЗО БМ-13 «Катюша»',
  'KV-1 Heavy Tank': 'Тяжёлый танк КВ-1',
  'KV-2 Heavy Assault Tank': 'Тяжёлый танк КВ-2',
  'KV-8 Flamethrower Tank': 'Огнемётный танк КВ-8',
  'SU-76M': 'САУ СУ-76М',
  'SU-85 Tank Destroyer': 'Истребитель танков СУ-85',
  'T-70 Light Tank': 'Лёгкий танк Т-70',
  'T-34/76': 'Средний танк Т-34/76',
  'T-34/85': 'Средний танк Т-34/85',
  'Jagdpanzer IV/70 (V)': 'Истребитель танков Jagdpanzer IV/70',
  Jagdtiger: 'Истребитель танков «Ягдтигр»',
  "Tiger B 'Königstiger'": 'Тяжёлый танк «Королевский тигр»',
  Kübelwagen: 'Кубельваген',
  "Panzer II 'Luchs'": 'Лёгкий танк Panzer II «Лухс»',
  Sturmtiger: 'Штурмовой миномёт «Штурмтигр»',
};

export const ROLE_NAMES: Record<string, string> = {
  'Core Infantry': 'Основная пехота',
  'Elite Heavy Infantry': 'Элитная тяжёлая пехота',
  'Support Infantry': 'Пехота поддержки',
  'Medium Tank': 'Средний танк',
  'Heavy Tank': 'Тяжёлый танк',
  'Light Tank': 'Лёгкий танк',
  'Tank Destroyer': 'Истребитель танков',
  'Command Officer': 'Офицер командования',
  'Infantry Officer': 'Пехотный офицер',
  Artillery: 'Артиллерия',
  Reconnaissance: 'Разведка',
};

export const WEAPON_NAMES: Record<string, string> = {
  m10_m5_3inch_gun_mp: '76-мм пушка M5',
  m10_m5_3inch_ap_gun_mp: '76-мм бронебойная пушка M5',
  m36_m4_90mm_gun_mp: '90-мм пушка M4',
  m36_m4_90mm_ap_gun_mp: '90-мм бронебойная пушка M4',
  m26_m3_90mm_gun_mp: '90-мм пушка M3',
  pershing_coaxial_vehicle_turret_mp: 'Спаренный пулемёт',
  pershing_vehicle_hull_mp: 'Курсовой пулемёт',
  dodge_wc51_m2hb_50cal_mp: '12,7-мм пулемёт M2HB',
  m20_utility_car_m2hb_50cal_mounted_mp: '12,7-мм пулемёт M2HB',
  m1_81mm_mortar_mp: '81-мм миномёт M1',
  m3_halftrack_m2hb_50cal_mp: '12,7-мм пулемёт M2HB',
  halftrack_250_dummy: 'Служебный слот',
  m5a1_stuart_m6_37mm_mp: '37-мм пушка M6',
  m5a1_stuart_m1919a4_30_cal_coaxial_mp: '7,62-мм спаренный Browning M1919A4',
  m5a1_stuart_m1919a4_30_cal_hull_mp: '7,62-мм курсовой Browning M1919A4',
};

const ARTILLERY =
  /\b(M10|M36|Achilles|Priest|Sexton|M8A1|Calliope|Panzerwerfer|Katyusha|BM-13|ISU|SU-|Elefant|Jagd|StuG|Sturmpanzer|Sturmtiger)/i;
const TANKS =
  /\b(Pershing|Sherman|Churchill|Comet|Cromwell|Valentine|Panther|Panzer IV|Tiger|IS-2|KV-|T-34|Centaur|Flakpanzer)/i;

export function tUnit(name: string): string {
  return name === 'M4C Sherman' ? 'M4C Sherman' : name;
}
export function tRole(role?: string): string | undefined {
  return role;
}
export function tCategory(category: Category): string {
  return category === 'Infantry'
    ? 'Пехота'
    : category === 'Team weapons'
      ? 'Расчёты орудий и пулемётов'
      : 'Техника';
}
export function tWeapon(name: string | null): string {
  if (!name) return 'Неизвестное вооружение';
  const englishNames: Record<string, string> = {
    m10_m5_3inch_gun_mp: 'M5 3-inch Gun',
    m10_m5_3inch_ap_gun_mp: 'M5 3-inch AP Gun',
    m36_m4_90mm_gun_mp: 'M4 90mm Gun',
    m36_m4_90mm_ap_gun_mp: 'M4 90mm AP Gun',
    m26_m3_90mm_gun_mp: 'M3 90mm Gun',
    pershing_coaxial_vehicle_turret_mp: 'Coaxial Machine Gun',
    pershing_vehicle_hull_mp: 'Hull Machine Gun',
    dodge_wc51_m2hb_50cal_mp: 'Browning M2HB .50 cal',
    m20_utility_car_m2hb_50cal_mounted_mp: 'Browning M2HB .50 cal',
    m1_81mm_mortar_mp: 'M1 81mm Mortar',
    m3_halftrack_m2hb_50cal_mp: 'Browning M2HB .50 cal',
    m5a1_stuart_m6_37mm_mp: 'M6 37mm Gun',
    m5a1_stuart_m1919a4_30_cal_coaxial_mp: 'Coaxial Browning M1919A4 .30 cal',
    m5a1_stuart_m1919a4_30_cal_hull_mp: 'Hull Browning M1919A4 .30 cal',
  };
  if (englishNames[name]) return englishNames[name];
  const known: [RegExp, string][] = [
    [/m2hb|browning_50cal|50cal/, 'Browning M2HB .50 cal'],
    [/dshk/, 'DShK 38'],
    [/maxim|m1910/, 'Maxim M1910'],
    [/mg42/, 'MG42'],
    [/mg34/, 'MG34'],
    [/vickers/, 'Vickers MG'],
    [/bren/, 'Bren Gun'],
    [/dp28|dp_28/, 'DP-28'],
    [/thompson/, 'Thompson SMG'],
    [/ppsh/, 'PPSh-41'],
    [/mp40/, 'MP40'],
    [/stg44|mp44/, 'StG 44'],
    [/kar98|k98/, 'Karabiner 98k'],
    [/mosin/, 'Mosin-Nagant'],
    [/m1_garand|garand/, 'M1 Garand'],
    [/svt/, 'SVT-40'],
    [/m1919/, 'Browning M1919'],
    [/m1918|bar_/, 'BAR M1918'],
    [/flamethrower|flamer/, 'Flamethrower'],
    [/panzerschreck|rpzb/, 'Panzerschreck'],
    [/bazooka|zook/, 'Bazooka'],
    [/piat/, 'PIAT'],
    [/mortar/, 'Mortar'],
    [/howitzer/, 'Howitzer'],
    [/pak_?40/, 'Pak 40 75mm'],
    [/pak_?43/, 'Pak 43 88mm'],
    [/zis_?3/, 'ZiS-3 76mm'],
    [/rocket|katyusha|calliope|panzerwerfer/, 'Rocket Launcher'],
    [/coaxial/, 'Coaxial Machine Gun'],
    [/hull/, 'Hull Machine Gun'],
  ];
  const match = known.find(([pattern]) => pattern.test(name));
  if (match) return match[1];
  return name
    .replace(/_(mp|sp|upgrade|weapon)$/gi, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function classifyUnit(unit: Pick<Unit | UnitLite, 'category' | 'name'>): DisplayCategory {
  if (unit.category === 'Infantry') return 'Пехота';
  if (unit.category === 'Team weapons') return 'Расчёты';
  if (ARTILLERY.test(unit.name)) return 'САУ';
  if (TANKS.test(unit.name)) return 'Танки';
  return 'Лёгкая техника';
}

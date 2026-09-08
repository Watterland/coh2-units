import type { DoctrineAbility } from '../types';

type Text = Pick<DoctrineAbility, 'description'> & { extra?: string; nameRu?: string };

// Branch ids whose commander RGD carries no localization. Texts are curated
// against the ability's game behaviour.
export const doctrineAbilityTexts: Record<string, Text> = {
  improved_fortification: {
    nameRu: 'Улучшенные укрепления',    description: 'Инженерные отряды возводят огневые точки и укрепления быстрее и с меньшими затратами ресурсов.',
  },
  precision_barrage: {
    nameRu: 'Точный артналёт',    description: 'Артиллерийский налёт повышенной точности: снаряды ложатся плотнее к цели, уничтожая даже укреплённые позиции.',
  },
  assault_tommys: {
    nameRu: 'Штурмовая пехота',    description: 'Вызывает штурмовые пехотные секции, усиленные автоматическим оружием и гранатами для ближнего боя.',
    extra: 'Секции появляются в выбранной точке и готовы к немедленному штурму.',
  },
  straffing_run: {
    nameRu: 'Штурмовой обстрел',    description: 'Истребитель-бомбардировщик проходит над линией фронта, расстреливая пехоту и лёгкую технику из пушек и пулемётов.',
    extra: 'Особенно эффективно против открытых колонн и расчётов.',
  },
  m5_halftrack_brits: {
    nameRu: 'БТР M5',    description: 'Вызывает бронетранспортёр M5 для быстрой переброски пехоты и огневой поддержки.',
  },
  m10_achillies_deploy: {
    nameRu: 'Вызов M10 «Ахиллес»',    description: 'Вызывает истребитель танков M10 «Ахиллес» с 17-фунтовой пушкой, способной пробивать тяжёлую броню.',
  },
  mortar_81mm: {
    nameRu: '81-мм миномёт',    description: 'Вызывает расчёт 81-мм миномёта для поддержки пехоты навесным огнём.',
  },
  crew_repair: {
    nameRu: 'Ремонт экипажем',    description: 'Экипажи техники могут проводить полевой ремонт без отгона машины в тыл.',
  },
  land_mattress_dispatch: {
    nameRu: 'Вызов «Ленд Маттресс»',    description: 'Вызывает реактивную установку «Ленд Маттресс», накрывающую площадь залпом 32 снарядов.',
  },
  sexton_dispatch: {
    nameRu: 'Вызов «Секстона»',    description: 'Вызывает самоходную 25-фунтовую гаубицу «Секстон» для подвижной артиллерийской поддержки.',
  },
  overwatch: {
    nameRu: 'Перехват',    description: 'Орудия и миномёты переходят в режим перехвата: они автоматически открывают огонь по противнику, обнаруженному в заданной зоне.',
  },
  fire_support_operation: {
    nameRu: 'Огневая поддержка',    description: 'Пехотные секции получают усиленную огневую поддержку и координацию при штурме позиций.',
  },
  raid_tommys: {
    nameRu: 'Рейдовая пехота',    description: 'Вызывает рейдовую пехотную секцию, обученную скрытному проникновению и внезапным атакам.',
  },
  opel_blitz_dispatch: {
    nameRu: 'Вызов Opel Blitz',    description: 'Вызывает грузовик Opel Blitz: он доставляет ресурсы и служит передвижной точкой снабжения.',
  },
  flammpanzer_38t_hetzer: {
    nameRu: 'Вызов «Фаммпанцера»',    description: 'Вызывает огнемётный танк «Фаммпанцер 38(t)» — низкий, бронированный и смертоносный для гарнизонов.',
  },
  rocket_artillery_support: {
    nameRu: 'Ракетная артподдержка',    description: 'Ракетные установки наносят залп по обозначенному району, накрывая его огненным валом.',
  },
  for_the_father_land: {
    nameRu: 'За Отечество',    description: 'Пехота «Осткомандования» укрепляет захваченные территории: удержание точек становится заметно легче.',
  },
  tiger_tank_okw: {
    nameRu: 'Вызов «Тигра»',    description: 'Открывает вызов тяжёлого танка Tiger I для войск «Осткомандования».',
  },
  panzer_iv_j: {
    nameRu: 'Вызов Panzer IV J',    description: 'Вызывает средний танк Panzer IV Ausf. J — надёжную рабочую лошадку немецких танковых дивизий.',
  },
  infantry_veteran_squad_leader: {
    nameRu: 'Ветеран-командир',    description: 'Пехотные отряды получают опытного командира, повышающего их боевую эффективность.',
  },
  vehicle_crew_repairs: {
    nameRu: 'Полевой ремонт техники',    description: 'Экипажи бронетехники самостоятельно устраняют повреждения в полевых условиях.',
  },
  mobile_observation_251: {
    nameRu: 'Машина наблюдения SdKfz 250',    description: 'Вызывает полугусеничную машину наблюдения SdKfz 250: она расширяет обзор и вскрывает противника в тумане войны.',
  },
  breakthrough_equipment: {
    nameRu: 'Штурмовое снаряжение',    description: 'Панцергренадеры получают штурмовое снаряжение: улучшенное вооружение и принадлежности для прорыва обороны.',
  },
  air_drop_supply_run: {
    nameRu: 'Сброс снабжения',    description: 'Транспортный самолёт сбрасывает контейнер со снабжением в выбранную точку.',
  },
  weapon_crate_drop: {
    nameRu: 'Сброс вооружения',    description: 'Сбрасывает ящик с трофейным и штатным вооружением, которым можно перевооружить пехоту.',
  },
  guards_airbourne_troops: {
    nameRu: 'Гвардейцы-десантники',    description: 'Вызывает гвардейский воздушно-десантный отряд — отборную пехоту, высаживающуюся в глубине обороны.',
  },
  assault_guards: {
    nameRu: 'Штурмовая гвардия',    description: 'Вызывает штурмовые гвардейские отряды с автоматическим оружием для ближнего боя.',
  },
  shock_152mm_artillery: {
    nameRu: '152-мм артиллерия',    description: 'Вызывает тяжёлое 152-мм орудие: огонь прямой наводкой сокрушает укрепления и бронетехнику.',
  },
  zis_6_supply_truck: {
    nameRu: 'ЗИС-6 снабжения',    description: 'Вызывает грузовик ЗИС-6: он усиливает приток ресурсов с удерживаемых территорий.',
  },
  air_drop_resources_soviet_weapons: {
    nameRu: 'Сброс ресурсов и оружия',    description: 'Авиационный сброс доставляет ресурсы и вооружение для перевооружения пехоты.',
  },
  tank_hunter_ambush_tactics: {
    nameRu: 'Засада ПТО',    description: 'Противотанковые расчёты маскируются на позициях и наносят усиленный урон первым выстрелом.',
  },
  off_map_smoke_barrage: {
    nameRu: 'Дымовой налёт',    description: 'Артиллерийский налёт ставит дымовую завесу, скрывая манёвр войск от огня противника.',
  },
  ranger_dispatch: {
    nameRu: 'Вызов рейнджеров',    description: 'Вызывает отряд рейнджеров — тяжёлую штурмовую пехоту США.',
  },
  m83_cluster_mines: {
    nameRu: 'Кассетные мины M83',    description: 'Разбрасывает кассетные мины M83: каждая взрывается при приближении пехоты.',
  },
  m5_halftrack_group: {
    nameRu: 'Пара БТР M5',    description: 'Вызывает пару бронетранспортёров M5 для переброски и поддержки пехоты.',
  },
  recon_loiter: {
    nameRu: 'Разведывательное патрулирование',    description: 'Самолёт барражирует над районом, вскрывая передвижения противника в тумане войны.',
  },
  p47_stafe_attack: {
    nameRu: 'Штурмовая атака P-47',    description: 'Штурмовик P-47 «Тандерболт» атакует цель из восьми пулемётов, косит пехоту и лёгкую технику.',
  },
  t34_sherman_calliope_dispatch: {
    nameRu: 'Вызов «Каллиопы»',    description: 'Вызывает танк M4 «Каллиопа» с реактивной артиллерийской установкой залпового огня.',
  },
  sherman_assault_package: {
    nameRu: 'Штурмовой пакет «Шермана»',    description: 'Танки «Шерман» получают штурмовой пакет: усиленные орудия и дополнительное оборудование для боя в городе.',
  },
  riflemen_30_caliber_lmg: {
    nameRu: 'Ручной пулемёт стрелков',    description: 'Стрелковый отряд получает ручной пулемёт Browning M1919 для усиления огневой мощи.',
  },
  riflemen_flamethrower_unlock: {
    nameRu: 'Огнемёт для стрелков',    description: 'Открывает для стрелков огнемёт — страшное оружие против гарнизонов и укрытий.',
  },
  urban_assault_kit: {
    nameRu: 'Городской штурмовой набор',    description: 'Пехота получает городской штурмовой набор: гранаты, взрывчатку и снаряжение для зачистки зданий.',
  },
};

// Unit-level abilities whose RGD record has no localized help text.
export const unitAbilityTexts: Record<string, string> = {
  'Paratrooper Stationary Camouflage':
    'Десантники маскируются на позиции и остаются невидимыми, пока не переместятся или не откроют огонь.',
  'Pathfinder In Cover Stationary Camouflage':
    'Разведчики в укрытии маскируются и незаметно корректируют огонь по противнику.',
  'Pathfinder In Cover Stationary Camouflage Improved':
    'Улучшенная маскировка разведчиков в укрытии: обнаружить их почти невозможно.',
  'Commando Infiltration Camouflage':
    'Коммандос просачиваются сквозь позиции противника, оставаясь невидимыми вне боя.',
  'Brit Sniper Delayed Cover Auto Camouflage':
    'Снайпер автоматически маскируется в укрытии после выстрела.',
  'Partisan Sniper Delayed Cover Auto Camouflage':
    'Снайпер-партизан автоматически маскируется в укрытии после выстрела.',
  'Sniper Delayed Cover Auto Camouflage':
    'Снайпер автоматически маскируется в укрытии после выстрела.',
  'Axis Sniper Delayed Cover Auto Camouflage':
    'Снайпер автоматически маскируется в укрытии после выстрела.',
  'Partisan Delayed Cover Auto Camouflage':
    'Партизаны автоматически маскируются, находясь в укрытии без движения.',
  'Conscript In Cover Stationary Camouflage':
    'Призывники в укрытии маскируются и остаются незаметными до открытия огня.',
  'Falls Stationary Camouflage':
    'Фальширмъегеры маскируются на позиции и исчезают из поля зрения противника.',
  'Guards Camouflage':
    'Гвардейцы маскируются на месте, скрываясь от наблюдения противника.',
  'Armored Rifle Command':
    'Бронетранспортёр координирует действия приданной пехоты, повышая её эффективность.',
};

// Russian display names for squad abilities whose game records are not
// localized, keyed by the English list label.
export const abilityNameRu: Record<string, string> = {
  'Maintain Command Range': 'Держаться возле командира',
  'Victor Target': 'Целеуказание «Виктор»',
  '25 Pounder Artillery Barrage': 'Залп 25-фунтовых гаубиц',
  'Heroic Charge': 'Героическая атака',
  'Throw Grenade': 'Бросить гранату',
  'Fire-Up': 'Бегом марш!',
  'Throw Satchel Charge': 'Бросить подрывной заряд',
  'Upgrade to Barracks': 'Модернизировать до казарм',
  'Paratrooper Stationary Camouflage': 'Маскировка на позиции',
  'Pathfinder In Cover Stationary Camouflage': 'Маскировка в укрытии',
  'Pathfinder In Cover Stationary Camouflage Improved': 'Улучшенная маскировка в укрытии',
  'Commando Infiltration Camouflage': 'Скрытное проникновение',
  'Brit Sniper Delayed Cover Auto Camouflage': 'Автомаскировка снайпера',
  'Axis Sniper Delayed Cover Auto Camouflage': 'Автомаскировка снайпера',
  'Sniper Delayed Cover Auto Camouflage': 'Автомаскировка снайпера',
  'Partisan Delayed Cover Auto Camouflage': 'Автомаскировка партизан',
  'Conscript In Cover Stationary Camouflage': 'Маскировка новобранцев',
  'Falls Stationary Camouflage': 'Маскировка на позиции',
  'Guards Camouflage': 'Маскировка гвардии',
  'Stormtrooper In Cover Auto Camouflage': 'Автомаскировка штурмовиков',
  Repair: 'Ремонт',
  'Armor Piercing Shells': 'Бронебойные снаряды',
  '81mm Mortar Bombardment': 'Налёт 81-мм миномёта',
  'Incendiary Mortar Round': 'Зажигательная мина',
  'Incendiary Mortar Barrage': 'Зажигательный миномётный налёт',
  'Disable Free-Fire': 'Запрет свободного огня',
  'Smoke Barrage': 'Дымовой залп',
  'Combined Arms': 'Общевойсковое взаимодействие',
  Hulldown: 'За укрытием',
  'Rapid Maneuvers': 'Быстрый манёвр',
  'Emergency War Speed': 'Аварийный ход',
  'Fire Smoke Shell': 'Дымовой снаряд',
  'M89 White Phosphorous Shell': 'Белый фосфор M89',
  'Infantry Support Smoke': 'Дымовая завеса для пехоты',
  'Critical Shot': 'Точный выстрел',
  'Throw Molotov Cocktail': 'Коктейль Молотова',
  'RPG-43 Anti-Tank Grenade': 'Граната РПГ-43',
  'RPG-40 Anti-Tank Grenade Assault': 'Граната РПГ-40',
  'RGD-33 Anti-Personnel Grenade': 'Граната РГД-33',
  'RG-42 Anti-Personnel Grenade': 'Граната РГ-42',
  'RGD-1 Smoke Grenade': 'Дымовая граната РГД-1',
  'Satchel Charge': 'Подрывной заряд',
  'Aimed Satchel Charge': 'Прицельный подрывной заряд',
  'Fire Superiority': 'Огневое превосходство',
  'Firing Positions': 'Огневые позиции',
  'Button Vehicle': 'Заблокировать машину',
  'Prioritize Vehicles': 'Приоритет: техника',
  'Vehicle Tracking': 'Слежение за техникой',
  Tracking: 'Слежение',
  'Hold Fire': 'Не стрелять',
  'Sniper Hold Fire': 'Не стрелять',
  'Mortar Barrage': 'Миномётный налёт',
  'Fire Smoke Barrage': 'Дымовой миномётный залп',
  'Creeping Barrage': 'Подвижный заградительный огонь',
  'Creeping Smoke Barrage': 'Подвижная дымовая завеса',
  'Heavy Artillery Barrage': 'Тяжёлый артналёт',
  'Light Artillery Barrage': 'Лёгкий артналёт',
  'Rocket barrage': 'Реактивный залп',
  'Delayed Fuse': 'Замедленный взрыватель',
  Flare: 'Осветительная ракета',
  'Direct Fire': 'Стрельба прямой наводкой',
  'Smoke Screen': 'Дымовая завеса',
  'Main Gun: Load Armor Piercing': 'Зарядить бронебойный',
  'Main Gun: Load HVAP': 'Зарядить подкалиберный',
  'Load Armor Piercing': 'Зарядить бронебойный',
  'Load High Explosive Canister': 'Зарядить картечью',
  'Inspire Infantry': 'Воодушевление',
  'Anti-Tank Gun Ambush Tactics': 'Засада ПТО',
  Raid: 'Рейд',
  'Recon Loiter': 'Разведывательное патрулирование',
  'Secure Mode': 'Охрана',
  'Recon Mode': 'Режим разведки',
  'Crew Repair': 'Ремонт экипажем',
  'Riflemen Cavalry Covering Fire': 'Огневое прикрытие кавалерии',
  'Distribute Medical Supplies': 'Раздать медикаменты',
  'Not One Step Back': 'Ни шагу назад!',
  'Hold the Line': 'Держать рубеж',
  'Volley Fire': 'Залповый огонь',
  'Suppressing Fire': 'Подавляющий огонь',
  Sprint: 'Рывок',
  'Ambush Camouflage': 'Маскировка в засаде',
  'Model 24 Smoke Grenade': 'Дымовая граната M24',
  'Heat Grenade': 'Кумулятивная граната',
  Camouflage: 'Маскировка',
  'Reinforce Squad': 'Пополнить отряд',
  'Armored Rifle Command': 'Командование мотопехотой',
  'Fire Canister Round': 'Выстрел картечью',
  'Hull Down Position': 'Позиция за укрытием',
  Overdrive: 'Форсированный ход',
  'Priest 105mm Howitzer Barrage': 'Налёт 105-мм гаубицы «Приста»',
  '105mm Range Boost': 'Дальность 105-мм орудий',
  'Overwatch Priest Barrage': 'Артналёт по наводке',
  'Counter Battery': 'Контрбатарейная борьба',
  'Calliope Barrage': 'Залп «Каллиопы»',
  'Commando Demolition Charges': 'Подрывные заряды коммандос',
  'Concealing Smoke': 'Дымовая завеса',
  'Deploy Marksman': 'Выделить меткого стрелка',
  'Button Enemy Vehicle': 'Заблокировать машину противника',
  'Rifle Smoke Grenade': 'Дымовая граната',
  '20mm Strafing Fire': 'Обстрел из 20-мм автопушки',
  'Fire Petard Mortar Round': 'Выстрел мортирой Петар',
  'Tank Shock': 'Таранный удар',
  'Crew Self Defense': 'Самооборона экипажа',
  'Fire Panzerfaust': 'Выстрел из фаустпатрона',
  'Rifle Grenade Shot': 'Выстрел винтовочной гранатой',
  'Field First Aid': 'Полевая аптечка',
  'Model 24 Stun Grenade': 'Оглушающая граната M24',
  'Counter Barrage': 'Контрбатарейный налёт',
  'Artillery Smoke Barrage': 'Дымовой артналёт',
  'Concentrated Fire': 'Сосредоточенный огонь',
  'Coordinated Barrage': 'Скоординированный налёт',
  'Bundled Model 24 Grenades': 'Связка гранат M24',
  'Rudimentary Repair': 'Полевой ремонт',
  'Medical Kit': 'Медицинский набор',
  'Field Medical Kit': 'Полевой медицинский набор',
  'Salvage Wrecks': 'Разборка обломков',
  'Barbed Wire Cutters': 'Ножницы для колючей проволоки',
  'Battlefield Repair': 'Ремонт на поле боя',
  'Pioneer Antispam': 'Обезвреживание ловушек',
  'Target Weak Point': 'Поразить уязвимое место',
  'Bunker Busting Barrage': 'Налёт по укреплениям',
  'Blitzkrieg Tactics': 'Тактика блицкрига',
  'Panzer Tactician': 'Тактик-танкист',
  '15cm Rocket Barrage': 'Залп 15-см реактивных снарядов',
  'Low Angle 15cm Rocket Barrage': 'Настильный залп 15-см снарядов',
  'Mark Target': 'Обозначить цель',
  'Infantry Awareness': 'Заметка пехоты',
  'Oorah!': 'Ура!',
  'Hit the Dirt!': 'В землю!',
  Merge: 'Слить отряды',
  Barrage: 'Артналёт',
  'Fear Propaganda Artillery': 'Пропагандистский артобстрел',
  'Throw No.36 "Mills Bomb"': 'Бросить гранату №36 «Миллс»',
  'Fire Grenade': 'Огненная граната',
  'Medical Kit 2': 'Медицинский набор',
};

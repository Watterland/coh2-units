export interface AbilityHistory {
  text: string;
  source: string;
}

// Historical notes are added only when a reliable public source identifies
// the real-world weapon, vehicle, unit or operation behind the ability.
export const abilityHistory: Record<string, AbilityHistory> = {
  'Is-2 Support': {
    text: 'ИС-2 был советским тяжёлым танком, поступившим на вооружение в 1943 году. Его 122-мм орудие применялось для прорыва укреплённых рубежей и борьбы с бронетехникой.',
    source: 'https://www.tankmuseum.org/article/is-2',
  },
  'Isu152 Unlock': {
    text: 'ИСУ-152 являлась советской тяжёлой самоходной установкой на шасси танка ИС. 152-мм орудие-гаубица позволяло применять её против укреплений и бронетехники.',
    source: 'https://www.tankmuseum.org/article/isu-152',
  },
  'T34 85 Unlock': {
    text: 'Т-34-85 поступил на вооружение СССР в 1944 году. Новая трёхместная башня и 85-мм орудие усилили возможности семейства Т-34 против немецкой бронетехники того периода.',
    source: 'https://www.tankmuseum.org/article/t-34-85',
  },
  'Tiger Tank': {
    text: 'Tiger I был немецким тяжёлым танком, принятым на вооружение в 1942 году. Он был вооружён 88-мм пушкой KwK 36 и имел мощное для своего времени бронирование.',
    source: 'https://www.tankmuseum.org/article/tiger-i',
  },
  'Tiger Tank Ace': {
    text: 'Tiger I был немецким тяжёлым танком, принятым на вооружение в 1942 году. Он был вооружён 88-мм пушкой KwK 36 и имел мощное для своего времени бронирование.',
    source: 'https://www.tankmuseum.org/article/tiger-i',
  },
  'M26 Pershing Dispatch': {
    text: 'M26 Pershing был американским тяжёлым танком, поступившим в войска в последние месяцы Второй мировой войны. Машина имела 90-мм пушку и участвовала в боях в Европе в 1945 году.',
    source: 'https://www.tankmuseum.org/article/m26-pershing',
  },
  'Dshk Machinegun Paradrop': {
    text: 'ДШК был советским крупнокалиберным пулемётом калибра 12,7 мм. Его применяли против пехоты, лёгкой техники и низколетящих самолётов.',
    source: 'https://www.iwm.org.uk/collections/item/object/30022056',
  },
  'Pak 43 Emplacement': {
    text: 'Немецкая 88-мм Pak 43 была высокоскоростным противотанковым орудием Второй мировой войны и относилась к наиболее мощным немецким противотанковым средствам того периода.',
    source: 'https://www.tankmuseum.org/article/pak-43',
  },
};

// Ключ — ability id без суффиксов _mp/_sp/_tow, строчными. Источник — официальная русская локаль UCS.
//
// Аудит 33 отображаемых game-ability записей Soviet: 29 имеют официальные
// имя и описание в game-ability-details.ts. Четыре always_on способности с
// пустым ui_info (автомаскировка снайпера/партизан, маскировка новобранцев и
// гвардии) получают русские имена из doctrine-ability-texts.ts. Ручных
// переводов и пропусков UCS нет.
export const abilityRuSoviet: Record<string, { nameRu: string; descriptionRu?: string }> = {};

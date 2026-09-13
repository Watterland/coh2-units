// Ключ — ability id без суффиксов _mp/_sp/_tow, строчными. Источник — официальная русская локаль UCS.
//
// Аудит всех 43 отображаемых game-ability записей Ostheer: официальные имена и
// описания уже есть в game-ability-details.ts; always_on автомаскировка снайпера
// покрыта doctrine-ability-texts.ts. Ручных переводов и пропусков UCS нет.
export const abilityRuOstheer: Record<string, { nameRu: string; descriptionRu?: string }> = {};

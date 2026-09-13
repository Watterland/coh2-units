// Ключ — ability id без суффиксов _mp/_sp/_tow, строчными. Источник — официальная русская локаль UCS.
//
// Итог проверки (все 43 game-ability id юнитов OKW): русские имена/описания уже есть
// в src/data/game-ability-details.ts; для falls_stationary_camouflage_mp (в RGD ui_info
// пустой) имя и текст покрывает doctrine-ability-texts.ts:
//   abilityNameRu['Falls Stationary Camouflage'] = «Маскировка на позиции».
// Ручных переводов не требуется — карта намеренно пуста.
export const abilityRuOkw: Record<string, { nameRu: string; descriptionRu?: string }> = {};

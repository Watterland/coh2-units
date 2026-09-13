// Ключ — ability id без суффиксов _mp/_sp/_tow, строчными. Источник — официальная русская локаль UCS.
// Аудит British: русские имена есть у всех 24 уникальных game-ability id фракции —
// 22 уже в game-ability-details.ts (официальная локализация), 2 оставшихся
// («Commando Infiltration Camouflage» → «Скрытное проникновение», «Brit Sniper Delayed
// Cover Auto Camouflage» → «Автомаскировка снайпера») резолвятся через abilityNameRu
// в doctrine-ability-texts.ts. В UCS эти два файла-способности (always_on, пустой ui_info)
// локстроков не имеют, поэтому дублировать ручные переводы сюда не нужно.
export const abilityRuBritish: Record<string, { nameRu: string; descriptionRu?: string }> = {};

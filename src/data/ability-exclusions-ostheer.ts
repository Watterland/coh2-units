// unit.id → ability id (или нормализованное англ. имя wiki-способности: lowercase,
// только [a-z0-9]), которые не должны показываться юниту.
//
// Аудит всех 43 отображаемых game-ability записей Ostheer: каждая подтверждена
// в squad_ability_ext либо entity_ability_ext соответствующего RGD. Wiki-записей
// у фракции нет, поэтому исключения не требуются.
export const abilityExclusionsOstheer: Record<string, string[]> = {};

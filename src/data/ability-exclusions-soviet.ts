// unit.id → ability id (или нормализованное англ. имя wiki-способности: lowercase,
// только [a-z0-9]), которые не должны показываться юниту.
//
// Аудит 33 отображаемых game-ability записей Soviet: каждая подтверждена в
// squad_ability_ext или entity ability_ext соответствующего RGD. Ложных
// способностей в units.json/wiki для фракции нет.
export const abilityExclusionsSoviet: Record<string, string[]> = {};

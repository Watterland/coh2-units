// unit.id → ability id (или нормализованное англ. имя wiki-способности: lowercase,
// только [a-z0-9]), которые не должны показываться юниту.
//
// Все 17 game-ability записей USF подтверждены в squad_ability_ext. Исключения ниже
// относятся к ошибочным Wiki-записям CoH1: их нет в соответствующих USF RGD.
export const abilityExclusionsUsf: Record<string, string[]> = {
  captain_squad_mp: ['maintaincommandrange', 'victortarget', '25pounderartillerybarrage'],
  lieutenant_squad_mp: ['maintaincommandrange', 'heroiccharge', '25pounderartillerybarrage'],
  paratrooper_squad_mp: ['throwgrenade', 'fireup', 'upgradetobarracks'],
  ranger_squad_commander_mp: ['throwgrenade', 'fireup', 'upgradetobarracks'],
};

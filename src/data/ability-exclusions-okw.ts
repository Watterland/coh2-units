// unit.id → ability id (или нормализованное англ. имя wiki-способности: lowercase,
// только [a-z0-9]), которые не должны показываться юниту.
//
// Проверка: все game-ability id юнитов OKW (reference-units.md) подтверждены по RGD —
// каждый присутствует в squad_ability_ext отряда, поэтому сюда попадают только
// wiki-способности, которых нет в данных CoH2.
export const abilityExclusionsOkw: Record<string, string[]> = {
  // Wiki-скрейп принёс способности CoH1 («Blitzkrieg Tactics», «Prioritize Vehicles»,
  // «Panzer Tactician»): их нет ни в squad_ability_ext/entity_ability_ext «Пантеры»,
  // ни где-либо в attrib (panzer_tactician существует только как командирская
  // способность Ост-германии). Данные игры приоритетны — скрываем.
  panther_ausf_g_squad_mp: ['blitzkriegtactics', 'prioritizevehicles', 'panzertactician'],

  // «Infantry Awareness» — способность CoH1 разведмашины; у OKW SdKfz 221 в RGD её нет
  // (squad/entity ability_ext: экстренный ремонт, медпакет, дым, мина, локаут и т.д.).
  scout_car_sdkfz221_mp: ['infantryawareness', 'prioritizevehicles', 'panzertactician'],

  // CoH1-наследие скрейпа и для «Тигра» OKW: в CoH2 у него другие способности
  // (combat_blitz_tiger_mp, аура vet2, координированный залп, дым/полубашня на уровне entity).
  west_german_tiger_squad_mp: ['blitzkriegtactics', 'prioritizevehicles', 'panzertactician'],
};

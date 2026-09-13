# Ostheer

Статус: `[x]` DONE

## Оружие пехоты — `src/data/weapon-issue-ostheer.ts`
- [x] Все 12 пехотных юнитов фракции обработаны
- [x] Все 46 отображаемых записей «отряд/ствол» кроме основного имеют статус `base` / `upgrade` / `doctrine`
- [x] Для неоднозначных `doctrine`-стволов указаны русские доктрины через `{ issue, doctrines }`
- [x] Кросс-проверка с `units.json` / RGD выполнена

## Способности — `src/data/ability-exclusions-ostheer.ts`
- [x] Проверены все 34 юнита фракции по RGD (`squad_ability_ext` + entity/upgrade)
- [x] Все 43 отображаемые game-ability подтверждены; wiki-способностей и exclusions нет

## Переводы — `src/data/ability-ru-ostheer.ts`
- [x] Все 43 записи покрыты официальной UCS через `game-ability-details.ts`/`doctrine-ability-texts.ts`
- [x] Ручные переводы не потребовались

## Заметки и расхождения
- RGD squad/loadout/upgrade сверены для всех 12 infantry `units-ostheer.json`.
- Покрытие оружия: 15 `base`, 17 `upgrade`, 14 `doctrine` (46 записей «отряд/ствол», 23 разных id оружия).
- Противотанковая ружейная граната, G43 и MP44 используют явные доктрины: имя оружия не позволяет безопасно разрешить их автоматически.
- Неинтегрированные карты `ability-exclusions-ostheer.ts` и `ability-ru-ostheer.ts` намеренно пусты; их должен импортировать шаг 7 общего плана.

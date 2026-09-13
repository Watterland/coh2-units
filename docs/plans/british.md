# British

Статус: DONE

## Оружие пехоты — `src/data/weapon-issue-british.ts`
- [x] Все пехотные юниты фракции обработаны (11 из 11)
- [x] Каждый ствол кроме основного имеет статус `base` / `upgrade` / `doctrine` (52 уникальных ствола)
- [x] Для `doctrine`-стволов доктрины разрешаются (или указаны явно через `{ issue, doctrines }`) — доктринных стволов у British пехоты не найдено: 0
- [x] Кросс-проверка с `units.json` / `wiki.ts` выполнена

Итоги: base — 20, upgrade — 32, doctrine — 0.

Ключевые механики, вскрытые при аудите (подтверждены двумя независимыми местами данных):
- **Оружейные стойки**: Брен Mk.II и PIAT выдаются подбором у стойки при HQ (ebps `brit_weapon_rack_*`, слотовый подбор), требование — player-upgrade `weapon_rack_unlock_mp` («Разработка оружейных стоек», 100 зп + 10 топлива). Это тех., не доктрина → все такие стволы `upgrade`.
- **Виккерс K** — только squad-апгрейды: `vickers_k_lmg_mp` (рейдеры, 120 боеп.), `vickers_k_lmg_officer_1_mp` (офицер, 60 боеп.), `sappers_heavy_squad_mp`/`_recovery_` (тяжёлые сапёры, 60 боеп., рота «Наковальня»). Все без доктрины → `upgrade`.
- **Граната No.36M (Миллс)** — НЕ штатная: способность `tommy_mills_bomb_mp` требует player-upgrade `tommy_mills_bomb_mp` («Выдача гранат No.36M», 100 зп + 10 топлива) → `upgrade`.
- **Граната No.82 (тяжёлая)** — требует player-upgrade `company_hammer_mp` (выбор роты «Молот» в HQ, тех.) → `upgrade`.
- **Дымовая шашка / Координация огня** у пехотных отделений — требуют апгрейд «Пиротехника» (40 боеп.; требование в файле способности) → маркерный ствол `upgrade`.
- **ПТР Бойса** танко-охотничьего отделения — выдаётся на спавне авто-апгрейдом `tommy_boys_at_rifles` (squad_upgrade_apply_ext) → `base`.
- **Брен коммандос** — штатный пассив `elite_bren_guns` («Эксперты по тяжёлому вооружению», UCS 11168332) → `base`.

## Способности — `src/data/ability-exclusions-british.ts`
- [x] Все юниты фракции проверены по RGD (`squad_ability_ext` + апгрейды)
- [x] Ложные способности внесены в exclusions — **ложных нет** (пустая карта)

Итоги: проверено 35 game-ability ids на 14 юнитах (все юниты с id ≠ ∅; у остальных 17 юнитов game=0 и wiki=0). Все 35 id реально присутствуют в `squad_ability_ext` своих отрядов (проверено полным парсером таблиц RGD: у `parseRgd` из tools/lib теряются дублирующиеся ключи таблиц, из-за чего в `squad_ability_ext` томми видно только 1 способность из 8 — для аудита написан свой парсер в scratch). Wiki-способностей у British в `wiki.ts` нет (unitIndex отсутствуют).

## Переводы — `src/data/ability-ru-british.ts`
- [x] Русские имена/описания из UCS добавлены — **новых не требуется** (пустая карта)
- [x] Ручные переводы помечены `// manual` — ручных переводов нет

Итоги: все 24 уникальных game-ability id фракции уже имеют русские имена: 22 — в `game-ability-details.ts` (официальная локализация, с описаниями), 2 — резолвятся через `abilityNameRu` из `doctrine-ability-texts.ts` (`commando_infiltration_camouflage_mp`, `brit_sniper_delayed_cover_auto_camouflage_mp`). В UCS у этих двух файлов-способностей пустой `ui_info` (always_on-пассивы без локстроков) — официальных строк нет, дублировать ручные переводы не стал.

## Заметки и расхождения
1. **Артефакты serealia/units.json (данные игры приоритетны):**
   - `sapper_vickers_k_machine_gun_mp` числится у `tommy_squad_mp`, `air_support_officer_squad_mp`, `tommy_squad_raid_mp` — в игре этим отрядам недоступен (ствол тяжёлых сапёров; выдаётся только squad-апгрейдами, стоек с Виккерсом нет). Помечен `upgrade` с комментарием-артефактом; для UI честнее было бы скрыть.
   - `infantry_vickers_k_machine_gun_mp` у `sapper_squad_mp` (и `sapper_vickers` у recovery отсутствует) — это тот же ствол тяжёлых сапёров под другим именем модели; помечен `upgrade`.
   - У `tommy_squad_tank_hunter_mp` числится `tommy_officer_smoke_marker_grenade`, но требующий «Пиротехники» апгрейд отряду недоступен (в `squad_upgrade_ext` только «Набор PIAT») — ствол фактически мёртв; помечен `upgrade` с комментарием.
2. **Расхождение с ожиданием «штатные гранаты = base»**: у British гранаты отделений (No.36M, No.82) и дымовая шашка гейтятся исследованиями/апгрейдами → `upgrade`. Штатные (base) — только гранаты без требований: No.82 средняя (коммандос/офицер), ПТ-гранаты (сапёры/танк-хантеры), No.77 WP и дымы с vet1 (ветеранство — не покупка).
3. **Доктринных стволов у British пехоты нет** (проверено: ни одно имя ствола не матчится с 36 способностями 9 британских доктрин через `weaponDoctrineNames`; в `weaponDoctrineOverrides` British-стволов тоже нет).
4. Сомнительное, не внесено: способность `qf_25lb_coordinated_fire_order_officer_mp` у танко-охотничьего отделения присутствует в `squad_ability_ext`, но из-за недостижимого требования «Пиротехники» мертва (см. п.1) — оставлена, т.к. формально принадлежит отряду.
5. Прочее из RGD, не попавшее в game-abilities (фильтр регэкспа извлекателя), не проверялось на ложность — в списках нет: `blizzard_effect*`, `brit_medic_tommy_timed_area_heal_mp`, `tommy_cover_combat_bonus`, `officer_recon_sweep`, `commando_assassinate_mp`, `commando_demo_mp`, `tommy_tank_detection_mp`, `garrisoned_squad_facing*`, `brit_emplacement_braced_mp`, `tune_up_bonus_mp`, `observation_mode`, `elite_bren_guns`, `cover_smoke_grenades`, `sapper_emplacement_tear_down`.
6. Штурмовое отделение: апгрейд «Улучшение штурмового отделения» выдаёт Thompson (`paratrooper_thompson_mp`), но этого ствола нет в units.json — не классифицировался.

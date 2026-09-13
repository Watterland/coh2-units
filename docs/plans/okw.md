# OKW

Статус: **DONE** — `[x]` все блоки выполнены (см. «Заметки и расхождения» внизу).

## Оружие пехоты — `src/data/weapon-issue-okw.ts`
- [x] Все пехотные юниты фракции обработаны (7/7)
- [x] Каждый ствол кроме основного имеет статус `base` / `upgrade` / `doctrine` (31/31)
- [x] Для `doctrine`-стволов доктрины разрешаются (или указаны явно через `{ issue, doctrines }`)
- [x] Кросс-проверка с `units.json` / `wiki.ts` выполнена

Прогресс по блокам:
- [x] assault_pioneer_squad_mp, fallschirmjager_squad_mp, terror_officer_squad_mp
- [x] jaeger_light_infantry_recon_squad_mp, obersoldaten_squad_mp
- [x] panzerfusilier_squad_mp, volksgrenadier_squad_mp
- [x] техника (верхние пулемёты «Танковых командиров») — перепроверены и переведены на явный список доктрин

## Способности — `src/data/ability-exclusions-okw.ts`
- [x] Все юниты фракции проверены по RGD (`squad_ability_ext` + апгрейды) (32/32)
- [x] Ложные способности внесены в exclusions (9 wiki-записей CoH1 у 3 юнитов)

## Переводы — `src/data/ability-ru-okw.ts`
- [x] Русские имена/описания из UCS проверены
- [x] Ручные переводы помечены `// manual` — не потребовались

## Заметки и расхождения

Оружие (все статусы подтверждены минимум двумя источниками: sbps `squad_upgrade_ext` + требования в файлах upgrade/ + abilities/ebps):
- Итог по пехоте: 31 ствол — `base` 13, `upgrade` 8, `doctrine` 10.
- `volks_cqc_upgrade` (MP40 + дым + осколочная Model 24 у фольксгренадер) требует пассив `pyro_volks` доктрины «Огненный шторм» → всё, что выдаётся этим набором, помечено `doctrine` с явным списком.
- `waffen_bundled_assault_stielgranate` у оберсов — ИСПРАВЛЕНО на `base`: способность `waffen_elite_bundled_assault_grenade` («Связка гранат», 35 боеп.) лежит в `entity ability_ext` без единого доктринного требования. Ранее в файле стояло `doctrine` ошибочно.
- `jaeger_g43_rifle_mp`: автоподстановка по имени (и `weaponDoctrineOverrides`) даёт ост-германскую «Доктрину немецкой пехоты» — для OKW это ложь; указан явный список `['Доктрина прикрытия', 'Доктрина сбора трофеев']` (доктрины, вызывающие разведотряд). Расхождение в `doctrine-units.ts` вне моих файлов — на усмотрение интегратора.
- `fire_grenade_weapon_mp` (зажигательная граната фольксгренадер) — player-апгрейд `volk_fire_grenade`, который ставит SWS при появлении на поле (UCS: «Нужен бронетранспортер снабжения sWS»); классифицировано как `upgrade` (без доктрины), механика нестандартная — примечание.
- `stielgranate_grenade_mp`/`model_24_smoke_mp` фольксгренадер без доктринного набора CQC недоступны вовсе: у «фольксов» базово нет гранат — особенность фракции, не ошибка данных.
- Веховские записи (верхние MG42) перепроверены: апгрейды `*_top_gunner_*` требуют squad-апгрейд `tank_commander`, тот — пассив `tank_commander_unlock` («Элитная бронетехника»/«Большое наступление»); переведены на явную форму `{ issue, doctrines }`.

Способности:
- Все 43 game-ability id юнитов OKW присутствуют в `squad_ability_ext` отрядов напрямую — ложных среди game-id НЕТ.
- `usf_hold_fire_mp` у hetzer_squad_mp (и в entity-способностях пантеры/тигра/221): название вводит в заблуждение, но id реально есть в RGD отряда → оставлен (критерий a).
- Exclusions: только wiki-способности CoH1 у юнитов 151/162/163 («Blitzkrieg Tactics», «Prioritize Vehicles», «Panzer Tactician», «Infantry Awareness») — в attrib CoH2 их у этих юнитов нет (Blitzkrieg Tactics/Prioritize Vehicles не существуют вовсе; Panzer Tactician — командирка Ост-германии; Infantry Awareness — Ostheer scout car).
- Пробел генератора `game-abilities.ts` (вне моей зоны): реальные способности OKW не попали в списки id — `coordinated_barrage` (Hetzer/Королевский тигр/Пантера/PzIV J), `fallschirmjaeger_greande`, `infiltration_tactics_grenade`, `terror_officer_*`, `jagdtiger_128mm_supporting_fire`, `sturmtiger_380mm_*`, а также повсеместные `blizzard_effect` (сезонная арктическая способность на каждом отряде). Данные о них собраны, но не вносились — id отсутствуют в reference-units.md.

Переводы:
- Русские имена есть у всех 43 game-ability id: 42 — в `game-ability-details.ts`, `falls_stationary_camouflage_mp` (в RGD `ui_info` пустой) покрывается `doctrine-ability-texts.ts` → «Маскировка на позиции». Ручных переводов не потребовалось, `abilityRuOkw` пустая по факту проверки (задокументировано в файле).

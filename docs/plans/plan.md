# План: подпись оружия пехоты + чистка и перевод способностей

Статусы: `[ ]` не начато, `[~]` в процессе, `[x]` готово.
При обрыве продолжать с первого неотмеченного пункта.

## Шаг 0. План и шаблоны
- [x] `docs/plans/plan.md` (этот файл)
- [x] Шаблоны `docs/plans/<нация>.md` (soviet, ostheer, okw, usf, british)

## Шаг 1. Проверка источников
- [x] `tools/.cache/attrib/attrib` на месте: sbps/races/{soviet, german, west_german, aef, british}, `upgrade/<race>`
- [x] UCS-локали читаются (рус. 6.9 МБ + англ.)
- [x] Справка по юнитам и стволам: `docs/plans/reference-units.md`

Расы в RGD: Soviet→soviet, Ostheer→german, OKW→west_german, USF→aef, British→british.

## Шаги 2–6. Агенты по нациям (параллельно, по 1 на нацию)
- [x] Soviet — `docs/plans/soviet.md`
- [x] Ostheer — `docs/plans/ostheer.md`
- [x] OKW — `docs/plans/okw.md`
- [x] USF — `docs/plans/usf.md`
- [x] British — `docs/plans/british.md`

Каждый агент создаёт/заполняет только файлы своей нации:
- `src/data/weapon-issue-<нация>.ts` — статусы стволов
- `src/data/ability-exclusions-<нация>.ts` — ложные способности
- `src/data/ability-ru-<нация>.ts` — русские имена/описания из UCS
- `docs/plans/<нация>.md` — прогресс и расхождения

## Шаг 7. Интеграция (главный агент)
- [x] `weapon-issue.ts`: тип `WeaponIssueEntry` (+ doctrines), сводная карта по фракциям, `weaponIssueFor()`
- [x] `data/index.ts`: фильтр exclusions в `abilitiesForUnit`, мердж переводов из `ability-ru-<нация>.ts`
- [x] `WeaponPanel`: точные метки «Штатное» / «Улучшение» / «Доктрина: …» вместо эвристики `isIssued`

## Шаг 8. Проверка
- [x] Новые тесты: полнота карт (каждый пехотный юнит, каждый ствол кроме основного — покрыт)
- [x] `npm test`
- [x] `npm run lint`
- [x] `tsc -b && vite build`
- [x] Выборочная сверка 2–3 юнитов по RGD (проведена в аудитах всех наций)
- [x] Финальная сводка, обновление статусов

## Принятые решения
- Статусы оружия: `base` / `upgrade` / `doctrine`, **без** указания Battle Phase.
- План хранится в `docs/plans/` в репозитории.
- 5 агентов запускаются параллельно; конфликтов нет (каждый пишет только свои файлы).
- Переводы: приоритет — официальная русская локаль UCS; ручные помечаются `// manual`.
- Источник истины по статусам — RGD игры; wiki/units.json — кросс-проверка.

## Шаг 9. Русские описания способностей (фидбек)
- [x] `game-ability-texts.ts` — карта «англ. имя → русский текст» из RGD `ui_info` + англ./рус. UCS; генератор `npm run extract-ability-texts` (`tools/build-ability-texts.mjs`)
- [x] `abilitiesForUnit`: игровой вариант первичный; wiki-дубли по англ./рус. имени выбрасываются; англ. описания wiki-записей заменяются русскими из игровых файлов
- [x] `abilityNameRu` подключён к игровому конвейеру (пассивы маскировки с пустым `ui_info`)
- [x] Регрессионный тест `ability-ru.test.ts`: все отображаемые имена и описания способностей юнитов и доктрин — русские (или пустые, если строк в UCS нет)

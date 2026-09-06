# COH2 Units

Русскоязычный справочник боевых характеристик Company of Heroes 2.

## Запуск

```bash
npm install
npm run dev
```

Проверка production-сборки:

```bash
npm run build
```

## Источники данных

- Боевые характеристики: [coh2.serealia.ca](https://coh2.serealia.ca/)
- Иллюстрации, способности, доктрины, стоимость и требования: Company of Heroes Wiki (Fandom)

`src/data/units.json` содержит выгруженные боевые характеристики. `src/data/wiki.ts` создаётся автоматически и добавляет материалы Wiki.

## Обновление данных

Для повторного извлечения Serealia необходимы сохранённые HTML и JavaScript-файлы исходного сайта:

```bash
npm run extract -- /path/to/serealia_script.js /path/to/serealia.html
```

Затем обновите изображения, способности, доктрины и метаданные:

```bash
npm run fetch-wiki
npm run cache-wiki-assets
```

Скрипт Wiki делает запросы с паузой и выполняется несколько минут. `cache-wiki-assets` скачивает найденные изображения в `public/media`, чтобы просмотр сайта не зависел от CDN Fandom. Не редактируйте `src/data/wiki.ts` вручную.

## Игровые портреты

При локальной установке CoH2 можно использовать настоящие портреты из командной панели игры вместо Wiki-рендеров:

```bash
FFDEC_JAR=/path/to/ffdec.jar npm run extract-game-icons -- "/path/to/Company of Heroes 2"
```

Скрипт читает SGA-архивы, извлекает DDS-атласы и создаёт `public/game-icons`. Файлы игры не изменяются.

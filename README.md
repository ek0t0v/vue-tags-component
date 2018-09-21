# vue-tags-component

[![Latest Version on NPM](https://img.shields.io/npm/v/vue-tags-component.svg?style=flat-square)](https://npmjs.com/package/vue-tags-component)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![npm](https://img.shields.io/npm/dt/vue-tags-component.svg?style=flat-square)](https://www.npmjs.com/package/vue-tags-component)

## Фичи

- управление стрелками, а также клавишами enter/tab/backspace
- фильтрация тегов
- события
- tabindex

## Установка

С помощью npm:

```sh
$ npm install --save vue-tags-component
```

## Использование

Подключение компонента:

```js
import Vue from 'vue';
import { VueTags } from 'vue-tags-component';

Vue.component('vue-tags', VueTags);
```

Размещение в html-файле или другом компоненте:

```html
<vue-tags
    :active="activeTags"
    :all="allTags"
    :element-count-for-start-arrow-scrolling="3"
    :tab-index="1"
    @on-tag-added="onTagAdded"
    @on-tag-removed="onTagRemoved"
    @on-tag-list-opened="onTagListOpened"
    @on-tag-list-closed="onTagListClosed"
/>
```

Все возможные props и события указаны в примере выше. Передаваемые теги должны выглядеть так:

```json
[
    {
        "name": "Tag",
        "slug": "tag",
        "color": "#963dff"
    }
]
```

## TODO

- Закрытие выпадающего списка при клике вне компонента.
- Убирать из общего списка тегов уже добавленные теги. В поиске не находить уже добавленный тег.
- Сделать функционал создания нового тега, добавить событие создания тега. Сделать этот функционал опциональным (возможность включить через props).
- Валидация объектов тегов в props - тег должен содержать name, slug и color.
- Придумать удобный способ стилизации (переопределение стандартных стилей или какой-то другой способ).
- Адаптивность.
- Анимация.
- Плейсхолдер для поисковой строки (нужен ли?). Показ плейсхолдера только когда ни одного тега не выбрано.

## События

### onTagAdded

Вызывается при добавлении тега в список активных, передает объект тега.

### onTagRemoved

Вызывается при удалении тега из списка активных, передает объект тега.

### onTagListOpened

Вызывается при открытии списка тегов.

### onTagListClosed

Вызывается при закрытии списка тегов.
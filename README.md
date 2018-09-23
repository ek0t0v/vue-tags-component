# vue-tags-component

[![Latest Version on NPM](https://img.shields.io/npm/v/vue-tags-component.svg?style=flat-square)](https://npmjs.com/package/vue-tags-component)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![npm](https://img.shields.io/npm/dt/vue-tags-component.svg?style=flat-square)](https://www.npmjs.com/package/vue-tags-component)

The package contains a Vue.js component for adding and removing tags.

## Features

- keyboard control
- search
- events
- tabindex

## Installation

Install the package via npm:

```sh
$ npm install --save vue-tags-component
```

## Usage

The most common use case is to register the component globally:

```js
import Vue from 'vue';
import { VueTags } from 'vue-tags-component';

Vue.component('vue-tags', VueTags);
```

On your page you can now use html like this:

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

All props and events are indicated in the example above. Tags should look like this:

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

- Closing the drop-down list when clicking outside the component.
- Remove already added tags from the general list of tags. In the search, you can not find an already added tag.
- Make the functionality of creating a new tag, add a tag creation event. Make this functionality optional (the ability to enable via props).
- Validating tag objects in the prop, the tag must contain name, slug, and color.
- To think up a convenient way of styling (redefining standard styles or some other way).
- Adaptive layout.
- Animation.
- Placeholder for the search string (do you need?). Show the placeholder only when no tag is selected.

## Events

### onTagAdded

Called when the tag is added to the active list, it passes the tag object.

### onTagRemoved

Called when the tag is removed from the active list, it passes the tag object.

### onTagListOpened

Called when opening a list of tags.

### onTagListClosed

Called when the list of tags is closed.
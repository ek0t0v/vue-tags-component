<template>
    <div class="tags" ref="tags">
        <input
            class="hidden-input-for-tabindex"
            type="text"
            :tabindex="tabIndex"
            @focus="onTagSelect"
        />
        <div
            class="tags__shadow"
            v-bind:class="{ 'tags__shadow--tag-list-active': tagListActive }"
        >
            <div
                class="tags__active"
                @click="onTagSelect"
                v-bind:class="{ 'tags__active--tag-list-active': tagListActive }"
            >
                <div
                    class="tag"
                    v-for="(tag, index) in active"
                    :key="index"
                    :style="'background-color:' + (colorsEnabled && 'color' in tag ? tag.color : tagColorDefault)"
                >
                    <span class="tag__name">{{ tag.name }}</span>
                    <div
                        class="tag__remove-button"
                        v-if="tagListActive"
                        @click="removeTag(tag)"
                    >
                        <svg viewBox="0 0 8 8">
                            <polygon points="8 1.01818182 6.98181818 0 4 2.98181818 1.01818182 0 0 1.01818182 2.98181818 4 0 6.98181818 1.01818182 8 4 5.01818182 6.98181818 8 8 6.98181818 5.01818182 4"></polygon>
                        </svg>
                    </div>
                </div>
                <div class="tags__search-block">
                    <input
                        class="tags__search"
                        type="text"
                        v-if="tagListActive"
                        v-model="search"
                        tabindex="-1"
                    />
                </div>
            </div>
            <div
                class="tags__list"
                v-if="tagListActive"
            >
                <span>{{ tagListLabel }}</span>
                <div
                    class="tags__list-item"
                    v-for="(tag, index) in filteredList"
                    :key="index"
                    @click="addTag(index)"
                >
                    <span class="tags__create-tag-label" v-if="tagCreationEnabled && tag.id === 0">Create</span>
                    <div
                        class="tags__list-item-tag"
                        :style="'background-color:' + (colorsEnabled && 'color' in tag ? tag.color : tagColorDefault)"
                    >
                        <span>{{ tag.name }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'VueTags',
        props: {
            active: {
                type: Array,
                required: true,
            },
            all: {
                type: Array,
                required: true,
            },
            elementCountForStartArrowScrolling: {
                type: Number,
                required: false,
                default: 3,
                validator: value => value >= 1,
            },
            tabIndex: {
                type: Number,
                required: false,
                default: 1,
                validator: value => value > 0,
            },
            tagCreationEnabled: {
                type: Boolean,
                required: false,
                default: false,
            },
            colorsEnabled: {
                type: Boolean,
                required: false,
                default: false,
            },
            colors: {
                type: Array,
                required: false,
                default: () => [
                    '#0099ff',
                    '#4cca3c',
                    '#ff5460',
                    '#963dff',
                    '#FFB800',
                ],
            },
            tagColorDefault: {
                type: String,
                required: false,
                default: '#333',
            },
            tagListLabel: {
                type: String,
                required: false,
                default: 'Select an option',
            },
        },
        data() {
            return {
                tagListActive: false,
                search: '',
                currentTagFromList: null,
                tagListClass: 'tags__list',
                tagClass: 'tags__list-item',
                tagFocusedClass: 'tags__list-item--focused',
                tagListElementHeight: 34,
                newTagColor: null,
                searchInputClass: 'tags__search',
            };
        },
        mounted() {
            window.addEventListener('click', e => this.handleClickOutsideTagList(e));
        },
        updated() {
            if (this.search.length > 0) {
                this.currentTagFromList = 0;
            }

            if (this.tagCreationEnabled && this.search.length === 0) {
                this.newTagColor = null;
            }

            this.updateSelection();
        },
        computed: {
            filteredList() {
                let list = this.all.filter(tag => tag.name.toLowerCase().indexOf(this.search.toLowerCase()) >= 0);

                if (this.tagCreationEnabled && this.search.length > 0 && list.every(item => item.name !== this.search)) {
                    if (!this.newTagColor) {
                        this.newTagColor = this.getColorForNewTag();
                    }

                    list.push({
                        id: 0,
                        name: this.search,
                        slug: this.search,
                        color: this.newTagColor,
                    });
                }

                return list;
            },
        },
        methods: {
            onTagSelect(e) {
                setTimeout(() => document.querySelector('.' + this.searchInputClass).focus(), 100);
                e.stopPropagation();

                if (!this.tagListActive) {
                    this.$emit('on-tag-list-opened');
                    this.tagListActive = true;
                }

                document.onmouseover = () => {
                    document.querySelectorAll('.' + this.tagClass).forEach((item, i) => {
                        item.addEventListener('mouseover', () => this.currentTagFromList = i);
                    });

                    this.updateSelection();
                };

                document.onkeydown = e => {
                    switch (e.keyCode) {
                        case 13:
                            this.handleEnterKey();

                            break;
                        case 8:
                            this.handleBackspaceKey();

                            break;
                        case 9:
                            this.handleTabKey();

                            break;
                        case 38:
                            this.handleUpKey();
                            this.updateSelection();

                            break;
                        case 40:
                            this.handleDownKey();
                            this.updateSelection();

                            break;
                    }
                };
            },
            addTag(index) {
                if (this.tagSelected(index)) {
                    return;
                }

                this.tagCreationEnabled
                    ? this.$emit(this.filteredList[index].id === 0 ? 'on-tag-created' : 'on-tag-added', this.filteredList[index])
                    : this.$emit('on-tag-added', this.filteredList[index]);

                if (this.tagCreationEnabled && this.search.length > 0) {
                    this.newTagColor = null;
                }

                this.search = '';
            },
            removeTag(tag) {
                this.$emit('on-tag-removed', tag);
            },
            tagSelected(index) {
                return this.active.some(element => element.slug === this.filteredList[index].slug);
            },
            handleEnterKey() {
                if (!this.tagSelected(this.currentTagFromList)) {
                    this.addTag(this.currentTagFromList);
                }
            },
            handleTabKey() {
                if (this.tagListActive) {
                    this.tagListActive = false;
                    this.currentTagFromList = null;
                    this.search = '';
                }
            },
            handleBackspaceKey() {
                if (this.search.length === 1) {
                    this.currentTagFromList = null;
                }

                if (this.search.length < 1 && this.active.length > 0) {
                    this.removeTag(this.active.length - 1);
                }
            },
            handleUpKey() {
                let tagList = document.querySelector('.' + this.tagListClass);

                if (this.currentTagFromList === null || this.currentTagFromList <= 0) {
                    this.currentTagFromList = this.filteredList.length - 1;
                    tagList.scrollTo(0, this.getScrollHeight());
                } else if (this.currentTagFromList > 0) {
                    this.currentTagFromList--;
                }

                if (this.filteredList.length - this.currentTagFromList > this.elementCountForStartArrowScrolling) {
                    tagList.scrollBy(0, -1 * this.tagListElementHeight);
                }
            },
            handleDownKey() {
                let tagList = document.querySelector('.' + this.tagListClass);

                if (this.currentTagFromList === null || this.currentTagFromList === this.filteredList.length - 1) {
                    this.currentTagFromList = 0;
                    tagList.scrollTo(0, 0);
                } else if (this.currentTagFromList >= 0 && this.currentTagFromList < this.filteredList.length - 1) {
                    this.currentTagFromList++;
                }

                if (this.currentTagFromList > this.elementCountForStartArrowScrolling - 1) {
                    tagList.scrollBy(0, this.tagListElementHeight);
                }
            },
            handleClickOutsideTagList(e) {
                if (e.target.closest('.tags__list')) {
                    return;
                }

                this.$emit('on-tag-list-closed');

                document.onkeydown = null;
                this.tagListActive = false;
                this.currentTagFromList = null;
                this.search = '';
            },
            updateSelection() {
                document.querySelectorAll('.' + this.tagClass).forEach((item, i) => {
                    i === this.currentTagFromList
                        ? item.classList.add(this.tagFocusedClass)
                        : item.classList.remove(this.tagFocusedClass);
                });
            },
            getColorForNewTag() {
                if (!this.tagCreationEnabled) {
                    return;
                }

                return this.colorsEnabled
                    ? this.colors[Math.floor(Math.random() * this.colors.length)]
                    : this.tagColorDefault;
            },
            getScrollHeight() {
                return Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                );
            },
        },
    };
</script>

<style lang="less" scoped>
    .flex(@direction, @wrap, @justify-content, @align-items) {
        display: flex;
        flex-flow: @direction @wrap;
        justify-content: @justify-content;
        align-items: @align-items;
    }

    .font(@font, @size, @weight, @color) {
        font-family: @font, Helvetica, sans-serif;
        font-size: @size;
        font-weight: @weight;
        color: @color;
    }

    @primary-font: 'Source Sans Pro';

    .hidden-input-for-tabindex {
        width: 0;
        height: 0;
    }

    .tags {

        position: relative;
        width: 400px;
        height: 40px;

        &--active {
            box-shadow: 0 4px 16px rgba(0,0,0,.1);
        }

        &__active {

            .flex(row, wrap, flex-start, flex-start);
            min-height: calc(40px - 12px);
            padding: 7px 7px 3px 7px;
            background-color: #fff;
            border-radius: 3px;
            border: 1px solid #cfcfcf;
            position: relative;
            z-index: 1;

            &--tag-list-active {
                border-radius: 3px 3px 0 0;
            }

        }

        &__search-block {
            width: auto;
            margin: 0 0 0 -7px;
            display: flex;
            align-items: center;
            flex: 1 1 60px;
            min-width: 72px;
        }

        &__search {

            width: 100%;
            font-size: 13px;
            margin: 0;
            height: 24px;
            resize: none;
            size: 1;

            &:only-child {
                margin: 0 0 4px 7px;
            }

        }

        &__list {

            .flex(column, nowrap, flex-start, flex-start);
            width: calc(100% - 2px);
            padding: 7px 0;
            border: 1px solid #cfcfcf;
            border-top: none;
            border-radius: 0 0 3px 3px;
            background-color: #f5f5f5;

            span {
                color: #aaa;
                font-size: 12px;
                margin: 0 0 3px 7px;
            }

        }

        &__list-item {

            .flex(row, nowrap, flex-start, flex-start);
            width: calc(100% - 14px);
            min-height: 24px;
            padding: 5px 7px;
            cursor: pointer;

            &--focused {
                background-color: rgba(0, 0, 0, .06);
            }

        }

        &__list-item-tag {

            .flex(row, nowrap, flex-start, center);
            height: 24px;
            margin: 0 4px 4px 0;
            border-radius: 3px;
            padding: 0 10px 0 8px;
            background-color: #aaa;

            span {
                .font(@primary-font, 13px, 600, #fff);
                margin: 0 0 1px 0;
            }

            &:last-child {
                margin: 0;
            }

        }

        &__create-tag-label {
            margin: 0 7px 0 0 !important;
            line-height: 24px;
        }

        &__shadow {

            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
            border-radius: 3px;

            &--tag-list-active {
                box-shadow: 0 4px 24px rgba(0,0,0,.25);
            }

        }

    }

    .tag {

        .flex(row, nowrap, flex-start, center);
        height: 24px;
        margin: 0 4px 4px 0;
        border-radius: 3px;
        padding: 0 9px 0 8px;
        background-color: #aaa;

        &__name {
            .font(@primary-font, 13px, 600, #fff);
            margin: 0 0 1px 0;
        }

        &__remove-button {

            width: 24px;
            height: 24px;
            margin: 0 -9px 0 0;
            align-items: center;
            user-select: none;
            display: inline-flex;
            flex-grow: 0;
            flex-shrink: 0;
            justify-content: center;
            border-radius: 0 3px 3px 0;
            cursor: pointer;

            &:hover > svg {
                opacity: 1;
            }

            svg {
                width: 8px;
                height: 8px;
                display: block;
                fill: #fff;
                flex-shrink: 0;
                opacity: .5;
                transition: opacity .2s ease-in-out 0s;
            }

        }

    }
</style>
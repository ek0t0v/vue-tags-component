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
                    :style="'background-color:' + tag.color"
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
                        ref="search"
                        tabindex="-1"
                    />
                </div>
            </div>
            <div
                class="tags__list"
                v-if="tagListActive"
                ref="list"
            >
                <span>Select an option or create one</span>
                <div
                    class="tags__list-item"
                    v-for="(tag, index) in filteredList"
                    :key="index"
                    @click="addTag(index)"
                >
                    <div
                        class="tags__list-item-tag"
                        :style="'background-color:' + tag.color"
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
        },
        data() {
            return {
                tagListActive: false,
                search: '',
                currentTagFromList: null,
                tagClass: 'tags__list-item',
                tagFocusedClass: 'tags__list-item--focused',
                tagListElementHeight: 34,
            };
        },
        mounted() {
            let self = this;

            window.addEventListener('click', () => {
                self.$emit('on-tag-list-closed');

                document.onkeydown = null;
                self.tagListActive = false;
                self.currentTagFromList = null;
                self.search = '';
            });
        },
        computed: {
            filteredList() {
                this.currentTagFromList = null;

                let items = document.querySelectorAll('.' + this.tagClass);

                items.forEach(item => item.classList.remove(this.tagFocusedClass));

                return this.all.filter(tag => tag.name.toLowerCase().indexOf(this.search.toLowerCase()) >= 0);
            },
        },
        methods: {
            onTagSelect(e) {
                let self = this;

                setTimeout(() => self.$refs.search.focus(), 100);
                e.stopPropagation();

                if (!this.tagListActive) {
                    this.$emit('on-tag-list-opened');
                    this.tagListActive = true;
                }

                document.onmouseover = () => {
                    let items = document.querySelectorAll('.' + self.tagClass);

                    items.forEach((item, i) => {
                        item.addEventListener('mouseover', e => {
                            items.forEach(item => item.classList.remove(self.tagFocusedClass));
                            self.currentTagFromList = i;
                            e.currentTarget.classList.add(self.tagFocusedClass);
                        });
                    });
                };

                document.onkeydown = e => {
                    let items = document.querySelectorAll('.' + self.tagClass);

                    switch (e.keyCode) {
                        case 13: // enter
                            if (!self.tagSelected(self.currentTagFromList)) {
                                self.addTag(self.currentTagFromList);
                                self.search = '';
                            }

                            break;
                        case 8: // backspace
                            if (self.$refs.search.value.length < 1) {
                                // тут стоит возвращать сам тег - сейчас логика основана на том, что backspace
                                // удаляет теги по очереди с конца
                                if (self.active.length > 0) {
                                    self.removeTag(self.active.length - 1);
                                }
                            }

                            break;
                        case 9: // tab
                            if (self.tagListActive) {
                                self.tagListActive = false;
                                self.currentTagFromList = null;
                                self.search = '';
                            }

                            break;
                        case 38: // up
                            if (self.currentTagFromList === null || self.currentTagFromList <= 0) {
                                self.currentTagFromList = self.filteredList.length - 1;
                                self.$refs.list.scrollTo(0, self.getScrollHeight());
                            } else if (self.currentTagFromList > 0) {
                                self.currentTagFromList--;
                            }

                            if (self.filteredList.length - self.currentTagFromList > self.elementCountForStartArrowScrolling) {
                                self.$refs.list.scrollBy(0, -1 * self.tagListElementHeight);
                            }

                            items.forEach(item => item.classList.remove(self.tagFocusedClass));
                            items[self.currentTagFromList].classList.add(self.tagFocusedClass);

                            break;
                        case 40: // down
                            if (self.currentTagFromList === null || self.currentTagFromList === self.filteredList.length - 1) {
                                self.currentTagFromList = 0;
                                self.$refs.list.scrollTo(0, 0);
                            } else if (self.currentTagFromList >= 0 && self.currentTagFromList < self.filteredList.length - 1) {
                                self.currentTagFromList++;
                            }

                            if (self.currentTagFromList > self.elementCountForStartArrowScrolling - 1) {
                                self.$refs.list.scrollBy(0, self.tagListElementHeight);
                            }

                            items.forEach(item => item.classList.remove(self.tagFocusedClass));
                            items[self.currentTagFromList].classList.add(self.tagFocusedClass);

                            break;
                    }
                };
            },
            addTag(index) {
                if (!this.tagSelected(index)) {
                    this.$emit('on-tag-added', this.filteredList[index]);
                }
            },
            removeTag(tag) {
                this.$emit('on-tag-removed', tag);
            },
            tagSelected(index) {
                return this.active.some(element => {
                    return element.slug === this.filteredList[index].slug;
                });
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

            .flex(column, nowrap, flex-start, flex-start);
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
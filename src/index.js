import VueTags from './components/VueTags';

export default {
    install(Vue) {
        Vue.component('vue-tags', VueTags);
    },
};

export { VueTags };
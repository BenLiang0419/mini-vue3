
import { h } from '../lib/mini-vue.esm.js'

export const App = {
    setup() {
        return {
            username: 'BoLi'
        }
    },
    render() {
        return h('div', 
        {
            class: 'big'
        }, 
        [
            h('h1', { class: "red" }, "Hi"), 
            h('h2', { class: "blue" }, "mini-vue")
        ])
    }
};

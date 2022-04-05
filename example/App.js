
import { h } from '../lib/mini-vue.esm.js'

window.self = null
export const App = {
    setup() {
        return {
            username: 'BoLi-luyi'
        }
    },
    render() {
        window.self = this
        return h(
            'div',
            {
                id: 'root',
                class: 'big'
            },
            // [
            //     h('h1', { class: "red" }, "Hi"), 
            //     h('h2', { class: "blue" }, "mini-vue")
            // ]
            `Hi, ` + this.username
        )
    }
};

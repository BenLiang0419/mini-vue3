
import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js';

window.self = null
export const App = {
    name: 'App',
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
                class: 'big',
                // onClick: () => {
                //     console.log('onclick')
                // },
                // onMouseleave: () => {
                //     console.log('mouse leave')
                // }
            },
            [
                h('h1', { class: "red" }, "Hi"),
                h('h2', { class: "blue" }, "mini-vue"),
                h(Foo, {
                    count: 1, onAdd() {
                        console.log('onAdd')
                    },
                    onAddCount(value) {
                        console.log('onAddCount', value)
                    }
                }, {
                    "header": h('h1', {}, "123 header"),
                    "footer": h('h1', { class: 'blue' }, "abc footer")
                })
            ]
        )
    }
};

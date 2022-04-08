
import { h, createTextVNode } from '../../lib/mini-vue.esm.js'
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
        const app = h("h1", {}, "app")
        const foo = h(Foo,
            {},
            // [h("div", {}, "app1")]
            {
                header: ({ msg }) => [h("h1", {}, "abc header " + msg), createTextVNode('textVnode')],
                footer: () => h("h1", {}, "asd footer")
            }
        )

        return h("div", {}, [app, foo])
    }
};

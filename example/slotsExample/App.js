
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
        const app = h("div", {}, "app")
        const foo = h(Foo,
            {},
            // [h("div", {}, "app1")]
            {
                header: ({ msg }) => h("div", {}, "abc header " + msg),
                footer: () => h("div", {}, "asd footer")
            }
        )

        return h("div", {}, [app, foo])
    }
};

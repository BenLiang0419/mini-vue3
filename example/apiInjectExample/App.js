
import { h, provide, inject } from '../../lib/mini-vue.esm.js'

window.self = null

const Foo = {
    setup() {
        provide("foo", "foo");
        provide("bar", "bar");
        return {
            msg: 'foo-1'
        }        
    },
    render() {
        const compOne = h("h1", {}, this.msg);
        const bar = h(Bar)

        return h("div", {}, [compOne, bar])
    }
};

// const FooSecond = {
//     setup() {
//         return {
//             msg: 'foo-2'
//         }
//     },
//     render() {
//         const compOne = h("span", {}, this.msg);
//         return h(compOne);
//     }
// };

const Bar = {
    setup() {
        const foo = inject('foo')
        const bar = inject('bar')

        return {
            foo, bar
        }
    },
    render() {
        const app = h("h1", {}, "Bar")
        const constom = h('h2', {}, `Bar-provide-inject: foo - ${this.foo}, bar - ${this.bar}`)

        return h('div', {}, [app, constom])
    }    
}

export const App = {
    name: 'App',
    setup() {
        // console.log("current instance", getCurrentInstance())
        return {
            username: 'BoLi-luyi'
        }
    },
    render() {
        window.self = this
        const app = h("h1", {}, "App")
        const foo = h(Foo)

        return h("div", {}, [app, foo])
    }
};

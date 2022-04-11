
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
        const compTwo = h(FooSecond)

        return h("div", {}, [compOne, compTwo])
    }
};

const FooSecond = {
    setup() {
        provide('foo', 'fooTwo')
        const foo = inject('foo')
        return {
            msg: 'foo-2',
            foo
        }
    },
    render() {
        const compOne = h("h1", {}, this.msg + '->' + this.foo);
        const bar = h(Bar)
        return h("div", {}, [compOne, bar])
    }
};

const Bar = {
    setup() {
        const bar = inject('bar')
        const foo = inject('foo')

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

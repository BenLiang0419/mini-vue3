import { h, renderSlot } from "../../lib/mini-vue.esm.js";

export const Foo = {
    name: 'Foo',
    setup() {
        return {}
    },
    render() {
        // 1. slots 
        console.log('this.$slots', this.$slots)

        const msg = 'msg'
        const foo = h('div', {}, "foo")
        // 2. this.$slots -> array, 实际上渲染时候需要的是vnode
        //   所以就有了renderSlot
        // 3. 具名插槽
        //   处理solt-name, renderslot(slot, name)
        // 4. 作用域插槽
        return h('div', {}, [renderSlot(this.$slots, "header", { msg }), foo, renderSlot(this.$slots, "footer")])
    }
};

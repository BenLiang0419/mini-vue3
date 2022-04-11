import { h, renderSlot } from "../../lib/mini-vue.esm.js";

export const Foo = {
    name: 'Foo',
    setup(props, { emit, slots }) {
        // 1. setup能获取到props
        console.log(props)

        // 3. props是一个shallow Readonly 无法修改
        // props.count++
        console.log(props)

        // 事件
        const emitAdd = () => {
            console.log('emitAdd')
            emit('add')
            emit('add-count', 123)
        }

        // slots
        console.log(slots)

        return {
            emitAdd
        }
    },
    render() {
        // 1. slots 
        console.log('this.$slots', this.$slots)
        // 2. 能够调用到props
        // 2. this.$slots -> array, 实际上渲染时候需要的是vnode
        //   所以就有了renderSlot
        // 3. 具名插槽
        //   处理solt-name, renderslot(slot, name)
        return h('div', {}, [
            renderSlot(this.$slots, 'header'),
            h('h', {}, 'count: ' + this.count),
            h('button', { onClick: this.emitAdd}, "emitAdd"),
            renderSlot(this.$slots, 'footer')
        ])
    }
};


import { h, ref } from '../../lib/mini-vue.esm.js'

export const Array2Array = {
    name: 'Array2Array',
    setup() {
        const patchStatus = ref(true)
        window.patchStatus = patchStatus
        return {
            patchStatus
        }
    },
    render() {

        // 左侧
        // old: a, b, c
        // new: a, b, d, e
        // c -> d, e
        // const arrayComponent = h('div', {},
        //     [
        //         h('h1', { key: 'A' }, 'Array-A'),
        //         h('h1', { key: 'B' }, 'Array-B'),
        //         h('h1', { key: 'C' }, 'Array-C')
        //     ])
        // const textCompoent = h('div', {}, [
        //     h('h1', { key: 'A' }, 'Array-A'),
        //     h('h1', { key: 'B' }, 'Array-B'),
        //     h('h1', { key: 'D' }, 'Array-D'),
        //     h('h1', { key: 'E' }, 'Array-E')
        // ])

        // 右侧
        // old: c, a, b
        // new: d, e, a, b
        // const arrayComponent = h('div', {},
        //     [
        //         h('h1', { key: 'C' }, 'Array-C'),
        //         h('h1', { key: 'A' }, 'Array-A'),
        //         h('h1', { key: 'B' }, 'Array-B')
        //     ])
        // const textCompoent = h('div', {}, [
        //     h('h1', { key: 'D' }, 'Array-D'),
        //     h('h1', { key: 'E' }, 'Array-E'),
        //     h('h1', { key: 'A' }, 'Array-A'),
        //     h('h1', { key: 'B' }, 'Array-B')
        // ])

        // 新的比老的长 -- 新增
        // 左侧
        // const arrayComponent = h('div', {},
        //     [
        //         h('h1', { key: 'A' }, 'Array-A'),
        //         h('h1', { key: 'B' }, 'Array-B')
        //     ])
        // const textCompoent = h('div', {}, [
        //     h('h1', { key: 'A' }, 'Array-A'),
        //     h('h1', { key: 'B' }, 'Array-B'),
        //     h('h1', { key: 'D' }, 'Array-D'),
        //     h('h1', { key: 'E' }, 'Array-E')
        // ])

        // 右侧
        // const arrayComponent = h('div', {},
        //     [
        //         h('h1', { key: 'A' }, 'Array-A'),
        //         h('h1', { key: 'B' }, 'Array-B')
        //     ])
        // const textCompoent = h('div', {}, [
        //     h('h1', { key: 'D' }, 'Array-D'),
        //     h('h1', { key: 'E' }, 'Array-E'),
        //     h('h1', { key: 'A' }, 'Array-A'),
        //     h('h1', { key: 'B' }, 'Array-B')
        // ])

        // 旧的比新的长 -- 删除
        // 左侧
        // const arrayComponent = h('div', {},
        //     [
        //         h('h1', { key: 'A' }, 'Array-A'),
        //         h('h1', { key: 'B' }, 'Array-B'),
        //         h('h1', { key: 'D' }, 'Array-D'),
        //         h('h1', { key: 'E' }, 'Array-E')

        //     ])
        // const textCompoent = h('div', {},
        //     [
        //         h('h1', { key: 'A' }, 'Array-A'),
        //         h('h1', { key: 'B' }, 'Array-B')
        //     ])

        // 右侧
        // const arrayComponent = h('div', {},
        //     [
        //         h('h1', { key: 'D' }, 'Array-D'),
        //         h('h1', { key: 'E' }, 'Array-E'),
        //         h('h1', { key: 'A' }, 'Array-A'),
        //         h('h1', { key: 'B' }, 'Array-B')

        //     ])
        // const textCompoent = h('div', {},
        //     [
        //         h('h1', { key: 'A' }, 'Array-A'),
        //         h('h1', { key: 'B' }, 'Array-B')
        //     ])

        // 中间对比
        const arrayComponent = h('div', {},
            [
                h('h1', { key: 'D' }, 'Array-D'),
                h('h1', { key: 'C' }, 'Array-C'),
                h('h1', { key: 'E' }, 'Array-E'),
                h('h1', { key: 'A' }, 'Array-A'),
                h('h1', { key: 'B' }, 'Array-B')
            ])

        const textCompoent = h('div', {},
            [
                h('h1', { key: 'D' }, 'Array-D'),
                h('h1', { key: 'E' }, 'Array-E'),
                h('h1', { key: 'C' }, 'Array-C'),
                h('h1', { key: 'G' }, 'Array-G'),
                h('h1', { key: 'A' }, 'Array-A'),
                h('h1', { key: 'B' }, 'Array-B')

            ])

        return this.patchStatus === true ? arrayComponent : textCompoent
    }
};

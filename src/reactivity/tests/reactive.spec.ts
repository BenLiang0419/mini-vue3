import { reactive, isReactive, readonly, isReadonly, isProxy } from '../reactive'

describe('reactive', () => {
    it('bar', () => {
        const original = { name: 'ben' }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(observed.name).toBe('ben')
    })

    it('isReactive', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(original)).toBe(false)
    })

    it('isReadonly', () => {
        const original = { foo: 1 }
        const readonlyed = readonly(original)
        const observed = reactive(original)
        expect(isReadonly(readonlyed)).toBe(true)
        expect(isReadonly(observed)).toBe(false)
        expect(isReadonly(original)).toBe(false)
    })

    it('nested reactive', () => {
        const obj = {
            key: 'value',
            name: {
                foo: 1
            },
            arr: [{ bar: 2 }]
        }
        const observed = reactive(obj)
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(observed.name)).toBe(true)
    })

    it('isProxy', () => {
        const original = { name: 'ben' }
        const observed = reactive(original)
        const isReadObserved = readonly(original)

        const proxy = new Proxy(original, {})

        expect(isProxy(observed)).toBe(true)
        expect(isProxy(isReadObserved)).toBe(true)

        // because use isReactive or isReadonly
        expect(isProxy(proxy)).toBe(false)
    })

})
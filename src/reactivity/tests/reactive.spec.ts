import { reactive, isReactive, readonly, isReadonly } from '../reactive'

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

})
import { isReactive, isReadonly, shallowReactive } from '../reactive'

describe('shallowReactive', () => {
    it('shallow readonly', () => {
        const original = { name: 'ben', address: { room: '202' } }
        const observed = shallowReactive(original)
        
        expect(observed).not.toBe(original)
        expect(observed.name).toBe('ben')
        expect(isReadonly(observed.name)).toBe(false)
        expect(isReactive(observed.address)).toBe(false)
        expect(isReadonly(observed.address)).toBe(false)
        
        // observed.name = 'boli'
        // expect(observed.name).toBe('boli')
        
    })

})
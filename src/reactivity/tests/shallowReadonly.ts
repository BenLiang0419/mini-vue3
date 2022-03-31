import { isReactive, isReadonly, shallowReadonly } from '../reactive'

describe('shallowReadonly', () => {
    it('shallow readonly', () => {
        const original = { name: 'ben', address: { room: '202' } }
        const observed = shallowReadonly(original)
        
        expect(observed).not.toBe(original)
        expect(observed.name).toBe('ben')
        expect(isReadonly(observed.name)).toBe(true)
        expect(isReactive(observed.address)).toBe(false)
        expect(isReadonly(observed.address)).toBe(true)
        
        observed.name = 'boli'
        console.warn = jest.fn()
        expect(console.warn).toHaveBeenCalled()
        expect(observed.name).toBe('ben')
        
    })

})
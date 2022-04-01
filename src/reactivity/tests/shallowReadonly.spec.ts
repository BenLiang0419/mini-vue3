import { isReactive, isReadonly, shallowReadonly } from '../reactive'

describe('shallowReadonly', () => {
    it('shallow readonly', () => {
        const original = { name: 'ben', address: { room: '202' } }
        const observed = shallowReadonly(original)
        
        expect(observed).not.toBe(original)
        expect(observed.name).toBe('ben')
        expect(isReadonly(observed)).toBe(true)
        expect(isReadonly(observed.name)).toBe(false)
        expect(isReactive(observed.address)).toBe(false)
        
        // console.warn = jest.fn()
        // expect(console.warn).toHaveBeenCalled()
        // expect(observed.name).toBe('ben')
        
    })

})
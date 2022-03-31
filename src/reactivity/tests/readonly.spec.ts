import { isReadonly, readonly } from '../reactive'

describe('readonly', () => {
    it('bar', () => {
        const original = { name: 'ben', address: { room: '202' } }
        const observed = readonly(original)
        expect(observed).not.toBe(original)
        expect(observed.name).toBe('ben')
        expect(isReadonly(observed.address)).toBe(true)
    })
})
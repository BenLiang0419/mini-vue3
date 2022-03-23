import { reactive } from '../reactive'

describe('reactive', () => {
    it('bar', () => {
        const original = { name: 'ben' }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(observed.name).toBe('ben')
    })
})
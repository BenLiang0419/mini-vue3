import { effect } from "../effect"
import { ref } from "../ref"

describe('refs', () => {

    it('ref example', () => {
        const count = ref(0)
        expect(count.value).toBe(0)
    })

    it('ref should be reactive', () => {
        const count = ref(1)
        let num;
        let callEffectCount = 0
        expect(count.value).toBe(1)

        effect(() => {
            callEffectCount++
            num = count.value
        })

        expect(count.value).toBe(1)
        expect(num).toBe(1)
        expect(callEffectCount).toBe(1)

        count.value = 2
        expect(count.value).toBe(2)
        expect(num).toBe(2)
        expect(callEffectCount).toBe(2)

        count.value = 2
        expect(num).toBe(2)
        expect(callEffectCount).toBe(2)
    })

    it('ref should be reactive obj', () => {
        const count = ref({ foo: 1 })
        let num;
        let callEffectCount = 0

        effect(() => {
            callEffectCount++
            num = count.value.foo
        })

        expect(num).toBe(1)
        expect(callEffectCount).toBe(1)
        count.value.foo = 2
        expect(num).toBe(2)

    })

    it.skip('class test', () => {
        class rf {
            _value: any
            name: any
            constructor(name, value) {
                this.name = name
                this._value = value
            }
            public set value(v: string) {
                this.name = v;
            }
            public get value(): string {
                return this.name
            }
        }
        const person = new rf('jack', 1)
        expect(person._value).toBe(1)
        expect(person.name).toBe('jack')
        expect(person.value).toBe('jack')
        person.name = 'ben'
        expect(person.name).toBe('ben')
        expect(person.value).toBe('ben')
    })

})
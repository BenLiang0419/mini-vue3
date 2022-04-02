import { effect } from "../effect"
import { isReactive, reactive } from "../reactive"
import { isRef, proxyRef, ref, unRef } from "../ref"

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

    it('isRef present', () => {
        const refNum = ref(1)
        const num = 1
        const observed = reactive({
            foo: 1
        })
        const refObj = ref({
            bar: 1
        })
        expect(isRef(refNum)).toBe(true);
        expect(isRef(num)).toBe(false);
        expect(isRef(observed)).toBe(false);
        expect(isRef(refObj)).toBe(true);
        expect(isRef(refObj.value)).toBe(false)
        expect(isReactive(refObj.value)).toBe(true)
    });

    it('unRef present', () => {
        const refNum = ref(1)
        expect(refNum.value).toBe(1);
        expect(unRef(1)).toBe(1);
        expect(unRef(refNum)).toBe(1);
    });

    it('proxyRef present', () => {
        // vue3-data step() { return { ref } }
        // vue3-template 不用.value
        // 是因为使用了proxyRef
        const user = {
            age: ref(10),
            name: 'Ben'
        }

        const proxyRefUser = proxyRef(user)

        expect(user.age.value).toBe(10);
        expect(proxyRefUser.age).toBe(10);
        expect(proxyRefUser.name).toBe('Ben');

        proxyRefUser.age = 1
        expect(proxyRefUser.age).toBe(1);
        expect(user.age.value).toBe(1);

        proxyRefUser.age = ref(2)
        expect(proxyRefUser.age).toBe(2);
        expect(user.age.value).toBe(2)

        user.name = '1'
        expect(proxyRefUser.name).toBe('1');

        // const customer = {
        //     age: 1
        // }
        // const proxyCustomer = proxyRef(customer)
        // proxyCustomer.name = 1
        // expect(proxyCustomer.name).toBe(1);
        // expect(user.name).toBe(1);



    });

})
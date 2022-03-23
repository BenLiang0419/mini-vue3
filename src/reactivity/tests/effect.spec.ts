import { reactive } from '../reactive';
import { effect } from '../effect';

describe("effect", () => {
    it('bar', function () {
        const user = reactive({
            age: 10
        });

        let nextAge;
        effect(() => {
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(11)

        user.age++
        expect(nextAge).toBe(12)

    });

    it('runner', function() {
        // effect(fn) => function(runner) => fn => return
        let foo = 10;
        const runner = effect(() => {
            foo++
            return "foo"
        })

        expect(foo).toBe(11)
        const str = runner()
        expect(foo).toBe(12)
        expect(str).toBe('foo')

    })

})
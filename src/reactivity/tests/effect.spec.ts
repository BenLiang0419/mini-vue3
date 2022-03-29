import { reactive } from '../reactive';
import { effect, stop } from '../effect';

describe("effect", () => {
    it('reactive effect', function () {
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

    it('effect runner', function () {
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

    it('effect scheduler', () => {
        let foo = reactive({ age: 10 });
        let run: any;
        let bar: unknown;

        const scheduler = jest.fn(() => {
            run = runner
        })

        const runner = effect(() => {
            bar = foo.age
        }, { scheduler })

        // scheduler 没有被调用
        expect(scheduler).not.toHaveBeenCalled()
        expect(bar).toBe(10)
        // 进行数据变更 update
        foo.age++
        // scheduler 被调用一次
        expect(scheduler).toHaveBeenCalledTimes(1)
        run()
        expect(bar).toBe(11)
    })

    it('effect stop', () => {

        const car = reactive({ name: 'benz' })
        let name;

        const runner = effect(() => {
            name = car.name
        })

        car.name = 'BMW'
        expect(name).toBe('BMW')
        stop(runner)

        // 这里直接触发 set
        // 只是触发了trigger，需要触发依赖
        // 之前已经执行了stop，所以已经没有了任何的依赖
        // name 还是等于BMW
        car.name = 'Audi'
        expect(name).toBe('BMW')

        // 这里触发了 get set
        // 执行了一个get，就要进行了一次收集依赖
        // 之前调用stop的清除依赖已经失效了，被收集起来
        // 所以在执行 set 的时候，就会触发依赖 执行effect runner
        // 这里需要对stop进行优化
        car.name = car.name + '2'
        expect(name).toBe('BMW')

        runner()
        expect(name).toBe('Audi2')

    })

    it('effect onStop', () => {

        const obj = reactive({
            bar: 1
        })

        let foo;

        const onStop = jest.fn(() => {
            foo = 10
        })

        const runner = effect(() => {
            foo = obj.bar
        }, { onStop })

        stop(runner)
        expect(onStop).toBeCalledTimes(1)
        expect(foo).toBe(10)



    })

})
import { computed } from "../computed";
import { reactive } from "../reactive";

describe('computed', () => {

    it('simple', () => {
        
        const foo = reactive({ num: 1 })
        const bar = computed(() => {
            return foo.num
        })

        expect(bar.value).toBe(1);
    });

    it('should computed lazy', () => {
        const foo = reactive({ num: 1 })
        
        const runner = jest.fn(() => {
            return foo.num
        })

        const bar = computed(runner)

        expect(runner).not.toHaveBeenCalled();        
        
        expect(bar.value).toBe(1);
        expect(runner).toHaveBeenCalledTimes(1);

        // again computed
        expect(bar.value).toBe(1);
        expect(runner).toHaveBeenCalledTimes(1);

        foo.num = 2 // trigger 
        expect(runner).toHaveBeenCalledTimes(1);

        // 因为trigger后，改变了，所以再次被调用了
        // 所以被调用次数为 2
        expect(bar.value).toBe(2);
        expect(runner).toHaveBeenCalledTimes(2);

        // again computed
        expect(bar.value).toBe(2);
        expect(runner).toHaveBeenCalledTimes(2);

    })

})
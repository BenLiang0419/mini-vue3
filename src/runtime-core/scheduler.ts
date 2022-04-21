
const queue: any[] = []
const promise = Promise.resolve()

// 解决不要多次创建Promise
let isExceute = false

export const nextTick = (fn) => {
    return fn ? promise.then(fn) : promise
}

export const queueJob = (job) => {
    // 判断一下是否存在队列，如果存在就不加了
    if (!queue.includes(job)) {
        queue.push(job)
    }
    // 执行微任务
    excuteQueue()
};

function excuteQueue() {
    // MDN https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
    if (isExceute) return
    isExceute = true
    nextTick(() => {
        isExceute = false
        let job;
        while ((job = queue.shift())) {
            job & job()
        }
    })
}

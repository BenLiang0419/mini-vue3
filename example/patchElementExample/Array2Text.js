
import { h, ref } from '../../lib/mini-vue.esm.js'

export const Array2Text = {
    name: 'Array2Text',
    setup() {
        const patchStatus = ref(true)
        window.patchStatus = patchStatus
        return {
            patchStatus
        }
    },
    render() {
        const arrayComponent = h('div', {}, [h('h1', {}, 'Array-1'), h('h1', {}, 'Array-2')])
        const textCompoent = h('div', {}, 'Text-Component')
        
        return this.patchStatus === true ? arrayComponent : textCompoent 
    }
};

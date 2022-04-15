
import { h, ref } from '../../lib/mini-vue.esm.js'

export const Text2Text = {
    name: 'Text2Text',
    setup() {
        const patchStatus = ref(true)
        window.patchStatus = patchStatus
        return {
            patchStatus
        }
    },
    render() {
        const oldText = h('div', {}, 'Text-Old')
        const newText = h('div', {}, 'Text-New')
        
        return this.patchStatus === true ? oldText : newText 
    }
};

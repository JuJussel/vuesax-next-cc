import './style.sass'

import component from './vsButtonGroup'
component.install = (vue: any) => {
  vue.component('vs-button-group', component)
}

if (typeof window !== 'undefined' && window.Vue) {
  component.install(window.Vue)
}

export default component

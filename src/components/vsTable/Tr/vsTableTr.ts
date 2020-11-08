import Vue, { CreateElement } from 'vue'
import { VNode } from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import VsComponent from '../../../mixins/component'
import expand from './vsTableExpand'
@Component
export default class VsTableTr extends VsComponent {
  @Prop({}) data: any
  @Prop({ type: Boolean, default: false }) isSelected: boolean
  @Prop({ type: Boolean, default: false }) notClickSelected: boolean
  @Prop({ type: Boolean, default: false }) openExpandOnlyTd: boolean
  @Prop({ type: Boolean, default: false }) expanded: boolean
  //expand: boolean = false
  instanceExpand: any = null

  mounted() {
    if (this.expanded) {
      const colspan = this.$parent.$el.querySelectorAll('thead th').length
      const trExpand = Vue.extend(expand)
      this.instanceExpand = new trExpand()
      this.instanceExpand.$props.colspan = colspan
      this.instanceExpand.$slots.default = this.$slots.expand
      this.instanceExpand.vm = this.instanceExpand.$mount()
      this.instanceExpand.$data.hidden = false
      this.insertAfter(this.instanceExpand.vm.$el)
    }
  }

  insertAfter(element: any) {
    if (this.$el.nextSibling) {
      this.$el.parentNode.insertBefore(element, this.$el.nextSibling)
    } else {
      this.$el.parentNode.appendChild(element)
    }
  }

  @Watch('data')
  handleChangeData() {
    (this.$el as HTMLElement).style.removeProperty(`--vs-color`)
    if (this.instanceExpand) {
      this.instanceExpand.$data.hidden = true
      this.instanceExpand = null
      // this.expand = false
    }
  }

  handleClickHasExpand() {
    if (this.instanceExpand) {
      this.instanceExpand.$data.hidden = !this.instanceExpand.$data.hidden
      this.instanceExpand = null
      this.$emit('expandChange', false)
    } else {
      const colspan = this.$parent.$el.querySelectorAll('thead th').length
      const trExpand = Vue.extend(expand)
      this.instanceExpand = new trExpand()
      this.instanceExpand.$props.colspan = colspan
      this.instanceExpand.$slots.default = this.$slots.expand
      this.instanceExpand.vm = this.instanceExpand.$mount()
      this.instanceExpand.$data.hidden = false
      this.insertAfter(this.instanceExpand.vm.$el)
      this.$emit('expandChange', true)
    }
  }

  public render(h: any): VNode {
    const commands = h('td', {
      on: {
        click: (evt: any) => {
          evt.stopPropagation();
        }
      },
      staticClass: 'cc-vs-trow-commands vs-table__td'
    }, [
      this.$slots.commands
    ])

    let includedSlot = this.$slots.default
    if (this.$slots.commands) {
      includedSlot = [this.$slots.default, commands]
    }

    return h('tr', {
      staticClass: 'vs-table__tr',
      on: {
        click: (evt: any) => {
          if (this.$slots.expand) {
            if (
              (this.openExpandOnlyTd ? evt.target.nodeName == 'TD' : true) &&
              !evt.target.className.includes('isEdit')) {
              this.handleClickHasExpand()
            }
          }

          if (evt.target.nodeName == 'TD' && !this.notClickSelected) {
            (this.$parent as any).selected(this.data)
            this.$emit('selected', this.data)
          }

          this.$emit('click', evt)
        }
      },
      class: {
        selected: this.isSelected,
        isExpand: !!this.instanceExpand,
        expand: this.$slots.expand
      }
    }, includedSlot)
  }
}

import { VNode } from 'vue'
import { Component, Inject, Prop, Watch  } from 'vue-property-decorator'
import VsComponent from '../../../mixins/component'
import '../../vsCheckbox/Base/style.sass'
import vsCheckbox from '../../vsCheckbox/Base/vsCheckbox'

@Component
export default class VsSelectOption extends VsComponent {
  @Prop({}) value!: any

  @Prop({type: Boolean, default: false}) disabled: boolean

  // @Inject()
  // select: any

  @Prop({}) label!: any

  activeOption: boolean = false

  hiddenOption: boolean = false

  _uid: any

  myIndex: 0

  @Watch('$parent.textFilter')
  handleTextFilter(val: string) {
    if (val) {
      if (this.label.toLowerCase().indexOf(val.toLowerCase()) === -1) {
        this.hiddenOption = true
      } else {
        this.hiddenOption = false
      }
    } else {
      this.hiddenOption = false
    }
  }

  get isActive() {
    const parentValue = this.getParent().value
    if (typeof parentValue == 'number') {
      return parentValue == this.value
    } else {
        if(typeof parentValue === 'object' && Array.isArray(parentValue)) {
          if(typeof this.value === 'string') {
            return parentValue.includes(this.value)
          } else {
            return parentValue.filter((item: string ) => Object.entries(item)[0][1] === Object.entries(this.value)[0][1]).length > 0
          }

        } else if (typeof parentValue === 'object') {
          return this.value == parentValue
        } else {
          return parentValue.indexOf(this.value) !== -1
        }
    }
  }

  get isHover() {
    return this.getParent().uids.indexOf(this._uid) == this.getParent().hoverOption
  }

  get isMultiple() {
    return this.getParent().multiple
  }

  getParent() {
    return (this.$parent as any).isSelect && (this.$parent as any)
    || (this.$parent.$parent as any).isSelect && (this.$parent.$parent as any)
  }

  mounted() {
    if (!this.getParent().renderSelect) {
      this.getParent().childOptions.push(this)
    }
    this.getParent().uids.push(this._uid)

    this.activeOption = this.isActive

    this.getParent().setHover()
  }

  public render(h: any): VNode {
    const checkbox = h(vsCheckbox, {
      props: {
        checkedForce: this.isActive,
      },
    }, [this.$slots.default])

    return h('button', {
      attrs: {
        disabled: this.disabled
      },
      staticClass: 'vs-select__option',
      class: [{
        activeOption: this.isActive,
        isHover: this.isHover,
        isMultiple: this.isMultiple,
        hiddenOption: this.hiddenOption
      }],
      on: {
        ...this.$listeners,
        mousedown: () => {
          (this.$parent as any).clickOption(this.value, this.label)
        },
        blur: () => {
          if (!(this.$parent as any).targetSelect && !(this.$parent as any).targetClose) {
            (this.$parent as any).activeOptions = false
          }
        }
      }
    }, [
      this.isMultiple && checkbox,
      !this.isMultiple && this.$slots.default,
    ])
  }
}

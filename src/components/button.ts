import { defineComponent, h, type PropType, type Component } from 'vue'
import { LoaderCircle } from 'lucide-vue-next'
import { appleKey, motionProps, resolveMotion, type AppleContext } from '../core/context'
import { ripple } from '../core/motion'

export const AppleButton = defineComponent({
  name: 'AppleButton', inheritAttrs: false,
  inject: { apple: { from: appleKey, default: null } },
  props: {
    ...motionProps,
    variant: { type: String as PropType<'primary' | 'secondary' | 'outline' | 'danger'>, default: 'primary' },
    size: { type: String as PropType<'small' | 'medium' | 'large'>, default: 'medium' },
    icon: [Object, Function] as PropType<Component>, iconOnly: Boolean, label: String,
    disabled: Boolean, loading: Boolean, ripple: { type: Boolean, default: true }, href: String,
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
  },
  emits: ['click'],
  render() {
    const context = this.apple as AppleContext | null
    const motion = resolveMotion(this.motion, context?.motion.value.mode, context?.motion.value.reduced)
    const blocked = this.disabled || this.loading
    const content = () => h('span', { class: 'apple-button__content' }, [this.$slots.default?.(), this.loading ? h(LoaderCircle, { size: 18, class: 'apple-spin', 'aria-hidden': true }) : this.icon ? h(this.icon, { size: 18, 'aria-hidden': true }) : null])
    const tag = this.href && !blocked ? 'a' : 'button'
    const node = h(tag, {
      ...this.$attrs, class: ['apple-button', `apple-button--${this.variant}`, `apple-button--${this.size}`, { 'apple-button--icon': this.iconOnly }, this.$attrs.class],
      type: this.href && !blocked ? undefined : this.type, href: blocked ? undefined : this.href,
      disabled: blocked, 'aria-disabled': blocked || undefined, 'aria-busy': this.loading || undefined,
      'aria-label': this.label ?? this.$attrs['aria-label'], title: this.iconOnly ? this.label : undefined,
      'data-apple-motion': motion,
      onClick: (event: MouseEvent) => { if (blocked) event.preventDefault(); else this.$emit('click', event) },
    }, [content()])
    return ripple(node, this.ripple && !blocked && motion !== 'none')
  },
})

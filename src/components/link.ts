import { defineComponent, h, type Component, type PropType } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'

export const AppleLink = defineComponent({
  name: 'AppleLink', inheritAttrs: false,
  emits: ['click'],
  props: {
    as: { type: String as PropType<'a' | 'button'>, default: 'a' },
    href: String, external: Boolean, disabled: Boolean,
    icon: [Object, Function] as PropType<Component>, iconOnly: Boolean, label: String,
  },
  render() {
    return h(this.as, {
      ...this.$attrs,
      class: ['apple-link', { 'apple-link--icon': this.iconOnly }, this.$attrs.class],
      'aria-label': this.label ?? this.$attrs['aria-label'],
      title: this.iconOnly ? this.label : this.$attrs.title,
      type: this.as === 'button' ? this.$attrs.type ?? 'button' : undefined,
      disabled: this.as === 'button' ? this.disabled : undefined,
      href: this.disabled || this.as === 'button' ? undefined : this.href,
      target: this.as === 'a' ? this.external ? '_blank' : this.$attrs.target : undefined,
      rel: this.as === 'a' ? this.external ? 'noopener noreferrer' : this.$attrs.rel : undefined,
      'aria-disabled': this.disabled || undefined,
      onClick: (event: MouseEvent) => { if (this.disabled) event.preventDefault(); else this.$emit('click', event) },
    }, [h('span', { class: 'apple-link__content' }, [this.$slots.default?.(), this.icon ? h(this.icon, { size: 18, 'aria-hidden': true }) : null, this.external ? h(ArrowUpRight, { size: 14, 'aria-hidden': true }) : null])])
  },
})

<template>
  <article class="apple-card" :class="[mode === 'full' ? zoom : '', `${shadow}-shadow`, `apple-card--zoom-${zoom}`, `apple-card--shadow-${shadow}`]" :data-apple-motion="mode">
    <slot name="media"><img v-if="image" class="apple-card__image" :src="image" :alt="imageAlt" loading="lazy" /></slot>
    <div class="apple-card__body">
      <p v-if="eyebrow" class="apple-card__eyebrow">{{ eyebrow }}</p>
      <div v-if="icon || title || $slots.icon || $slots.title" class="apple-card__heading">
        <slot name="icon">
          <img v-if="typeof icon === 'string' && icon" :src="icon" alt="" width="48" height="48" />
          <component :is="icon" v-else-if="icon" :size="48" :color="iconColor" aria-hidden="true" />
        </slot>
        <slot name="title"><h3 v-if="title"><a v-if="href" :href="href">{{ title }}</a><template v-else>{{ title }}</template></h3></slot>
      </div>
      <p v-if="subtitle" class="apple-card__subtitle">{{ subtitle }}</p>
      <p v-if="text" class="apple-card__text">{{ text }}</p>
      <slot />
      <div v-if="$slots.actions" class="apple-card__actions"><slot name="actions" /></div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, inject, type Component, type PropType } from 'vue'
import { appleKey, motionProps, resolveMotion } from '../core/context'

const props = defineProps({
  ...motionProps,
  icon: [Object, Function, String] as PropType<Component | string>, iconColor: String,
  title: String, subtitle: String, text: String, eyebrow: String,
  image: String, imageAlt: { type: String, default: '' }, href: String,
  zoom: { type: String as PropType<'big' | 'small' | 'none'>, default: 'none' },
  shadow: { type: String as PropType<'normal' | 'static' | 'focused' | 'none'>, default: 'normal' },
})
const apple = inject(appleKey, null)
const mode = computed(() => resolveMotion(props.motion, apple?.motion.value.mode, apple?.motion.value.reduced))
</script>

<style scoped>
/* Copied from springBootServer/vuetify-project/src/components/AppleCard.vue. */
.apple-card {
  padding: 12px;
  border-radius: 18px;
  transition: all .3s cubic-bezier(0,0,.5,1);
}

.normal-shadow, .static-shadow {
  box-shadow: 2px 4px 12px #00000014;
}

.focused-shadow {
  box-shadow: 2px 4px 16px #00000029;
}

.normal-shadow:hover {
  box-shadow: 2px 4px 16px #00000029;
}

.none:hover {
  transform: none;
}

.big:hover {
  transform: scale3d(1.04, 1.04, 1.04) translateY(-4px);
}

.small:hover {
  transform: scale3d(1.01, 1.01, 1.01);
}

/* Apptify surface tokens and motion preferences replace Vuetify's app context. */
.apple-card { position: relative; min-width: 0; overflow: hidden; background: var(--apple-surface); }
.apple-card__body { padding: 12px 16px; }
.apple-card[data-apple-motion=none] { transition: none; }
.apple-card[data-apple-motion=reduced] { transition-duration: 80ms; }
@media (hover: none), (pointer: coarse) { .apple-card:hover { transform: none; } }
</style>

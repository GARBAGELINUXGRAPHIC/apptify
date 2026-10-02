# Apptify architecture

Vue 3 + TypeScript; Options API component definitions. All public components use `Apple` names and register as `<apple-*>`. No Tailwind. Do not import Vuetify component styles; only its ripple directive and narrowly scoped ripple CSS are used.

## Ownership

- `src/core/`: root-owned theme, motion, message bus, overlay service and plugin context.
- `src/components/forms.ts`, `src/styles/forms.css`: forms agent.
- `src/components/content.ts`, `src/styles/content.css`: content agent.
- `src/components/overlays.ts`, `src/styles/overlays.css`: overlays agent.
- Root owns all other files, exports, gallery, packaging, docs, tests and integration.

## Shared contract

CSS variables: `--apple-bg`, `--apple-surface`, `--apple-surface-alt`, `--apple-text`, `--apple-secondary`, `--apple-border`, `--apple-accent`, `--apple-accent-text`, `--apple-danger`, `--apple-success`, `--apple-warning`, `--apple-shadow`, `--apple-radius`, `--apple-duration`, `--apple-ease`. Font inherits system sans-serif. Cards 8px radius, controls pill or 8px. No negative letter spacing.

Core exports from `src/core/context.ts`: `appleKey` InjectionKey<AppleContext>; `createApple(options?)`; `useApple()`; `resolveMotion(value, global, reduced)` and `motionProps`. `AppleContext` has `theme` and `motion` refs (access state and methods through `.value`), `messages` bus and `overlays` service. Root context is injected via `apple: { from: appleKey }` in Options API. Public components accept `motion: 'inherit'|'auto'|'full'|'reduced'|'none'`, `disabled` where applicable, and forward attrs to their semantic root.

Form components export named defineComponent values from `forms.ts` and `formComponents` object. Content equivalent is `contentComponents`; overlays equivalent `overlayComponents`. Avoid importing sibling component files; native elements/lucide icons are fine. All inputs use `modelValue`, `update:modelValue`; non-button buttons must be type=button. Item lists use `{label: string, value: string|number, disabled?: boolean}`. Error and hint are string props. Every input requires label or aria-label.

Overlays service in context: `entries` ref holding an array (`entries.value`); `open(options)` returns `{id, close(value?), update(patch), result: Promise<unknown>}`. Options: `kind: 'dialog'|'drawer'|'sheet'|'snackbar'`, `title?`, `message?`, `component?`, `props?`, `onMessage?`, `persistent?`, `confirmText?`, `cancelText?`, `tone?`, `duration?`. `close(id,value?)`, `closeTop(value?)`. All programmatic overlays rendered by `AppleOverlayHost` inside `AppleProvider`.

Message bus: `sendMessage(channel, payload)` and `onMessage(channel, listener)` returns unsubscribe; component dialog receives `sendMessage` callback and `close` in props. Responses return listener results. No global singleton so SSR/multiple apps are isolated.

`AppleProvider` applies theme variables and motion policy to its wrapper; overlay Teleports should target the provider's child `[data-apple-portals]` element or receive identical theme/motion styles. Root provides `portalTarget` as a ref<string|HTMLElement|undefined> in context. Use Teleport only when target exists.

Accessibility: visible focus, proper labels, keyboard operation, focus restoration, nested overlay scroll lock and top-only Escape. Respect safe-area insets; min 44px primary touch targets; no content overflow at 320px. All user-facing default copy in Chinese.

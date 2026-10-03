import { AppleImage, type AppleImageItem, type AppleViewerImage } from 'apptify'
// @ts-expect-error The internal viewer is no longer a public entry.
import { AppleImageViewer } from 'apptify'
// @ts-expect-error Internal implementation names must not escape the facade.
import { InternalImageViewer } from 'apptify'

type ImageProps = InstanceType<typeof AppleImage>['$props']
const metadata: AppleViewerImage = { src: '/one.jpg', alt: 'one', title: 'Title', width: 600, height: 400 }
const custom: AppleImageItem = { value: 'card', label: 'Card', description: 'Copy' }
const single: ImageProps = { gallery: metadata }
const array: ImageProps = { gallery: [metadata, '/two.jpg'], index: 1, 'onUpdate:index': (index: number) => void index }
const carousel: ImageProps = { gallery: [custom], carousel: true, preview: false }
// @ts-expect-error Source data belongs to gallery, not top-level props.
const legacy: ImageProps = { src: '/legacy.jpg', alt: 'legacy' }
void [single, array, carousel, legacy, AppleImageViewer, InternalImageViewer]

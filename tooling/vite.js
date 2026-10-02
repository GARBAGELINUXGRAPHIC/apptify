import Pages from 'vite-plugin-pages'

/** File routing with the same src/views convention as vuetify-project. */
export default function apptifyRoutes(options = {}) {
  return Pages({
    dirs: [{ dir: 'src/views', baseRoute: '' }],
    ...options,
    resolver: 'vue',
  })
}

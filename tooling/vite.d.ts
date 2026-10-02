import type { Plugin } from 'vite'
import type { UserOptions } from 'vite-plugin-pages'

/** Generates Vue routes from src/views by default. */
export default function apptifyRoutes(options?: Omit<UserOptions, 'resolver'>): Plugin

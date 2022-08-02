import router from '@/router'

/**
 * 插件集
 * @type {import('vue').Plugin[]}
 */
const plugins = [router]

/**
 *
 * @param {import('vue').App} app
 * @returns
 */
// export const usePlugins = app => plugins.forEach(plugin => app.use(plugin))
export const usePlugins = (app) => plugins.forEach(app.use)

/* eslint-disable */
import ChildRoutes from './router/router'
import './assets/css/base-theme.scss'

// --- 微服务环境 ---
window.AppData.registerChildRoutes(ChildRoutes)
console.log('oneforall base module loading completed')

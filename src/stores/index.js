import { createPinia } from 'pinia'
import { websocketPlugin } from './plugins/websocket'

const pinia = createPinia()
pinia.use(websocketPlugin)

export default pinia

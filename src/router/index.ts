import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CursorFlow from '../views/CursorFlow.vue'
import JsonCleaner from '../views/JsonCleaner.vue'
import Mirror from '../views/Mirror.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/cursor-flow',
      name: 'cursor-flow',
      component: CursorFlow
    },
    {
      path: '/json-cleaner',
      name: 'json-cleaner',
      component: JsonCleaner
    },
    {
      path: '/mirror',
      name: 'mirror',
      component: Mirror
    }
  ]
})

export default router

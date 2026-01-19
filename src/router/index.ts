import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CursorFlow from '../views/CursorFlow.vue'
import JsonCleaner from '../views/JsonCleaner.vue'

const router = createRouter({
  history: createWebHistory('/dev-flow-kit/'),
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
    }
  ]
})

export default router

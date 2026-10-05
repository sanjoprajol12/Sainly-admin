import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    permission?: string | string[]
    middleware?: string
  }
}

export {}

import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'newrelic' },
  setup(_options, nuxt) {
    nuxt.hook('listen', () => {
      require('newrelic')
    })
  },
})

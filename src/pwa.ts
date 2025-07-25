import { registerSW } from 'virtual:pwa-register'

export function registerServiceWorker() {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('Nova versão disponível. Deseja atualizar?')) {
          updateSW(true)
        }
      },
      onOfflineReady() {
        console.log('Aplicativo pronto para uso offline')
      },
      immediate: true
    })
  }
}
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registrado com sucesso:', registration.scope);
        })
        .catch((error) => {
          console.error('Erro ao registrar ServiceWorker:', error);
        });
    });
  }
}
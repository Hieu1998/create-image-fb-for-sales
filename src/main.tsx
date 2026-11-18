import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker immediately for 100% offline support
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('AuraAesthetic: Service Worker updated');
  },
  onOfflineReady() {
    console.log('AuraAesthetic: Ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

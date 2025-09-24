import i18next from 'i18next';
import resources from './locales/resources.js';

await i18next.init({
  lng: 'ru',
  debug: true,
  resources,
});

export default i18next;

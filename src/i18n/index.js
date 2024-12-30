import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import vi from './vi.json';

const userLanguage = navigator.language || navigator.userLanguage;
const defaultLanguage = userLanguage.startsWith('vi') ? 'vi' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      vi: {
        translation: vi
      }
    },
    lng: defaultLanguage,
    fallbackLng: 'vi',
    debug: true,
    interpolation: {
      escapeValue: false
    },
    keySeparator: '.',
    react: {
      useSuspense: false
    }
  });

export default i18n;
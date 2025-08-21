import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  tr: { translation: { welcome: 'Hoş geldin' } },
  en: { translation: { welcome: 'Welcome' } }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'tr',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n

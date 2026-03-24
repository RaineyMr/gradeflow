import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          welcome: "Good afternoon",
          daily_overview: "DAILY OVERVIEW",
          alerts: "Alerts",
          today_lessons: "TODAY'S LESSONS",
          science_focus: "Science needs focus!",
          ai_tips: "AI Tips for Marcus",
          viewing: "Viewing",
          messages: "Messages"
        }
      },
      es: {
        translation: {
          welcome: "Buenas tardes",
          daily_overview: "RESUMEN DIARIO",
          alerts: "Alertas",
          today_lessons: "LECCIONES DE HOY",
          science_focus: "¡La ciencia necesita atención!",
          ai_tips: "Consejos de IA para Marcus",
          viewing: "Viendo a",
          messages: "Mensajes"
        }
      }
    }
  });

export default i18n;

// src/lib/i18n.js
// ─── GradeFlow i18n — English + Spanish ──────────────────────────────────────
// Usage:
//   import { useT } from '../lib/i18n'
//   const t = useT()
//   t('good_morning')  →  'Good morning' or 'Buenos dias'
//
// The current language is read from the Zustand store (currentUser.lang).
// Defaults to 'en' if not set.

import { useStore } from './store'

// ─── Translation table ────────────────────────────────────────────────────────
const TRANSLATIONS = {
  // ── Greetings ──────────────────────────────────────────────────────────────
  good_morning:          { en: 'Good morning',       es: 'Buenos dias'         },
  good_afternoon:        { en: 'Good afternoon',     es: 'Buenas tardes'       },
  good_evening:          { en: 'Good evening',       es: 'Buenas noches'       },

  // ── Navigation labels ──────────────────────────────────────────────────────
  nav_home:              { en: 'Home',               es: 'Inicio'              },
  nav_classes:           { en: 'Classes',            es: 'Clases'              },
  nav_messages:          { en: 'Messages',           es: 'Mensajes'            },
  nav_reports:           { en: 'Reports',            es: 'Informes'            },
  nav_alerts:            { en: 'Alerts',             es: 'Alertas'             },
  nav_feed:              { en: 'Feed',               es: 'Feed'                },
  nav_grades:            { en: 'Grades',             es: 'Calificaciones'      },
  nav_teachers:          { en: 'Teachers',           es: 'Maestros'            },
  nav_settings:          { en: 'Settings',           es: 'Configuracion'       },
  nav_back:              { en: 'Back',               es: 'Atras'               },

  // ── Dashboard — teacher ────────────────────────────────────────────────────
  daily_overview:        { en: 'DAILY OVERVIEW',     es: 'RESUMEN DEL DIA'     },
  todays_lessons:        { en: "TODAY'S LESSONS",    es: 'LECCIONES DE HOY'    },
  my_classes:            { en: 'My Classes',         es: 'Mis Clases'          },
  needs_attention:       { en: 'Needs Attention',    es: 'Necesita Atencion'   },
  parent_messages:       { en: 'Parent Messages',    es: 'Mensajes a Padres'   },
  scan_grade:            { en: 'Scan & Grade',       es: 'Escanear y Calificar'},
  sync_tools:            { en: 'Sync your tools',    es: 'Sincronizar herramientas' },
  add_widgets:           { en: '+ Add Widgets',      es: '+ Agregar Widgets'   },
  lesson_plans:          { en: 'Lesson Plans',       es: 'Planes de Clase'     },
  reports:               { en: 'Reports',            es: 'Informes'            },
  gradebook:             { en: 'Gradebook',          es: 'Libro de Calificaciones' },
  testing_suite:         { en: 'Testing Suite',      es: 'Suite de Examenes'   },
  class_feed:            { en: 'Class Feed',         es: 'Feed de Clase'       },
  integrations:          { en: 'Integrations',       es: 'Integraciones'       },

  // ── Dashboard — student ────────────────────────────────────────────────────
  my_grades:             { en: 'My Grades',          es: 'Mis Calificaciones'  },
  by_class:              { en: 'By Class',           es: 'Por Clase'           },
  upcoming:              { en: 'Upcoming',           es: 'Proximas tareas'     },
  ai_study_tips:         { en: 'AI Study Tips',      es: 'Consejos de Estudio IA' },
  upload_assignment:     { en: 'Upload Assignment',  es: 'Subir Tarea'         },
  ask_spark:             { en: 'Ask Spark',          es: 'Preguntarle a Spark' },
  marcus_classes:        { en: "Marcus's Classes",   es: 'Clases de Marcus'    },
  science_focus:         { en: 'Science needs your focus!', es: 'La ciencia necesita tu atencion!' },

  // ── Dashboard — parent ────────────────────────────────────────────────────
  viewing:               { en: 'Viewing',            es: 'Viendo'              },
  third_grade:           { en: '3rd Grade',          es: '3er Grado'           },
  gpa:                   { en: 'GPA',                es: 'Promedio'            },
  assignments:           { en: 'Assignments',        es: 'Tareas'              },
  messages_label:        { en: 'Messages',           es: 'Mensajes'            },
  contact_teacher:       { en: 'Contact Teacher',    es: 'Contactar Maestro'   },
  grade_of_teacher:      { en: 'Message Teacher',    es: 'Mensaje al Maestro'  },
  ai_tips_for:           { en: 'AI Tips for',        es: 'Consejos IA para'    },

  // ── Dashboard — admin ─────────────────────────────────────────────────────
  school_analytics:      { en: 'School-wide Analytics', es: 'Analiticas Escolares' },
  teachers_label:        { en: 'Teachers',           es: 'Maestros'            },
  school_settings:       { en: 'School Settings',   es: 'Configuracion Escolar' },
  school_reports:        { en: 'School Reports',    es: 'Informes Escolares'   },
  pending:               { en: 'pending',            es: 'pendientes'          },

  // ── Common actions ─────────────────────────────────────────────────────────
  save:                  { en: 'Save',               es: 'Guardar'             },
  cancel:                { en: 'Cancel',             es: 'Cancelar'            },
  done:                  { en: 'Done',               es: 'Listo'               },
  send:                  { en: 'Send',               es: 'Enviar'              },
  sync:                  { en: 'Sync',               es: 'Sincronizar'         },
  sync_now:              { en: 'Sync Now',           es: 'Sincronizar ahora'   },
  connect:               { en: 'Connect',            es: 'Conectar'            },
  connected:             { en: 'Connected',          es: 'Conectado'           },
  not_connected:         { en: 'Not connected',      es: 'No conectado'        },
  loading:               { en: 'Loading...',         es: 'Cargando...'         },
  error:                 { en: 'Error',              es: 'Error'               },
  search:                { en: 'Search',             es: 'Buscar'              },
  view_all:              { en: 'View all',           es: 'Ver todo'            },
  new:                   { en: '+ New',              es: '+ Nuevo'             },
  edit:                  { en: 'Edit',               es: 'Editar'              },
  delete:                { en: 'Delete',             es: 'Eliminar'            },
  download:              { en: 'Download',           es: 'Descargar'           },
  upload:                { en: 'Upload',             es: 'Subir'               },
  close:                 { en: 'Close',              es: 'Cerrar'              },

  // ── Camera / grading ──────────────────────────────────────────────────────
  scan:                  { en: 'Scan',               es: 'Escanear'            },
  grade_student_work:    { en: 'Grade Student Work', es: 'Calificar Trabajo'   },
  scan_grade_sheet:      { en: 'Scan Grade Sheet (Bulk)', es: 'Escanear Hoja de Calificaciones' },
  upload_answer_key:     { en: 'Upload Answer Key',  es: 'Subir Clave de Respuestas' },
  upload_roster:         { en: 'Upload Class Roster', es: 'Subir Lista de Clase' },
  submit_work:           { en: 'Submit Your Work',   es: 'Enviar tu Trabajo'   },
  start_camera:          { en: 'Start Camera',       es: 'Iniciar Camara'      },
  capture:               { en: 'Capture',            es: 'Capturar'            },
  choose_file:           { en: 'Choose File',        es: 'Elegir Archivo'      },
  processing:            { en: 'Claude is reading this file', es: 'Claude esta leyendo este archivo' },
  sync_to_gradebook:     { en: 'Sync to Gradebook',  es: 'Sincronizar con Libro de Calificaciones' },
  scan_another:          { en: 'Scan Another',       es: 'Escanear Otro'       },
  synced:                { en: 'Synced to Gradebook!', es: 'Sincronizado!'     },
  class_label:           { en: 'Class',              es: 'Clase'               },
  student_label:         { en: 'Student',            es: 'Estudiante'          },
  assignment_label:      { en: 'Assignment',         es: 'Tarea'               },
  answer_key:            { en: 'Answer Key (optional)', es: 'Clave de Respuestas (opcional)' },
  ai_detects:            { en: 'AI detects from paper', es: 'La IA detecta del papel' },
  all_students:          { en: 'All students — detect name from paper', es: 'Todos los estudiantes — detectar nombre del papel' },

  // ── Gradebook ─────────────────────────────────────────────────────────────
  grade:                 { en: 'Grade',              es: 'Calificacion'        },
  score:                 { en: 'Score',              es: 'Puntaje'             },
  avg:                   { en: 'Avg',                es: 'Prom'                },
  passing:               { en: 'Passing',            es: 'Aprobado'            },
  failing:               { en: 'Failing',            es: 'Reprobado'           },
  at_risk:               { en: 'At Risk',            es: 'En Riesgo'           },
  quiz:                  { en: 'Quiz',               es: 'Prueba'              },
  test:                  { en: 'Test',               es: 'Examen'              },
  homework:              { en: 'Homework',           es: 'Tarea'               },
  participation:         { en: 'Participation',      es: 'Participacion'       },

  // ── Parent messages ───────────────────────────────────────────────────────
  send_message:          { en: 'Send Message',       es: 'Enviar Mensaje'      },
  email:                 { en: 'Email',              es: 'Correo'              },
  sms:                   { en: 'SMS',                es: 'SMS'                 },
  both:                  { en: 'Both',               es: 'Ambos'               },
  language:              { en: 'Language',           es: 'Idioma'              },
  translate:             { en: 'Translate',          es: 'Traducir'            },
  review_send:           { en: 'Review & Send',      es: 'Revisar y Enviar'    },
  message_sent:          { en: 'Message sent!',      es: 'Mensaje enviado!'    },
  pending_label:         { en: 'Pending',            es: 'Pendiente'           },
  sent_label:            { en: 'Sent',               es: 'Enviado'             },

  // ── Alerts ────────────────────────────────────────────────────────────────
  below_passing:         { en: 'below passing',      es: 'bajo el nivel aprobatorio' },
  due_this_week:         { en: 'due this week',      es: 'con vencimiento esta semana' },
  assignments_due:       { en: 'assignments due this week for', es: 'tareas con vencimiento esta semana para' },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings:              { en: 'Settings',           es: 'Configuracion'       },
  account:               { en: 'Account & Profile',  es: 'Cuenta y Perfil'     },
  notifications_label:   { en: 'Notifications',      es: 'Notificaciones'      },
  school_branding:       { en: 'School Branding',    es: 'Marca Escolar'       },
  grading_setup:         { en: 'Grading Setup',      es: 'Configuracion de Calificaciones' },
  curriculum_links:      { en: 'Curriculum Links',   es: 'Vinculos de Curriculo' },
  logout:                { en: 'Sign Out',           es: 'Cerrar Sesion'       },
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useT() {
  const lang = useStore(s => s.currentUser?.lang || 'en')
  return function t(key, fallback) {
    const entry = TRANSLATIONS[key]
    if (!entry) return fallback || key
    return entry[lang] || entry['en'] || fallback || key
  }
}

// ─── Standalone helper (for use outside React components) ────────────────────
export function getT(lang = 'en') {
  return function t(key, fallback) {
    const entry = TRANSLATIONS[key]
    if (!entry) return fallback || key
    return entry[lang] || entry['en'] || fallback || key
  }
}

// ─── Greeting helper ──────────────────────────────────────────────────────────
export function getGreeting(lang = 'en') {
  const hour = new Date().getHours()
  const t = getT(lang)
  if (hour < 12) return t('good_morning')
  if (hour < 17) return t('good_afternoon')
  return t('good_evening')
}

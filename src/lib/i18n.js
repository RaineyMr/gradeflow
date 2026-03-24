// src/lib/i18n.js
// ─── GradeFlow i18n — English + Spanish ──────────────────────────────────────
// Usage:
//   import { useT } from '../lib/i18n'
//   const t = useT()
//   t('good_morning')  →  'Good morning' or 'Buenos dias'
//
// The current language is read from the TOP-LEVEL store lang field (not nested
// inside currentUser) so that all components react instantly when toggleLang fires.

import { useStore } from './store'

// ─── Translation table ────────────────────────────────────────────────────────
const TRANSLATIONS = {
  // ── Greetings ──────────────────────────────────────────────────────────────
  good_morning:          { en: 'Good morning',       es: 'Buenos días'         },
  good_afternoon:        { en: 'Good afternoon',     es: 'Buenas tardes'       },
  good_evening:          { en: 'Good evening',       es: 'Buenas noches'       },

  // ── Navigation labels ──────────────────────────────────────────────────────
  nav_home:              { en: 'Home',               es: 'Inicio'              },
  nav_classes:           { en: 'Classes',            es: 'Clases'              },
  nav_messages:          { en: 'Messages',           es: 'Mensajes'            },
  nav_reports:           { en: 'Reports',            es: 'Informes'            },
  nav_alerts:            { en: 'Alerts',             es: 'Alertas'             },
  nav_feed:              { en: 'Feed',               es: 'Feed'                },
  nav_grades:            { en: 'Grades',             es: 'Notas'               },
  nav_teachers:          { en: 'Teachers',           es: 'Maestros'            },
  nav_settings:          { en: 'Settings',           es: 'Ajustes'             },
  nav_back:              { en: 'Back',               es: 'Atrás'               },

  // ── Dashboard — teacher ────────────────────────────────────────────────────
  daily_overview:        { en: 'DAILY OVERVIEW',     es: 'RESUMEN DEL DÍA'     },
  todays_lessons:        { en: "TODAY'S LESSONS",    es: 'LECCIONES DE HOY'    },
  my_classes:            { en: 'My Classes',         es: 'Mis Clases'          },
  needs_attention:       { en: 'Needs Attention',    es: 'Necesita Atención'   },
  parent_messages:       { en: 'Parent Messages',    es: 'Mensajes a Padres'   },
  scan_grade:            { en: 'Scan & Grade',       es: 'Escanear y Calificar'},
  sync_tools:            { en: 'Sync your tools',    es: 'Sincronizar herramientas' },
  add_widgets:           { en: '+ Add Widgets',      es: '+ Agregar Widgets'   },
  lesson_plans:          { en: 'Lesson Plans',       es: 'Planes de Clase'     },
  reports:               { en: 'Reports',            es: 'Informes'            },
  gradebook:             { en: 'Gradebook',          es: 'Libro de Calificaciones' },
  testing_suite:         { en: 'Testing Suite',      es: 'Suite de Exámenes'   },
  class_feed:            { en: 'Class Feed',         es: 'Feed de Clase'       },
  integrations:          { en: 'Integrations',       es: 'Integraciones'       },

  // ── Dashboard — student ────────────────────────────────────────────────────
  my_grades:             { en: 'My Grades',          es: 'Mis Calificaciones'  },
  by_class:              { en: 'By Class',           es: 'Por Clase'           },
  upcoming:              { en: 'Upcoming',           es: 'Próximas tareas'     },
  ai_study_tips:         { en: 'AI Study Tips',      es: 'Consejos de Estudio IA' },
  upload_assignment:     { en: 'Upload Assignment',  es: 'Subir Tarea'         },
  ask_spark:             { en: 'Ask Spark',          es: 'Preguntarle a Spark' },
  science_focus:         { en: 'Science needs your focus!', es: '¡La ciencia necesita tu atención!' },

  // ── Dashboard — parent ────────────────────────────────────────────────────
  viewing:               { en: 'Viewing',            es: 'Viendo'              },
  third_grade:           { en: '3rd Grade',          es: '3er Grado'           },
  gpa:                   { en: 'GPA',                es: 'Promedio'            },
  assignments:           { en: 'Assignments',        es: 'Tareas'              },
  messages_label:        { en: 'Messages',           es: 'Mensajes'            },
  contact_teacher:       { en: 'Contact Teacher',    es: 'Contactar Maestro'   },
  ai_tips_for:           { en: 'AI Tips for',        es: 'Consejos IA para'    },

  // ── Dashboard — admin ─────────────────────────────────────────────────────
  school_analytics:      { en: 'School-wide Analytics', es: 'Analíticas Escolares' },
  teachers_label:        { en: 'Teachers',           es: 'Maestros'            },
  school_settings:       { en: 'School Settings',   es: 'Configuración Escolar' },
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
  back_to_dashboard:     { en: 'Back to Dashboard',  es: 'Volver al Panel'     },
  open_arrow:            { en: 'Open →',             es: 'Abrir →'             },

  // ── Camera / grading ──────────────────────────────────────────────────────
  scan:                  { en: 'Scan',               es: 'Escanear'            },
  grade_student_work:    { en: 'Grade Student Work', es: 'Calificar Trabajo'   },
  scan_grade_sheet:      { en: 'Scan Grade Sheet (Bulk)', es: 'Escanear Hoja de Calificaciones' },
  upload_answer_key:     { en: 'Upload Answer Key',  es: 'Subir Clave de Respuestas' },
  upload_roster:         { en: 'Upload Class Roster', es: 'Subir Lista de Clase' },
  submit_work:           { en: 'Submit Your Work',   es: 'Enviar tu Trabajo'   },
  start_camera:          { en: 'Start Camera',       es: 'Iniciar Cámara'      },
  capture:               { en: 'Capture',            es: 'Capturar'            },
  choose_file:           { en: 'Choose File',        es: 'Elegir Archivo'      },
  processing:            { en: 'Claude is reading this file', es: 'Claude está leyendo este archivo' },
  sync_to_gradebook:     { en: 'Sync to Gradebook',  es: 'Sincronizar con Libro de Calificaciones' },
  scan_another:          { en: 'Scan Another',       es: 'Escanear Otro'       },
  synced:                { en: 'Synced to Gradebook!', es: '¡Sincronizado!'    },

  // ── Gradebook ─────────────────────────────────────────────────────────────
  grade:                 { en: 'Grade',              es: 'Calificación'        },
  score:                 { en: 'Score',              es: 'Puntaje'             },
  avg:                   { en: 'Avg',                es: 'Prom'                },
  passing:               { en: 'Passing',            es: 'Aprobado'            },
  failing:               { en: 'Failing',            es: 'Reprobado'           },
  at_risk:               { en: 'At Risk',            es: 'En Riesgo'           },
  quiz:                  { en: 'Quiz',               es: 'Prueba'              },
  test:                  { en: 'Test',               es: 'Examen'              },
  homework:              { en: 'Homework',           es: 'Tarea'               },
  participation:         { en: 'Participation',      es: 'Participación'       },
  students_label:        { en: 'students',           es: 'estudiantes'         },
  add_assignment:        { en: '+ Assignment',       es: '+ Tarea'             },
  edit_weights:          { en: '⚙ Edit',             es: '⚙ Editar'            },
  search_students:       { en: 'Search students...', es: 'Buscar estudiantes...' },

  // ── Parent messages ───────────────────────────────────────────────────────
  send_message:          { en: 'Send Message',       es: 'Enviar Mensaje'      },
  email:                 { en: 'Email',              es: 'Correo'              },
  sms:                   { en: 'SMS',                es: 'SMS'                 },
  both:                  { en: 'Both',               es: 'Ambos'               },
  language:              { en: 'Language',           es: 'Idioma'              },
  translate:             { en: 'Translate',          es: 'Traducir'            },
  review_send:           { en: 'Review & Send',      es: 'Revisar y Enviar'    },
  message_sent:          { en: 'Message sent!',      es: '¡Mensaje enviado!'   },
  pending_label:         { en: 'Pending',            es: 'Pendiente'           },
  sent_label:            { en: 'Sent',               es: 'Enviado'             },
  new_message:           { en: '+ New',              es: '+ Nuevo'             },
  all_messages:          { en: 'All',                es: 'Todos'               },
  search_messages:       { en: 'Search messages...', es: 'Buscar mensajes...'  },

  // ── Alerts ────────────────────────────────────────────────────────────────
  below_passing:         { en: 'below passing',      es: 'bajo el nivel aprobatorio' },
  due_this_week:         { en: 'due this week',      es: 'con vencimiento esta semana' },
  no_alerts:             { en: 'All clear!',         es: '¡Todo en orden!'     },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings:              { en: 'Settings',           es: 'Configuración'       },
  account:               { en: 'Account & Profile',  es: 'Cuenta y Perfil'     },
  notifications_label:   { en: 'Notifications',      es: 'Notificaciones'      },
  school_branding:       { en: 'School Branding',    es: 'Marca Escolar'       },
  grading_setup:         { en: 'Grading Setup',      es: 'Conf. de Calificaciones' },
  curriculum_links:      { en: 'Curriculum Links',   es: 'Vínculos de Currículo' },
  logout:                { en: 'Sign Out',           es: 'Cerrar Sesión'       },

  // ── Student dashboard ─────────────────────────────────────────────────────
  daily_overview_student:{ en: 'DAILY OVERVIEW',     es: 'RESUMEN DEL DÍA'     },
  todays_lessons_label:  { en: "TODAY'S LESSONS 📖", es: 'LECCIONES DE HOY 📖' },
  my_classes_label:      { en: 'My Classes',         es: 'Mis Clases'          },
  alerts_label:          { en: 'Alerts',             es: 'Alertas'             },
  class_feed_label:      { en: 'Class Feed',         es: 'Feed de Clase'       },
  view_worksheet:        { en: 'View Worksheet 📄',  es: 'Ver Hoja de Trabajo 📄' },
  upload_assignment_btn: { en: 'Upload Assignment',  es: 'Subir Tarea'         },

  // ── Parent dashboard ──────────────────────────────────────────────────────
  daily_overview_parent: { en: "'S DAILY OVERVIEW",  es: ' RESUMEN DEL DÍA'    },
  todays_lessons_parent: { en: "TODAY'S LESSONS 📖", es: 'LECCIONES DE HOY 📖' },
  classes_label:         { en: 'Classes',            es: 'Clases'              },
  alerts_count:          { en: 'Alerts',             es: 'Alertas'             },
  ai_tips_label:         { en: 'AI Tips',            es: 'Consejos IA'         },
  science_focus_parent:  { en: 'Science needs focus!', es: '¡La ciencia necesita atención!' },
  contact_btn:           { en: 'Contact Teacher',    es: 'Contactar Maestro'   },

  // ── Admin dashboard ───────────────────────────────────────────────────────
  school_gpa:            { en: 'School GPA',         es: 'Promedio Escolar'    },
  school_wide:           { en: 'School-wide Analytics', es: 'Analíticas Escolares' },
  teachers_panel:        { en: 'Teachers',           es: 'Maestros'            },
  messages_panel:        { en: 'Messages',           es: 'Mensajes'            },
  alerts_panel:          { en: 'Alerts',             es: 'Alertas'             },
  active_label:          { en: '✓ Active',           es: '✓ Activo'            },
  pending_verify:        { en: '⚠ Verify',           es: '⚠ Verificar'         },
  add_widgets_label:     { en: '＋ Add Widgets',      es: '＋ Agregar Widgets'   },

  // ── Reports ───────────────────────────────────────────────────────────────
  class_mastery:         { en: 'Class Mastery',      es: 'Dominio de Clase'    },
  student_report:        { en: 'Student Report',     es: 'Informe del Estudiante' },
  grade_dist:            { en: 'Grade Dist.',        es: 'Distribución'        },
  needs_attn:            { en: 'Needs Attention',    es: 'Necesita Atención'   },
  comm_log:              { en: 'Comm. Log',          es: 'Registro de Comm.'   },
  progress:              { en: 'Progress',           es: 'Progreso'            },
  filter_all_classes:    { en: 'All Classes',        es: 'Todas las Clases'    },

  // ── Feed / class ──────────────────────────────────────────────────────────
  all_classes:           { en: 'All Classes',        es: 'Todas las Clases'    },
  new_post:              { en: '+ Post',             es: '+ Publicar'          },
  all_posts:             { en: 'All',                es: 'Todos'               },
  posts_label:           { en: '📢 Posts',           es: '📢 Publicaciones'    },
  pinned_label:          { en: '📌 Pinned',          es: '📌 Fijados'          },
  discussions_label:     { en: '🗣️ Discussions',    es: '🗣️ Discusiones'      },

  // ── Lesson plan ───────────────────────────────────────────────────────────
  lesson_plans_title:    { en: 'Lesson Plans',       es: 'Planes de Clase'     },
  ai_generate:           { en: '✨ AI Generate',     es: '✨ Generar con IA'   },
  build_scratch:         { en: '📝 Build from Scratch', es: '📝 Crear desde Cero' },
  upload_doc:            { en: '📤 Upload Document', es: '📤 Subir Documento'  },

  // ── Tutorials ─────────────────────────────────────────────────────────────
  tutorials_title:       { en: 'Tutorials & Help',   es: 'Tutoriales y Ayuda'  },
  tutorials_sub:         { en: 'Getting started guides for every role', es: 'Guías de inicio para cada rol' },
  teacher_label:         { en: 'Teacher',            es: 'Maestro'             },
  student_label_tab:     { en: 'Student',            es: 'Estudiante'          },
  parent_label_tab:      { en: 'Parent',             es: 'Padre/Madre'         },
  admin_label_tab:       { en: 'Admin',              es: 'Admin'               },
  resources_label:       { en: 'Resources',          es: 'Recursos'            },
  support_label:         { en: 'Support',            es: 'Soporte'             },

  // ── App header / hamburger menu ───────────────────────────────────────────
  profile_settings:      { en: 'Profile & Settings', es: 'Perfil y Ajustes'   },
  switch_account:        { en: 'Switch Account',     es: 'Cambiar Cuenta'      },
  switch_to_spanish:     { en: 'Cambiar a Español',  es: 'Switch to English'   },
  tutorials_menu:        { en: 'Tutorials',          es: 'Tutoriales'          },
  dashboard_menu:        { en: 'Dashboard',          es: 'Panel Principal'     },
  sign_out:              { en: 'Sign Out',           es: 'Cerrar Sesión'       },
  account_section:       { en: 'Account',            es: 'Cuenta'              },
  app_section:           { en: 'App',                es: 'Aplicación'          },
  pages_section:         { en: 'Pages',              es: 'Páginas'             },
  gradebook_menu:        { en: 'Gradebook',          es: 'Calificaciones'      },
  lesson_plans_menu:     { en: 'Lesson Plans',       es: 'Planes de Clase'     },
  messages_menu:         { en: 'Messages',           es: 'Mensajes'            },
  reports_menu:          { en: 'Reports',            es: 'Informes'            },
  testing_suite_menu:    { en: 'Testing Suite',      es: 'Suite de Exámenes'   },
  class_feed_menu:       { en: 'Class Feed',         es: 'Feed de Clase'       },
  grades_menu:           { en: 'Grades',             es: 'Calificaciones'      },
  assignments_menu:      { en: 'Assignments',        es: 'Tareas'              },
  progress_menu:         { en: 'Progress',           es: 'Progreso'            },
  alerts_menu:           { en: 'Alerts',             es: 'Alertas'             },
  staff_menu:            { en: 'Staff',              es: 'Personal'            },
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Subscribes to the top-level `lang` store field (NOT currentUser.lang)
// so every component re-renders instantly when the user switches language.
export function useT() {
  // Read from the top-level lang field — this triggers re-renders correctly
  const lang = useStore(s => s.lang || 'en')
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

import React, { useState } from 'react'
import { useT } from '../lib/i18n'

const C = { bg:'#060810',card:'#161923',inner:'#1e2231',text:'#eef0f8',muted:'#6b7494',border:'#2a2f42',green:'#22c97a',blue:'#3b7ef4',amber:'#f5a623',purple:'#9b6ef5',teal:'#0fb8a0' }

const ROLES_EN = [
  { id:'teacher', label:'Teacher', icon:'🧑‍🏫', color:C.blue   },
  { id:'student', label:'Student', icon:'🎓',   color:C.teal   },
  { id:'parent',  label:'Parent',  icon:'👨‍👩‍👧', color:C.green  },
  { id:'admin',   label:'Admin',   icon:'🏫',   color:C.purple },
]

const CONTENT = {
  teacher: {
    steps: [
      { icon:'📷', title_en:'Scan & Grade',       title_es:'Escanear y Calificar',     desc_en:'Tap the camera icon in the top bar, choose "Grade Student Work," snap a photo of any paper. AI reads the score, calculates the percentage, and posts it to your gradebook.', desc_es:'Toca el ícono de cámara en la barra superior, elige "Calificar Trabajo", toma una foto de cualquier papel. La IA lee la calificación, calcula el porcentaje y lo publica en tu libro de calificaciones.' },
      { icon:'📚', title_en:'Gradebook',           title_es:'Libro de Calificaciones',  desc_en:'Tap any class card on your dashboard to open the gradebook. View all students, tap any grade to edit it. Add assignments with the + button.', desc_es:'Toca cualquier tarjeta de clase en tu panel para abrir el libro. Ve todos los estudiantes, toca cualquier calificación para editarla. Agrega tareas con el botón +.' },
      { icon:'✨', title_en:'AI Lesson Plans',     title_es:'Planes con IA',            desc_en:'Open Lesson Plan Builder, choose "AI Generate from Standard/TEKS," fill in subject/grade/topic and tap Generate. You get a full lesson package including objectives, steps, worksheet, and exit ticket.', desc_es:'Abre el Constructor de Planes, elige "Generar con IA desde Estándar/TEKS", completa materia/grado/tema y toca Generar. Obtienes un plan completo con objetivos, pasos, hoja de trabajo y boleto de salida.' },
      { icon:'💬', title_en:'Parent Messages',    title_es:'Mensajes a Padres',        desc_en:'GradeFlow auto-drafts parent messages when students fail or improve. Go to Parent Messages, review AI drafts, edit if needed, then send.', desc_es:'GradeFlow redacta automáticamente mensajes a padres cuando los estudiantes fallan o mejoran. Ve a Mensajes, revisa los borradores de IA, edita si es necesario y envía.' },
      { icon:'📊', title_en:'Reports',            title_es:'Informes',                 desc_en:'Tap Reports on your dashboard to run Class Mastery, At-Risk, Grade Distribution, and more. Print, export as PDF, or download as CSV.', desc_es:'Toca Informes en tu panel para generar Dominio de Clase, En Riesgo, Distribución de Notas y más. Imprime, exporta como PDF o descarga como CSV.' },
      { icon:'🧪', title_en:'Testing Suite',      title_es:'Suite de Exámenes',        desc_en:'Create tests from scratch with the question builder, lock any external test URL in the browser, or upload a PDF and let AI digitize it. Monitor live during tests.', desc_es:'Crea exámenes desde cero con el constructor de preguntas, bloquea cualquier URL de examen externo en el navegador, o sube un PDF y deja que la IA lo digitalice. Monitorea en vivo durante los exámenes.' },
    ],
    resources_en: ['Getting started guide (PDF)','Sample lesson plan templates','Grading rubric examples','Parent communication scripts'],
    resources_es: ['Guía de inicio (PDF)','Plantillas de planes de clase','Ejemplos de rúbricas de calificación','Guiones de comunicación para padres'],
  },
  student: {
    steps: [
      { icon:'📊', title_en:'My Dashboard',       title_es:'Mi Panel',                 desc_en:"Your dashboard shows your GPA, today's lessons, upcoming assignments, and messages from your teacher — all in one place.", desc_es:'Tu panel muestra tu promedio, las lecciones de hoy, tareas próximas y mensajes de tu maestro, todo en un solo lugar.' },
      { icon:'📋', title_en:'Assignments',        title_es:'Tareas',                   desc_en:'Tap the Assignments widget to see what\'s due. Submit your work using the camera or file upload. Your teacher gets notified immediately.', desc_es:'Toca el widget de Tareas para ver qué está pendiente. Entrega tu trabajo usando la cámara o subiendo un archivo. Tu maestro recibe una notificación de inmediato.' },
      { icon:'✨', title_en:'AI Study Tips',      title_es:'Consejos de Estudio IA',   desc_en:'Tap the AI Study Tips widget to get personalized advice based on your grades. The AI suggests study strategies specific to each subject.', desc_es:'Toca el widget de Consejos de Estudio IA para obtener consejos personalizados según tus calificaciones. La IA sugiere estrategias específicas para cada materia.' },
      { icon:'💬', title_en:'Messages',           title_es:'Mensajes',                 desc_en:'Messages from your teacher appear here. You can read updates, reminders, and feedback.', desc_es:'Los mensajes de tu maestro aparecen aquí. Puedes leer actualizaciones, recordatorios y retroalimentación.' },
      { icon:'📚', title_en:'View Grades',        title_es:'Ver Calificaciones',       desc_en:'Tap any class card to see your detailed grades. Each assignment shows your score and class average.', desc_es:'Toca cualquier tarjeta de clase para ver tus calificaciones detalladas. Cada tarea muestra tu puntaje y el promedio de la clase.' },
    ],
    resources_en: ['Student handbook','Assignment submission guide','Study tips library'],
    resources_es: ['Manual del estudiante','Guía para entregar tareas','Biblioteca de consejos de estudio'],
  },
  parent: {
    steps: [
      { icon:'📊', title_en:"Your Child's Progress", title_es:'Progreso de tu Hijo/a',   desc_en:"Your dashboard tracks your child's grades across all classes in real time.", desc_es:'Tu panel rastrea las calificaciones de tu hijo/a en todas las clases en tiempo real.' },
      { icon:'🔔', title_en:'Alerts',               title_es:'Alertas',                  desc_en:"GradeFlow sends you a notification whenever your child's grade changes significantly.", desc_es:'GradeFlow te envía una notificación cada vez que la calificación de tu hijo/a cambia significativamente.' },
      { icon:'💬', title_en:'Teacher Messages',     title_es:'Mensajes del Maestro',     desc_en:"Messages from teachers appear in your Messages tab. You can read and reply directly.", desc_es:'Los mensajes de los maestros aparecen en tu pestaña de Mensajes. Puedes leer y responder directamente.' },
      { icon:'✨', title_en:'AI Parenting Tips',    title_es:'Consejos IA para Padres',  desc_en:"The AI Tips widget gives you personalized suggestions on how to support your child's learning at home.", desc_es:'El widget de Consejos IA te da sugerencias personalizadas sobre cómo apoyar el aprendizaje de tu hijo/a en casa.' },
    ],
    resources_en: ['Parent involvement guide','How to read report cards','Supporting learning at home'],
    resources_es: ['Guía de participación de padres','Cómo leer boletas de calificaciones','Apoyar el aprendizaje en casa'],
  },
  admin: {
    steps: [
      { icon:'🏫', title_en:'School Overview',    title_es:'Vista General de la Escuela', desc_en:'Your dashboard shows school-wide GPA, total students and teachers, at-risk counts, and trend data — all updated in real time.', desc_es:'Tu panel muestra el promedio escolar, total de estudiantes y maestros, conteos en riesgo y datos de tendencia, todo actualizado en tiempo real.' },
      { icon:'👩‍🏫', title_en:'Teacher Support',   title_es:'Apoyo a Maestros',            desc_en:'The Teachers panel shows each teacher\'s class averages and at-risk student counts. Tap any teacher to view details.', desc_es:'El panel de Maestros muestra los promedios de clase de cada maestro y los conteos de estudiantes en riesgo. Toca cualquier maestro para ver detalles.' },
      { icon:'📊', title_en:'School Reports',     title_es:'Informes Escolares',          desc_en:'Run school-wide reports including GPA trends, grade distribution, communication logs, and at-risk summaries. Export as PDF or CSV.', desc_es:'Genera informes escolares incluyendo tendencias de GPA, distribución de calificaciones, registros de comunicación y resúmenes de riesgo.' },
      { icon:'📢', title_en:'Announcements',      title_es:'Anuncios',                    desc_en:'Use the Comm Hub to send school-wide announcements to all teachers, students, and parents at once.', desc_es:'Usa el Centro de Comunicación para enviar anuncios escolares a todos los maestros, estudiantes y padres a la vez.' },
    ],
    resources_en: ['Admin setup guide','Data privacy overview','School branding customization'],
    resources_es: ['Guía de configuración de admin','Resumen de privacidad de datos','Personalización de marca escolar'],
  },
}

const SUPPORT = {
  en: [
    { icon:'🎥', title:'Live Walkthrough',    desc:'Request a guided onboarding session for your school.' },
    { icon:'📖', title:'Help Center Articles',  desc:'Search role-specific docs, FAQs, and setup guides.' },
    { icon:'📝', title:'Release Notes',         desc:'See product changes and new feature announcements.' },
  ],
  es: [
    { icon:'🎥', title:'Demostración en Vivo',    desc:'Solicita una sesión guiada de incorporación para tu escuela.' },
    { icon:'📖', title:'Artículos del Centro de Ayuda', desc:'Busca documentación por rol, preguntas frecuentes y guías de configuración.' },
    { icon:'📝', title:'Notas de la Versión',      desc:'Ve los cambios del producto y nuevos anuncios de funciones.' },
  ],
}

export default function Tutorials() {
  const t = useT()
  // Read lang directly from store for non-hook usage
  const lang = useStore ? require('../lib/store').useStore.getState().lang : 'en'
  const [role, setRole] = useState('teacher')
  const content = CONTENT[role]
  const isEs = lang === 'es'

  const ROLES = [
    { id:'teacher', label: t('teacher_label'),      icon:'🧑‍🏫', color:C.blue   },
    { id:'student', label: t('student_label_tab'),  icon:'🎓',   color:C.teal   },
    { id:'parent',  label: t('parent_label_tab'),   icon:'👨‍👩‍👧', color:C.green  },
    { id:'admin',   label: t('admin_label_tab'),    icon:'🏫',   color:C.purple },
  ]

  const currentRole = ROLES.find(r => r.id === role)

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
      <div style={{ padding:'24px 16px 0', marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, margin:'0 0 6px' }}>{t('tutorials_title')}</h1>
        <p style={{ fontSize:13, color:C.muted, margin:0 }}>{t('tutorials_sub')}</p>
      </div>

      {/* Role tabs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'0 16px', marginBottom:24 }}>
        {ROLES.map(r => (
          <button key={r.id} onClick={() => setRole(r.id)}
            style={{ padding:'10px 6px', borderRadius:14, border:`1.5px solid ${role===r.id ? r.color : C.border}`, background:role===r.id ? `${r.color}18` : C.card, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:20 }}>{r.icon}</span>
            <span style={{ fontSize:11, fontWeight:700, color:role===r.id ? r.color : C.muted }}>{r.label}</span>
          </button>
        ))}
      </div>

      {/* Steps */}
      <div style={{ padding:'0 16px', marginBottom:24 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:'0 0 14px' }}>
          {currentRole?.icon} {currentRole?.label} {isEs ? 'Guía' : 'Guide'}
        </h2>
        {content.steps.map((step, i) => (
          <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px', marginBottom:10, display:'flex', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:C.inner, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{step.icon}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:6 }}>
                {isEs ? step.title_es : step.title_en}
              </div>
              <p style={{ fontSize:13, color:'#c0c8e0', lineHeight:1.65, margin:0 }}>
                {isEs ? step.desc_es : step.desc_en}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Resources */}
      <div style={{ padding:'0 16px', marginBottom:24 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:'0 0 14px' }}>{t('resources_label')}</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {(isEs ? content.resources_es : content.resources_en).map(r => (
            <button key={r} style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', textAlign:'left', cursor:'pointer', color:C.text, fontSize:12, fontWeight:600 }}
              onClick={() => alert(`${r} — ${isEs ? 'disponible en la biblioteca de recursos de tu escuela' : "available in your school's resource library"}`)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Support */}
      <div style={{ padding:'0 16px' }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:'0 0 14px' }}>{t('support_label')}</h2>
        {(SUPPORT[isEs ? 'es' : 'en']).map(s => (
          <div key={s.title} style={{ background:C.inner, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:4 }}>{s.icon} {s.title}</div>
            <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.5 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Need to add this import at the top:
// import { useStore } from '../lib/store'

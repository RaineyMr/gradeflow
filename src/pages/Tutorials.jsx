import React, { useState } from 'react'

const C = { bg:'#060810',card:'#161923',inner:'#1e2231',text:'#eef0f8',muted:'#6b7494',border:'#2a2f42',green:'#22c97a',blue:'#3b7ef4',amber:'#f5a623',purple:'#9b6ef5',teal:'#0fb8a0' }

const ROLES = [
  { id:'teacher', label:'Teacher', icon:'🧑‍🏫', color:C.blue   },
  { id:'student', label:'Student', icon:'🎓',   color:C.teal   },
  { id:'parent',  label:'Parent',  icon:'👨‍👩‍👧', color:C.green  },
  { id:'admin',   label:'Admin',   icon:'🏫',   color:C.purple },
]

const CONTENT = {
  teacher: {
    steps: [
      { icon:'📷', title:'Scan & Grade',       desc:'Tap the camera icon in the top bar, choose "Grade Student Work," snap a photo of any paper. AI reads the score, calculates the percentage, and posts it to your gradebook.' },
      { icon:'📚', title:'Gradebook',           desc:'Tap any class card on your dashboard to open the gradebook. View all students, tap any grade to edit it. Add assignments with the + button.' },
      { icon:'✨', title:'AI Lesson Plans',     desc:'Open Lesson Plan Builder, choose "AI Generate from Standard/TEKS," fill in subject/grade/topic and tap Generate. You get a full lesson package including objectives, steps, worksheet, and exit ticket.' },
      { icon:'💬', title:'Parent Messages',    desc:'GradeFlow auto-drafts parent messages when students fail or improve. Go to Parent Messages, review AI drafts, edit if needed, then send. Every alert has a positive version too.' },
      { icon:'📊', title:'Reports',            desc:'Tap Reports on your dashboard to run Class Mastery, At-Risk, Grade Distribution, and more. Print, export as PDF, or download as CSV.' },
      { icon:'🧪', title:'Testing Suite',      desc:'Create tests from scratch with the question builder, lock any external test URL in the browser, or upload a PDF and let AI digitize it. Monitor live during tests.' },
    ],
    resources: ['Getting started guide (PDF)','Sample lesson plan templates','Grading rubric examples','Parent communication scripts'],
  },
  student: {
    steps: [
      { icon:'📊', title:'My Dashboard',       desc:'Your dashboard shows your GPA, today\'s lessons, upcoming assignments, and messages from your teacher — all in one place.' },
      { icon:'📋', title:'Assignments',        desc:'Tap the Assignments widget to see what\'s due. Submit your work using the camera or file upload. Your teacher gets notified immediately.' },
      { icon:'✨', title:'AI Study Tips',      desc:'Tap the AI Study Tips widget to get personalized advice based on your grades. The AI suggests study strategies and action steps specific to each subject.' },
      { icon:'💬', title:'Messages',           desc:'Messages from your teacher appear here. You can read updates, reminders, and feedback. Reply through the message thread.' },
      { icon:'📚', title:'View Grades',        desc:'Tap any class card to see your detailed grades. Each assignment shows your score and class average. Tap a grade for more details.' },
    ],
    resources: ['Student handbook','Assignment submission guide','Study tips library'],
  },
  parent: {
    steps: [
      { icon:'📊', title:"Your Child's Progress", desc:"Your dashboard tracks your child's grades across all classes in real time. Green is good, red means they may need extra support." },
      { icon:'🔔', title:'Alerts',               desc:"GradeFlow sends you a notification whenever your child's grade changes significantly. Tap any alert to see details and teacher contact info." },
      { icon:'💬', title:'Teacher Messages',     desc:"Messages from teachers appear in your Messages tab. You can read and reply directly. Teachers are notified when you've read a message." },
      { icon:'✨', title:'AI Parenting Tips',    desc:"The AI Tips widget gives you personalized suggestions on how to support your child's learning at home based on their current grades and subjects." },
    ],
    resources: ['Parent involvement guide','How to read report cards','Supporting learning at home'],
  },
  admin: {
    steps: [
      { icon:'🏫', title:'School Overview',    desc:'Your dashboard shows school-wide GPA, total students and teachers, at-risk counts, and trend data — all updated in real time.' },
      { icon:'👩‍🏫', title:'Teacher Support',   desc:'The Teachers panel shows each teacher\'s class averages and at-risk student counts. Tap any teacher to view details and send a direct message.' },
      { icon:'📊', title:'School Reports',     desc:'Run school-wide reports including GPA trends, grade distribution, communication logs, and at-risk summaries. Export as PDF or CSV.' },
      { icon:'📢', title:'Announcements',      desc:'Use the Comm Hub to send school-wide announcements to all teachers, students, and parents at once.' },
    ],
    resources: ['Admin setup guide','Data privacy overview','School branding customization'],
  },
}

export default function Tutorials() {
  const [role, setRole] = useState('teacher')
  const content = CONTENT[role]

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'Inter, Arial, sans-serif', paddingBottom:80 }}>
      <div style={{ padding:'24px 16px 0', marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, margin:'0 0 6px' }}>Tutorials & Help</h1>
        <p style={{ fontSize:13, color:C.muted, margin:0 }}>Getting started guides for every role</p>
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
          {ROLES.find(r => r.id===role)?.icon} {ROLES.find(r => r.id===role)?.label} Guide
        </h2>
        {content.steps.map((step, i) => (
          <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'16px', marginBottom:10, display:'flex', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:C.inner, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{step.icon}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:6 }}>{step.title}</div>
              <p style={{ fontSize:13, color:'#c0c8e0', lineHeight:1.65, margin:0 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resources */}
      <div style={{ padding:'0 16px', marginBottom:24 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:'0 0 14px' }}>Resources</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {content.resources.map(r => (
            <button key={r} style={{ background:C.inner, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', textAlign:'left', cursor:'pointer', color:C.text, fontSize:12, fontWeight:600 }}
              onClick={() => alert(`${r} — available in your school's resource library`)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Support */}
      <div style={{ padding:'0 16px' }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:'0 0 14px' }}>Support</h2>
        {[{ icon:'🎥', title:'Live Walkthrough',    desc:'Request a guided onboarding session for your school.' },{ icon:'📖', title:'Help Center Articles',  desc:'Search role-specific docs, FAQs, and setup guides.' },{ icon:'📝', title:'Release Notes',         desc:'See product changes and new feature announcements.' }].map(s => (
          <div key={s.title} style={{ background:C.inner, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
            <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:4 }}>{s.icon} {s.title}</div>
            <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.5 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

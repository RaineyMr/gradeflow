// src/pages/SupportStaffAI.jsx
import React from 'react'
import AIAssistantPanel from '../components/support/AIAssistantPanel'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function SupportStaffAI({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #003057 0%, #000d1a 100%)', 
        padding:'16px 20px', position:'sticky', top:0, zIndex:50 
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button 
            onClick={onBack} 
            style={{ 
              background:'rgba(255,255,255,0.12)', 
              border:'none', 
              borderRadius:10, 
              padding:'7px 14px', 
              color:'#fff', 
              cursor:'pointer', 
              fontSize:13, 
              fontWeight:600 
            }} 
          >
            ← Back
          </button>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>
              🤖 AI Assistant
            </h1>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.55)', margin:0 }}>
              Support Staff AI Helper
            </p>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel - Full Screen */}
      <AIAssistantPanel
        isOpen={true}
        onClose={onBack}
        initialContext={{ 
          screen: 'ai',
          standalone: true
        }}
      />
    </div>
  )
}

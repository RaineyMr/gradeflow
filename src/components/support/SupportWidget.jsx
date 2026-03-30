// src/components/support/SupportWidget.jsx
import React from 'react'

const C = {
  bg:'#060810', card:'#111520', inner:'#1a1f2e', raised:'#1e2436',
  text:'#eef0f8', soft:'#c8cce0', muted:'#6b7494', border:'#252b3d',
  green:'#22c97a', blue:'#3b7ef4', red:'#f04a4a', amber:'#f5a623',
  teal:'#0fb8a0', purple:'#9b6ef5',
}

export default function SupportWidget({ 
  title, 
  icon, 
  children, 
  color = C.blue,
  size = 'medium', // 'small', 'medium', 'large'
  onClick 
}) {
  const sizeStyles = {
    small: { padding:16, minHeight:120 },
    medium: { padding:20, minHeight:180 },
    large: { padding:24, minHeight:240 }
  }

  return (
    <div 
      style={{
        background:C.card,
        border:`1px solid ${C.border}`,
        borderRadius:16,
        ...sizeStyles[size],
        cursor: onClick ? 'pointer' : 'default',
        transition:'all 0.15s',
        position:'relative',
        overflow:'hidden'
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div style={{ 
        display:'flex', alignItems:'center', gap:12, marginBottom:16 
      }}>
        <div style={{
          width:40, height:40, borderRadius:10, background:`${color}20`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:20
        }}>
          {icon}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>
            {title}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ color:C.text, fontSize:13, lineHeight:1.5 }}>
        {children}
      </div>

      {/* Accent border */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:3,
        background:color, borderRadius:'16px 16px 0 0'
      }} />
    </div>
  )
}

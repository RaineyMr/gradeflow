/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: '#0c0e14',
        card: '#161923',
        elevated: '#1e2231',
        border: '#2a2f42',
        'text-primary': '#eef0f8',
        'text-muted': '#6b7494',
        accent: '#3b7ef4',
        success: '#22c97a',
        danger: '#f04a4a',
        warning: '#f5a623',
        purple: '#9b6ef5',
        teal: '#0fb8a0',
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        widget: '20px',
        card: '14px',
        pill: '999px',
      }
    }
  },
  plugins: []
}

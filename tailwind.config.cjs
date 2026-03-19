module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        slateDeep: '#020617',
        emerald500: 'var(--emerald-500, #10B981)',
        cyan400: 'var(--cyan-400, #22D3EE)'
      }
    }
  },
  plugins: []
}

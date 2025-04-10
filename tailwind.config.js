module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aggrid: {
          primary: '#5F46F9',
          secondary: '#0F0816',
          brand: '#10B981',
          background: 'var(--tw-color-aggrid-background)',

          border: 'var(--tw-color-aggrid-border)',
          hover: 'var(--tw-color-aggrid-hover)',
          pagination: 'var(--tw-color-aggrid-pagination)',
          paginationtext: 'var(--tw-color-aggrid-paginationtext)'
        }
      },
      fontFamily: {
        'dm-mono': ['var(--font-dm-mono)'],
        proxima: ['Proxima Nova', 'sans-serif']
      }
    }
  },
  plugins: []
}

module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aggrid: {
          background: 'var(--tw-color-aggrid-background)',

          border: 'var(--tw-color-aggrid-border)',
          hover: 'var(--tw-color-aggrid-hover)',
          pagination: 'var(--tw-color-aggrid-pagination)',
          paginationtext: 'var(--tw-color-aggrid-paginationtext)'
        }
      }
    }
  },
  plugins: []
}

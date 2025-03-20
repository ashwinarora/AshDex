module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aggrid: {
          background: 'var(--tw-color-aggrid-background)',
          header: 'var(--tw-color-aggrid-header)',
          text: 'var(--tw-color-aggrid-text)',
          border: 'var(--tw-color-aggrid-border)',
          hover: 'var(--tw-color-aggrid-hover)',
          headertext: 'var(--tw-color-aggrid-headertext)',
          pagination: 'var(--tw-color-aggrid-pagination)',
          paginationtext: 'var(--tw-color-aggrid-paginationtext)'
        }
      }
    }
  },
  plugins: []
}

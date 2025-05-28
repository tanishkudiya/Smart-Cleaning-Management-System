module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
  animation: {
    fadeIn: 'fadeIn 1s ease-out',
    slideInUp: 'slideInUp 1s ease-out',
    'spin-slow': 'spin 10s linear infinite',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    },
    slideInUp: {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' }
    }
  }
}
  },
  plugins: [],
};

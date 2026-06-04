import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cubic-bg': '#1A1721',
        'cubic-card': '#211D2A',
        'cubic-card-hover': '#2D2840',
        'cubic-accent': '#4ADE80',
        'cubic-border': '#2D2840',
        'cubic-muted': '#9B97A8',
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'cursive'],
        dm: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

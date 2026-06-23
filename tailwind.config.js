/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },
            },
            keyframes: {
                shimmer: {
                    '0%':   { backgroundPosition: '-400px 0' },
                    '100%': { backgroundPosition:  '400px 0' },
                },
                'fade-in-up': {
                    '0%':   { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%':   { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-down': {
                    '0%':   { opacity: '0', transform: 'translateY(-8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'progress-bar': {
                    '0%':   { width: '0%',   opacity: '1' },
                    '80%':  { width: '85%',  opacity: '1' },
                    '100%': { width: '100%', opacity: '0' },
                },
            },
            animation: {
                shimmer:       'shimmer 1.4s infinite linear',
                'fade-in-up':  'fade-in-up 0.45s ease both',
                'fade-in':     'fade-in 0.35s ease both',
                'slide-down':  'slide-down 0.3s ease both',
                'progress-bar':'progress-bar 1.8s ease-out forwards',
            },
        },
    },
    plugins: [],
}

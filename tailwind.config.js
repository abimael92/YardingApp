// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                desert: {
                    50: '#fef7ee',
                    100: '#fdebd5',
                    200: '#f9d3aa',
                    300: '#f4b474',
                    400: '#ee8c3d',
                    500: '#ea6f17',
                    600: '#db5510',
                    700: '#b63f10',
                    800: '#923315',
                    900: '#762c14',
                },
                sage: {
                    50: '#f6f7f3',
                    100: '#eaede2',
                    200: '#d5dcc6',
                    300: '#b4c29d',
                    400: '#91a374',
                    500: '#738855',
                    600: '#596b41',
                    700: '#465435',
                    800: '#3a452d',
                    900: '#323a28',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
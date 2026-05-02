import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563EB',
                    foreground: '#FFFFFF',
                }
            },
            fontFamily: {
                sans: ['var(--font-jakarta)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;

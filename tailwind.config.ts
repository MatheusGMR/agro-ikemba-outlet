
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#14a249',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#ebf0f1',
					foreground: '#000000'
				},
				destructive: {
					DEFAULT: '#E53E3E',
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#F7FAFC',
					foreground: '#718096'
				},
				accent: {
					DEFAULT: '#EDF2F7',
					foreground: '#14a249'
				},
				// Cores do brandbook Agro Ikemba
				"brand": {
					"green": {
						DEFAULT: "#14a249",
						"dark": "#115629"
					},
					"gray": {
						DEFAULT: "#ebf0f1"
					},
					"black": "#000000"
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: { 
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: { 
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					from: { 
						opacity: '1',
						transform: 'translateY(0)'
					},
					to: { 
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out forwards',
				'fade-out': 'fade-out 0.3s ease-out forwards',
			},
			fontFamily: {
				'poppins': ['Poppins', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

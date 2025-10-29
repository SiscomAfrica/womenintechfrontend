/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // RN app color palette
        'primary-orange': '#FF6B35',
        'primary-blue': '#007AFF',
        'success-green': '#4CAF50',
        'success-green-alt': '#34C759',
        'text-primary': '#1A1A1A',
        'text-secondary': '#333333',
        'text-tertiary': '#666666',
        'text-quaternary': '#999999',
        'text-placeholder': '#A0A0A0',
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F5F5F5',
        'bg-tertiary': '#F8F9FA',
        'bg-input': '#F9F9F9',
        'border-light': '#F0F0F0',
        'border-medium': '#E8E8E8',
        'border-dark': '#E0E0E0',
        
        // Session type colors
        'session-keynote': '#FF6B35',
        'session-workshop': '#4ECDC4',
        'session-networking': '#95E1D3',
        'session-panel': '#F38181',
        'session-break': '#A8E6CF',
        
        // Shadcn UI colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // RN app border radius scale
        'xs': 'var(--radius-sm)', // 8px
        'app-md': 'var(--radius-md)', // 12px
        'app-lg': 'var(--radius-lg)', // 16px
        'app-xl': 'var(--radius-xl)', // 20px
      },
      spacing: {
        // RN app spacing scale
        'xs': 'var(--spacing-xs)', // 8px
        'sm': 'var(--spacing-sm)', // 12px
        'md': 'var(--spacing-md)', // 16px
        'lg': 'var(--spacing-lg)', // 20px
        'xl': 'var(--spacing-xl)', // 24px
      },
      fontSize: {
        // RN app typography scale
        'caption': ['var(--font-size-caption)', { lineHeight: '1.3', letterSpacing: '0.5px' }],
        'body-xs': ['var(--font-size-xs)', { lineHeight: '1.3' }],
        'body-sm': ['var(--font-size-sm)', { lineHeight: '1.4' }],
        'body-md': ['var(--font-size-base)', { lineHeight: '1.4' }],
        'body-lg': ['var(--font-size-md)', { lineHeight: '1.5' }],
        'heading-sm': ['var(--font-size-lg)', { lineHeight: '1.3' }],
        'heading-md': ['var(--font-size-xl)', { lineHeight: '1.3' }],
        'heading-lg': ['var(--font-size-2xl)', { lineHeight: '1.3' }],
        'heading-xl': ['var(--font-size-3xl)', { lineHeight: '1.2' }],
        'button': ['var(--font-size-md)', { fontWeight: '600' }],
        'button-sm': ['var(--font-size-base)', { fontWeight: '600' }],
      },
      fontWeight: {
        'normal': 'var(--font-weight-normal)',
        'medium': 'var(--font-weight-medium)',
        'semibold': 'var(--font-weight-semibold)',
        'bold': 'var(--font-weight-bold)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Основные цвета из дизайн-системы
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        "input-background": "var(--input-background)",
        ring: "var(--ring)",
        // Цвета для чартов
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
        // Sidebar цвета
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Текстовые роли
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-subtle": "var(--text-subtle)",
        "text-disabled": "var(--text-disabled)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      fontSize: {
        xs: ["var(--text-xs)", { lineHeight: "1.33" }],
        sm: ["var(--text-sm)", { lineHeight: "1.43" }],
        base: ["var(--text-base)", { lineHeight: "1.5" }],
        lg: ["var(--text-lg)", { lineHeight: "1.56" }],
        xl: ["var(--text-xl)", { lineHeight: "1.4" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "1.33" }],
      },
      fontWeight: {
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
      },
      // Брейкпоинты согласно гайдлайнам
      screens: {
        'mobile': '360px',
        'tablet': '600px',
        'desktop': '1024px',
        'large': '1440px',
      },
      // Сетка согласно гайдлайнам
      gridTemplateColumns: {
        'mobile': 'repeat(4, minmax(0, 1fr))',
        'tablet': 'repeat(8, minmax(0, 1fr))',
        'desktop': 'repeat(12, minmax(0, 1fr))',
      },
      // Отступы согласно гайдлайнам (spacing scale: 8 / 12 / 16 / 24 / 32 / 48)
      spacing: {
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
        '26': '6.5rem',  // 104px
        '30': '7.5rem',  // 120px
        '34': '8.5rem',  // 136px
        '38': '9.5rem',  // 152px
      },
      // Контейнеры согласно гайдлайнам
      maxWidth: {
        'container-sm': '1200px',
        'container-lg': '1280px',
      },
      // Высоты элементов управления согласно гайдлайнам
      height: {
        'control': '2.75rem', // 44px для десктопа
        'control-mobile': '2.5rem', // 40px для мобильных
        'table-row': '3rem', // 48px для строк таблицы
      },
      // Анимации
      animation: {
        'fade-in': 'fadeIn 0.15s ease-in-out',
        'fade-out': 'fadeOut 0.15s ease-in-out',
        'slide-in': 'slideIn 0.15s ease-in-out',
        'slide-out': 'slideOut 0.15s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [
    // Плагин для анимаций
    require('@tailwindcss/forms'),
  ],
}

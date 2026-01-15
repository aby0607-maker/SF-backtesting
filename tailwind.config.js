/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode backgrounds
        dark: {
          950: '#08080C',  // Deepest
          900: '#0D0D12',  // Main background
          800: '#1A1A24',  // Elevated surfaces
          700: '#252532',  // Cards/inputs
          600: '#32323F',  // Hover states
          500: '#3F3F4D',  // Borders
        },
        // Primary brand color (Purple from Figma)
        primary: {
          50: '#E6D6FD',
          100: '#C8AEFC',
          200: '#8B85FA',
          300: '#985DF9',
          400: '#6B49F8',
          500: '#7E5FF7',  // Main primary
          600: '#712FDE',
          700: '#5A25B2',
          800: '#3F1A7C',
          900: '#26104A',
          950: '#0C0519',
        },
        // Morning Glory (Teal - used for success states)
        teal: {
          50: '#E2F0F2',
          100: '#C3F3E5',
          200: '#A4EED7',
          300: '#87E8CB',
          400: '#77E6C4',
          500: '#69E2B0',
          600: '#53B597',
          700: '#3E8971',
          800: '#2A5A4C',
          900: '#1F443A',
          950: '#0A1713',
        },
        // Information (Blue)
        info: {
          50: '#CCF3EB',
          100: '#9AE7CF',
          200: '#67C2FF',
          300: '#4FBBFF',
          400: '#1DA4FF',
          500: '#00C4B8',
          600: '#0278CC',
          700: '#015C8A',
          800: '#003E66',
          900: '#001F34',
          950: '#000E1A',
        },
        // Success (Green)
        success: {
          50: '#CCF3EB',
          100: '#9AE7CF',
          200: '#67DDB8',
          300: '#35D0A0',
          400: '#02B17A',
          500: '#00C489',
          600: '#009DED',
          700: '#03895F',
          800: '#004E36',
          900: '#003D2A',
          950: '#00271B',
        },
        // Warning (Orange)
        warning: {
          50: '#FED0B3',
          100: '#FEB180',
          200: '#FDA167',
          300: '#FE8240',
          400: '#FC721A',
          500: '#FC6200',
          600: '#CA4E00',
          700: '#973B00',
          800: '#662700',
          900: '#4C1D00',
          950: '#321400',
        },
        // Destructive (Red)
        destructive: {
          50: '#FEEBEF',
          100: '#FEB0C1',
          200: '#FB9EB2',
          300: '#FA7592',
          400: '#FB4E73',
          500: '#F63A63',
          600: '#C62E4F',
          700: '#AD2945',
          800: '#621728',
          900: '#4A1120',
          950: '#2B030E',
        },
        // Neutral (Grays)
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Verdict colors (mapped to design system)
        verdict: {
          buy: '#00C489',      // Success green
          hold: '#FC6200',     // Warning orange
          avoid: '#F63A63',    // Destructive red
        },
        // Score colors (gradient from red to green)
        score: {
          low: '#F63A63',      // 0-4 (destructive)
          medium: '#FC6200',   // 4-6 (warning)
          high: '#00C489',     // 6-8 (success)
          excellent: '#03895F', // 8-10 (success dark)
        },
        // Segment status
        segment: {
          positive: '#00C489',
          neutral: '#6B7280',
          negative: '#F63A63',
        },
        // Alert severity
        alert: {
          critical: '#F63A63',
          high: '#FC6200',
          medium: '#FE8240',
          low: '#00C4B8',
        },
        // Background colors
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#F9FAFB',
          tertiary: '#F3F4F6',
        },
        // Text colors
        content: {
          DEFAULT: '#111827',
          secondary: '#4B5563',
          tertiary: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        // From Figma design system
        'display': ['4rem', { lineHeight: '3.5rem', fontWeight: '700', letterSpacing: '-0.02em' }], // 64px
        'h1': ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],      // 40px
        'h2': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '600' }],  // 36px
        'h3': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],      // 32px
        'h4': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],  // 28px
        'h5': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],      // 24px
        'h6': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],  // 20px
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],               // 18px
        'body': ['1rem', { lineHeight: '1.5rem' }],                       // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],               // 14px
        'caption': ['0.75rem', { lineHeight: '1rem' }],                   // 12px
      },
      spacing: {
        // From Figma spacing system (4px base)
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '2': '0.5rem',      // 8px
        '3': '0.75rem',     // 12px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '8': '2rem',        // 32px
        '10': '2.5rem',     // 40px
        '12': '3rem',       // 48px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
        '32': '8rem',       // 128px
        '40': '10rem',      // 160px
        '48': '12rem',      // 192px
        '56': '14rem',      // 224px
        '64': '16rem',      // 256px
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'card': '12px',
        'button': '8px',
        'input': '8px',
        'badge': '6px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'dropdown': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'purple': '0 4px 14px 0 rgba(126, 95, 247, 0.25)',
        // Glow effects for dark mode
        'glow-purple': '0 0 20px rgba(126, 95, 247, 0.5), 0 0 40px rgba(126, 95, 247, 0.2)',
        'glow-green': '0 0 20px rgba(0, 196, 137, 0.5), 0 0 40px rgba(0, 196, 137, 0.2)',
        'glow-orange': '0 0 15px rgba(252, 98, 0, 0.4), 0 0 30px rgba(252, 98, 0, 0.15)',
        'glow-red': '0 0 20px rgba(246, 58, 99, 0.5), 0 0 40px rgba(246, 58, 99, 0.2)',
        // Glass card shadows
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(126, 95, 247, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'score-fill': 'scoreFill 1.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scoreFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(180deg, #1A1A24 0%, #0D0D12 100%)',
        'gradient-purple-dark': 'linear-gradient(135deg, rgba(126, 95, 247, 0.15) 0%, transparent 50%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}

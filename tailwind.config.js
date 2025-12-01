/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.tsx",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Color Presets - Nature-Friendly Palette
      colors: {
        // Primary Blue (#1E90FF)
        primary: {
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CBFF',
          300: '#66B1FF',
          400: '#3397FF',
          500: '#1E90FF', // Primary Blue
          600: '#1873CC',
          700: '#125699',
          800: '#0C3A66',
          900: '#061D33',
        },
        // Deep Blue (#0057A7)
        'deep-blue': {
          50: '#E6F0F7',
          100: '#CCE1EF',
          200: '#99C3DF',
          300: '#66A5CF',
          400: '#3387BF',
          500: '#0057A7', // Deep Blue
          600: '#004586',
          700: '#003465',
          800: '#002244',
          900: '#001123',
        },
        // Eco Green (#32CD32)
        'eco-green': {
          50: '#F0FDF0',
          100: '#DCFBDC',
          200: '#B9F7B9',
          300: '#96F396',
          400: '#73EF73',
          500: '#32CD32', // Eco Green
          600: '#28A428',
          700: '#1E7B1E',
          800: '#145214',
          900: '#0A290A',
        },
        // Warning Yellow (#FFCC00)
        warning: {
          50: '#FFFBF0',
          100: '#FFF7E0',
          200: '#FFEFC1',
          300: '#FFE7A2',
          400: '#FFDF83',
          500: '#FFCC00', // Warning Yellow
          600: '#CCA300',
          700: '#997A00',
          800: '#665200',
          900: '#332900',
        },
        // Alert Red (#FF3B30)
        alert: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          300: '#E57373',
          400: '#EF5350',
          500: '#FF3B30', // Alert Red
          600: '#CC2F26',
          700: '#99231D',
          800: '#661713',
          900: '#330C0A',
        },
        // Semantic Colors
        success: '#32CD32',
        error: '#FF3B30',
        info: '#1E90FF',
        // Gray Scale
        gray: {
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
        // Water Quality Status Colors
        'water-quality': {
          excellent: '#32CD32',
          good: '#1E90FF',
          fair: '#FFCC00',
          poor: '#FF9500',
          critical: '#FF3B30',
        },
      },
      // Spacing Presets
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
        32: '128px',
        40: '160px',
        48: '192px',
        64: '256px',
      },
      // Font Size Presets
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.5' }],
        lg: ['18px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.5' }],
        '2xl': ['24px', { lineHeight: '1.25' }],
        '3xl': ['30px', { lineHeight: '1.25' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.2' }],
        '6xl': ['60px', { lineHeight: '1.2' }],
        '7xl': ['72px', { lineHeight: '1.1' }],
        '8xl': ['96px', { lineHeight: '1.1' }],
      },
      // Font Weight Presets
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      // Line Height Presets
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      // Letter Spacing Presets
      letterSpacing: {
        tighter: '-0.5px',
        tight: '-0.25px',
        normal: '0px',
        wide: '0.25px',
        wider: '0.5px',
        widest: '1px',
      },
      // Border Radius Presets
      borderRadius: {
        none: '0px',
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

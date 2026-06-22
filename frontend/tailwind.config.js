export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
          /* ── Primary (Deep Indigo — sophisticated) ── */
          "primary": "#4338ca",
          "on-primary": "#ffffff",
          "primary-container": "#e0e7ff",
          "on-primary-container": "#312e81",
          "primary-fixed": "#e2dfff",
          "primary-fixed-dim": "#c3c0ff",
          "on-primary-fixed": "#0f0069",
          "on-primary-fixed-variant": "#3323cc",
          "inverse-primary": "#c3c0ff",

          /* ── Secondary (Soft Lavender/Purple — like reference) ── */
          "secondary": "#8b7cb8",
          "on-secondary": "#ffffff",
          "secondary-container": "#ede8f5",
          "on-secondary-container": "#4a3b6b",
          "secondary-fixed": "#e8dff5",
          "secondary-fixed-dim": "#c8b8e0",
          "on-secondary-fixed": "#2d1f4e",
          "on-secondary-fixed-variant": "#5c4d82",

          /* ── Tertiary (Peach/Salmon — hero accent from reference) ── */
          "tertiary": "#e8956a",
          "on-tertiary": "#ffffff",
          "tertiary-container": "#fde8d8",
          "on-tertiary-container": "#7c3a1a",
          "tertiary-fixed": "#ffdcc3",
          "tertiary-fixed-dim": "#ffb77d",
          "on-tertiary-fixed": "#2f1500",
          "on-tertiary-fixed-variant": "#6e3900",

          /* ── Error ── */
          "error": "#dc2626",
          "on-error": "#ffffff",
          "error-container": "#fee2e2",
          "on-error-container": "#991b1b",

          /* ── Warning ── */
          "warning": "#d97706",
          "on-warning": "#ffffff",
          "warning-container": "#fef3c7",
          "on-warning-container": "#92400e",

          /* ── Success ── */
          "success": "#059669",
          "on-success": "#ffffff",
          "success-container": "#d1fae5",
          "on-success-container": "#064e3b",

          /* ── Surfaces (Warm gray palette — like reference background) ── */
          "background": "#eae6e1",
          "on-background": "#1c1917",
          "surface": "#ffffff",
          "on-surface": "#1c1917",
          "surface-dim": "#d6d2cd",
          "surface-bright": "#f5f2ee",
          "surface-variant": "#f0ece8",
          "on-surface-variant": "#57534e",
          "surface-container-lowest": "#ffffff",
          "surface-container-low": "#f5f2ee",
          "surface-container": "#efecea",
          "surface-container-high": "#e7e3de",
          "surface-container-highest": "#d6d2cd",
          "surface-tint": "#4338ca",

          /* ── Dark Surface (for dark cards like reference) ── */
          "surface-dark": "#1c1917",
          "on-surface-dark": "#e7e5e4",
          "surface-dark-dim": "#292524",
          "on-surface-dark-dim": "#a8a29e",

          "inverse-surface": "#292524",
          "inverse-on-surface": "#f5f2ee",

          /* ── Outline ── */
          "outline": "#a8a29e",
          "outline-variant": "#d6d2cd",
      },
      "borderRadius": {
          "DEFAULT": "0.75rem",
          "sm": "0.5rem",
          "md": "0.75rem",
          "lg": "1rem",
          "xl": "1.25rem",
          "2xl": "1.5rem",
          "3xl": "2rem",
          "full": "9999px"
      },
      "spacing": {
          "gap_section": "24px",
          "sidebar_width": "260px",
          "sidebar_collapsed": "72px",
          "gutter": "16px",
          "padding_card": "24px",
          "container_max": "1280px",
          "margin_mobile": "16px"
      },
      "fontFamily": {
          "h1-mobile": ["Inter", "sans-serif"],
          "caption": ["Inter", "sans-serif"],
          "h2": ["Inter", "sans-serif"],
          "h3": ["Inter", "sans-serif"],
          "h1": ["Inter", "sans-serif"],
          "data-mono": ["JetBrains Mono", "monospace"],
          "body": ["Inter", "sans-serif"]
      },
      "fontSize": {
          "h1-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
          "caption": ["12px", { "lineHeight": "16px", "letterSpacing": "0.01em", "fontWeight": "500" }],
          "h2": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
          "h3": ["18px", { "lineHeight": "24px", "letterSpacing": "0em", "fontWeight": "600" }],
          "h1": ["28px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
          "data-mono": ["13px", { "lineHeight": "18px", "letterSpacing": "0em", "fontWeight": "400" }],
          "body": ["14px", { "lineHeight": "20px", "letterSpacing": "0em", "fontWeight": "400" }]
      },
      "boxShadow": {
          "card": "0 1px 4px rgba(0,0,0,0.04)",
          "card-hover": "0 12px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
          "modal": "0 24px 64px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)",
          "nav": "0 1px 3px rgba(0,0,0,0.04)",
          "inner": "inset 0 2px 4px rgba(0,0,0,0.04)",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
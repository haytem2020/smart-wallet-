---
name: Teal Clarity
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3d4947'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#55615f'
  on-secondary: '#ffffff'
  secondary-container: '#d8e5e2'
  on-secondary-container: '#5b6765'
  tertiary: '#00685c'
  on-tertiary: '#ffffff'
  tertiary-container: '#008375'
  on-tertiary-container: '#f4fffb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#d8e5e2'
  secondary-fixed-dim: '#bcc9c6'
  on-secondary-fixed: '#121e1c'
  on-secondary-fixed-variant: '#3d4947'
  tertiary-fixed: '#62fae3'
  tertiary-fixed-dim: '#3cddc7'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005047'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 44px
  headline-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style

This design system is built for high-frequency financial tracking, prioritizing cognitive clarity and visual calm. The brand personality is professional yet approachable, utilizing a **Modern Minimalist** aesthetic with **Glassmorphic** accents to create a sense of depth without clutter. 

The target audience consists of mindful individuals seeking financial organization. The UI should evoke a sense of "quiet control"—using ample whitespace (negative space) and a sophisticated RTL (Right-to-Left) flow to ensure data-heavy screens remain breathable. Visual interest is generated through subtle gradients and layered surfaces rather than aggressive decorative elements.

## Colors

The palette centers on an eye-comforting Teal spectrum. The **Primary Teal (#0D9488)** is used for main actions and brand presence, balanced by a **Secondary Tint (#F0FDFA)** which serves as a soft background for card elements to reduce optical fatigue.

- **Primary**: Teal 600 for high-level hierarchy and CTA buttons.
- **Secondary**: A light teal wash for large surface areas.
- **Tertiary**: A bright Mint/Teal for "Income" indicators and positive trends.
- **Surface**: Pure White (#FFFFFF) for primary cards to pop against the subtle teal-grey background (#F8FAFC).
- **Status**: Soft Red (#F43F5E) for expenses/alerts, used sparingly to maintain the "calm" brand promise.

## Typography

The design system utilizes **IBM Plex Sans Arabic** for its exceptional legibility in financial contexts and its neutral, systematic feel. The type scale is optimized for RTL reading patterns, ensuring that numerals (Western Arabic or Eastern Arabic numerals, depending on locale) align perfectly with the text baseline.

Key typographic rules:
- **Numerical Data**: Use Medium or SemiBold weights for currency amounts to ensure they are the first thing the eye catches.
- **Line Height**: Increased line-heights for body text to accommodate Arabic script descenders and ascenders comfortably.
- **Alignment**: Standardize on Right-alignment; avoid center-aligning long paragraphs.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile-first interactions. On mobile devices, a 4-column grid is used with a 20px outer margin. On larger dashboards (tablet/desktop), a 12-column grid is employed.

- **Vertical Rhythm**: Built on an 8px base unit.
- **Touch Targets**: All interactive elements (buttons, list items) maintain a minimum height of 48px.
- **RTL Logic**: Margins and paddings are mirrored; `padding-right` on a standard LTR layout becomes `padding-left` here to maintain the start-of-line breathing room.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. Instead of heavy black shadows, this design system uses soft, colored shadows (Teal-tinted) to maintain a clean look.

- **Level 0 (Background)**: #F8FAFC (Light Grey-Blue).
- **Level 1 (Cards)**: White surface with a 12% opacity Teal shadow, 4px blur, 2px offset.
- **Level 2 (Active/Modals)**: White surface with a 15% opacity Teal shadow, 16px blur, 8px offset.
- **Glassmorphism**: Top navigation bars and bottom tab bars should use a 20px background blur (backdrop-filter) with an 80% opaque white fill to create a sense of continuity as the user scrolls.

## Shapes

The shape language is **Rounded**, favoring organic and friendly containers. Standard UI components like input fields and small cards use a **0.5rem (8px)** radius. Larger dashboard containers and primary call-to-action sections use a **1rem (16px)** radius to feel distinct and modern.

Buttons are never sharp; they should always carry at least a 0.5rem radius or be fully pill-shaped if they are floating action buttons (FAB).

## Components

### Buttons
- **Primary**: Solid Teal (#0D9488) with white text. High-contrast, 16px corner radius.
- **Secondary**: Teal-tinted background (#F0FDFA) with Teal text. No border.

### Expense Cards
Cards should feature a 1px soft border (#E2E8F0) and a subtle shadow. The category icon should be placed on the far right (RTL start), followed by the category name and date. The currency amount should be on the far left (RTL end).

### Input Fields
Inputs use a "floating label" style. The border is a neutral #CBD5E1, turning Primary Teal on focus. Error states should change the border to Red, but keep the background white to maintain cleanliness.

### Progress Bars
Used for budget tracking. The track should be a very light neutral (#F1F5F9), with the filler using a Teal-to-Mint gradient.

### Chips/Tags
Used for transaction categories. Small, 4px radius, using low-saturation background colors (e.g., soft lavender for "Shopping", soft amber for "Dining") to differentiate categories without overwhelming the primary teal theme.
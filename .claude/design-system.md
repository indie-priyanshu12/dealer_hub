# Design System
### Version 1.0
### Project: Premium Car Dealership Inventory System

---

# Philosophy

## Core Vision

This website should not feel like a traditional dealership website.

It should feel like walking into a luxury automotive showroom where every interaction has been carefully crafted.

Users should enjoy exploring vehicles even when they have no intention of purchasing one.

The interface should create curiosity, confidence, and excitement while remaining calm and professional.

Every page should communicate:

- Premium
- Trust
- Precision
- Simplicity
- Modern Engineering
- Luxury

The user should never feel overwhelmed.

Instead, the UI should quietly guide them through every interaction.

---

# Design Inspiration

The design language combines elements from:

- Porsche
- Apple
- Mercedes-Benz
- Rivian
- Lucid Motors
- Linear.app
- Stripe
- Framer
- Nothing

Avoid copying any specific design.

Instead, combine their strongest characteristics into one cohesive experience.

---

# Experience Goals

When users first open the website they should think:

> "This looks premium."

Within ten seconds:

> "This feels smooth."

After interacting:

> "Everything responds exactly how I expected."

By the end:

> "I want to browse more."

The website should encourage exploration.

---

# Visual Identity

## Theme

Warm Light Theme

Never use harsh white backgrounds.

The website should feel soft and welcoming.

Large empty spaces are encouraged.

Allow the content to breathe.

---

## Colour Palette

### Primary Background

```css
#F8F8F6
```

---

### Secondary Background

```css
#F2F3F5
```

---

### Glass Surface

```css
rgba(255,255,255,0.55)
```

---

### Card Background

```css
#FFFFFF
```

---

### Primary Text

```css
#1E293B
```

---

### Secondary Text

```css
#64748B
```

---

### Accent Blue

```css
#2563EB
```

---

### Hover Blue

```css
#3B82F6
```

---

### Success

```css
#22C55E
```

---

### Error

```css
#EF4444
```

---

### Border

```css
rgba(0,0,0,.08)
```

---

### Glass Border

```css
rgba(255,255,255,.45)
```

---

# Glassmorphism

Glass should be used carefully.

Do NOT make every component glass.

Glass should feel premium because it is rare.

Allowed:

- Navbar
- Login card
- Register card
- Search box
- Filter drawer
- Floating action buttons
- Dialogs
- Vehicle quick preview
- Notifications

Not allowed:

- Every card
- Every button
- Entire pages
- Tables
- Long forms

---

Glass Style

```css
backdrop-filter: blur(18px);

background:
rgba(255,255,255,.55);

border:
1px solid rgba(255,255,255,.45);

box-shadow:
0 12px 40px rgba(0,0,0,.08);
```

---

# Typography

## Font

Primary

```
Manrope
```

Fallback

```
Inter

Plus Jakarta Sans
```

Never use multiple fonts.

---

## Font Weights

Regular

```
400
```

Medium

```
500
```

SemiBold

```
600
```

Bold

```
700
```

Extra Bold

```
800
```

---

# Typography Scale

Hero

```
72px
```

Section

```
52px
```

Heading

```
40px
```

Card Title

```
28px
```

Body

```
18px
```

Small

```
15px
```

Caption

```
13px
```

Maintain generous line height.

---

# Border Radius

Small

```
12px
```

Cards

```
20px
```

Buttons

```
999px
```

Inputs

```
18px
```

Dialogs

```
24px
```

Never use sharp corners.

---

# Spacing System

Use an 8-point grid.

```
4
8
16
24
32
48
64
80
96
128
```

No arbitrary spacing.

Whitespace is a design element.

---

# Shadows

Use soft shadows.

Avoid dark heavy shadows.

Card

```css
0 10px 30px rgba(0,0,0,.06)
```

Hover

```css
0 18px 40px rgba(0,0,0,.08)
```

Floating

```css
0 25px 60px rgba(0,0,0,.12)
```

---

# Motion Principles

Motion should explain.

Never decorate.

Every animation should answer one question:

"What changed?"

---

Animations should feel:

- smooth
- soft
- responsive
- intentional

Never flashy.

---

# Timing

Hover

```
180ms
```

Click

```
120ms
```

Page transition

```
350ms
```

Dialog

```
280ms
```

Loading

```
600ms
```

---

# Easing

Prefer

```
ease-out
```

or

Spring

```
stiffness:180

damping:22
```

Avoid bounce animations.

---

# Micro-interactions

Every interactive element should respond.

Buttons

- Slight lift
- Shadow increases
- Colour brightens
- Cursor changes

Inputs

- Glow softly
- Border animates
- Label transitions
- Caret colour becomes blue

Cards

- Lift
- Image zooms slightly
- Shadow deepens
- CTA fades in

Links

- Underline slides in
- Colour changes

Icons

- Rotate slightly
- Fade
- Scale 1.05

Loading

- Skeleton shimmer
- Smooth fade

Success

- Gentle check animation

Error

- Soft shake
- Never aggressive

---

# Hover Philosophy

Hover should reveal.

Not surprise.

The user should feel rewarded.

Never distracted.

---

# Buttons

Buttons should feel touchable.

Primary

- Blue gradient
- White text
- Pill shape
- Soft shadow

Hover

- Lift 2px
- Brighten
- Shadow increases

Pressed

- Scale 0.98

Disabled

- Reduced opacity
- No hover

---

# Inputs

Inputs should feel premium.

Large height

Rounded

Minimal borders

Soft shadows

Generous padding

Focus state:

- Blue glow
- Slight elevation
- Border transition

Never use thick outlines.

---

# Cards

Cards are the core experience.

Vehicle cards should feel collectible.

Hover behaviour:

- Move upward
- Image zoom 1.04
- Button fades upward
- Shadow increases
- Border brightens

Do not over-animate.

---

# Icons

Use

Lucide React

Outline icons only.

Consistent stroke width.

Do not mix icon libraries.

---

# Images

Vehicle photography should dominate.

Use:

Large

High quality

Edge-to-edge

Rounded corners

Minimal overlays.

Images should always remain the focus.

---

# Loading Experience

Never show blank screens.

Always use:

- Skeletons
- Fade transitions
- Progressive loading

Avoid spinners whenever possible.

---

# Accessibility

Target WCAG AA.

Keyboard navigation must work everywhere.

Visible focus rings.

High colour contrast.

Minimum touch target:

```
44×44px
```

Forms require labels.

Animations should respect:

```
prefers-reduced-motion
```

---

# Responsive Philosophy

Desktop first.

Tablet second.

Mobile never feels like a compressed desktop.

Components should rearrange naturally.

Avoid horizontal scrolling.

---

# Emotion

Every page should feel:

Elegant.

Confident.

Modern.

Relaxed.

Expensive.

Never loud.

Never childish.

Never overly futuristic.

---

# Things To Avoid

Do NOT use:

- Neumorphism
- Excessive gradients
- Rainbow colours
- Heavy blur everywhere
- Excessive shadows
- Bounce animations
- Long loading animations
- Sharp corners
- Dense layouts
- Tiny buttons
- Tiny text
- Flashing effects
- Overly dark sections

---

# Success Metric

If someone lands on the website without knowing anything about the company, they should assume:

- The dealership sells premium vehicles.
- The platform is professionally engineered.
- The experience feels polished and trustworthy.
- Browsing the inventory is enjoyable enough that they continue exploring beyond their original goal.

Every design decision should reinforce these four impressions.
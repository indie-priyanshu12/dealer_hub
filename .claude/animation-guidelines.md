# Animation & Interaction Guidelines
### Version 1.0
### Premium Car Dealership Inventory System

---

# Philosophy

Motion is part of the product.

Animations should never exist just because they look cool.

Every animation must communicate:

- Feedback
- Hierarchy
- Direction
- Cause and effect
- Delight

A user should never notice the animation itself.

They should only notice that the website feels incredibly smooth.

The goal is to make interactions feel satisfying rather than flashy.

---

# Motion Principles

Every animation should answer one question:

> "What changed?"

Never animate without purpose.

Motion should feel like the interface is physically responding to the user.

The website should feel alive.

---

# Motion Personality

The motion language should feel:

- Premium
- Confident
- Soft
- Elegant
- Responsive
- Refined

Never

- Bouncy
- Cartoonish
- Exaggerated
- Slow
- Distracting

---

# Animation Timing

### Hover

```
150–180ms
```

---

### Input Focus

```
180ms
```

---

### Button Click

```
120ms
```

---

### Cards

```
250ms
```

---

### Modal

```
300ms
```

---

### Page Transition

```
350ms
```

---

### Hero Animations

```
600ms
```

---

### Authentication Switch

```
600ms
```

---

# Easing

Default

```
ease-out
```

Preferred Spring

```
stiffness: 180

damping: 22

mass: 0.8
```

Avoid overshooting.

Avoid exaggerated bounce.

---

# Hover Philosophy

Hover should feel rewarding.

Every hover should slightly improve the interface.

Never surprise the user.

Never dramatically move components.

---

# Mouse Cursor

Desktop only.

The cursor should feel like a light source.

Features

- Soft radial glow
- Subtle shadow movement
- Light reflection on glass cards

Never create distracting cursor trails.

---

# Buttons

## Hover

Animate

- Lift 2px
- Shadow increases
- Gradient brightens
- Border lightens

Duration

```
180ms
```

---

## Press

Animate

- Scale 0.98
- Shadow reduces
- Gradient darkens

Release should feel soft.

---

## Success

After successful action

Button morphs into

✓

Small pulse

Continue naturally.

---

# Inputs

Hover

- Border darkens
- Shadow increases

Focus

- Blue glow
- Label slides upward
- Caret changes colour
- Shadow expands

Error

- Soft shake
- Border becomes red
- Helper fades in

Success

- Green check
- Border becomes green
- Glow fades naturally

---

# Cards

Cards should react to the user.

Hover

- Translate upward 6px
- Shadow deepens
- Image zooms to 1.04
- Border brightens
- CTA slides upward
- Favourite icon fades in

Maximum movement

```
6px
```

Never more.

---

# Vehicle Image

Hover

- Slight zoom
- Improved brightness
- Reflection shift

Never rotate.

Never aggressively zoom.

---

# Vehicle Details

Expandable specifications

Animate

- Height
- Opacity
- Blur

Never instantly appear.

---

# Navigation

Hover

- Underline grows from center
- Text colour changes
- Small upward movement

Active page

Blue indicator slides smoothly.

---

# Search Bar

Focus

- Expand slightly
- Glow softly
- Search icon animates
- Suggestions fade upward

Typing

Results update smoothly.

Avoid layout jumps.

---

# Filters

Opening filters

Animate

- Fade
- Slide
- Blur

Selections

Checkbox fills smoothly.

Sliders animate naturally.

---

# Dropdowns

Open

Scale

```
0.96 → 1
```

Fade

Shadow

Items stagger

Close

Reverse animation.

---

# Hero Section

On page load

Headline

Fade

Slide upward

Vehicle image

Fade

Scale

```
0.95 → 1
```

Buttons

Appear sequentially.

---

# Login/Register Transition

This is the signature animation.

Do not simply swap forms.

Instead

Entire layout transitions.

Sequence

1.

Current form fades slightly.

2.

Container slides.

3.

Image shifts.

4.

Glass reflections update.

5.

Heading changes.

6.

Inputs stagger.

7.

Buttons appear.

Everything should feel continuous.

---

# Page Transitions

Every route transition should feel connected.

Exit

Opacity

100 → 0

Translate

```
0 → -20px
```

Enter

Opacity

0 → 100

Translate

```
20px → 0
```

Duration

```
350ms
```

---

# Skeleton Loading

Prefer skeletons instead of spinners.

Skeletons

- Rounded
- Soft shimmer
- Neutral colours

Never flashing.

---

# Notifications

Toast enters

Fade

Slide

Scale

Exit

Fade

Slide upward

Maximum duration

```
4 seconds
```

---

# Success Animations

Examples

Vehicle Added

Vehicle Purchased

Registration Complete

Use

- Check animation
- Small pulse
- Soft glow

Never confetti.

---

# Error Animations

Examples

Login Failed

Validation Failed

Purchase Failed

Animate

- Small shake
- Red glow
- Message fades in

Never aggressive shaking.

---

# Empty States

Illustration fades.

Text slides upward.

CTA appears last.

Encourage exploration.

Never show blank screens.

---

# Numbers

Statistics

Inventory Count

Prices

Revenue

Animate counting.

Duration

```
800ms
```

Never animate continuously.

---

# Charts

Animate once.

Bars grow upward.

Lines draw naturally.

Tooltips fade.

No constant movement.

---

# Image Loading

Images

Fade

Scale

```
0.98 → 1
```

Blur

```
6px → 0px
```

Lazy load all large images.

---

# Scroll Behaviour

Scrolling should feel smooth.

Cards appear as they enter viewport.

Fade

Translate

```
20px
```

Maximum once.

Never replay every scroll.

---

# Floating Action Button

Hover

Lift

Glow

Ripple

Click

Compress

Release

Expand naturally.

---

# Modal Windows

Background

Blur

Dark overlay

Modal

Scale

```
0.96 → 1
```

Fade

Close

Reverse.

---

# Tables

Rows

Fade sequentially.

Hover

Highlight row.

Buttons appear softly.

Sorting

Columns animate smoothly.

---

# Progress Indicators

Use animated progress bars.

Never use abrupt changes.

Progress should ease naturally.

---

# Reduced Motion

Respect

```
prefers-reduced-motion
```

Disable

- Parallax
- Floating
- Cursor effects
- Card tilt
- Hero animations

Retain only essential fades.

---

# Performance Rules

Only animate

- opacity
- transform
- filter

Avoid animating

- width
- height
- left
- top
- margin

Use GPU acceleration.

Avoid layout thrashing.

---

# Things To Avoid

Do NOT use

- Bounce animations
- Infinite floating objects
- Constant spinning
- Flashing colours
- Elastic effects
- Confetti
- Excessive parallax
- Random motion
- Slow transitions
- Delayed UI

Every movement should have a reason.

---

# Signature Interactions

These should become the visual identity of the website.

✓ Sliding Login/Register panels

✓ Magnetic premium buttons

✓ Glass reflections

✓ Vehicle card lift

✓ Cursor light glow

✓ Smooth shared page transitions

✓ Animated vehicle image zoom

✓ Blue focus glow on inputs

✓ Floating navigation indicator

✓ Skeleton loading

✓ Soft success animations

---

# Final Motion Goal

If a user spends five minutes exploring the website, they should never consciously think about the animations.

Instead, they should simply feel that the entire platform is exceptionally polished, responsive, and enjoyable to use.

The interface should feel less like a traditional website and more like interacting with a carefully engineered luxury automotive product.

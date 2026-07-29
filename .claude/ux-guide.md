# UX States, Error Handling & Feedback Design System
### Version 1.0
### Premium Car Dealership Inventory System

---

# Philosophy

Users should never feel confused.

Every state of the application should answer one of these questions:

- What is happening?
- Why is it happening?
- What can I do next?

The application should never expose technical information to end users.

The UI must translate technical problems into clear, human-friendly language.

Users don't care about:

- HTTP Status Codes
- Stack traces
- JWT errors
- SQL errors
- Axios exceptions
- Network exceptions

Users care about:

> "Can I continue?"

---

# Core Principles

Every state should contain:

✓ A meaningful illustration or icon

✓ A simple headline

✓ A short explanation

✓ A clear primary action

✓ An optional secondary action

✓ Consistent animations

✓ Accessible messaging

---

# Voice & Tone

The application should sound

- Helpful
- Professional
- Friendly
- Calm
- Reassuring

Never

- Robotic
- Technical
- Aggressive
- Funny during errors
- Overly apologetic

Avoid

❌ Error 500

❌ Request failed

❌ Something broke unexpectedly

Instead

✅ We're having trouble loading your vehicles.

✅ Check your connection and try again.

---

# Loading Philosophy

Never show a blank page.

Never leave users wondering if the application froze.

Loading should reassure users that progress is happening.

---

# Skeleton Loading

Skeletons should replace nearly every spinner.

Use skeletons for

- Vehicle cards
- Vehicle details
- Profile page
- Dashboard
- Search results
- Filters
- Inventory tables
- Admin pages
- User profile
- Notifications

Skeleton Style

- Rounded corners
- Soft shimmer
- Light grey
- No flashing
- Match actual content layout

Animation

```
Soft shimmer

1.5 seconds

Infinite
```

Never use harsh flashing placeholders.

---

# Progress Indicators - Use laoder.svg which is available in the public folder

Use progress indicators when loading takes more than

```
600ms
```

Examples

- Login
- Registration
- Vehicle Purchase
- Image Upload
- File Export

Progress should feel smooth.

Never jump instantly.

---

# Initial Page Loading

Instead of

White screen

↓

Spinner

Use

Soft fade

Logo

Headline

Skeleton layout

Then content appears progressively.

---

# Authentication Loading

Login

Button transforms into loading state.

Button text changes

```
Signing you in...
```

Spinner appears inside button.

Inputs become disabled.

Background remains interactive.

When complete

Button morphs into

✓

Then transition to dashboard.

---

# Registration Loading

Button

```
Creating your account...
```

Loading indicator

↓

Success animation

↓

Automatic login

↓

Redirect

---

# Vehicle Purchase Loading

Button

```
Processing Purchase...
```

Button disabled.

Progress line animates.

Card remains visible.

Do not freeze the page.

---

# Empty States

Empty states should encourage exploration.

Never leave empty white spaces.

---

## No Vehicles Available

Headline

```
No vehicles available yet
```

Description

```
We're updating our inventory.
Check back soon or explore our featured collections.
```

Primary

```
Refresh Inventory
```

Secondary

```
Browse Categories
```

Illustration

Minimal premium vehicle outline.

---

## Empty Search Results

Headline

```
No vehicles matched your search
```

Description

```
Try adjusting your filters or searching for a different model.
```

Actions

Reset Filters

Browse All Vehicles

---

## Empty Wishlist

Headline

```
Your wishlist is waiting
```

Description

```
Save vehicles you're interested in and compare them later.
```

CTA

Browse Vehicles

---

## Empty Notifications

Headline

```
You're all caught up
```

Description

```
We'll notify you about purchases, updates and offers here.
```

---

# No Internet

Detect offline mode.

Never let users wonder.

Headline

```
You're offline
```

Description

```
It looks like you've lost your internet connection.
We'll reconnect automatically once you're back online.
```

Primary

Retry

Secondary

Continue Browsing Cached Data

Show

Connection status indicator.

Automatically retry every

```
10 seconds
```

---

# Slow Internet

If requests exceed

```
4 seconds
```

Show

```
This is taking a little longer than usual...
```

Never

"Loading..."

Offer

Cancel

Retry

---

# Something Went Wrong

This is for unexpected errors.

Never expose

Axios errors

Stack traces

Database messages

JWT exceptions

Instead

Headline

```
Something went wrong
```

Description

```
We couldn't complete your request.
Please try again.
```

Actions

Retry

Return Home

Contact Support

Log technical details silently.

---

# Server Error

Instead of

```
500 Internal Server Error
```

Show

Headline

```
We're having trouble right now
```

Description

```
Our team has been notified.
Please try again in a few moments.
```

CTA

Retry

---

# Unauthorized

Headline

```
Please sign in
```

Description

```
You need an account to continue.
```

CTA

Login

---

# Session Expired

Headline

```
Your session has expired
```

Description

```
For your security, please sign in again.
```

CTA

Sign In

---

# Forbidden

Headline

```
Access Restricted
```

Description

```
You don't have permission to perform this action.
```

CTA

Return

---

# Not Found (404)

Should not feel like a dead end.

Headline

```
This page isn't here.
```

Description

```
The page may have been moved or no longer exists.
```

Illustration

Minimal road disappearing into the distance.

Actions

Home

Browse Inventory

Search Vehicles

---

# Vehicle Not Found

Headline

```
Vehicle unavailable
```

Description

```
This vehicle may have been sold or removed from the inventory.
```

Actions

Browse Similar Vehicles

---

# API Failure

Instead of exposing

Axios Error

Network Error

Fetch failed

Show

```
We're having trouble reaching our servers.

Please try again shortly.
```

Retry automatically.

---

# Validation Errors

Errors should appear beside the field.

Never use alert boxes.

Examples

Email

```
Please enter a valid email address.
```

Password

```
Password must contain at least 8 characters.
```

Phone

```
Enter a valid phone number.
```

---

# Form Submission Success

Success should feel rewarding.

Examples

Login

✓ Welcome back!

Registration

✓ Your account is ready.

Purchase

✓ Purchase confirmed.

Vehicle Added

✓ Vehicle successfully added.

Vehicle Updated

✓ Changes saved.

Wishlist

✓ Added to wishlist.

---

# Success Feedback

Instead of disappearing instantly

Show

Animated success icon.

Green glow.

Subtle pulse.

Message fades upward.

Duration

```
2.5 seconds
```

---

# Toast Notifications

Use toast notifications for

- Save
- Delete
- Update
- Purchase
- Login
- Logout
- Registration

Placement

Top Right

Desktop

Bottom

Mobile

Maximum

```
3

visible
```

Stack smoothly.

---

# Toast Design

Rounded

Glass

Soft shadow

Accent border

Icon

Auto dismiss

```
4 seconds
```

Pause on hover.

---

# Delete Confirmation

Never delete immediately.

Modal

Headline

```
Delete Vehicle?
```

Description

```
This action cannot be undone.
```

Buttons

Cancel

Delete

Delete button

Red

---

# Purchase Confirmation

Instead of immediate purchase

Show

Summary

Vehicle

Price

Tax

Total

Confirm Purchase

---

# Retry States

Whenever possible

Provide

Retry button.

Do not force page refreshes.

---

# Optimistic UI

Use optimistic updates for

Wishlist

Likes

Bookmarks

Profile changes

Then silently sync.

Rollback if necessary.

---

# Refresh States

Refreshing inventory

Do not blank the page.

Keep existing content.

Small loading indicator at top.

Replace content once loaded.

---

# Search States

Typing

Show

Searching...

If no results

Immediately transition into

Empty Search State.

---

# Button Loading

Loading buttons should

Keep width.

Replace text with loading state.

Prevent double-clicks.

Restore smoothly.

---

# Accessibility

All messages

Screen-reader friendly.

Use

```
aria-live="polite"
```

for success.

Use

```
aria-live="assertive"
```

for errors.

Never rely only on colour.

---

# Error Logging

Users should never see technical details.

Internally log

- API response
- Error code
- Stack trace
- Route
- Browser
- Timestamp

Optionally integrate

- Sentry
- LogRocket

---

# Delight Moments

The application should celebrate achievements.

Examples

✓ First Login

✓ First Vehicle Purchased

✓ Profile Completed

✓ Inventory Added

✓ Admin Created Vehicle

Use

Small success animation.

Subtle glow.

Never use confetti.

Never interrupt workflow.

---

# State Checklist

Every major page should support these states:

✅ Initial Loading

✅ Skeleton Loading

✅ Empty State

✅ No Search Results

✅ No Internet

✅ Slow Connection

✅ Success

✅ Validation Error

✅ Server Error

✅ Unauthorized

✅ Forbidden

✅ Session Expired

✅ Vehicle Not Found

✅ 404 Page

✅ Retry State

✅ Delete Confirmation

✅ Purchase Confirmation

✅ Refreshing State

✅ Optimistic Update

✅ Toast Notifications

---

# Final Goal

A user should never encounter a confusing screen.

Whether something succeeds, fails, loads slowly, or has no data, the interface should always communicate clearly, remain visually polished, and guide the user toward the next meaningful action.

The application should feel dependable, forgiving, and thoughtfully designed—even when things go wrong.
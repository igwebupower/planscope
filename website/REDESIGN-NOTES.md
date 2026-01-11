# PlanScope Website Redesign

## Design Philosophy

**"A quiet, confident product used by serious people."**

This redesign strips away the visual noise that signals "AI-generated SaaS template" and replaces it with intentional restraint. Every element earns its place.

### Core Principles

1. **Typography as design** — Headlines do the heavy lifting. No decorative icons or badges needed.

2. **Monochrome confidence** — Near-black text on white. One accent color (green) used only for positive status indicators. This isn't a startup trying to look "fun."

3. **Editorial rhythm** — Sections flow like a well-edited article, not a collection of component cards.

4. **Breathing room** — Generous spacing signals quality. Cramped layouts signal desperation.

5. **Mobile-native** — Not "desktop scaled down." Touch targets are generous. Text breathes.

---

## Color System

```css
/* Near-monochrome palette with functional accents */

/* Ink (text) */
--color-ink: #0a0a0a;           /* Primary text */
--color-ink-secondary: #525252;  /* Body copy */
--color-ink-tertiary: #8a8a8a;   /* Captions, labels */
--color-ink-faint: #b3b3b3;      /* Disabled, borders */

/* Surface (backgrounds) */
--color-surface: #ffffff;        /* Primary background */
--color-surface-raised: #fafafa; /* Slight elevation */
--color-surface-sunken: #f5f5f4; /* Recessed areas */
--color-border: #e5e5e5;         /* Visible borders */
--color-border-subtle: #f0f0f0;  /* Subtle separators */

/* Functional accents (used sparingly) */
--color-accent: #16a34a;         /* Positive/success only */
--color-pending: #a16207;        /* Pending/warning only */
```

### Why This Palette?

- **No brand color domination** — The product speaks through clarity, not color.
- **Warm neutrals** — Pure grays feel cold. The subtle warmth in #f5f5f4 feels human.
- **Accent restraint** — Green only appears for "approved" status. It means something.

---

## Typography

```css
/* System: Inter with specific weights */
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

/* Scale: Restrained, editorial */
--text-xs: 0.8125rem;  /* 13px - Captions */
--text-sm: 0.875rem;   /* 14px - Body small */
--text-base: 1rem;     /* 16px - Body */
--text-lg: 1.125rem;   /* 18px - Lead paragraphs */
--text-xl: 1.25rem;    /* 20px - Subheads */
--text-2xl: 1.5rem;    /* 24px - Section titles */
--text-3xl: 2rem;      /* 32px - Major sections */
--text-4xl: 2.75rem;   /* 44px - Secondary hero */
--text-5xl: 3.5rem;    /* 56px - Primary hero */
```

### Type Decisions

- **Inter** — Chosen for its optical clarity at small sizes and tight letter-spacing at large sizes. Not Poppins (too friendly), not Satoshi (too trendy).

- **Weight restraint** — Only 400, 450, 500, 550, 600 used. No bold (700) anywhere. Confidence doesn't need to shout.

- **Tight tracking on headlines** — `-0.025em` makes large text feel crafted, not generated.

---

## Spacing System

```css
/* 4px base unit, deliberate gaps */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Spacing Philosophy

- **Section padding: 96px+ on desktop** — Lets each section breathe independently.
- **Element gaps: 16-32px** — Tight enough to feel grouped, loose enough to feel calm.
- **Mobile reduction: ~60%** — Proportional, not arbitrary.

---

## Layout Structure

### Hero
- Centered, text-only (no split layout with mockup)
- Eyebrow → Title → Subtitle → CTA
- Product visual below hero, not competing with it

### Why No Split Hero?
The split hero with a browser mockup is the most overused SaaS pattern. It signals "template." A centered, typography-led hero signals confidence in the message itself.

### Product Visual
- Simple representation, not a fake "browser window"
- Shows the actual value: the panel with planning data
- Styled to match the real extension

### Sections Flow
1. Hero (proposition)
2. Product visual (proof)
3. Coverage stats (credibility)
4. Value proposition (problem/solution)
5. Features (details)
6. How it works (simplicity)
7. Use cases (relevance)
8. Pricing (action)
9. Final CTA (nudge)
10. Footer (utility)

---

## What Was Removed

### ❌ Browser mockup with colored dots
The red/yellow/green traffic lights are visual noise. Every SaaS site has them. Removing them doesn't lose information.

### ❌ Numbered feature cards
"01", "02", "03" numbering is a template pattern. Features don't need sequence—they need clarity.

### ❌ Step connectors
The dotted lines between "how it works" steps add nothing. The numbers themselves indicate sequence.

### ❌ "Most Popular" badges
These feel manipulative. The Pro plan's border treatment signals prominence without shouting.

### ❌ Colored CTA section
The teal background CTA was the most "AI SaaS" element. The final CTA is now white with a simple border separator.

### ❌ Trust bar with uppercase labels
"COMPREHENSIVE UK PLANNING DATA COVERAGE" in uppercase feels like marketing-speak. Replaced with simple stats.

### ❌ Icon usage
No icons throughout. Icons are often crutches for weak copy. The words do the work.

---

## Copy Improvements

### Hero

**Before:**
> Know before you buy.
> PlanScope shows you planning permission data directly on Rightmove and Zoopla listings. See what's been approved nearby, local authority approval rates, and potential development restrictions — all without leaving the page.

**After:**
> Planning data on every listing
> See what's been approved nearby, local authority approval rates, and development restrictions — without leaving the page.

**Why:**
- "Know before you buy" is abstract. "Planning data on every listing" is concrete.
- "PlanScope shows you" is redundant—they know what they're on.
- "all without leaving the page" → "without leaving the page" (tighter)

---

### Value Section

**Before:**
> The hidden cost of not knowing
> Most property buyers discover planning issues after they've made an offer...

**After:**
> The data you need, before you need it
> Most buyers discover planning issues after making an offer...

**Why:**
- "Hidden cost" is marketing-speak. "Before you need it" is benefit-focused.
- "property buyers" → "buyers" (unnecessary qualifier)
- "they've made" → "making" (tighter)

---

### Features

**Before:**
> Everything you need to know, in one place
> PlanScope surfaces the data that matters, right when you need it.

**After:**
Section title removed. Features speak for themselves.

**Why:**
- "Everything you need to know, in one place" is filler. Every product claims this.
- Let the feature descriptions carry the weight.

---

### Feature: Planning Constraints

**Before:**
> Conservation areas, listed buildings, green belt, flood zones, and Article 4 directions. Critical restrictions flagged before you fall in love with a property.

**After:**
> Conservation areas, listed buildings, green belt, flood zones, Article 4 directions. Critical restrictions, surfaced immediately.

**Why:**
- "before you fall in love with a property" is cliché. Cut it.
- "surfaced immediately" is more direct.

---

### How It Works

**Before:**
> Up and running in 30 seconds

**After:**
> How it works

**Why:**
- "Up and running in 30 seconds" makes a promise that creates skepticism.
- "How it works" is neutral and lets the simplicity speak.

---

### CTA Button

**Before:**
> Get Early Access

**After:**
> Add to Chrome — free

**Why:**
- "Early Access" implies beta/incomplete. For a production extension, state the action.
- "— free" removes pricing anxiety without a separate note.

---

### Final CTA

**Before:**
> Make informed property decisions
> Research smarter with planning intelligence on every listing.

**After:**
> Make informed decisions
> Planning intelligence on every property you browse.

**Why:**
- "property decisions" → "decisions" (context is clear)
- "Research smarter" is generic. Cut.
- "on every property you browse" is more specific than "on every listing"

---

## Avoiding "AI-Generated" Patterns

### Pattern 1: Gradient hero backgrounds
**Avoided by:** Pure white background with typography-led hierarchy.

### Pattern 2: Oversized rounded cards
**Avoided by:** Subtle 6-8px radii. Cards have light borders, not shadows.

### Pattern 3: Illustration packs
**Avoided by:** Zero illustrations. The product visual is a styled representation of real UI.

### Pattern 4: Numbered features
**Avoided by:** Simple headings. No "01", "02" markers.

### Pattern 5: "Most popular" badges on pricing
**Avoided by:** Featured plan has a darker border. No badge.

### Pattern 6: Colored CTA sections
**Avoided by:** All sections are white or light gray. No colored backgrounds.

### Pattern 7: Icon grids
**Avoided by:** Zero icons anywhere. Copy carries meaning.

### Pattern 8: Excessive animations
**Avoided by:** Only subtle transitions (150-250ms) on interactive elements.

---

## Mobile Considerations

### Touch Targets
- All buttons: minimum 44px height
- Nav toggle: 32x32px active area
- Footer links: 12px vertical padding

### Typography Scaling
```css
/* Desktop: 56px hero → Mobile: 32px hero */
/* Proportional reduction, not arbitrary */
@media (max-width: 640px) {
  --text-5xl: 2rem;    /* Was 3.5rem */
  --text-4xl: 1.75rem; /* Was 2.75rem */
  --text-3xl: 1.5rem;  /* Was 2rem */
}
```

### Layout Shifts
- Hero: padding reduced 40%
- Grids: collapse to single column
- Stats: stack vertically
- Pricing: stack vertically

### Cookie Banner
- Full-width on mobile, floating card on desktop
- Buttons expand to fill width on mobile

---

## Files Delivered

1. `index-redesign.html` — Complete HTML structure
2. `styles-redesign.css` — Full CSS with design system
3. `REDESIGN-NOTES.md` — This documentation

---

## Implementation Notes

### To Deploy

1. Backup current `index.html` and `styles.css`
2. Rename `index-redesign.html` → `index.html`
3. Rename `styles-redesign.css` → `styles.css`
4. Test on mobile devices before launch

### Dependencies
- Google Fonts: Inter (400, 450, 500, 550, 600)
- No JavaScript frameworks
- No CSS frameworks
- No build step required

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Quality Check

> "Would this design still feel premium and human-designed in 3 years?"

**Yes.** The design relies on:
- Typographic hierarchy (timeless)
- Generous whitespace (timeless)
- Restrained color (timeless)
- No trend-chasing visuals

What dates quickly: gradients, shadows, animations, illustrations, icons.
What lasts: clarity, restraint, confidence.

# Play Ready design system

**Direction: The Ground Register.**

The product replaces a coach's paper notebook at a sports academy in Dumka, Jharkhand.
The interface borrows its visual language from the physical world of a local sports
ground: the pitch green, chalk white field markings, scoreboard numerals, jersey
number plates, and the rubber stamps a club office uses to close its registers.

It is a working tool, not a poster. Every decorative-looking element traces back to a
real function: stamps are states, plates are identities, ruler ticks are sessions.

## The two faces: night register and day ledger

The product has two surfaces with different jobs, and they are designed as one story:

- **The night register (public brand).** The landing page and the login door wear
  the academy after dark: a near-black pitch canvas (`pitch #0A0F0A`), bone-white
  poster type, and one loud volt-lime accent (`volt #C8EF4C`) — the language of
  floodlit grounds and scoreboard panels. Type is Archivo pushed to its widest cut
  (`.display-poster`, width 125%, weight 860, uppercase, tight leading) set at
  poster scale with staggered line reveals. Photography is real sports imagery
  (cricket, kabaddi, football, hockey, athletics — the academy's five sports),
  unified by a dark green-black duotone grade with film grain. Motion is scroll-
  driven: clip-wipe image reveals, staggered line entrances, gentle parallax.
  Everything respects `prefers-reduced-motion` (framer-motion `MotionConfig
  reducedMotion="user"` plus a CSS fallback).
- **The day ledger (the working app).** Inside the desk, the lights come on: the
  sage field, chalk surfaces, ledger rules, stamps and jersey plates documented
  below. Usability outranks atmosphere here — no marketing animation, dense and
  scannable tables, permanent labels, large touch targets.

The login page is the hinge between the two: the dark panel carries the brand
photography and the register promise; the volt seam (a 3px rule) joins it to the
light form panel where the working day begins.

## Research basis

- Impeccable slop catalogue (impeccable.style/slop): three slop eras were avoided
  explicitly: purple-gradient/glass/neon (2022), beige editorial reflex (2025), and
  GPT-style neobrutalism (2026). This system is green-dominant by brand decision, not
  cream-dominant; borders are hairline rules, not thick black outlines with hard
  offset shadows; there are no gradients, glows, or glass anywhere.
- Dribbble sports dashboard research (via visual analysis of live search results):
  premium shots share one trait, restraint. One accent color used surgically,
  typographic discipline, hairline dividers instead of card shadows, and
  domain-specific data visualization instead of generic charts. The recurring cliches
  (dark mode with neon lime, three floating phone mockups, glass KPI cards, generic
  sidebar admin) were all deliberately rejected.
- W3C WAI older-users guidance and NN/g senior usability research: base body text
  17px, contrast at least 4.5:1, permanent form labels, visible focus, consistent
  navigation, no hover-only interactions, no automatic movement, forgiving errors.
  Atkinson Hyperlegible was chosen as the body face because it was designed
  specifically for low-vision readers.

## Palette

| Token | Hex | Role |
| --- | --- | --- |
| field | #E8ECDD | Page background, pale sage (green-tinted, not beige) |
| chalk | #FAFAF4 | Surfaces: panels, tables, dialogs |
| ink | #1D251C | Primary text, dark plates |
| ink-2 | #4E5A4A | Secondary text |
| ink-3 | #636E5C | Meta text, only at 14px+ |
| line | #C7CFB8 | Hairline rules on light surfaces |
| line-2 | #9DAB92 | Strong rules, table header underlines |
| green-deep | #173D2B | Masthead, footer, dark panels. The brand surface. |
| green | #1F5C3D | Primary buttons, active states, Present |
| green-2 | #2A7350 | Hover states, links |
| green-tint | #DCE6D2 | Selected rows, tag backgrounds |
| green-tint-2 | #EBF1E4 | Zebra rows, quiet fills |
| red | #B23A26 | Absent, locked, destructive. Functional only. |

Rules: green is the identity, red is reserved for meaning (absence, locks, danger).
No gradients. No glows. No glass. No purple, no blue, no neon.

## Typography

- Display: **Archivo** (variable, weight 700-900, width axis up to 125%).
  Page titles, masthead brand, big headings. Athletic poster voice.
- Body: **Atkinson Hyperlegible** (400, 700). All reading text, forms, buttons.
  Chosen for low-vision legibility.
- Data: **IBM Plex Mono** (400, 500, 600). Scores, dates, percentages, jersey
  numbers, table numerals. The scoreboard voice.

Scale (rem, root 17px): body 1rem, secondary 0.88rem (15px, never smaller),
table meta 0.82rem minimum, h1 page 1.9rem, section head 1.25rem, scoreboard
numerals 2.5rem to 3.5rem. Uppercase only for short table headers and stamps,
letter-spacing 0.06em. Body text always sentence case.

## Shape and surface

- Radius scale: 0, 4px, 6px, 10px. Nothing rounder. Cards are 6px.
- Surfaces separated by 1px hairline rules (`line`) on chalk, or by solid green
  fills. Depth comes from surface color contrast, never from shadows.
- Panels sit directly on field with a chalk fill and a hairline border.
- Not everything is a card: lists and tables use rules and spacing, sections are
  separated by double rules like a register book.

## Signature components

- **Jersey plate**: 30px ink or green square, white mono numeral. Player identity
  in every row and header. Real sport artifact, doubles as the avatar.
- **Stamps**: bordered mono uppercase labels, rotated 1.5 degrees. READY (green),
  LOCKED (red), OPEN (ink), CLOSED (ink). Used only for states, never decoration.
- **Attendance ruler**: a tick tape where one tick equals one session held. Filled
  green ticks are presents, hollow ticks are absences. Data-true progress.
- **Register table**: deep green header band with chalk text, 56px+ rows, hairline
  rules, mono numerals right-aligned. The core artifact of the product.
- **P/A control**: segmented Present / Absent toggle, 48px tall, full words with
  check and cross icons, green fill versus red fill. No color alone: text always
  present.

## Accessibility contract

- WCAG 2.2 AA: all text at 4.5:1 or better, large text 3:1 or better.
- Controls 48px minimum height, mobile bottom tabs 64px.
- Permanent labels above every input, placeholders never carry meaning.
- Focus: 3px solid green outline, 2px offset, everywhere.
- Status never by color alone (icons + words).
- Respects prefers-reduced-motion: all transitions disabled.
- No hover-only functionality. No automatic carousels or marquees.

## Motion

One interaction language: 100-150ms ease-out. Button press scale 0.98, dialog
fade and rise, tab underline slide, toast slide-in. Nothing loops, nothing
bounces, nothing hides content waiting for JavaScript.

## Copy rules

Short sentences. Sentence case. No em dashes. No marketing filler. Say what the
coach can do and what the numbers mean. Errors tell the user what to do next.

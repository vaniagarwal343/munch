# munch

An interactive dining guide for UW Seattle students with dietary restrictions. Users take a quiz, get matched to restaurants, and see a live map of where everyone's eating.

## Design system

### Colors
- Brown: #674A40 (primary, grounding, text)
- Teal: #50A3A4 (secondary accent)
- Amber: #FCAF38 (warm accent)
- Orange: #F95335 (action/CTA color)
- Cream: #FFFAF5 (background)
- White: #FFFFFF

### Typography
- Primary font: Outfit (geometric, clean) — all headings, body, UI
- Alternative: Figtree — can be swapped in
- Headings: bold/black weight, tight letter-spacing
- Body: regular weight, line-height 1.6-1.7

### Design principles
- Colorblocking: bold solid-color sections, no gradients or textures
- Lots of whitespace
- Minimal — no emojis as design elements, no grain, no floating decorations
- Sharp or slightly rounded corners, not pill shapes everywhere
- 4-color stripe (brown, teal, amber, orange) as a recurring section border motif

### Tech stack
- Next.js + TypeScript + SASS
- Supabase (database + realtime)
- Mapbox GL JS (map)
- Vercel (deployment)

# Odd Easy — Website Architecture

The single reference for building, maintaining and extending the Odd Easy website. It describes every component, every animation and effect, the systems that drive them, and the exact parameters, so the live page can be rebuilt pixel-for-pixel and motion-for-motion from this document alone.

**Canonical source.** Appendix A contains the complete, verbatim source of the current page. Where any description in this document and Appendix A disagree, Appendix A is correct; please fix the description.

**Reference build.** The live prototype is the Claude artifact "Odd Easy". This document matches it as of 6 October 2026 (revision: phonetic "odd" in every script, logo-matched typefaces).

---

## 1. Intent

Odd Easy is a production house (ads, music videos, branded films). The site is a pitch to high-end clients in design and media. Two words govern every decision: **lucid** and **high-grade professional**.

In practice that means:

- One memorable thing: the bilingual wordmark ओड easy, whose first word turns like a reel through India's languages, always spelling the *sound* of "odd" so the brand name survives in every script. Everything around it is quiet.
- The page should feel like a lit studio and a camera viewfinder, not a website: a soft key light on a sage wall, film grain, hairline frame rules with registration marks.
- Motion answers the visitor. After the opening, nothing moves on its own except slow ambient drift; the reel turns with the scroll and the light follows the cursor.
- No chrome that doesn't earn its place. No navigation bar, no cursor label, no timecode, no scroll hint.

## 2. Stack

| Concern | Choice | Notes |
|---|---|---|
| Markup / styling | One static HTML file, plain CSS with custom properties | No build step required |
| Animation | GSAP 3.13.0 core + CustomEase | Loaded from cdnjs. GSAP and all its plugins are free for commercial use since Webflow's acquisition |
| Scripting | Vanilla JS in an IIFE | No framework |
| Fonts | Google Fonts | One bold face per Indic script, see §5.2 |
| Images | One photograph (About backdrop) | Inlined as a data URI in the prototype; ship as a file in production, see §11 |

Recommended repository layout when this leaves the prototype:

```
/index.html            markup (Appendix A, body)
/styles/main.css       all CSS (Appendix A, <style>)
/scripts/main.js       all JS (Appendix A, final <script>)
/assets/studio.jpg     About backdrop photograph
/architecture.md       this file
```

## 3. Page model

The site is one document with two "screens" stacked in a single scroll:

```
scroll y = 0 ──────────────►  HOME: wordmark in the lit frame
                              │  .hero spacer, 170svh tall
                              │  0 → 0.70vh   reel turns through all languages, lands on ओड
                              │  0.70 → 1.15vh  wordmark lifts away, photo fades in, About copy rises
scroll y = 1.70vh ─────────►  ABOUT section (normal flow, min-height 100svh)
```

Everything on the home screen is `position: fixed`. The `.hero` element is an empty spacer that provides scroll distance. The `.about` section sits after it in normal flow and scrolls up over the fixed layers.

## 4. Layer stack

Back to front. All fixed layers are `pointer-events: none` except the About control.

| Order | Element | Position | z-index | Role |
|---|---|---|---|---|
| 1 | `body` background | — | — | `--paper`, the sage wall |
| 2 | `.field` (`.key`, `.shade`, `.vignette`) | fixed | auto | Studio light rig |
| 3 | `.grain` | fixed | auto | Static ambient grain over the wall |
| 4 | `.scene` (`.photo`, `.scrim`, `.film`) | fixed | 1 | About backdrop; invisible on home |
| 5 | `.frame` | fixed | 2 | Hairline rules and corner registration marks |
| 6 | `.chrome` (label, wordmark, badge) | fixed children | auto | Home-screen content |
| 7 | `.about` | relative, in flow | 3 | About copy, scrolls over everything below |
| 8 | `.about-dock` | fixed | 7 | The About control on the bottom rule |
| — | `.measure` | absolute, off-screen | — | Hidden text measurer for the fit system |

## 5. Design tokens

### 5.1 Colour

Defined on `:root`. Dark tokens apply under `prefers-color-scheme: dark` unless `data-theme="light"` is set, and always under `data-theme="dark"`.

| Token | Light (default) | Dark | Use |
|---|---|---|---|
| `--paper` | `#586259` | `#2a302a` | Page background, the sage wall |
| `--key` | `#717b70` | `#586259` | Centre of the key light |
| `--shade` | `#2c322c` | `#0d100d` | Light fall-off, vignette |
| `--ink` | `#f1f3ee` | `#eef1ec` | Wordmark, primary text, marks |
| `--quiet` | `#d0d6ce` | `#a9b1a7` | Labels, badge text, contact keys |
| `--rule` | `rgba(255,255,255,.16)` | `rgba(255,255,255,.14)` | Hairlines |

The About scrim uses a fixed near-black green, `rgb(10,13,10)`, at varying alpha (§6.3).

### 5.2 Typography

| Token | Stack | Weight | Use |
|---|---|---|---|
| `--heavy` | Inter Tight, Sarpanch, Noto Sans Bengali, Telugu, Tamil, Gujarati, Arabic, Kannada, Oriya, Malayalam | 800; Devanagari 900 | "odd" in every script; About closing line (Latin, so Inter Tight) |
| `--logo-latin` | Jost, Poppins, system-ui | 400 | "easy" in the wordmark |
| `--light` | Poppins, Jost, system-ui | 400 | About tagline and body |
| `--mono` | JetBrains Mono | 400 | Labels, badge, About control, contact keys |

**Matching the logo.** The logo is custom lettering, so these are the closest open fonts rather than the originals:

- **ओड → Sarpanch Black (900).** The logo's Devanagari is wide, very heavy and rectilinear, with narrow slit counters, square terminals and a flat headline. Sarpanch is the Google Fonts Devanagari face built on that same blocky, squared construction. Applied with `.w.odd:lang(hi), .w.odd:lang(mr) { font-weight: 900 }`.
- **easy → Jost (400).** The logo's "easy" is a monoline geometric sans with a single-storey *a* (round bowl on a straight stem), a straight-armed *y* and a horizontal *e* bar. Jost is a Futura-style geometric with exactly those forms. Poppins, used before, has a double-storey *a* and didn't match.
- For a perfect match on the resting state, replace the live text with the logo's SVG once the reel lands (keep the live text for the reel and for accessibility).

Script coverage for "odd": Devanagari (Hindi, Marathi) is served by Sarpanch; each other script has its own Noto Sans face at 800, so no script falls back to a mismatched system font. Urdu uses Noto Sans Arabic.

The Google Fonts request (exact):

```
https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800&family=Sarpanch:wght@900&family=Poppins:wght@400&family=Jost:wght@400&family=JetBrains+Mono:wght@400&family=Noto+Sans+Bengali:wght@800&family=Noto+Sans+Telugu:wght@800&family=Noto+Sans+Tamil:wght@800&family=Noto+Sans+Gujarati:wght@800&family=Noto+Sans+Arabic:wght@800&family=Noto+Sans+Kannada:wght@800&family=Noto+Sans+Oriya:wght@800&family=Noto+Sans+Malayalam:wght@800&display=swap
```

Type scale:

| Element | Size | Line height | Tracking |
|---|---|---|---|
| Wordmark | computed by fit (§8.2), max 240px | 1.12 | odd 0, easy −0.01em |
| About tagline | `clamp(30px, 5vw, 72px)` | 1.04 | −0.025em |
| About body | `clamp(16px, 1.25vw, 19px)` | 1.55 | 0 |
| About closing line | `clamp(20px, 2vw, 30px)`, heavy | 1.15 | −0.02em |
| About control | `--btn-fs` = 24px, mono, uppercase | 1 | 0.22em |
| Labels, contact keys | 10.5px mono, uppercase | 1.5 | 0.08em |
| Badge | 10.5px mono (9px under 640px) | — | 0.16em |
| Contact values | 15px | — | 0 |

### 5.3 Space

| Token | Value | Use |
|---|---|---|
| `--inset` | 28px (18px under 640px) | Distance of the frame rules from the viewport edge |
| `--gap` | 92px | Half-width of the break in the bottom rule around "About" |
| `--btn-fs` | 24px | About control size; also drives its vertical offset |
| Wordmark gap | `0.16em` | Space between "odd" and "easy" |

All edge positions add `env(safe-area-inset-*)` so the frame clears phone notches and home indicators.

### 5.4 Motion vocabulary

| Name | Value | Where |
|---|---|---|
| Studio ease | `cubic-bezier(.65, 0, .35, 1)` | All CSS hover transitions |
| `reel` (CustomEase) | `M0,0 C0.28,0 0.36,0.3 0.5,0.56 C0.64,0.82 0.78,1.012 0.88,1.008 C0.94,1.004 0.97,1 1,1` | Opening reel spin: slow wind-up, fast blur, 1.2% overshoot, settle. Falls back to `power4.inOut` |
| GSAP eases | `power3.out`, `power3.inOut`, `power2.inOut`, `power2.out`, `sine.inOut` | Opening, light rig, reveals |

---

## 6. Components

Each component lists its markup, its styling, and its behaviour. Exact CSS for every rule is in Appendix A.

### 6.1 Light rig — `.field`

```html
<div class="field" aria-hidden="true">
  <div class="light key" id="keyLight"></div>
  <div class="light shade" id="shadeLight"></div>
  <div class="vignette"></div>
</div>
```

- `.key`: a 150vmax circle, radial gradient from `--key` (centre) through 55% mix at 22% to transparent at 58%. The bright patch on the wall.
- `.shade`: a 160×120vmax ellipse of `--shade`, opacity .75. The fall-off on the opposite side.
- `.vignette`: radial darkening of the edges with `--shade` at 55% mix from 55% to 100%.
- Both lights are centred with negative margins and moved only with GSAP `x`/`y`/`scale`, so they never fight CSS transforms.
- Resting position: key at (−22% vw, −18% vh) from centre, shade at (+30% vw, +25% vh). Behaviour in §7.3 and §8.4.

### 6.2 Ambient grain — `.grain`

A fixed full-screen layer of SVG `feTurbulence` fractal noise (base frequency .9, 3 octaves, 180px tile), opacity .10, `mix-blend-mode: multiply`; in dark mode `screen` at .07. Static. It gives the wall a photographic tooth.

### 6.3 About backdrop — `.scene`

```html
<div class="scene" id="scene" aria-hidden="true">
  <div class="photo" id="photo"></div>
  <div class="scrim"></div>
  <div class="film"></div>
</div>
```

Three sub-layers, back to front:

1. **`.photo`**: the studio photograph (red square on a white cyc, figure walking in) as a `cover` background at `center 46%`, with `inset: -4%` of bleed so the scale animation never reveals an edge.
2. **`.scrim`**: legibility shading in near-black green. A vertical gradient (.55 at top, .20 at 32%, .28 at 58%, .82 at bottom) plus a radial edge darkening (transparent to 40%, .45 at the edge). The bright centre with the red square is left nearly clear; the top (tagline) and bottom (body, contact) are darkened for light text.
3. **`.film`**: the "middle layer" moving film grain. SVG fractal noise (frequency 1.15, 2 octaves, desaturated, 240px tile) at opacity .32, `mix-blend-mode: overlay`, oversized to `inset: -50%`, jittered by the `film` keyframes (§7.2).

The whole `.scene` starts at opacity 0 and `visibility: hidden`; scroll drives it (§8.3).

### 6.4 Ruled frame — `.frame`

```html
<div class="frame" aria-hidden="true">
  <div class="rule h t"></div><div class="rule h b seg-l"></div><div class="rule h b seg-r"></div>
  <div class="rule v l"></div><div class="rule v r"></div>
  <div class="rule v c1"></div><div class="rule v c2"></div>
  <div class="rule h r1"></div><div class="rule h r2"></div>
  <div class="mark-corner mc-tl"></div><div class="mark-corner mc-tr"></div>
  <div class="mark-corner mc-bl"></div><div class="mark-corner mc-br"></div>
</div>
```

- **Outer frame**: 1px `--rule` lines inset by `--inset` on all four sides.
- **Bottom rule** is two segments (`seg-l`, `seg-r`), each `50% − inset − gap` wide, leaving a break in the middle where the About control sits, like a label interrupting a line on a technical drawing.
- **Inner rules** (`c1`, `c2` at 24% from left/right; `r1`, `r2` at 26% from top/bottom) divide the frame into a camera-viewfinder grid. Vertical inner rules are hidden under 640px.
- **Corner registration marks**: 9px crosses (two 1px strokes, `--ink` at .55 opacity) centred on each outer corner.
- The frame never scrolls. It sits above the photograph and stays visible behind the About copy; only the inner rules fade out on scroll (§8.3).

### 6.5 Services label — `.label.tl`

`Films · Ads · Music videos` / `Shot, cut and finished in-house`, mono 10.5px uppercase `--quiet`, top-left inside the frame (inset + 14px). Hidden during the opening; fades in after.

### 6.6 Rotating badge — `.badge`

```html
<div class="badge" aria-hidden="true">
  <svg viewBox="0 0 100 100">
    <defs><path id="ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs>
    <text><textPath href="#ring" startOffset="0">Odd Easy · Films · Ads · Music videos · Production house · </textPath></text>
    <circle class="dot" cx="50" cy="50" r="2.2"/>
  </svg>
</div>
```

92px (72px under 640px), top-right inside the frame. Text on a 38-unit circle in mono `--quiet`, with an `--ink` dot at the centre. Rotates continuously (§7.2). Hidden during the opening.

### 6.7 Wordmark — `.mark` › `.words`

```html
<main class="mark">
  <h1 class="words" id="words" aria-label="Odd Easy">
    <span class="slot" id="oddSlot" data-which="odd"></span>
    <span class="slot" id="easySlot" data-which="easy"></span>
  </h1>
</main>
```

The slots are filled by JS with one `.w` element each (`.w.odd` in `--heavy`, `.w.easy` in `--logo-latin`). A `.w` holds either plain text or, for the logo words, one `.ch` span per grapheme (for the split-flap landing).

- **Layout**: `.mark` is a fixed full-screen grid centring `.words`, a flex row with `gap: .16em`. Font size is set inline by the fit system (§8.2).
- **"odd" slot** (`#oddSlot`): a block of fixed width (the width of ओड at the current size) and height `1.12em`. The `.w` inside is absolutely positioned with `right: 0`, so **every word ends at the same point before "easy" and any extra length extends to the left**. `transform-origin: 100% 52%`, so flips and any shrink pivot from that right edge too. Non-logo faces get class `.alt` with `padding-right: .08em` of clearance for scripts whose final glyph draws past its box (virama/pulli marks in Telugu, Tamil, Kannada, Odia and Malayalam).
- **"easy" slot**: an inline grid of fixed width; "easy" never changes.
- **Measurer**: `<div class="words measure">` with `#mOdd` and `#mEasy`, off-screen at 100px, used to measure the logo words.

Never change "odd" back to a grid or centred alignment: browsers handle overflow alignment inconsistently, which is what caused earlier collisions with "easy".

### 6.8 About control — `.about-dock` › `.about-btn`

```html
<div class="about-dock" id="dock">
  <button class="about-btn" id="aboutBtn" type="button" aria-controls="about" aria-expanded="false">
    <span class="flip"><span>About</span><span aria-hidden="true">About</span></span>
  </button>
</div>
```

- Centred on the bottom rule, inside its break: `left: 50%`, `bottom: inset`, `transform: translate(-50%, calc(12px + 0.14 * var(--btn-fs)))`. The offset is tuned so the word's x-height sits on the rule line.
- Mono, 24px, uppercase, 0.22em tracking, `--ink`. No border or fill: it reads as part of the drawing, not a button.
- Hover/focus states are in §7.4. Click scrolls to the About section (§8.3).
- It fades out within the first 12% of a viewport of scroll.

### 6.9 Scroll spacer — `.hero`

`<div class="hero" id="hero" aria-hidden="true"></div>`, height `170vh` / `170svh`. Pure scroll distance; see §3 and §8.3.

### 6.10 About section — `.about`

```html
<section class="about" id="about" aria-label="About">
  <div class="about-inner">
    <h2 class="tag"><span class="rev"><span>making things look cooler than they probably need to.</span></span></h2>
    <div class="body">
      <div class="rev"><p>We make ads, music videos, branded films, and whatever else gives us a good excuse to pick up a camera.</p></div>
      <div class="rev"><p>From a random thought on a notes app to the final frame — we make, shoot, direct, create, overthink, and eventually deliver.</p></div>
      <div class="rev"><p>If it can be imagined, shot and edited — we're probably interested.</p></div>
      <div class="rev"><p class="closing">Good stories. Strong visuals. No unnecessary noise.</p></div>
    </div>
    <ul class="contact">
      <li><span>Email</span><a href="mailto:oddeasyproductions@gmail.com">oddeasyproductions@gmail.com</a></li>
      <li><span>Instagram</span><a href="https://instagram.com/_oddeasy" target="_blank" rel="noopener">@_oddeasy</a></li>
      <li><span>WhatsApp</span><a href="https://wa.me/919234283982" target="_blank" rel="noopener">+91 92342 83982</a></li>
    </ul>
  </div>
</section>
```

- **Grid** (above 820px): two columns `1.15fr 1fr`, rows `auto 1fr auto`, gap `40px 8%`. The tagline spans both columns at the top (max 16ch); the body sits bottom-left (max 46ch); the contact list sits bottom-right (min 320px).
- **Under 820px**: one column, gap 36px, tagline max 12ch, body and contact full width.
- **Padding** keeps all copy inside the frame: `inset + clamp(56px, 9vh, 96px)` top, `inset + clamp(20px, 5vw, 72px)` sides, `inset + clamp(48px, 8vh, 80px)` bottom.
- **Reveal masks**: each line is wrapped in `.rev` (`overflow: hidden`) so it can rise from below its own edge. Contact rows animate as whole `li`s.
- **Contact rows**: 90px mono key column, 18px gap, 14px vertical padding, hairline `--rule` above each row and below the last. Links underline on hover (§7.4).

---

## 7. Animation and effects catalogue

Every motion on the site. Times in seconds, positions on the GSAP timeline in brackets.

### 7.1 Opening sequence

Runs once on load after fonts are ready (§8.5). Scroll is locked (`html.lock`) and the page is forced to the top until the sequence ends.

| # | Target | From → to | Duration | Ease | Starts at |
|---|---|---|---|---|---|
| 1 | Key light | scale 2.6 → 1 (overexposed white settling into the lit wall) | 2.4 | power3.out | 0 |
| 2 | Shade light | opacity 0 → .75 | 2.2 | power2.out | 0.2 |
| 3 | Horizontal rules | scaleX 0 → 1 from the left, stagger .06 | 1.4 | power3.inOut | 0.5 |
| 4 | Vertical rules | scaleY 0 → 1 from the top, stagger .06 | 1.4 | power3.inOut | 0.6 |
| 5 | Corner marks | opacity 0 → 1 | 0.5 | default | 1.6 |
| 6 | Wordmark (focus pull) | opacity 0, blur 26px, scale 1.04 → opacity 1, blur 0, scale 1 | 2.0 | power2.inOut | 0.6 |
| 7 | "odd" reel | 20 half-turns (two laps of all 10 languages), ending on ओड, with split-flap landing (§8.1) | 3.2, delay 0.3 | `reel` CustomEase | after 1–6 finish |
| 8 | Label, badge, About control | opacity 0, y 4 → opacity 1, y 0, stagger .08 | 0.9 | power2.out | after 7 |

After step 8 the scroll lock is released and the scroll system goes live.

### 7.2 Continuous ambient motion

| Effect | Detail |
|---|---|
| Badge rotation | `.badge svg` rotate 0 → 360°, 40s, linear, infinite |
| Shade breathing | `.shade` scale to `random(0.92, 1.1)`, 9s, sine.inOut, yoyo, infinite, new random value each cycle |
| Film grain (About) | `@keyframes film`, 1s, `steps(8)`, infinite: translate through (0,0), (−6%,4%), (5%,−7%), (−9%,−3%), (7%,8%), (−3%,9%), (9%,−2%), (−7%,−8%). Eight jumps a second reads as moving film stock. Disabled under reduced motion |
| Ambient grain (home) | Static |

### 7.3 Pointer-driven

| Effect | Detail |
|---|---|
| Key light follows the cursor | `quickTo` on x/y, 2.2s, power3.out; offset = 0.35 × pointer distance from centre |
| Shade counter-moves | `quickTo` on x/y, 3.2s, power3.out; offset = −0.22 × pointer distance |
| Light on scroll | Both lights also travel with scroll progress `q` toward the far corner for About (§8.4) |

### 7.4 Hover and focus

| Element | Effect | Timing |
|---|---|---|
| About control | Word rolls up and is replaced by its duplicate from below (`.flip` spans translateY −100%) | 0.55s, studio ease |
| About control | 4px `--ink` dots fade in at each end, sliding 6px outward into place | opacity 0.45s, transform 0.55s |
| About control | Bottom rule segments draw back slightly (scaleX .985 from their outer ends), via `body.about-hover` | 0.6s, studio ease |
| About control focus | 1px `--ink` outline, 6px offset, plus the same roll and dots | — |
| Contact links | Underline draws in left to right (background-size 0 → 100% × 1px) | 0.5s, studio ease |

### 7.5 Scroll-driven

All computed in `readScroll()` from `scrollY`. `sd` = spin distance = hero height − viewport height (0.70vh). `q` = About progress = `clamp((y − sd) / (0.45 × vh))`.

| Effect | Mapping |
|---|---|
| "odd" reel | Target angle = `clamp(y / sd) × 10 × 180°`: the reel passes through all nine other languages and lands on ओड exactly at `y = sd`. Smoothed and snapped (§8.3) |
| Reel motion blur and light pulse | From the reel's angular velocity, as in the opening |
| Wordmark exit | y 0 → −40px, opacity 1 → 0, blur 0 → 16px, all × q |
| Inner rules | opacity 1 − q |
| Home chrome (label, badge) | opacity `1 − clamp(q × 1.6)` |
| About control | opacity `1 − clamp(y / (0.12 × vh))`; pointer-events off below 0.1 |
| Photograph | `.scene` opacity = q (hidden at 0); `.photo` scale 1.08 → 1.00 and blur 10px → 0 × q (a focus pull) |
| Lights | Key and shade travel toward About positions × q (§8.4) |
| About copy reveal | Lines start at yPercent 110, opacity 0. Plays forward (yPercent 0, opacity 1, 0.9s, power3.out, stagger .07) once q > .25; reverses when y falls below `0.5 × sd` |

### 7.6 Reel rendering detail

Applies to every frame the reel moves, whether from the opening or from scroll.

| Property | Formula |
|---|---|
| Rotation | `perspective(5em) rotateX(vis)`, where `vis` ∈ [−90°, 90°] is the angle around the current face |
| Face change | At the edge-on point (±90°), the text swaps to the next language |
| Shading | opacity `0.2 + 0.8 × cos(vis)` |
| Motion blur | `min(9px, max(0, (v − 0.15) × 3))`, v in degrees per ms |
| Split-flap landing | On the final approach to ओड, each grapheme flips in on its own: letter progress `qi = clamp((q − i × 0.16) / span)`, rotation `−90° + 90° × qi`, opacity `0.15 + 0.85 × cos` |
| Fit scale | `scale(sc)` only if the word plus perspective growth, blur and ink would pass the left edge of the frame (§8.2) |

---

## 8. Systems

### 8.1 Reel engine

State per slot (`S.odd`, `S.easy`): `slot`, `el` (the `.w`), `cls`, `chars`, `k` (current face index), `face`, `faceW` (rendered width).

- **`setFace(s, d, split)`**: sets `lang`/`dir`, writes the text (split into `.ch` grapheme spans with `Intl.Segmenter` when `split`), toggles `.alt`, then records `faceW = el.offsetWidth`, the real laid-out width in that script's font. Splitting is only used for the logo word: Indic and Arabic scripts must never be split mid-word, because conjuncts and joining break.
- **`draw(s, a, sign, faces, v)`**: maps an angle `a` (degrees) to face `k = floor((a + 90) / 180)` and local angle `vis = a − 180k`, then applies §7.6.
- **`spin(s, faces, sign, duration, ease, delay)`**: tweens a proxy `{a}` from 0 to `(faces.length − 1) × 180` with GSAP, computing velocity per frame, and resolves a Promise on completion. Used by the opening.
- **`settle(s)`**: clears all inline transform, filter and opacity so the resting state is crisp.
- **`roundTrip(H, offset, which, backwards)`**: builds a face list that starts and ends on the home word. Currently unused (kept for a tap-to-spin interaction).
- Only "odd" ever animates. "easy" is rendered once and stays static.

### 8.2 Fit and anti-collision

`fit()` runs on load, after fonts arrive, on every resize and on every `fonts.loadingdone` event.

1. Measure ओड and "easy" at 100px in the off-screen measurer.
2. Font size `fs = min(100 × maxW / (wOdd + wEasy + 16), 0.24 × vh, 240)`, where `maxW` is 60% of viewport width (80% under 700px).
3. Set both slot widths to the logo widths at `fs`.
4. `leftRoom` = distance from the odd slot's left edge to the frame, minus `0.25 × fs`.

In `draw()`, the space a face needs is `faceW × mag + ink + 2 × blur`, where `mag = 5 / (5 − 0.6 × |sin(vis)|)` accounts for the near edge growing as it tips toward the viewer, and `ink = 0.06 × fs` for non-logo faces. If that exceeds `slotW + leftRoom`, the word is scaled down from its right edge to fit. Because the word is right-anchored, it can never cross into "easy"; the only limit is the left edge of the frame.

### 8.3 Scroll system

- Native document scroll; no smooth-scroll library. `history.scrollRestoration = 'manual'` so a reload always starts at the top.
- `onScroll` (passive) calls `readScroll()` and restarts a 160ms idle timer. When the scroll stops, the reel target snaps to the nearest whole word, so it never rests mid-flip.
- A GSAP ticker function eases the reel toward its target: `cur += (target − cur) × (1 − 0.84^(dt / 16.67))`, frame-rate independent, with velocity `|step| / dt × 0.6` feeding blur and the light pulse. At rest it calls `settle()`.
- `goAbout()` smooth-scrolls to `about.offsetTop` (instant under reduced motion). The About control and an `#about` URL hash both use it.

### 8.4 Light rig

`aimLight()` combines resting position, pointer and scroll progress `q`:

```
key   x = W × (−0.22 + 0.50 q) + 0.35 × pointerX     y = H × (−0.18 − 0.12 q) + 0.35 × pointerY
shade x = W × ( 0.30 − 0.60 q) − 0.22 × pointerX     y = H × ( 0.25 + 0.05 q) − 0.22 × pointerY
```

So on the home screen the key light sits upper-left and the shade lower-right; as About arrives, the key light travels to the upper-right and the shade to the lower-left, and stays there. All movement goes through the same `quickTo` functions, so the cursor, the scroll and the opening never fight over the lights. The reel's velocity also swells the key light: `scale = 1 + min(v, 2.5) × 0.06` (1.0s, power3.out).

### 8.5 Font loading

Before the opening, the script calls `document.fonts.load()` for every "odd" word in `--heavy` at the weight it renders in (900 for Hindi and Marathi, 800 otherwise) and "easy" in `--logo-latin`, then waits for `document.fonts.ready`, capped at 2.5s. This prevents the reel from measuring fallback fonts. Fonts that still arrive late trigger a re-fit through `loadingdone`.

---

## 9. Content

### 9.1 The reel

Every language spells the **sound** of "odd", the same way the logo writes ओड: an open *o* vowel followed by the retroflex *ḍ*. Scripts that otherwise add an inherent vowel end with a virama (्, ్, ், ್, ୍, ്) so the word ends on the consonant, as in English. Where a script has a dedicated vowel for the English short *o* (ऑ in Marathi, ઑ in Gujarati), it's used; elsewhere the spelling follows how each language already writes English loanwords such as "office". Order is by number of speakers in India.

| # | Language | Text | Romanised | `lang` | Font |
|---|---|---|---|---|---|
| 0 | Hindi (logo) | ओड | oḍ | hi | Sarpanch 900 |
| 1 | Bengali | অড | ɔḍ | bn | Noto Sans Bengali 800 |
| 2 | Marathi | ऑड | ŏḍ | mr | Sarpanch 900 |
| 3 | Telugu | ఆడ్ | āḍ | te | Noto Sans Telugu 800 |
| 4 | Tamil | ஆட் | āṭ (ட serves both ṭ and ḍ) | ta | Noto Sans Tamil 800 |
| 5 | Gujarati | ઑડ | ŏḍ | gu | Noto Sans Gujarati 800 |
| 6 | Urdu | آڈ | āḍ | ur, `dir="rtl"` | Noto Sans Arabic 800 |
| 7 | Kannada | ಆಡ್ | āḍ | kn | Noto Sans Kannada 800 |
| 8 | Odia | ଅଡ୍ | ɔḍ | or | Noto Sans Oriya 800 |
| 9 | Malayalam | ഓഡ് | ōḍ | ml | Noto Sans Malayalam 800 |

"easy" is always English. Have a native speaker confirm each spelling before launch.

Because every word is now two to three characters, the reel words are all close to the width of ओड; the right-anchored layout (§6.7) still applies as a guarantee.

### 9.2 Copy

All About copy is the client's own text, verbatim except that hyphens before "we make" and "we're probably interested" are set as em dashes. See §6.10.

---

## 10. Accessibility, reduced motion and fallbacks

- The wordmark `h1` carries `aria-label="Odd Easy"`. Decorative layers (`.field`, `.grain`, `.scene`, `.frame`, `.badge`, `.hero`, measurer) are `aria-hidden`.
- Each word sets `lang` (and `dir` for Urdu) so screen readers and shaping engines treat each script correctly.
- The About control is a real `<button>` with `aria-controls="about"` and a visible focus state.
- **Reduced motion** (`prefers-reduced-motion: reduce`): no opening sequence, no reel, no film-grain movement, no pointer-following light; the scroll-driven fades and the photo still respond so About remains reachable and legible; `goAbout()` jumps instantly.
- **GSAP fails to load**: the page shows the static logo and the About section below it; nothing depends on JS to be readable.
- **Safe areas**: every fixed edge position includes `env(safe-area-inset-*)`, and `viewport-fit=cover` is set.

## 11. Production notes

- **Photograph**: ship as `/assets/studio.jpg` (the source is about 48 kB) and reference it with `background: url("/assets/studio.jpg") center 46% / cover no-repeat;` instead of the data URI. Preload it on the home screen so it's ready when About arrives. The source file is named "Fluid Ensembles by Terminal 27": confirm the rights to use it, and credit it if required.
- **Fonts**: consider self-hosting and subsetting the Noto faces to the exact glyphs used; each is only needed for one word.
- **Scripts**: pin GSAP 3.13.0 and include CustomEase. ScrollTrigger and Observer are not used.
- **Meta**: add a description, Open Graph image (a still of the lit frame with ओड easy), favicon and `theme-color` (`#586259`).
- **Performance**: all animation is transform, opacity and filter on composited layers. The heaviest effect is the 16px blur on the wordmark and the 10px blur on the photo during the About transition; test on mid-range Android.

## 12. Known issues and clean-up

Unused or redundant code carried over from earlier iterations. None of it affects rendering; remove it during the port.

- `.label.bl` and `.label.br` rules (the removed scroll hint and timecode).
- `--light` lists `Noto Sans KR` and `Noto Sans Tamil`, which are no longer loaded or needed.
- `.w.odd:lang(hi) { letter-spacing: 0 }` duplicates the base rule.
- `.about-dock` declares `z-index` twice (2, then 7); 7 wins.
- `.frame { z-index: 2 }` is declared before the frame block; move it into the block.
- `roundTrip()` is unused (keep only if tap-to-spin returns).
- `setFace(S.easy, …, true)` splits "easy" into letters that never animate; plain text would do.
- The `loadingdone` comment mentions CJK, which is no longer used.

**Open decisions**

- Confirm the WhatsApp number: the link assumes the Indian country code (`wa.me/919234283982`).
- Native-speaker check of each phonetic spelling of "odd" (§9.1).
- Whether to swap the resting wordmark for the logo SVG for an exact match (§5.2).
- Photograph licence (above).

## 13. Porting guide (if moving to React or Next.js)

- Keep the engine framework-free: put the IIFE body in a module with an `init(root)` that returns a `destroy()`. Call it once from a client component's `useEffect` and wrap GSAP work in `gsap.context()` so it reverts on unmount.
- Don't render the reel text through React state; the engine writes to the DOM at 60fps by design.
- Keep the fixed layers outside any transformed ancestor, or `position: fixed` will break.
- Use `next/font` for the Google faces, preserving the `--heavy`, `--light` and `--mono` stacks, and keep `display: swap` plus the pre-load step in §8.5.

---

## Appendix A — Complete source

The full, verbatim page as of this document. The only change from the live prototype is that the inlined photograph is replaced by the file path `assets/studio.jpg` (§11).

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Odd Easy</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800&family=Sarpanch:wght@900&family=Poppins:wght@400&family=Jost:wght@400&family=JetBrains+Mono:wght@400&family=Noto+Sans+Bengali:wght@800&family=Noto+Sans+Telugu:wght@800&family=Noto+Sans+Tamil:wght@800&family=Noto+Sans+Gujarati:wght@800&family=Noto+Sans+Arabic:wght@800&family=Noto+Sans+Kannada:wght@800&family=Noto+Sans+Oriya:wght@800&family=Noto+Sans+Malayalam:wght@800&display=swap">
<style>
:root {
  --paper: #586259;            /* sage studio wall */
  --key: #717b70;              /* the key light */
  --shade: #2c322c;            /* the fall-off */
  --ink: #f1f3ee;
  --quiet: #d0d6ce;
  --rule: rgba(255, 255, 255, 0.16);
  --heavy: 'Inter Tight', 'Sarpanch', 'Noto Sans Bengali', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Noto Sans Gujarati', 'Noto Sans Arabic', 'Noto Sans Kannada', 'Noto Sans Oriya', 'Noto Sans Malayalam', system-ui, sans-serif;
  --light: 'Poppins', 'Jost', 'Noto Sans KR', 'Noto Sans Tamil', system-ui, sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
  --logo-latin: 'Jost', 'Poppins', system-ui, sans-serif;   /* geometric, single-storey a: closest open match to the logo's "easy" */
  --inset: 28px;
  --gap: 92px;
  --btn-fs: 24px;
  box-sizing: border-box;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #2a302a; --key: #586259; --shade: #0d100d;
    --ink: #eef1ec; --quiet: #a9b1a7; --rule: rgba(255, 255, 255, 0.14);
  }
}
:root[data-theme="dark"] {
  --paper: #2a302a; --key: #586259; --shade: #0d100d;
  --ink: #eef1ec; --quiet: #a9b1a7; --rule: rgba(255, 255, 255, 0.14);
}
*, *::before, *::after { box-sizing: border-box; }
html { scroll-padding-top: env(safe-area-inset-top, 0px); }
html, body { margin: 0; }
html.lock { overflow: hidden; }
body {
  background: var(--paper); color: var(--ink);
  font-family: var(--light);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ---------- light ---------- */
.field { position: fixed; inset: 0; overflow: hidden; pointer-events: none; }
.light {
  position: absolute; left: 50%; top: 50%; border-radius: 50%; will-change: transform, opacity;
}
.key {
  width: 150vmax; height: 150vmax; margin: -75vmax 0 0 -75vmax;
  background: radial-gradient(circle, var(--key) 0%, color-mix(in srgb, var(--key) 55%, transparent) 22%, transparent 58%);
}
.shade {
  width: 160vmax; height: 120vmax; margin: -60vmax 0 0 -80vmax;
  background: radial-gradient(ellipse, var(--shade) 0%, color-mix(in srgb, var(--shade) 40%, transparent) 30%, transparent 64%);
  opacity: .75;
}
.vignette {
  position: absolute; inset: 0;
  background: radial-gradient(120% 90% at 50% 50%, transparent 55%, color-mix(in srgb, var(--shade) 55%, transparent) 100%);
}
.grain {
  position: fixed; inset: 0; pointer-events: none; opacity: .10; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .8 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
@media (prefers-color-scheme: dark) { .grain { mix-blend-mode: screen; opacity: .07; } }


/* ---------- About backdrop: photograph, legibility scrim, then a moving film grain in the middle ---------- */
.scene { position: fixed; inset: 0; pointer-events: none; opacity: 0; visibility: hidden; z-index: 1; }
.scene .photo {
  position: absolute; inset: -4%;
  background: url("assets/studio.jpg") center 46% / cover no-repeat;
  will-change: transform, filter;
}
.scene .scrim {
  position: absolute; inset: 0;
  background:
    linear-gradient(180deg, rgba(10, 13, 10, .55) 0%, rgba(10, 13, 10, .20) 32%, rgba(10, 13, 10, .28) 58%, rgba(10, 13, 10, .82) 100%),
    radial-gradient(70% 60% at 50% 45%, transparent 40%, rgba(10, 13, 10, .45) 100%);
}
.scene .film {
  position: absolute; inset: -50%; opacity: .32; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>");
  animation: film 1s steps(8) infinite;
}
@keyframes film {
  0% { transform: translate(0, 0); }        12.5% { transform: translate(-6%, 4%); }
  25% { transform: translate(5%, -7%); }    37.5% { transform: translate(-9%, -3%); }
  50% { transform: translate(7%, 8%); }     62.5% { transform: translate(-3%, 9%); }
  75% { transform: translate(9%, -2%); }    87.5% { transform: translate(-7%, -8%); }
  100% { transform: translate(0, 0); }
}
@media (prefers-reduced-motion: reduce) { .scene .film { animation: none; } }
.frame { z-index: 2; }

/* ---------- ruled frame ---------- */
.frame { position: fixed; inset: 0; pointer-events: none; }
.rule { position: absolute; background: var(--rule); }
.rule.h { left: var(--inset); right: var(--inset); height: 1px; transform-origin: left center; }
.rule.v { top: var(--inset); bottom: var(--inset); width: 1px; transform-origin: center top; }
.rule.h.t { top: calc(env(safe-area-inset-top, 0px) + var(--inset)); }
.rule.h.b { bottom: calc(env(safe-area-inset-bottom, 0px) + var(--inset)); }
.rule.h.b.seg-l { right: auto; width: calc(50% - var(--inset) - var(--gap)); transition: transform .6s cubic-bezier(.65, 0, .35, 1); }
.rule.h.b.seg-r { left: auto;  width: calc(50% - var(--inset) - var(--gap)); transform-origin: right center; transition: transform .6s cubic-bezier(.65, 0, .35, 1); }
.about-hover .rule.h.b.seg-l, .about-hover .rule.h.b.seg-r { transform: scaleX(0.985); }
.rule.v.l { left: var(--inset); }
.rule.v.r { right: var(--inset); }
.rule.v.c1 { left: 24%; } .rule.v.c2 { right: 24%; }
.rule.h.r1 { top: 26%; }  .rule.h.r2 { bottom: 26%; }
.mark-corner { position: absolute; width: 9px; height: 9px; }
.mark-corner::before, .mark-corner::after { content: ""; position: absolute; background: var(--ink); opacity: .55; }
.mark-corner::before { left: 0; top: 4px; width: 9px; height: 1px; }
.mark-corner::after  { left: 4px; top: 0; width: 1px; height: 9px; }
.mc-tl { top: calc(env(safe-area-inset-top, 0px) + var(--inset) - 4px); left: calc(var(--inset) - 4px); }
.mc-tr { top: calc(env(safe-area-inset-top, 0px) + var(--inset) - 4px); right: calc(var(--inset) - 4px); }
.mc-bl { bottom: calc(env(safe-area-inset-bottom, 0px) + var(--inset) - 4px); left: calc(var(--inset) - 4px); }
.mc-br { bottom: calc(env(safe-area-inset-bottom, 0px) + var(--inset) - 4px); right: calc(var(--inset) - 4px); }
@media (max-width: 640px) { .rule.v.c1, .rule.v.c2 { display: none; } }

/* ---------- wordmark ---------- */
.mark { position: fixed; inset: 0; display: grid; place-items: center; pointer-events: none; }
.words {
  display: flex; align-items: center; justify-content: center;
  gap: .16em; line-height: 1.12; margin: 0;
  font-size: 120px; font-weight: inherit; user-select: none;
}
.slot { display: inline-grid; justify-items: center; align-items: center; cursor: default; }
.w {
  grid-area: 1 / 1; display: inline-block; white-space: nowrap;
  transform-origin: 50% 52%; backface-visibility: hidden;
  will-change: transform, opacity, filter;
}
.w .ch { display: inline-block; transform-origin: 50% 52%; backface-visibility: hidden; }
.w.odd  { font-family: var(--heavy); font-weight: 800; letter-spacing: 0; }
/* "odd" hangs from its right edge: whatever the script, the word ends at the same point before "easy"
   and any extra length goes out to the left */
#oddSlot { display: block; position: relative; height: 1.12em; flex: none; }
#oddSlot .w {
  position: absolute; right: 0; top: 0; height: 100%;
  display: flex; align-items: center;
  transform-origin: 100% 52%;
}
#oddSlot .w.alt { padding-right: .08em; }   /* room for scripts whose last glyph draws past its box */
.w.easy { font-family: var(--logo-latin); font-weight: 400; letter-spacing: -0.01em; }
.w.odd:lang(hi), .w.odd:lang(mr) { font-weight: 900; }   /* Sarpanch Black: the logo's blocky, slit-counter Devanagari */
.w.odd:lang(hi) { letter-spacing: 0; }
.measure { position: absolute; left: -9999px; top: 0; visibility: hidden; font-size: 100px; }

/* ---------- labels ---------- */
.label {
  position: fixed; margin: 0; font-family: var(--mono); font-size: 10.5px; line-height: 1.5;
  letter-spacing: .08em; text-transform: uppercase; color: var(--quiet); pointer-events: none;
}
.tl { top: calc(env(safe-area-inset-top, 0px) + var(--inset) + 14px); left: calc(var(--inset) + 14px); }
.bl { bottom: calc(env(safe-area-inset-bottom, 0px) + var(--inset) + 14px); left: calc(var(--inset) + 14px); }
.br { bottom: calc(env(safe-area-inset-bottom, 0px) + var(--inset) + 14px); right: calc(var(--inset) + 14px); font-variant-numeric: tabular-nums; }
.badge {
  position: fixed; top: calc(env(safe-area-inset-top, 0px) + var(--inset) + 10px); right: calc(var(--inset) + 10px);
  width: 92px; height: 92px; pointer-events: none;
}
.badge svg { width: 100%; height: 100%; overflow: visible; }
.badge text { font-family: var(--mono); font-size: 10.5px; letter-spacing: .16em; fill: var(--quiet); text-transform: uppercase; }
.badge .dot { fill: var(--ink); }
.intro .tl, .intro .badge, .intro .about-btn { opacity: 0; }

/* ---------- about ---------- */
.about-dock {
  position: fixed; left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + var(--inset));
  transform: translate(-50%, calc(12px + 0.14 * var(--btn-fs))); z-index: 2;
}
.about-btn {
  position: relative; display: block; margin: 0; padding: 12px 18px; border: 0; background: none; cursor: pointer;
  font-family: var(--mono); font-size: var(--btn-fs); line-height: 1; letter-spacing: .22em; text-transform: uppercase; color: var(--ink);
}
.about-btn .flip { position: relative; display: block; height: 1em; overflow: hidden; }
.about-btn .flip span { display: block; transition: transform .55s cubic-bezier(.65, 0, .35, 1); }
.about-btn .flip span + span { position: absolute; left: 0; top: 100%; }
.about-btn:hover .flip span, .about-btn:focus-visible .flip span { transform: translateY(-100%); }
.about-btn:focus-visible { outline: 1px solid var(--ink); outline-offset: 6px; }
.about-btn::before, .about-btn::after {
  content: ""; position: absolute; top: 50%; width: 4px; height: 4px; margin-top: -2px; border-radius: 50%;
  background: var(--ink); opacity: 0; transition: opacity .45s, transform .55s cubic-bezier(.65, 0, .35, 1);
}
.about-btn::before { left: -2px; transform: translateX(6px); }
.about-btn::after  { right: -2px; transform: translateX(-6px); }
.about-btn:hover::before, .about-btn:hover::after, .about-btn:focus-visible::before, .about-btn:focus-visible::after { opacity: 1; transform: none; }
.about-dock { z-index: 7; }

.hero { height: 170vh; height: 170svh; }
.about { position: relative; z-index: 3; }
.about-inner {
  min-height: 100vh; min-height: 100svh; display: grid; gap: 40px 8%;
  grid-template-columns: 1.15fr 1fr; grid-template-rows: auto 1fr auto;
  padding: calc(var(--inset) + clamp(56px, 9vh, 96px)) calc(var(--inset) + clamp(20px, 5vw, 72px)) calc(var(--inset) + clamp(48px, 8vh, 80px));
}
.about .tag {
  grid-column: 1 / -1; margin: 0; max-width: 16ch;
  font-family: var(--light); font-weight: 400;
  font-size: clamp(30px, 5vw, 72px); line-height: 1.04; letter-spacing: -0.025em;
}
.about .body { grid-column: 1; align-self: end; max-width: 46ch; }
.about .body p { margin: 0 0 1.1em; font-size: clamp(16px, 1.25vw, 19px); line-height: 1.55; font-weight: 400; }
.about .body p:last-child { margin-bottom: 0; }
.about .closing { font-family: var(--heavy); font-weight: 800; letter-spacing: -0.02em; font-size: clamp(20px, 2vw, 30px) !important; line-height: 1.15 !important; margin-top: 1.4em !important; }
.about .contact { grid-column: 2; align-self: end; justify-self: end; list-style: none; margin: 0; padding: 0; min-width: min(100%, 320px); }
.about .contact li { display: grid; grid-template-columns: 90px 1fr; gap: 18px; padding: 14px 0; border-top: 1px solid var(--rule); align-items: baseline; }
.about .contact li:last-child { border-bottom: 1px solid var(--rule); }
.about .contact span { font-family: var(--mono); font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--quiet); }
.about .contact a { color: var(--ink); text-decoration: none; font-size: 15px; background: linear-gradient(currentColor, currentColor) no-repeat 0 100% / 0 1px; transition: background-size .5s cubic-bezier(.65, 0, .35, 1); }
.about .contact a:hover, .about .contact a:focus-visible { background-size: 100% 1px; outline: none; }
.rev { overflow: hidden; }
.rev > * { display: block; }

@media (max-width: 820px) {
  .about-inner { grid-template-columns: 1fr; grid-template-rows: auto auto auto; gap: 36px; padding-top: calc(var(--inset) + 56px); }
  .about .body, .about .contact { grid-column: 1; justify-self: stretch; }
  .about .tag { max-width: 12ch; }
}

@media (max-width: 640px) {
  :root { --inset: 18px; }
  .badge { width: 72px; height: 72px; }
  .badge text { font-size: 9px; }
}
</style>
</head>
<body class="intro">
  <div class="field" aria-hidden="true">
    <div class="light key" id="keyLight"></div>
    <div class="light shade" id="shadeLight"></div>
    <div class="vignette"></div>
  </div>
  <div class="grain" aria-hidden="true"></div>

  <div class="scene" id="scene" aria-hidden="true">
    <div class="photo" id="photo"></div>
    <div class="scrim"></div>
    <div class="film"></div>
  </div>

  <div class="frame" aria-hidden="true">
    <div class="rule h t"></div><div class="rule h b seg-l"></div><div class="rule h b seg-r"></div>
    <div class="rule v l"></div><div class="rule v r"></div>
    <div class="rule v c1"></div><div class="rule v c2"></div>
    <div class="rule h r1"></div><div class="rule h r2"></div>
    <div class="mark-corner mc-tl"></div><div class="mark-corner mc-tr"></div>
    <div class="mark-corner mc-bl"></div><div class="mark-corner mc-br"></div>
  </div>

  <div class="chrome" id="chrome">
  <p class="label tl">Films · Ads · Music videos<br>Shot, cut and finished in-house</p>

  <main class="mark">
    <h1 class="words" id="words" aria-label="Odd Easy">
      <span class="slot" id="oddSlot" data-which="odd"></span>
      <span class="slot" id="easySlot" data-which="easy"></span>
    </h1>
  </main>

  <div class="about-dock" id="dock"><button class="about-btn" id="aboutBtn" type="button" aria-controls="about" aria-expanded="false"><span class="flip"><span>About</span><span aria-hidden="true">About</span></span></button></div>

  <div class="badge" aria-hidden="true">
    <svg viewBox="0 0 100 100">
      <defs><path id="ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs>
      <text><textPath href="#ring" startOffset="0">Odd Easy · Films · Ads · Music videos · Production house · </textPath></text>
      <circle class="dot" cx="50" cy="50" r="2.2"/>
    </svg>
  </div>
  </div>

  <div class="hero" id="hero" aria-hidden="true"></div>

  <section class="about" id="about" aria-label="About">
    <div class="about-inner">
      <h2 class="tag"><span class="rev"><span>making things look cooler than they probably need to.</span></span></h2>
      <div class="body">
        <div class="rev"><p>We make ads, music videos, branded films, and whatever else gives us a good excuse to pick up a camera.</p></div>
        <div class="rev"><p>From a random thought on a notes app to the final frame — we make, shoot, direct, create, overthink, and eventually deliver.</p></div>
        <div class="rev"><p>If it can be imagined, shot and edited — we're probably interested.</p></div>
        <div class="rev"><p class="closing">Good stories. Strong visuals. No unnecessary noise.</p></div>
      </div>
      <ul class="contact">
        <li><span>Email</span><a href="mailto:oddeasyproductions@gmail.com">oddeasyproductions@gmail.com</a></li>
        <li><span>Instagram</span><a href="https://instagram.com/_oddeasy" target="_blank" rel="noopener">@_oddeasy</a></li>
        <li><span>WhatsApp</span><a href="https://wa.me/919234283982" target="_blank" rel="noopener">+91 92342 83982</a></li>
      </ul>
    </div>
  </section>

  <div class="words measure" aria-hidden="true">
    <span class="w odd" id="mOdd"></span><span class="w easy" id="mEasy"></span>
  </div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/CustomEase.min.js"></script>
<script>
(function () {
  // "odd" spelled by sound in each script, the way the logo writes ओड: Hindi first, then the next nine
  // most-spoken Indian languages. "easy" never changes.
  const EASY = { t: 'easy', lang: 'en', name: 'English' };
  const PAIRS = [
    { odd: { t: 'ओड', lang: 'hi', name: 'Hindi' }, easy: EASY },
    { odd: { t: 'অড', lang: 'bn', name: 'Bengali' }, easy: EASY },
    { odd: { t: 'ऑड', lang: 'mr', name: 'Marathi' }, easy: EASY },
    { odd: { t: 'ఆడ్', lang: 'te', name: 'Telugu' }, easy: EASY },
    { odd: { t: 'ஆட்', lang: 'ta', name: 'Tamil' }, easy: EASY },
    { odd: { t: 'ઑડ', lang: 'gu', name: 'Gujarati' }, easy: EASY },
    { odd: { t: 'آڈ', lang: 'ur', name: 'Urdu', dir: 'rtl' }, easy: EASY },
    { odd: { t: 'ಆಡ್', lang: 'kn', name: 'Kannada' }, easy: EASY },
    { odd: { t: 'ଅଡ୍', lang: 'or', name: 'Odia' }, easy: EASY },
    { odd: { t: 'ഓഡ്', lang: 'ml', name: 'Malayalam' }, easy: EASY }
  ];
  const N = PAIRS.length, HOME = PAIRS[0], OTHERS = PAIRS.slice(1);

  const $ = id => document.getElementById(id);
  const words = $('words');
  const mOdd = $('mOdd'), mEasy = $('mEasy');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  if (G) G.registerPlugin(...[window.CustomEase].filter(Boolean));

  const seg = (window.Intl && Intl.Segmenter) ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
  const graphemes = t => seg ? [...seg.segment(t)].map(x => x.segment) : Array.from(t);

  function setLang(el, d) { el.lang = d.lang; if (d.dir) el.dir = d.dir; else el.removeAttribute('dir'); }
  function makeSlot(id, cls) {
    const slot = $(id);
    const el = document.createElement('span');
    el.className = 'w ' + cls; slot.appendChild(el);
    return { slot, el, cls, chars: [], k: -1, face: HOME[cls] };
  }
  const S = { odd: makeSlot('oddSlot', 'odd'), easy: makeSlot('easySlot', 'easy') };

  function setFace(s, d, split) {
    setLang(s.el, d); s.face = d;
    s.el.textContent = ''; s.chars = [];
    if (split) {
      graphemes(d.t).forEach(g => {
        const c = document.createElement('span');
        c.className = 'ch'; c.textContent = g;
        s.el.appendChild(c); s.chars.push(c);
      });
    } else s.el.textContent = d.t;
    s.el.classList.toggle('alt', d !== HOME[s.cls]);
    s.faceW = s.el.offsetWidth;            // the real laid-out width in this script's font
  }

  // ---------- measuring ----------
  const wCache = new Map();
  function natW(d, cls) {
    const key = cls + '|' + d.t;
    if (wCache.has(key)) return wCache.get(key);
    const m = cls === 'odd' ? mOdd : mEasy;
    setLang(m, d); m.textContent = d.t;
    const w = m.getBoundingClientRect().width;
    wCache.set(key, w); return w;
  }
  let fs = 120, leftRoom = 0;
  function fit() {
    const wo = natW(HOME.odd, 'odd'), we = natW(HOME.easy, 'easy');
    const vw = innerWidth, vh = innerHeight;
    const maxW = vw * (vw < 700 ? 0.8 : 0.6);
    fs = Math.min(100 * maxW / (wo + we + 16), vh * 0.24, 240);
    words.style.fontSize = fs + 'px';
    S.odd.slot.style.width = (wo * fs / 100) + 'px';
    S.easy.slot.style.width = (we * fs / 100) + 'px';
    const r = S.odd.slot.getBoundingClientRect();
    leftRoom = Math.max(0, r.left - (innerWidth < 700 ? 18 : 28) - 0.25 * fs);
  }

  // ---------- the reel ----------
  const deg = Math.PI / 180;
  function draw(s, a, sign, faces, v) {
    const H = faces.length - 1;
    const k = Math.max(0, Math.min(H, Math.floor((a + 90) / 180)));
    if (k !== s.k) { s.k = k; setFace(s, faces[k], k === 0 || k === H); }
    const vis = a - k * 180;
    const slotW = parseFloat(s.slot.style.width) || 0;
    const w = s.faceW || natW(faces[k], s.cls) * fs / 100;
    const blur = Math.min(9, Math.max(0, (v - 0.15) * 3));
    // a word tipping toward the lens grows at its near edge (perspective), blur spreads it further,
    // and some scripts draw past their measured box: fit all of that inside the slot plus part of the gap
    const mag = 5 / (5 - 0.6 * Math.abs(Math.sin(vis * deg)));
    const ink = faces[k] === HOME[s.cls] ? 0 : 0.06 * fs;
    const need = w * mag + ink + 2 * blur, room = slotW + (s.cls === 'odd' ? leftRoom : 0);
    const sc = (slotW > 0 && need > room) ? room / need : 1;

    if (k === H && H > 0 && vis < 0 && s.chars.length > 1) {
      s.el.style.transform = `scale(${sc})`;
      s.el.style.opacity = '';
      s.el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
      const q = (vis + 90) / 90, n = s.chars.length, d = 0.16, span = 1 - (n - 1) * d;
      s.chars.forEach((c, i) => {
        const qi = Math.min(1, Math.max(0, (q - i * d) / span));
        const vi = sign * (-90 + 90 * qi);
        c.style.transform = `perspective(5em) rotateX(${vi}deg)`;
        c.style.opacity = (0.15 + 0.85 * Math.cos(vi * deg)).toFixed(3);
      });
    } else {
      s.chars.forEach(c => { c.style.transform = ''; c.style.opacity = ''; });
      s.el.style.transform = `perspective(5em) rotateX(${sign * vis}deg) scale(${sc})`;
      s.el.style.opacity = (0.2 + 0.8 * Math.cos(vis * deg)).toFixed(3);
      s.el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
    }
  }
  function settle(s) {
    s.el.style.transform = s.el.style.filter = s.el.style.opacity = '';
    s.chars.forEach(c => { c.style.transform = ''; c.style.opacity = ''; });
  }

  let pulse = () => {};
  function spin(s, faces, sign, duration, ease, delay = 0) {
    return new Promise(res => {
      const H = faces.length - 1, p = { a: 0 };
      let lastA = 0, lastT = performance.now();
      s.k = -1; draw(s, 0, sign, faces, 0);
      G.to(p, {
        a: H * 180, duration, ease, delay,
        onStart() { lastT = performance.now(); },
        onUpdate() {
          const now = performance.now();
          const v = Math.abs(p.a - lastA) / Math.max(1, now - lastT);
          lastA = p.a; lastT = now;
          draw(s, p.a, sign, faces, v); pulse(v);
        },
        onComplete() { draw(s, H * 180, sign, faces, 0); settle(s); pulse(0); res(); }
      });
    });
  }
  function roundTrip(H, offset, which, backwards) {
    const f = [HOME[which]];
    for (let j = 1; j < H; j++) {
      const M = OTHERS.length, i = backwards ? ((offset - j) % M + M) % M : (offset + j) % M;
      f.push(OTHERS[i][which]);
    }
    f.push(HOME[which]); return f;
  }

  // ---------- light that follows the cursor and breathes with the reel ----------
  function setupLight() {
    const key = $('keyLight'), shade = $('shadeLight');
    G.set(key,   { x: -innerWidth * 0.22, y: -innerHeight * 0.18 });
    G.set(shade, { x:  innerWidth * 0.30, y:  innerHeight * 0.25 });
    if (reduce) return;
    const kx = G.quickTo(key, 'x', { duration: 2.2, ease: 'power3.out' });
    const ky = G.quickTo(key, 'y', { duration: 2.2, ease: 'power3.out' });
    const sx = G.quickTo(shade, 'x', { duration: 3.2, ease: 'power3.out' });
    const sy = G.quickTo(shade, 'y', { duration: 3.2, ease: 'power3.out' });
    addEventListener('pointermove', e => {
      pdx = e.clientX - innerWidth / 2; pdy = e.clientY - innerHeight / 2; aimLight();
    });
    G.to(shade, { scale: 'random(0.92, 1.1)', duration: 9, ease: 'sine.inOut', repeat: -1, yoyo: true, repeatRefresh: true });
    const ks = G.quickTo(key, 'scale', { duration: 1.0, ease: 'power3.out' });
    pulse = v => ks(1 + Math.min(v, 2.5) * 0.06);
    moveLight = (kxv, kyv, sxv, syv) => { kx(kxv); ky(kyv); sx(sxv); sy(syv); };
  }
  let moveLight = () => {}, pdx = 0, pdy = 0, q = 0;
  function aimLight() {
    const W = innerWidth, Hh = innerHeight;
    moveLight(W * (-0.22 + 0.5 * q) + pdx * 0.35, Hh * (-0.18 - 0.12 * q) + pdy * 0.35,
              W * (0.30 - 0.6 * q) - pdx * 0.22, Hh * (0.25 + 0.05 * q) - pdy * 0.22);
  }

  // ---------- scroll: the reel turns with the scroll, lands back on the logo, then About rises ----------
  const scene = $('scene'), photo = $('photo');
  const hero = $('hero'), about = $('about'), aboutBtn = $('aboutBtn'), dock = $('dock'), chrome = $('chrome');
  const innerRules = [...document.querySelectorAll('.rule.c1, .rule.c2, .rule.r1, .rule.r2')];
  const lines = [...about.querySelectorAll('.rev > *, .contact li')];
  const REEL = [HOME.odd, ...OTHERS.map(p => p.odd), HOME.odd], RH = REEL.length - 1;
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const spinDist = () => Math.max(1, hero.offsetHeight - innerHeight);
  let live = false, target = 0, cur = 0, atRest = true, revealed = false, revealTl = null, snapT = 0, lastT = performance.now();

  function readScroll() {
    const y = scrollY, vh = innerHeight, sd = spinDist();
    target = clamp01(y / sd) * RH * 180;
    q = clamp01((y - sd) / (vh * 0.45));
    G.set(words, { y: -40 * q, opacity: 1 - q, filter: q > 0.001 ? `blur(${(16 * q).toFixed(2)}px)` : 'none' });
    G.set(innerRules, { opacity: 1 - q });
    // the photograph pulls into focus as About arrives
    scene.style.visibility = q > 0.001 ? 'visible' : 'hidden';
    scene.style.opacity = q.toFixed(3);
    G.set(photo, { scale: 1.08 - 0.08 * q, filter: q < 0.999 ? `blur(${(10 * (1 - q)).toFixed(2)}px)` : 'none' });
    chrome.style.opacity = (1 - clamp01(q * 1.6)).toFixed(3);
    const b = 1 - clamp01(y / (vh * 0.12));
    dock.style.opacity = b.toFixed(3); dock.style.pointerEvents = b < 0.1 ? 'none' : '';
    aimLight();
    if (revealTl) {
      if (!revealed && q > 0.25) { revealed = true; revealTl.play(); }
      else if (revealed && y < sd * 0.5) { revealed = false; revealTl.reverse(); }
    }
  }
  function onScroll() {
    if (!live) return;
    readScroll();
    clearTimeout(snapT);
    // when the scroll stops, the reel settles on the nearest whole word instead of hanging mid-flip
    snapT = setTimeout(() => { target = Math.round(target / 180) * 180; }, 160);
  }
  function tick() {
    if (!live || reduce) return;
    const now = performance.now(), dt = Math.min(64, now - lastT); lastT = now;
    const d = target - cur;
    if (Math.abs(d) < 0.05) {
      if (!atRest) { cur = target; draw(S.odd, cur, 1, REEL, 0); pulse(0); if (cur % 180 === 0) settle(S.odd); atRest = true; }
      return;
    }
    atRest = false;
    const step = d * (1 - Math.pow(0.84, dt / 16.67));
    cur += step;
    const v = Math.abs(step) / Math.max(1, dt) * 0.6;
    draw(S.odd, cur, 1, REEL, v); pulse(v);
  }
  function goAbout() { scrollTo({ top: about.offsetTop, behavior: reduce ? 'auto' : 'smooth' }); }
  aboutBtn.addEventListener('click', goAbout);
  aboutBtn.addEventListener('pointerenter', () => document.body.classList.add('about-hover'));
  aboutBtn.addEventListener('pointerleave', () => document.body.classList.remove('about-hover'));
  addEventListener('scroll', onScroll, { passive: true });

  // ---------- opening: light settles, the frame draws, the logo pulls into focus, the reel runs ----------
  function introEase() {
    return window.CustomEase
      ? CustomEase.create('reel', 'M0,0 C0.28,0 0.36,0.3 0.5,0.56 C0.64,0.82 0.78,1.012 0.88,1.008 C0.94,1.004 0.97,1 1,1')
      : 'power4.inOut';
  }
  async function opening() {
    const key = $('keyLight'), shade = $('shadeLight');
    const tl = G.timeline();
    // overexposed white, settling into the lit wall
    tl.fromTo(key, { scale: 2.6, opacity: 1 }, { scale: 1, duration: 2.4, ease: 'power3.out' }, 0);
    tl.fromTo(shade, { opacity: 0 }, { opacity: .75, duration: 2.2, ease: 'power2.out' }, 0.2);
    // the frame rules draw themselves
    tl.fromTo('.rule.h', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power3.inOut', stagger: 0.06 }, 0.5);
    tl.fromTo('.rule.v', { scaleY: 0 }, { scaleY: 1, duration: 1.4, ease: 'power3.inOut', stagger: 0.06 }, 0.6);
    tl.fromTo('.mark-corner', { opacity: 0 }, { opacity: 1, duration: .5 }, 1.6);
    // focus pull on the logo
    tl.fromTo(words, { opacity: 0, filter: 'blur(26px)', scale: 1.04 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 2.0, ease: 'power2.inOut' }, 0.6);
    await tl.then();
    words.style.filter = '';

    const H = N * 2, oddFaces = [];
    for (let k = 0; k <= H; k++) oddFaces.push(PAIRS[k % N].odd);
    const ease = introEase();
    await spin(S.odd, oddFaces, 1, 3.2, ease, 0.3);
    document.body.classList.remove('intro');
    G.fromTo(['.tl', '.badge', '.about-btn'], { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.08 });
    document.documentElement.classList.remove('lock');
    S.odd.k = -1; cur = target = 0; lastT = performance.now();
    live = true; readScroll(); G.ticker.add(tick);
    if (location.hash === '#about') goAbout();
  }

  // ---------- boot ----------
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  setFace(S.odd, HOME.odd, true);
  setFace(S.easy, HOME.easy, true);
  fit();
  addEventListener('resize', () => { wCache.clear(); fit(); if (live) readScroll(); });
  // fonts that arrive late (CJK, Arabic) change word widths: re-measure so nothing collides
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { wCache.clear(); fit(); S.odd.faceW = S.odd.el.offsetWidth; });

  if (!G || reduce) {
    document.body.classList.remove('intro');
    if (G) { setupLight(); live = true; readScroll(); }
    if (location.hash === '#about') about.scrollIntoView();
    return;
  }
  scrollTo(0, 0);
  document.documentElement.classList.add('lock');
  G.set(lines, { yPercent: 110, opacity: 0 });
  revealTl = G.timeline({ paused: true }).to(lines, { yPercent: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .07 });
  // slow turn of the badge
  G.to('.badge svg', { rotate: 360, duration: 40, ease: 'none', repeat: -1 });

  const heavy = getComputedStyle(document.documentElement).getPropertyValue('--heavy');
  const light = getComputedStyle(document.documentElement).getPropertyValue('--logo-latin');
  const loads = [];
  PAIRS.forEach(p => {
    loads.push(document.fonts.load((/^(hi|mr)$/.test(p.odd.lang) ? '900' : '800') + ' 100px ' + heavy, p.odd.t));
    loads.push(document.fonts.load('400 100px ' + light, p.easy.t));
  });
  Promise.race([
    Promise.allSettled(loads).then(() => document.fonts.ready),
    new Promise(r => setTimeout(r, 2500))
  ]).then(() => {
    wCache.clear(); fit();
    setupLight(); opening();
  });
})();
</script>
</body>
</html>
```

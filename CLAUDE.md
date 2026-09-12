# dope-website

A cyberpunk / CRT personal site. Front end is React 19 + Vite, fully static.
`backend/` is a .NET placeholder, not in use. Bilingual (English / 中文).

Live: https://l9k.dev (107.149.92.201)

## Working agreement

**Do not commit unless asked.** Make the change, verify it, report what
happened — then stop. Committing, merging and pushing all wait for an explicit
request. Pushing to `master` triggers a deploy, so it is never a tidy-up step.

**Verify by measuring, not by screenshotting.** Most bugs in this repo's
history were invisible: a missing HTTP header, an inert highlight, a font
silently falling back. Read computed styles, check `scrollWidth >
clientWidth`, fetch the deployed asset and grep it.

**Say what could not be verified.** The preview browser cannot paint
animations (0 rAF frames), cannot grow a mobile URL bar, and cannot reproduce
a real device's touch behaviour. Those need the user's own machine — say so
rather than implying coverage.

It also does not repaint reliably after scrolling: a screenshot taken once the
page is scrolled shows a blank band, or an entirely blank viewport, while
`elementFromPoint` still returns the element that should be painted there and
forcing a repaint changes nothing. It reproduces on pages no change touched,
so read it as the preview, not the site — and measure geometry instead of
trusting the picture.

## Architecture

```
frontend/content/            markdown; directory layout = URL
  review/<medium>/<slug>.md    → /review/<medium>/<slug>
  blog-post/<slug>.md          → /blog-post/<slug>
  <slug>.md                    → /<slug>   standalone page, never in listings
                                 (home.md is the homepage; README.md excluded)
  abt-me.md + abt-me/*.md      → a standalone page that also has sub-pages:
                                 Resolve puts `page` ahead of `Section`, so
                                 /abt-me stays that md and never becomes a
                                 listing. The children are reached through the
                                 bottom nav's submenu only — not repeated on
                                 the page, same call as Section.jsx makes
frontend/src/
  content/posts.js           import.meta.glob at build time, parses frontmatter
  content/Markdown.jsx       marked tokens → React (not an HTML string)
  highlight/                 the [markup] system used inside prose
  components/nav/sections.js the section tree; sole source for routes, nav,
                             breadcrumbs. Plain data — must not import React
  i18n.js                    UI strings, { en, zh }
frontend/font-source/        full font, subsetting input only, never deployed
frontend/scripts/subset-font.mjs   emits public/font/*.subset.woff2
frontend/vendor/temu-thea/   git submodule: the game, compiled from source
deploy/nginx.conf            reference copy of the vhost; CI does NOT deploy it
deploy/bootstrap.sh          rebuild a fresh server to the point CI can take over
```

Article format and available markup: `docs/post-template.md` — the complete
syntax list and the skeleton to copy. `frontend/content/README.md` is the
shorter in-place version.

## Settled rules

**Syntax is not translated, names are.** `ls` / `cd` / `$` / `~` / `[F10]` /
`[ESC]` are syntax, not English; they stay out of i18n. Path segments, section
names and UI words follow the language. URLs are always ASCII slugs; Chinese
appears only in the display layer.

**One markup system.** `highlight/parse.js` already supports
`[name key="value"]…[/name]` with named parameters — do not add XML-style
syntax. A new interaction is one entry in `highlight/actions.js`; components
stay untouched. **Parameter names must match `docs/post-template.md`.** When
they do not, the highlight still gets its styling but is not interactive, and
the page looks identical — `tooltip` read `attrs.text` while every article and
the docs wrote `content=`, so every tooltip on the site was dead. Missing
content now `console.warn`s; new actions should do the same.

**`docs/post-template.md` is the syntax contract — update it in the same
change.** It holds every frontmatter field, every markup tag and every
parameter, plus the skeleton to copy when writing an article. Adding or
changing a tag, a parameter or a frontmatter field without touching that file
leaves the only description of the syntax wrong, and a wrong parameter name is
the one kind of mistake this repo cannot see: the page renders normally and
the feature is simply dead. `frontend/content/README.md` covers the same
ground more briefly and moves with it.

It lives in `docs/`, not in `content/`, and must stay there. `posts.js` globs
`/content/**/*.md` into the bundle whether or not a file is routed, the route
exclusion is a hardcoded check for `content/README.md` alone — so any other
`.md` directly under `content/` becomes a reachable page with an empty title —
and `scripts/subset-font.mjs` scans `content/`, which would pull the template's
example text into all four font subsets.

**Markdown goes through tokens, not an HTML string.** `[markup]` inside prose
becomes a React component with event handlers, which cannot be injected into an
HTML string. Adjacent text tokens must be merged first, or marked splits one
piece of markup across two tokens and the pair never matches.

**The Chinese font is a build-time subset.** Full Source Han Serif is 22.8MB;
the site uses a bit over a thousand characters. `scripts/subset-font.mjs` scans
`content/`, `src/` and the game's `i18n.js`, and emits ~420KB of woff2.
`predev` / `prebuild` run it, so **adding an article needs no manual step**. The
source font lives in `font-source/` — **do not move it back into `public/`**,
which Vite copies verbatim into `dist`. The output is gitignored.

A few HUD symbols (`✦ ◆ ❙ ×`) are appended to the subset's baseline because
they appear in JSX rather than in scanned text. `✦` and `❙` do not exist in
Source Han Serif or Oswald at all, so they fall back to a system face; the
lasting fix would be drawing them, as `Rating.jsx` already does for `▮▯` and
`highlight/icons.jsx` does for the chain that marks a `[link]`. Drawing is why
that icon looks the same under all four fonts and both languages — a glyph
would have to be added to the subset baseline and would still fall back
wherever the face lacks it.

**Article, standalone page and listing share one measure.** `--content-measure`
(100ch) is used by `.post`, `.page` and `.entry-list`, so the left and right
edges do not jump as you move between them. Two independent literals would
drift. `.page` was missing for a while and standalone pages had no cap at all:
on a 2200px screen home and abt-me ran the full 2130px, about 187 characters a
line, against 890px and 78 for an article on the same screen.

**Body size is fluid.** `--content-font-size` clamps 17px → 24px by viewport,
and prose is `--md-font-ratio` (1.5) times that — 25.5px → 36px. Do not set an
absolute px font size anywhere downstream: it opts that element out of the
scaling and recreates "too small on a 4K screen". Per-article overrides use
`fontScale` in frontmatter, a multiplier that composes with the base (clamped
0.8–1.6).

The ratio was 1.12, with `home.md` and `abt-me.md` each carrying
`fontScale: 1.34` to look right — so the comfortable ratio was really
1.12 × 1.34 ≈ 1.5 all along, and only those two pages had it. It is now the
default and those two dropped their `fontScale`; leaving it in would have
multiplied 1.34 a second time. **The ratio lives in one place** — `.md` and
`Contact.css` both read `--md-font-ratio`, because two literals drift, same
reason as `--content-measure`.

**It has to stay in `em`.** `.main-content.use-normal-font` multiplies the
base by 0.9 (Source Han Serif reads a size larger than the pixel font at the
same px), and `em` inherits that for free. Rebuilding it as a `calc()` on
`--content-font-size` silently drops that compensation.

The cost is on narrow screens: the clamp floors at 17px below a ~1280 viewport,
so a 375px phone gets the same 25.5px as a 1024px laptop — **31 characters a
line** against 41 before. Lowering it there means making `--md-font-ratio`
itself viewport-dependent, not touching the clamp.

**A hovered `[link]` answers in the chrome, not in a tooltip.** The cursor
becomes a pixel chain and the bottom bar's command line echoes the target,
restoring the command on leave. A tooltip means "there is a note here"; a link
means "this is clickable, and here is where it goes" — one box cannot say both,
and with neither, a link without a `tip` was indistinguishable from a tooltip
that had not loaded. Both run through `actions.js` alone: `cursor: 'chain'`
adds an `.is-chain` class, and `onActivate` calls `ui.showLinkHint(href)` —
the same hook `[settings]` uses to raise its arrow over the SETUP button.

**The chain's geometry lives once, in `highlight/chain.js`.** It is needed as
a React component (the bottom bar) and as an SVG data URI (the CSS cursor);
two copies of 40 rect coordinates would drift silently. `icons.jsx` may export
only components — `react-refresh/only-export-components` — so the data and the
data-URI builder cannot live there. CSS cannot import JS either, so `Layout`
sets `--chain-cursor` on the root element, the way `SiteNav` sets
`--nav-height`. That cursor always needs its `, pointer` fallback and its
`xmlns` + `width`/`height`: a data-URI SVG missing any of them is dropped
silently, leaving no cursor change at all.

The echo is `display: none` under 640px. `.sh-line` is `nowrap`, so a long URL
would push `[F10] SETUP` off screen; `min-width: 0` plus `overflow: hidden` is
what lets it ellipsize instead of bursting the line on wider screens.

**Headings are a neon tube, not an LED strip.** Three things separate the two,
and `Markdown.css` does all three: the core is near-white with the saturation
living in the glow (a colored core reads as LED); it is one continuously bent
tube, done as `border-left` + `border-bottom` + `border-bottom-left-radius` on
a single box rather than two stacked blocks; and it has a dark electrode cap at
the lit end. Bending it into the heading's underline makes it a section divider
as well as a level marker. The glow is `drop-shadow`, never `box-shadow` — the
box is empty in the middle, and `box-shadow` would light its whole rectangle,
inventing a top and right tube that do not exist.

**The bend is a crispEdges SVG, not `border-radius`.** A CSS rounded corner is
a real arc and is always anti-aliased, which puts one soft curve in a page
where the rating bars, the setup arrow, the chain and the tube itself are all
hard pixel edges; a square corner is worse. So the tube is three background
layers on one pseudo-element — vertical run, horizontal run, and a fixed-size
SVG elbow chamfered at 45° into pixel steps. Fixed size is the point: a
stretched SVG would distort the steps.

**One design cell is 2 CSS px, not 1** — the elbow's viewBox is half its
rendered size. At 1px a step is invisible at reading distance and the bevel is
indistinguishable from the anti-aliased arc it replaced, so the whole exercise
buys nothing. The cost is that the tube width has to be even (6px and 4px, not
5px and 3px), because the runs and the elbow's arms must land on the same
2px grid. **The three layers must stay in sync** —
the runs are sized `calc(100% - <elbow>)` and the elbow's arms sit at specific
rows of its own grid, so changing the tube width or the elbow size means
changing all three, and a mismatch leaves a gap at the seam.

**Headings do not get their own colour.** The text inherits `.main-content`'s
cyan, so a change to body colour carries the headings with it; hierarchy comes
from size, the tube and the dark plate. Fluorescent yellow was tried and pulled:
yellow letters, yellow bloom, white tube core, magenta tube light and magenta
wall wash put five colours in one heading, which scans as busy rather than
bright. The text's bloom is magenta because the tube is the only light source
in the picture.

**Light comes from the upper left, headings included.** Body text, `h1` and the
md headings all cast the same black shadow down-right; a heading's magenta bloom
is offset up-left so the two describe one light source. An even `0 0` glow reads
as foreign precisely because it has no direction while everything around it does.
`text-shadow` cannot be appended to, so a heading that adds a bloom has to
restate the black layers — they come from `--text-shadow-base` on `:root`
(`Layout.css`) rather than a second copy. It is on `:root`, not `.main-content`,
because referencing an undefined custom property invalidates the whole
declaration at computed-value time — the `--u` trap again.

**Glowing text needs something dark behind it.** The headings sit on a busy
neon photograph; yellow letters with a yellow glow have no separation from it,
which reads as "the shadow isn't working" rather than as low contrast. Two
fixes, both needed: a dark plate under the heading fading out to the right, and
a dark layer **last** in `text-shadow` — last, because shadows paint
front-to-back, and putting the dark layer first draws it on top of the glow as
a black outline.

**The stutter animates the pseudo-element, never the heading.** An `opacity`
animation on `h2` would give the heading a stacking context, and a `[tooltip]`
written inside a heading (z-index 1200) could then no longer clear the bottom
bar (z-index 1000) — the same trap as `.bg` not being allowed `position` or
`isolation`. Animating `::before` has no such effect. It is gated on
`.crt-flicker-on`, which `Layout` puts on `.main-content` from the same SETUP
switch as the full-screen flicker, so one toggle covers both, and it is off
under `prefers-reduced-motion`.

**"The flicker works on my phone but not on my PC" is not a bug.** Windows
Settings → Accessibility → Visual effects → Animation effects, when off, makes
every browser on that machine report `prefers-reduced-motion: reduce`, and the
guard then does its job. Check it from here rather than guessing: PowerShell
`SystemParametersInfo(SPI_GETCLIENTAREAANIMATION = 0x1042)` returns the real
setting. This machine has it off, which is also why the preview browser reports
`reduce` — that was never an artifact of automation.

**The preview browser cannot verify any of this in motion** — it reports
`prefers-reduced-motion: reduce` (so the guard correctly disables the
animation) and its document timeline is frozen, so `currentTime` does not
advance. What does work: override the media query, then scrub
`getAnimations()[0].currentTime` and read the computed `opacity` at each
keyframe moment. That proves the curve without a single frame being painted.
Sample the MIDPOINT of each keyframe interval, not the boundaries — with
`steps(1, end)` a sample landing exactly on a boundary reads the neighbouring
interval and silently skips a step, which looked like a missing keyframe.

**Headline entries only on leaf sections.** `/review` aggregates several media
and cannot pick one "most recommended", so it stars each sub-section's pick and
sorts them first, with no banner.

## The game submodule

`vendor/temu-thea` is a separate repo. The site's Vite compiles its `src/game`
directly through the `@game` alias — not an iframe, not an npm package — so the
game shares the site's fonts, CRT shell and language state. The bottom bar's
中文 toggle switches the game's text too.

**The game repo does not deploy.** Its CI runs lint / typecheck / test / build
only. A submodule pins a commit, so pushing there changes nothing on the site.
Shipping a game change takes three steps:

```
1. commit and push in the game repo          (CI runs the checks)
2. git submodule update --remote frontend/vendor/temu-thea
3. commit the moved pointer and push          (this is what deploys)
```

Skipping 2–3 leaves the game repo green and the site unchanged, with nothing
anywhere reporting a problem.

Clone with `--recurse-submodules`; CI needs `submodules: true` on checkout.
Without it every local machine works and only CI fails on a missing module.

**Host knobs**, all set in `pages/GamePage.css`: `--line-w` (stroke width),
`--game-font` (typeface), `--game-font-size` (overall size — every gap,
padding, min-width and tap target inside the game derives from it via
`--u = --game-font-size / 13`). **The game declares none of them, it only
writes fallbacks.** Custom properties resolve by inheritance and the nearest
declaration wins, so a value on `.hexgame` would override whatever the host
sets further out — which is the whole point of exposing them.

**`--u` is unavailable outside `.hexgame`.** `SaveControls` renders into the
host's chrome, outside the game root, so its stylesheet must use plain px. A
`calc()` referring to an undefined custom property is invalid at computed-value
time: `gap` fell back to `normal` and the three buttons ran together, silently.

**The game is sized by its own width, not the viewport.** `.game-stage` is a
container (`container-type: inline-size`) and `--game-font-size` is
`clamp(14px, 1.15cqw, 44px)`, so the HUD stays a constant ~20% of the board at
any size. The 44px ceiling is not large: a 4K panel at 100% scaling gives a
3770px stage and lands on 43px, while the same panel at 150% gives 28px —
identical physical size. Capping lower makes the 100% case top out early and
the panel shrink to 13%, which is the defect this replaced.

## Traps (each of these took a long time to find)

**`base` in `vite.config.js` must be `/`.** With `'./'`, assets under
`/review/films` resolve to `/review/assets/…`, which does not exist, gets caught
by nginx's SPA fallback and returns index.html — the browser receives a module
script with `text/html` and the page is blank. **The homepage is fine**, so
testing only the homepage will not find it.

**Never give `body` `display: flex` in `index.css`.** The Vite template shipped
`display:flex + place-items:center`, which makes the React root a flex item
whose `min-width:auto` sizes it to content instead of the viewport; on a narrow
screen any wide element bursts the page. The template's `overflow-x: hidden`
happened to hide the symptom. Both are removed — **do not add them back**; the
mask only hides the next layout bug.

**The fonts have no italics.** Neither BitPap nor Oswald has an italic face and
browsers do not synthesise oblique — `normal` / `italic` / `oblique 14deg`
render identically. Emphasise with quotes, colour or size.

**On touch, focus precedes click.** An unconditional `onFocus={activate}` on a
focusable element is toggled straight back off by the click, so the first tap
appears to flash. Use `e.target.matches(':focus-visible')` to tell keyboard
focus from a pointer tap.

**Touch has mouseenter but no mouseleave.** Hover-dependent state must be
cleared on navigation or it stays stuck.

**`background-attachment: fixed` zooms mid-scroll on phones.** A fixed
background's positioning area is the viewport, and the viewport grows when the
URL bar retracts, so `cover` recomputes its scale and the image jumps. The
image is 1920x1080 against a portrait screen, where height always decides the
scale. It is now `.bg::before`, a `position: fixed` layer of its own at
`100lvh`. Its `z-index` is negative, and **`.bg` must not get `position` or
`isolation`** — a stacking context there stops the body's `z-index: 1200`
tooltips clearing the `z-index: 1000` bottom bar.

**`lvh` and `svh` are both used here, in opposite directions.** The background
layer must cover the largest case, so `lvh`; too short shows bare canvas. The
game page must never exceed what is visible, so `svh`. With `lvh` the game page
sat exactly one URL bar taller than the screen (844 against 750, 94px), leaving
it permanently scrollable, and since the board takes its own pointer events the
only thing that moved was the fixed bottom bar — taps landed below the finger.
Desktop cannot show any of this; all three units equal the viewport there.

**nginx `add_header` replaces the inherited set, it does not add to it.** Any
`add_header` in a `location` drops every one inherited from `server`. After
adding `Strict-Transport-Security` at server level, every location with its own
cache headers (`/assets/`, `/font/`, `/image/`, `= /index.html`) lost it — and
the homepage reaches `/index.html` through `try_files`, so the most important
path was the one missing it. `always` does not help; that governs error
responses. Repeat it per location. Nothing breaks visibly.

**`width: 100vw` includes the scrollbar** and adds a stray horizontal scrollbar
on desktop. Use `100%`.

**Check horizontal overflow after any layout change**, rather than trusting a
screenshot: `document.documentElement.scrollWidth > clientWidth`.

## Local environment

- **`git push` must use the Windows ssh binary** — Git Bash's own ssh cannot see
  the keys in the Windows ssh-agent:
  `GIT_SSH_COMMAND="/c/Windows/System32/OpenSSH/ssh.exe" git push`
- Git Bash rewrites POSIX-looking arguments; `MSYS_NO_PATHCONV=1` disables it,
  but that also stops `/tmp/...` from resolving. Prefer relative paths.
- `autocrlf` is on. `.gitattributes` pins `*.sh`, `*.yml` and `deploy/nginx.conf`
  to LF — a CRLF shell script fails on Linux as `bad interpreter: ^M`, and only
  on the machine you are trying to rebuild.
- **No rsync locally.** Transfer with `tar -czf - . | ssh … tar -xzf -` or `scp`.
- Windows builds hash differently from CI: markdown is inlined by
  `import.meta.glob`, and CRLF makes the JS bundle a few hundred bytes larger.
  **Never use the bundle hash to decide whether a deploy landed** — grep content.
- Server backups (SSH public keys, acme.sh certs) live outside the repo at
  `C:\Users\36214\dope-server-backup\`. They contain private keys.

## Deployment

- **Debian 13 (trixie)**, Python 3.13, nginx 1.30 from nginx.org's repo
- Site root `/var/www/dope-website`; vhost at
  `/etc/nginx/conf.d/dope-website.conf`. `deploy/nginx.conf` is the repo's copy
  — **CI does not deploy it**; changes must be uploaded by hand
- Domain `l9k.dev`, `www` 301s to the apex. **The whole `.dev` TLD is HSTS
  preloaded**, so HTTPS is not optional: without a certificate browsers refuse
  to try port 80 at all and give `CONNECTION_REFUSED`, and no browser setting
  works around it
- Certificates via **acme.sh, not certbot** — pure shell, no Python dependency.
  Renewal is a root crontab entry, four times a day, reloading nginx through the
  hook recorded at install time. `--ecc` is required on `--install-cert`: the
  cert is ec-256 and lives in `<domain>_ecc/`
- The ACME webroot is `/var/www/acme` and **must not be inside the site
  directory** — CI rsyncs with `--delete` and would race a renewal
- **nginx needs `try_files $uri $uri/ /index.html`** or deep links 404
- CI: push to master/main builds and deploys, ending in a smoke test (five
  routes over https, the JS MIME type, and the http→https redirect). Because
  curl validates certificates and these calls have no `-k`, the smoke test
  doubles as certificate-expiry monitoring
- Secrets: `SERVER_HOST` / `SERVER_USER` / `SERVER_SSH_KEY`

## Rebuilding the server from scratch

`deploy/bootstrap.sh` takes a fresh machine to the point CI can take over.
**CI only rsyncs `dist/`** — it installs nothing, writes no vhost, issues no
certificate, creates no directories. Running it alone gets nowhere, and it
fails ahead of all that anyway: the deploy key is gone, the probe step touches
a `/var/www/dope-website` that does not exist, and the smoke test asks for
https before there is a certificate.

The ordering cannot be reversed: **the real vhost names certificate files, so
on a new machine `nginx -t` fails, nginx will not start, nothing listens on 80,
the ACME challenge cannot be answered and no certificate can be issued.** The
script stands up an HTTP-only vhost first and swaps in the real one after.

**nginx must come from nginx.org**, not the distribution: Debian ships 1.22/1.24
while the config uses `http2 on;`, which needs 1.25.1, and its nginx runs as
`www-data` while the workflow hardcodes `chown nginx:nginx`.

Things a minimal Debian image does not have, all of which broke a real rebuild:
`cron` (acme.sh prints "cannot install cron jobs" and continues, so the
certificate silently stops renewing three months later), `rsync` (every check
passes, the server looks finished, and CI's upload fails somewhere else
entirely), and a tty (`gpg --dearmor` prompts before overwriting an existing
keyring, so the script worked once and failed on every re-run — `--batch --yes`).

Some provider images ship `PubkeyAuthentication no`, which makes key auth fail
no matter how correct the file, its permissions and its fingerprints are. Only
`sshd -T` shows it.

Back up `/root/.ssh/authorized_keys` and `/root/.acme.sh` before reinstalling.
Put `acme.sh-backup.tar.gz` beside the script and it restores the certificate
instead of issuing one — Let's Encrypt allows five duplicates a week, a couple
of reinstalls can reach that, and on an HSTS-preloaded domain no certificate
means the site is unreachable, not degraded.

## Pending

- Root still logs in with a password; `PasswordAuthentication no` once key auth
  is confirmed from a second terminal. CI proves key auth works, so the
  precondition is already met — this is one line on the server, not a project
  task
- Deploys run as root; a dedicated deploy user would be better
- The four reviews (three Wong Kar-wai films, Outer Wilds) are **sample
  content** written in the first person — replace or delete before launch.
  `home.md`, `abt-me.md` and the blog post are real writing, not placeholders
- `abt-me/hobbies.md` and `abt-me/this-site.md` are empty shells, and
  `abt-me/experience.md` has no Chinese body. They are linked from the bottom
  nav, so each is a reachable page with a title and nothing under it
- **An empty language section does not fall back.** `splitLanguages` yields
  `''`, not `undefined`, and every reader uses `??` —
  `doc.body[lang] ?? doc.body.en` keeps the empty string, `Markdown` sees a
  falsy `children` and renders `null`. So a half-translated page goes blank in
  the missing language instead of showing the language that exists. Fix is in
  `posts.js` (drop empty parts) or at the three `??` chains, not in the md
- Section names (`review` / `blog-post` / `abt-me` / `game`) are not settled
- `anime` and `books` have no content

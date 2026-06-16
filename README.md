# cc-iosux

Quality-of-life tweaks for **[CrossCode](https://store.steampowered.com/app/368340/CrossCode/)**
running inside the **[cc-ios](https://github.com/cc-mods/cc-ios)** iPhone/iPad wrapper.

> ### ⚠️ You must own CrossCode. This repo contains **no game code or assets** — only a small mod.

Part of the [**cc-mods**](https://github.com/cc-mods) suite.

## What it does

On **cc-ios**, CrossCode runs inside a native `WKWebView`. This mod adds small iOS-only niceties:

| Feature | What it does |
|---|---|
| **Restart Game** button | Title-menu entry that reloads the web view — a clean full re-boot of CrossCode + CCLoader. |
| **Close Game** button | Title-menu entry that tells the cc-ios host app to exit. |
| **FPS-counter toggle** | A checkbox in **CCModManager → Mod settings** to show/hide the on-screen FPS counter. |

The title buttons fill a gap on iOS (the game's own "close" button is desktop-only, using
`nw.gui`). The FPS counter itself is drawn **natively** by the cc-ios host (an HTML overlay can't
paint over the game's WebGL canvas on iOS); this mod just owns the **on/off setting** for it.

### Where each piece lives

- `prestart.js` — adds the **Restart / Close** title-menu buttons (posts to the cc-ios `cccontrol`
  bridge).
- `poststart.js` — registers the **Show FPS counter** checkbox with CCModManager. The value is
  stored in `localStorage["cc-iosux-fpsCounter"]`; the cc-ios host reads it and shows/hides the
  native FPS label. Absent/null = on (the historical default).

### Desktop behavior: deliberate no-op

Desktop CrossCode already has a native **Close** button, has no `cccontrol` bridge, and has no
native FPS overlay to toggle. So on desktop — or any host that isn't cc-ios — this mod **detects
the missing bridge and adds nothing**, leaving the vanilla menu and settings untouched. It still
loads without error everywhere; it just only *functions* inside cc-ios. That keeps the whole
cc-mods suite mutually compatible and individually installable.

## Install

> **One-click:** on **cc-ios** this appears in the in-game **Mods** tab automatically. On desktop you
> generally don't need it, but it's harmless — add the `@cc-mods/CCModDB/stable` repository in
> CCModManager → Settings → Repositories, or grab the `.ccmod` from
> [Releases](https://github.com/cc-mods/cc-iosux/releases).

### iPhone / iPad (cc-ios)

cc-ios loads CCLoader mods (in-game **Mods** tab + on-device install). From a cc-ios checkout
(after `make setup`):

```bash
tools/setup-ccloader.sh --add-mod /path/to/cc-iosux
```

…or install the built `.ccmod` from the in-game **Mods** tab. Then:

- Boot to the title screen — you'll see **Restart Game** and **Close Game** under Options.
- Open **Mods → (select cc-ios UX) → Mod settings** to toggle the **FPS counter**.

The JS console logs `[cc-iosux] installed Restart + Close title buttons.` and
`[cc-iosux] registered FPS-counter setting in CCModManager.`

## Repo layout

```
cc-iosux/
  ccmod.json               CCLoader manifest (prestart + poststart, no assets)
  package.json             legacy CCLoader manifest mirror
  prestart.js              the title-menu patch (+ desktop no-op guard)
  poststart.js             registers the FPS-counter setting in CCModManager
  icon.png                 24x24 mod icon (original art)
  README.md
  LICENSE                  MIT (this mod's own code only)
  .github/workflows/release.yml   auto-release on push to main
```

## Development

Two small, independent scripts:

- `prestart.js` hooks `sc.TitleScreenButtonGui` in the **prestart** stage (after `game.compiled.js`
  defines `sc.*`). All button setup and callbacks are wrapped in `try/catch` so a mod error can
  never reach the game's init (which would show the `CRITICAL BUG` screen).
- `poststart.js` registers a CCModManager option config in the **poststart** stage (so
  `window.modmanager` is ready). It guards on both the cc-ios bridge and CCModManager being
  present, so it's a no-op anywhere either is missing.

Both gate on the cc-ios bridge (`window.webkit.messageHandlers.cccontrol` / `cchost`), so desktop is
a clean no-op.

Prove changes in the **cc-ios macOS WebKit harness** (local, no device, no signing) the same way the
other cc-mods do — boot the game with this mod overlaid and confirm `jsErrors=0` and the features
appear.

## Legal

Unofficial fan project, **not affiliated with, authorized, or endorsed by Radical Fish Games**.
Contains no CrossCode code or assets. This mod's own source is MIT (see [`LICENSE`](LICENSE)).
CrossCode and [CCLoader](https://github.com/CCDirectLink/CCLoader) belong to their respective owners.

# cc-iostitlebuttons

Native **Restart Game** and **Close Game** buttons on the **[CrossCode](https://store.steampowered.com/app/368340/CrossCode/)**
title-screen menu — for the **[cc-ios](https://github.com/cc-mods/cc-ios)** iPhone/iPad wrapper.

> ### ⚠️ You must own CrossCode. This repo contains **no game code or assets** — only a small mod.

Part of the [**cc-mods**](https://github.com/cc-mods) suite.

## What it does

On **cc-ios**, CrossCode runs inside a native `WKWebView`. The game's own "close" button is
desktop-only (it uses `nw.gui`), so on iPhone/iPad there's no in-game way to restart or quit. This
mod adds two entries to the title menu, grouped under **Options**:

| Button | Action |
|---|---|
| **Restart Game** | Reloads the web view — a clean full re-boot of CrossCode + CCLoader. |
| **Close Game** | Tells the cc-ios host app to exit. |

It posts to the cc-ios native `cccontrol` bridge to do this.

### Desktop behavior: deliberate no-op

Desktop CrossCode already has a native **Close** button (and doesn't need an in-app Restart), and it
has no `cccontrol` bridge. So when this mod is loaded on desktop — or any host that isn't cc-ios — it
**detects the missing bridge and adds nothing**, leaving the vanilla menu untouched. It still loads
without error everywhere; it just only *functions* inside cc-ios. That keeps the whole cc-mods suite
mutually compatible and individually installable.

## Install

> **One-click:** on **cc-ios** this appears in the in-game **Mods** tab automatically. On desktop you
> generally don't need it, but it's harmless — add the `@cc-mods/CCModDB/stable` repository in
> CCModManager → Settings → Repositories, or grab the `.ccmod` from
> [Releases](https://github.com/cc-mods/cc-iostitlebuttons/releases).

### iPhone / iPad (cc-ios)

cc-ios loads CCLoader mods (in-game **Mods** tab + on-device install). From a cc-ios checkout
(after `make setup`):

```bash
tools/setup-ccloader.sh --add-mod /path/to/cc-iostitlebuttons
```

…or install the built `.ccmod` from the in-game **Mods** tab. Then boot to the title screen — you'll
see **Restart Game** and **Close Game** under Options. The JS console logs `[cc-iostitlebuttons] installed`.

## Repo layout

```
cc-iostitlebuttons/
  ccmod.json               CCLoader manifest (prestart stage, no assets)
  package.json             legacy CCLoader manifest mirror
  prestart.js              the title-menu patch (+ desktop no-op guard)
  icon.png                 24x24 mod icon (original art)
  README.md
  LICENSE                  MIT (this mod's own code only)
  .github/workflows/release.yml   auto-release on push to main
```

## Development

The mod is a single `prestart.js`. It hooks `sc.TitleScreenButtonGui` in the **prestart** stage (after
`game.compiled.js` defines `sc.*`). All button setup and callbacks are wrapped in `try/catch` so a mod
error can never reach the game's init (which would show the `CRITICAL BUG` screen). The cc-ios bridge
detection (`window.webkit.messageHandlers.cccontrol`) gates everything, so desktop is a clean no-op.

Prove changes in the **cc-ios macOS WebKit harness** (local, no device, no signing) the same way the
other cc-mods do — boot the game with this mod overlaid and confirm `jsErrors=0` and the buttons appear.

## Legal

Unofficial fan project, **not affiliated with, authorized, or endorsed by Radical Fish Games**.
Contains no CrossCode code or assets. This mod's own source is MIT (see [`LICENSE`](LICENSE)).
CrossCode and [CCLoader](https://github.com/CCDirectLink/CCLoader) belong to their respective owners.

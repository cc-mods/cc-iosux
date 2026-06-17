# Copilot instructions — cc-iosux

Part of the **[cc-mods](https://github.com/cc-mods)** CrossCode suite — quality-of-life tweaks for
the cc-ios iPhone/iPad wrapper (Restart/Close title buttons + an FPS-counter toggle).

📓 **Read the suite agent docs first:**
**[`cc-mods/cc-agent-tools`](https://github.com/cc-mods/cc-agent-tools)** (private; org members only) is the
source of truth for hard-won findings — start at its
[`AGENTS.md`](https://github.com/cc-mods/cc-agent-tools/blob/main/AGENTS.md). Most relevant here:
- [`crosscode-modding.md`](https://github.com/cc-mods/cc-agent-tools/blob/main/crosscode-modding.md) —
  platform detection and the "iOS-targeted but universally safe" pattern this mod embodies.
- [`cc-ios.md`](https://github.com/cc-mods/cc-agent-tools/blob/main/cc-ios.md) — the `cccontrol`/`cchost`
  native bridges it posts to, the title-screen menu internals, and the **native** FPS overlay this
  mod's setting toggles.

**When you learn something durable, add it to `cc-mods/cc-agent-tools`** and keep this pointer intact.

## What this is

A small QoL mod for cc-ios with two independent pieces:
- `prestart.js` — adds **Restart Game** / **Close Game** entries to the title menu by patching
  `sc.TitleScreenButtonGui`; posts to `window.webkit.messageHandlers.cccontrol`.
- `poststart.js` — registers a **Show FPS counter** checkbox with CCModManager
  (`window.modmanager.registerAndGetModOptions`). The value lives in
  `localStorage["cc-iosux-fpsCounter"]`; the cc-ios host's FPS script reads it and shows/hides the
  **native** FPS label. The host treats absent/null as ON.

## The defining rule: load everywhere, function only on cc-ios

Both scripts **detect the cc-ios bridge** (`window.webkit?.messageHandlers?.cccontrol` / `cchost`).
If it's absent (desktop NW.js / any non-cc-ios host) they **log and return — a clean no-op**. The
FPS setting additionally requires CCModManager (`window.modmanager`) — absent → skip registration.
Everything must still *load without error* anywhere; it only *functions* inside cc-ios. Never throw
or add UI/settings on desktop.

## Must-not-break

- Keep the desktop no-op guards in **both** scripts. Wrap setup + callbacks in try/catch so a failure
  never reaches game init (`CRITICAL BUG`). Use focus indices clear of the game's (0–5).
- The FPS setting is a **contract with the cc-ios host**: the localStorage key is
  `cc-iosux-fpsCounter` (modId `cc-iosux` + option key `fpsCounter`) and the host reads exactly that.
  Don't rename the modId or option key without updating cc-ios's `Bootstrap.swift` (`FPS_SETTING_KEY`).
- Ship **no assets**. Ship both `ccmod.json` and `package.json`; keep versions and the
  `prestart`/`poststart` entries in sync. Valid CCModDB tags only. id `cc-iosux` == repo name.
- No game assets / personal data / secrets in commits.

## Release

Push to `main` auto-bumps the patch, tags, builds `cc-iosux-<ver>.ccmod`, publishes a Release.
**The bot pushes the bump commit back — `git pull --rebase origin main` first.** Docs-only paths
(`**.md`, `.github/**`, `LICENSE`) are excluded. Rebuild `cc-mods/CCModDB` after a release.

## Verify

`node --check prestart.js poststart.js`; validate JSON manifests. Real test is in cc-ios: title
screen shows the buttons; **Mods → cc-ios UX → Mod settings** toggles the FPS counter; desktop loads
it as a silent no-op.

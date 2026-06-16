// cc-iosux — quality-of-life settings for the cc-ios iPhone/iPad wrapper, surfaced in the
// in-game mod manager (CCModManager → "Mod settings" for this mod).
//
// WHAT THIS REGISTERS
//   A single "Show FPS counter" checkbox. The FPS counter itself is drawn NATIVELY by the
//   cc-ios host app (a UILabel above the WebGL canvas — on iOS an HTML overlay can't paint
//   over the game). The host's measuring script reads this setting from localStorage every
//   refresh and shows/hides the native label accordingly, so all this mod has to do is own
//   the toggle in the mod-manager UI. CCModManager stores the checkbox value in localStorage
//   under "cc-iosux-fpsCounter" ("true"/"false"); the host treats absent/null as ON.
//
// WHERE IT RUNS
//   Only inside cc-ios (the native bridge is present) AND only when CCModManager is installed
//   to host the settings page. On desktop, or without CCModManager, it registers nothing and
//   leaves the menu untouched — a clean no-op, like the title-buttons feature in prestart.js.
(function () {
	"use strict";

	var TAG = "[cc-iosux]";

	// Is the cc-ios native bridge present? Absent on desktop NW.js and any non-cc-ios host,
	// where the native FPS overlay doesn't exist and the toggle would do nothing.
	function hasCcIosBridge() {
		try {
			return !!(window.webkit && window.webkit.messageHandlers &&
				(window.webkit.messageHandlers.cccontrol || window.webkit.messageHandlers.cchost));
		} catch (e) { return false; }
	}

	if (!hasCcIosBridge()) {
		console.log(TAG + " not running under cc-ios; skipping QoL settings.");
		return;
	}

	// CCModManager owns the per-mod settings page. Without it there's nowhere to put the toggle.
	var mm = window.modmanager;
	if (!mm || typeof mm.registerAndGetModOptions !== "function") {
		console.log(TAG + " CCModManager not available; skipping FPS-counter setting.");
		return;
	}

	try {
		// Schema: { <category>: { settings, headers: { <header>: { <optionKey>: option } } } }.
		// The option key becomes the localStorage id "<modId>-<optionKey>" = "cc-iosux-fpsCounter";
		// CCModManager seeds it to `init` (true) on first registration when the key is absent.
		mm.registerAndGetModOptions(
			{ modId: "cc-iosux", title: "cc-ios UX" },
			{
				general: {
					settings: { tabIcon: "general", title: "General" },
					headers: {
						display: {
							fpsCounter: {
								type: "CHECKBOX",
								init: true,
								name: "Show FPS counter",
								description: "Show the on-screen frames-per-second counter (drawn by the cc-ios app in the letterbox bar)."
							}
						}
					}
				}
			}
		);
		console.log(TAG + " registered FPS-counter setting in CCModManager.");
	} catch (e) {
		// Never let a settings-registration failure surface as a game error.
		console.error(TAG + " failed to register mod settings (non-fatal):", e);
	}
})();

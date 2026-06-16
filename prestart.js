// cc-iostitlebuttons — native "Restart Game" and "Close Game" entries on the CrossCode
// title-screen menu, for the cc-ios iPhone/iPad wrapper.
//
// WHY / WHERE IT RUNS
//   On cc-ios the game runs inside a native WKWebView whose host app exposes a "cccontrol"
//   message handler. This mod posts to it: "restart" reloads the web view (a full game
//   re-boot) and "quit" exits the app. The game's own native "close" button is DESKTOP-gated
//   (it uses nw.gui) and therefore absent on iOS, which is the gap this mod fills.
//
//   Desktop CrossCode already has a native Close button and needs no in-app Restart, and it has
//   no cccontrol bridge — so on desktop (and any non-cc-ios host) this mod is a deliberate
//   NO-OP: it detects the missing bridge and adds nothing, leaving the vanilla menu untouched.
//   It still loads without error everywhere, satisfying the cc-mods "absolute compatibility,
//   full modularity" rule — it just only *functions* inside cc-ios.
//
// HOW IT PATCHES THE MENU
//   CrossCode builds the title menu in sc.TitleScreenButtonGui.init via _createButton, stacking
//   sc.ButtonGui entries bottom-anchored (x=12, y=offset; larger y = higher). We shift the
//   existing left-column buttons up by two slots and place Restart + Close in the freed bottom
//   slots, grouped under Options. Focus indices continue the game's own column so D-pad nav flows
//   in visual order. Everything is wrapped in try/catch so a mod error can never reach game init
//   (which would show the CRITICAL BUG screen).
(function () {
	"use strict";

	var TAG = "[cc-iostitlebuttons]";

	// Is the cc-ios native control bridge present? Absent on desktop NW.js and any non-cc-ios host.
	function hasControlBridge() {
		try {
			return !!(window.webkit && window.webkit.messageHandlers &&
				window.webkit.messageHandlers.cccontrol);
		} catch (e) { return false; }
	}

	function postControl(action) {
		try {
			window.webkit.messageHandlers.cccontrol.postMessage(action);
			return true;
		} catch (e) { return false; }
	}

	// Desktop / non-cc-ios host: do nothing (the desktop build already has a native Close button).
	if (!hasControlBridge()) {
		console.log(TAG + " not running under cc-ios; skipping (desktop already has a native Close).");
		return;
	}

	if (typeof sc === "undefined" || !sc.TitleScreenButtonGui) {
		console.warn(TAG + " TitleScreenButtonGui unavailable; skipping title buttons");
		return;
	}

	sc.TitleScreenButtonGui.inject({
		init: function () {
			this.parent();
			// Never let button setup throw into the game's init (→ CRITICAL BUG screen).
			try {
				this._cciosAddSystemButtons();
			} catch (e) {
				console.error(TAG + " title buttons failed (non-fatal):", e);
			}
		},

		_cciosAddSystemButtons: function () {
			if (!this.buttons || !this.buttons.length || !this.buttonGroup) return;

			// Slot height from a real button; shift the existing column up to make room.
			var slot = this.buttons[0].hook.size.y + 4;
			for (var i = 0; i < this.buttons.length; i++) {
				this.buttons[i].hook.pos.y += slot * 2;
			}

			// Focus indices continue the game's own column (new=…,load=3,options=4) so D-pad
			// navigation flows in visual order: …Options → Restart → Close. Higher index = lower
			// on screen, matching how the buttons are stacked (Close sits at the very bottom).
			this._cciosButton("Restart Game", 12 + slot, 6, function () {
				if (!postControl("restart")) { try { window.location.reload(); } catch (e) {} }
			});
			this._cciosButton("Close Game", 12, 7, function () {
				postControl("quit");
			});
		},

		// Mirrors _createButton but with explicit label text (no lang dependency).
		_cciosButton: function (label, yOffset, focusIndex, onPress) {
			var btn = new sc.ButtonGui(label, sc.BUTTON_DEFAULT_WIDTH);
			btn.setPos(12, yOffset);
			btn.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM);
			btn.hook.transitions = {
				DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.EASE },
				HIDDEN: { state: { offsetX: -(sc.BUTTON_DEFAULT_WIDTH + 12) }, time: 0.2, timeFunction: KEY_SPLINES.LINEAR }
			};
			btn.onButtonPress = function () {
				try { onPress(); } catch (e) { console.error(TAG + " button action failed:", e); }
			};
			btn.doStateTransition("DEFAULT", true);
			this.buttonGroup.addFocusGui(btn, 0, focusIndex);
			this.addChildGui(btn);
			this.buttons.push(btn);
		}
	});

	console.log(TAG + " installed Restart + Close title buttons.");
})();

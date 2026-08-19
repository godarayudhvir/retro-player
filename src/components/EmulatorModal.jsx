import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Gamepad2, Wifi, WifiOff, Menu } from 'lucide-react';
import { detectSystemFromExtension } from '../utils/systemDetector';

export default function EmulatorModal({ game, gamepadConnected, onClose, onSessionEnd }) {
  const stageRef = useRef(null);
  const iframeRef = useRef(null);
  const [isLocalOffline, setIsLocalOffline] = useState(!navigator.onLine);

  const sessionReportedRef = useRef(false);
  const activeSecondsRef = useRef(0);
  const isTabActiveRef = useRef(!document.hidden);
  const activeTimerRef = useRef(null);

  // Accurate active playtime timer (pauses when browser tab is inactive / backgrounded)
  useEffect(() => {
    sessionReportedRef.current = false;
    activeSecondsRef.current = 0;
    isTabActiveRef.current = !document.hidden;

    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    activeTimerRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        activeSecondsRef.current += 1;
      }
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (activeTimerRef.current) {
        clearInterval(activeTimerRef.current);
      }
    };
  }, [game]);

  const reportSessionEnd = useCallback(() => {
    if (sessionReportedRef.current) return;
    sessionReportedRef.current = true;
    const finalSeconds = activeSecondsRef.current;
    if (finalSeconds >= 3 && onSessionEnd && game) {
      console.log(`⏱️ [PLAYTIME TRACKER] Recorded active gameplay: ${finalSeconds}s for "${game.title}"`);
      onSessionEnd(game.id || game.title, finalSeconds);
    }
  }, [game, onSessionEnd]);

  useEffect(() => {
    if (!stageRef.current) return;

    stageRef.current.innerHTML = '';

    let sessionBlobUrl = null;
    let absoluteRomUrl = '';
    try {
      if (game.file) {
        sessionBlobUrl = URL.createObjectURL(game.file);
        absoluteRomUrl = sessionBlobUrl;
      } else if (game.romUrl && (game.romUrl.startsWith('blob:') || game.romUrl.startsWith('data:') || game.romUrl.startsWith('http://') || game.romUrl.startsWith('https://'))) {
        absoluteRomUrl = game.romUrl;
      } else if (game.romUrl) {
        absoluteRomUrl = new URL(game.romUrl, window.location.origin).href;
      }
      console.log(`🎮 [EMULATOR LAUNCHING] Game: "${game.title}" | System Core: ${game.systemCore} | ROM URL: ${absoluteRomUrl}`);
    } catch (e) {
      console.error(`🚨 [EMULATOR ERROR] Invalid ROM URL construction for game "${game.title}":`, game.romUrl, e);
    }

    // Determine initial data path: probe CDN or use local /emulatorjs/data/
    const cdnDataPath = 'https://cdn.emulatorjs.org/stable/data/';
    const localDataPath = '/emulatorjs/data/';
    const isOffline = !navigator.onLine;
    const initialDataPath = isOffline ? localDataPath : cdnDataPath;
    setIsLocalOffline(isOffline);
    let core = game.systemCore;
    if (!core || core === 'custom' || core === 'nes') {
      const detected = detectSystemFromExtension(game.filename || game.title || '');
      if (detected && detected.core && detected.core !== 'custom') {
        core = detected.core;
      } else {
        core = core || 'nes';
      }
    }
    if (core === 'gbc') core = 'gb';
    if (core === 'ps1') core = 'psx';
    if (core === 'sega' || core === 'genesis' || core === 'megadrive') core = 'segaMD';
    if (core === 'gamegear') core = 'segaGG';
    if (core === 'arcade') core = 'mame2003_plus';


    const iframe = document.createElement('iframe');
    iframeRef.current = iframe;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = '#000000';
    iframe.tabIndex = 0;
    iframe.allow = 'autoplay *; gamepad *; fullscreen *; cross-origin-isolated; accelerometer; gyroscope';

    stageRef.current.appendChild(iframe);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
          <style>
            *, *::before, *::after {
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: #000000;
              overflow: hidden;
              position: fixed;
              inset: 0;
              touch-action: none;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              user-select: none;
            }
            #game {
              width: 100%;
              height: 100%;
              position: absolute;
              inset: 0;
              overflow: hidden;
            }
            #game canvas {
              max-width: 100% !important;
              max-height: 100% !important;
              object-fit: contain !important;
            }

            /* Virtual Touchscreen Gamepad Overrides */
            .ejs_virtualGamepad_parent {
              position: absolute !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              width: 100% !important;
              height: 220px !important;
              max-height: 45vh !important;
              pointer-events: none !important;
              z-index: 99999 !important;
              display: block !important;
            }

            .ejs_virtualGamepad_left,
            .ejs_virtualGamepad_right,
            .ejs_virtualGamepad_bottom,
            .ejs_virtualGamepad_top,
            .ejs_virtualGamepad_button,
            .ejs_dpad_main {
              pointer-events: auto !important;
            }

            .ejs_virtualGamepad_left {
              position: absolute !important;
              bottom: 24px !important;
              left: 16px !important;
              width: 130px !important;
              height: 130px !important;
              z-index: 100000 !important;
            }

            .ejs_virtualGamepad_right {
              position: absolute !important;
              bottom: 24px !important;
              right: 16px !important;
              width: 135px !important;
              height: 135px !important;
              z-index: 100000 !important;
            }

            .ejs_virtualGamepad_bottom {
              position: absolute !important;
              bottom: 16px !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              margin-left: 0 !important;
              height: 34px !important;
              width: 130px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 10px !important;
              z-index: 100000 !important;
            }

            .ejs_virtualGamepad_button {
              background: rgba(255, 255, 255, 0.2) !important;
              backdrop-filter: blur(8px) !important;
              -webkit-backdrop-filter: blur(8px) !important;
              border: 2px solid rgba(255, 255, 255, 0.45) !important;
              color: #ffffff !important;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4) !important;
              touch-action: none !important;
            }

            .ejs_virtualGamepad_button_down {
              background: rgba(255, 255, 255, 0.45) !important;
              transform: scale(0.92) !important;
            }

            .ejs_dpad_main {
              opacity: 0.9 !important;
              filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5)) !important;
            }

            .ejs_dpad_bar {
              background: rgba(255, 255, 255, 0.25) !important;
              border: 1.5px solid rgba(255, 255, 255, 0.45) !important;
              backdrop-filter: blur(8px) !important;
              -webkit-backdrop-filter: blur(8px) !important;
            }

            /* Hide floating on-canvas hamburger button so topbar Menu button is the clean controller */
            .ejs_virtualGamepad_open {
              display: none !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          </style>
        </head>
        <body>
          <div id="game" tabindex="0"></div>
          <script>
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              console.error('🚨 [EMULATORJS ENGINE RUNTIME ERROR]:', msg, 'Script:', url, 'Line:', lineNo, error);
              return false;
            };

            window.EJS_player = '#game';
            window.EJS_gameUrl = ${JSON.stringify(absoluteRomUrl)};
            window.EJS_gameID = ${JSON.stringify(game.id || 'custom_game')};
            window.EJS_gameId = ${JSON.stringify(game.id || 'custom_game')};
            window.EJS_gameName = ${JSON.stringify(game.title || 'Custom Game')};
            window.EJS_core = ${JSON.stringify(core)};
            window.EJS_pathtodata = ${JSON.stringify(initialDataPath)};
            window.EJS_startOnLoaded = true;
            window.EJS_backgroundColor = '#000000';
            window.EJS_language = 'en-US';
            window.EJS_VirtualGamepad = true;

            // Configure Nintendo DS side-by-side screen layout for tablet / desktop viewports (>= 768px)
            const isTabletOrAbove = (window.innerWidth >= 768) || (window.parent && window.parent.innerWidth >= 768);
            if (${JSON.stringify(core)} === 'nds' && isTabletOrAbove) {
              window.EJS_defaultOptions = {
                desmume_screens_layout: 'left/right',
                desmume_screen_layout: 'left/right',
                desmume_screens_gap: '0',
                melonds_screen_layout: 'Left/Right',
                melonds_screen_layout_orientation: 'horizontal'
              };
              console.log('🎮 [NDS SCREEN LAYOUT] Side-by-side (Left/Right) configured for tablet / desktop display');
            }

            // Controller Synchronization & Hardware Index Patch for EmulatorJS with Touch Safety
            function patchEmulatorGamepad() {
              try {
                const emu = window.EJS_emulator;
                if (!emu) return;

                // Safeguard gameManager.simulateInput from throwing fatal runtime exceptions on touch/button events
                if (emu.gameManager && !emu.gameManager._safeSimulatePatched) {
                  emu.gameManager._safeSimulatePatched = true;
                  const origSimulate = emu.gameManager.simulateInput;
                  if (typeof origSimulate === 'function') {
                    emu.gameManager.simulateInput = function(player, btn, val) {
                      try {
                        return origSimulate.call(this, player, btn, val);
                      } catch (err) {
                        console.warn('⚠️ [CAUGHT EMULATOR INPUT EXCEPTION]:', err);
                      }
                    };
                  }
                }

                if (!emu._gamepadPatched) {
                  emu._gamepadPatched = true;
                  console.log('🎮 [PATCHING EMULATORJS GAMEPAD ENGINE] Overriding hardware index lookup & button mapper');

                  emu.gamepadEvent = function(e) {
                    if (!this.started || !this.gameManager) return;

                    // Fix: Find connected gamepad by matching .index rather than array position
                    const activeGps = (this.gamepad && this.gamepad.gamepads) ? this.gamepad.gamepads : [];
                    const gp = activeGps.find(f => f && f.index === e.gamepadIndex) || activeGps[0];
                    if (!gp) return;

                    const gpKey = gp.id + "_" + gp.index;
                    let gamepadIndex = this.gamepadSelection ? this.gamepadSelection.indexOf(gpKey) : -1;

                    // Fallback to Player 1 if single gamepad is active
                    if (gamepadIndex < 0) {
                      if (!Array.isArray(this.gamepadSelection)) {
                        this.gamepadSelection = ['', '', '', ''];
                      }
                      this.gamepadSelection[0] = gpKey;
                      gamepadIndex = 0;
                    }

                    const value = (function(val) {
                      if (val > 0.5 || val < -0.5) {
                        return (val > 0) ? 1 : -1;
                      }
                      return 0;
                    })(e.value || 0);

                    // Check for Controller Exit Shortcuts directly in the active frame:
                    // 1. Select (8) + Start (9) / Share + Options
                    // 2. Guide / PS Button (16)
                    // 3. L3 (10) + R3 (11) dual stick click
                    try {
                      const rawGps = navigator.getGamepads ? navigator.getGamepads() : [];
                      const curGp = rawGps.find(g => g && g.index === e.gamepadIndex) || rawGps[0];
                      if (curGp && curGp.buttons) {
                        const btn = curGp.buttons;
                        const isSelect = btn[8]?.pressed;
                        const isStart = btn[9]?.pressed;
                        const isGuide = btn[16]?.pressed;
                        const isL3R3 = btn[10]?.pressed && btn[11]?.pressed;

                        if ((isSelect && isStart) || isGuide || isL3R3) {
                          console.log('🎮 [CONTROLLER EXIT COMBO TRIGGERED IN IFRAME]');
                          window.parent.postMessage({ type: 'RETRO_PLAYER_EXIT_GAME' }, '*');
                          return;
                        }
                      }
                    } catch (eExit) {}

                    // Handle In-UI Button Re-mapping (Control Settings 'Set' popup)
                    if (this.controlPopup && 
                        this.controlPopup.parentElement && 
                        this.controlPopup.parentElement.parentElement && 
                        this.controlPopup.parentElement.parentElement.getAttribute("hidden") === null) {
                      if ("buttonup" === e.type || (e.type === "axischanged" && value === 0)) return;
                      const num = this.controlPopup.getAttribute("button-num");
                      const player = parseInt(this.controlPopup.getAttribute("player-num")) || 0;
                      if (gamepadIndex !== player && gamepadIndex !== -1) return;
                      if (!this.controls) this.controls = [[], [], [], []];
                      if (!this.controls[player]) this.controls[player] = [];
                      if (!this.controls[player][num]) {
                        this.controls[player][num] = {};
                      }
                      this.controls[player][num].value2 = e.label;
                      this.controlPopup.parentElement.parentElement.setAttribute("hidden", "");
                      if (typeof this.checkGamepadInputs === 'function') {
                        this.checkGamepadInputs();
                      }
                      if (typeof this.saveSettings === 'function') {
                        this.saveSettings();
                      }
                      console.log('🎮 [BUTTON REMAPPED]', 'Player ' + (player + 1) + ' button ' + num + ' -> ' + e.label);
                      return;
                    }

                    if ((this.settingsMenu && this.settingsMenu.style.display !== "none") || (typeof this.isPopupOpen === 'function' && this.isPopupOpen())) return;

                    const special = [16, 17, 18, 19, 20, 21, 22, 23];
                    for (let i = 0; i < 4; i++) {
                      if (gamepadIndex !== i) continue;
                      for (let j = 0; j < 30; j++) {
                        if (!this.controls || !this.controls[i] || !this.controls[i][j] || this.controls[i][j].value2 === undefined) {
                          continue;
                        }
                        const controlValue = this.controls[i][j].value2;

                        if (["buttonup", "buttondown"].includes(e.type) && (controlValue === e.label || controlValue === e.index)) {
                          if (this.gameManager && typeof this.gameManager.simulateInput === 'function') {
                            this.gameManager.simulateInput(i, j, (e.type === "buttonup" ? 0 : (special.includes(j) ? 0x7fff : 1)));
                          }
                        } else if (e.type === "axischanged") {
                          // Left Stick to D-Pad auto-fallback for all games
                          if (e.axis === 'LEFT_STICK_X' && this.gameManager && typeof this.gameManager.simulateInput === 'function') {
                            if (e.value > 0.35) {
                              this.gameManager.simulateInput(i, 7, 1); // D-Pad Right
                              this.gameManager.simulateInput(i, 6, 0); // D-Pad Left
                            } else if (e.value < -0.35) {
                              this.gameManager.simulateInput(i, 6, 1); // D-Pad Left
                              this.gameManager.simulateInput(i, 7, 0); // D-Pad Right
                            } else {
                              this.gameManager.simulateInput(i, 6, 0);
                              this.gameManager.simulateInput(i, 7, 0);
                            }
                          } else if (e.axis === 'LEFT_STICK_Y' && this.gameManager && typeof this.gameManager.simulateInput === 'function') {
                            if (e.value > 0.35) {
                              this.gameManager.simulateInput(i, 5, 1); // D-Pad Down
                              this.gameManager.simulateInput(i, 4, 0); // D-Pad Up
                            } else if (e.value < -0.35) {
                              this.gameManager.simulateInput(i, 4, 1); // D-Pad Up
                              this.gameManager.simulateInput(i, 5, 0); // D-Pad Down
                            } else {
                              this.gameManager.simulateInput(i, 4, 0);
                              this.gameManager.simulateInput(i, 5, 0);
                            }
                          }

                          if (typeof controlValue === "string" && controlValue.split(":")[0] === e.axis && this.gameManager && typeof this.gameManager.simulateInput === 'function') {
                            if (special.includes(j)) {
                              if (j === 16 || j === 17) {
                                if (e.value > 0) {
                                  this.gameManager.simulateInput(i, 16, 0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 17, 0);
                                } else {
                                  this.gameManager.simulateInput(i, 17, -0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 16, 0);
                                }
                              } else if (j === 18 || j === 19) {
                                if (e.value > 0) {
                                  this.gameManager.simulateInput(i, 18, 0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 19, 0);
                                } else {
                                  this.gameManager.simulateInput(i, 19, -0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 18, 0);
                                }
                              } else if (j === 20 || j === 21) {
                                if (e.value > 0) {
                                  this.gameManager.simulateInput(i, 20, 0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 21, 0);
                                } else {
                                  this.gameManager.simulateInput(i, 21, -0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 20, 0);
                                }
                              } else if (j === 22 || j === 23) {
                                if (e.value > 0) {
                                  this.gameManager.simulateInput(i, 22, 0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 23, 0);
                                } else {
                                  this.gameManager.simulateInput(i, 23, -0x7fff * e.value);
                                  this.gameManager.simulateInput(i, 22, 0);
                                }
                              }
                            } else if (value === 0 || controlValue === e.label || controlValue === (e.axis + ':' + value)) {
                              this.gameManager.simulateInput(i, j, ((value === 0) ? 0 : 1));
                            }
                          }
                        }
                      }
                    }
                  };

                  if (emu.gamepad) {
                    emu.gamepad.on("axischanged", emu.gamepadEvent.bind(emu));
                    emu.gamepad.on("buttondown", emu.gamepadEvent.bind(emu));
                    emu.gamepad.on("buttonup", emu.gamepadEvent.bind(emu));
                  }
                }
              } catch (err) {
                console.warn('Patch error:', err);
              }
            }

            function autoBindGamepadsToPlayers() {
              try {
                const emu = window.EJS_emulator;
                if (!emu) return;

                patchEmulatorGamepad();

                if (!emu.gamepad && typeof window.GamepadHandler === 'function') {
                  emu.gamepad = new window.GamepadHandler();
                  emu.gamepad.on("axischanged", emu.gamepadEvent.bind(emu));
                  emu.gamepad.on("buttondown", emu.gamepadEvent.bind(emu));
                  emu.gamepad.on("buttonup", emu.gamepadEvent.bind(emu));
                }

                if (emu.gamepad) {
                  if (typeof emu.gamepad.updateGamepadState === 'function') {
                    emu.gamepad.updateGamepadState();
                  }

                  const activeGps = (emu.gamepad.gamepads || []).filter(g => g && g.id);
                  if (!Array.isArray(emu.gamepadSelection) || emu.gamepadSelection.length === 0) {
                    emu.gamepadSelection = ['', '', '', ''];
                  }

                  let assignedAny = false;
                  for (let i = 0; i < activeGps.length; i++) {
                    const gp = activeGps[i];
                    if (!gp || !gp.id) continue;
                    const gpKey = gp.id + '_' + (gp.index !== undefined ? gp.index : i);
                    if (!emu.gamepadSelection.includes(gpKey)) {
                      const targetSlot = (i < 4 && (!emu.gamepadSelection[i] || emu.gamepadSelection[i] === 'notconnected'))
                        ? i
                        : emu.gamepadSelection.findIndex(s => !s || s === 'notconnected');
                      if (targetSlot !== -1) {
                        emu.gamepadSelection[targetSlot] = gpKey;
                        assignedAny = true;
                        console.log('🎮 [AUTO-ASSIGNED CONTROLLER]', gpKey, '-> Player', targetSlot + 1);
                      }
                    }
                  }

                  if (assignedAny && typeof emu.updateGamepadLabels === 'function' && Array.isArray(emu.gamepadLabels) && emu.gamepadLabels.length > 0) {
                    emu.updateGamepadLabels();
                  }
                }
              } catch (err) {
                console.warn('Gamepad auto-binding error:', err);
              }
            }

            const _connectedGps = new Set();
            function forwardGamepadConnected(gp) {
              if (!gp) return;
              const key = (gp.id || 'gp') + '_' + (gp.index !== undefined ? gp.index : 0);
              if (_connectedGps.has(key)) return;
              _connectedGps.add(key);
              try {
                const evt = new GamepadEvent('gamepadconnected', { gamepad: gp });
                window.dispatchEvent(evt);
              } catch (e) {
                try {
                  const custEvt = new CustomEvent('gamepadconnected');
                  custEvt.gamepad = gp;
                  window.dispatchEvent(custEvt);
                } catch (err) {}
              }
              autoBindGamepadsToPlayers();
            }

            function syncAllGamepads() {
              try {
                const gps = navigator.getGamepads ? navigator.getGamepads() : [];
                for (let i = 0; i < gps.length; i++) {
                  if (gps[i] && gps[i].connected) {
                    forwardGamepadConnected(gps[i]);
                  }
                }
              } catch (e) {}
            }

            window.addEventListener('gamepadconnected', function(e) {
              autoBindGamepadsToPlayers();
            });

            // Single initial sync on window load / user interaction
            window.addEventListener('focus', syncAllGamepads, { once: false });
            window.addEventListener('click', syncAllGamepads, { once: true });
            window.addEventListener('keydown', syncAllGamepads, { once: true });

            // Auto-focus canvas & window on ready / game start
            window.EJS_ready = function() {
              console.log('🎮 [EMULATORJS READY] Auto-focusing canvas & syncing gamepads');
              try {
                window.focus();
                const el = document.querySelector('canvas') || document.querySelector('#game canvas') || document.querySelector('#game');
                if (el) el.focus();
                syncAllGamepads();
                autoBindGamepadsToPlayers();
              } catch(e) {}
            };

            window.EJS_onGameStart = function() {
              console.log('🎮 [GAME STARTED] Emulation canvas active');
              try {
                window.focus();
                const el = document.querySelector('canvas') || document.querySelector('#game canvas') || document.querySelector('#game');
                if (el) el.focus();
                syncAllGamepads();
                autoBindGamepadsToPlayers();
              } catch(e) {}
            };

            // Auto-Save States & Save Battery RAM in IndexedDB / LocalStorage under unique Game ID
            window.EJS_onLoadState = function() {
              console.log('💾 [SAVE SYSTEM READY] Persistent save states bound to IndexedDB key:', ${JSON.stringify(game.id)});
            };

            function handleLoaderFallback() {
              console.warn('⚠️ [EMULATOR LOADER FALLBACK] Primary path failed. Attempting local /emulatorjs/data/loader.js fallback...');
              window.EJS_pathtodata = '/emulatorjs/data/';
              const fallbackScript = document.createElement('script');
              fallbackScript.src = '/emulatorjs/data/loader.js';
              fallbackScript.onerror = function() {
                console.error('🚨 [EMULATOR FATAL ERROR] Both online and local EmulatorJS loader failed to load.');
              };
              document.body.appendChild(fallbackScript);
            }
          </script>
          <script src="${initialDataPath}loader.js" onerror="handleLoaderFallback()"></script>
        </body>
      </html>
    `;

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Programmatically grant focus to iframe and game canvas
      setTimeout(() => {
        try {
          if (iframeRef.current) {
            iframeRef.current.focus();
            iframeRef.current.contentWindow?.focus();
          }
        } catch (e) {}
      }, 150);
    } catch (err) {
      console.error(`🚨 [EMULATOR IFRAME WRITE ERROR] Failed writing iframe doc for "${game.title}":`, err);
    }

    return () => {
      console.log(`🧹 [EMULATOR UNMOUNTING] Destroying emulator instance for "${game.title}"`);
      reportSessionEnd();
      if (sessionBlobUrl) {
        try {
          URL.revokeObjectURL(sessionBlobUrl);
          console.log(`🧹 [BLOB CLEANUP] Revoked session Object URL for custom ROM "${game.title}"`);
        } catch (e) {}
      }
      if (iframeRef.current) {
        try {
          const win = iframeRef.current.contentWindow;
          if (win) {
            if (win.EJS_emulator && typeof win.EJS_emulator.destroy === 'function') {
              win.EJS_emulator.destroy();
            }
            win.location.href = 'about:blank';
          }
        } catch (e) {}
        iframeRef.current.remove();
        iframeRef.current = null;
      }
      if (stageRef.current) {
        stageRef.current.innerHTML = '';
      }
    };
  }, [game, onSessionEnd]);

  // Forward parent gamepad events and continuously sync controller assignments
  useEffect(() => {
    if (!iframeRef.current) return;
    const syncWithIframe = () => {
      try {
        const win = iframeRef.current?.contentWindow;
        if (win) {
          const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
          for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i] && gamepads[i].connected) {
              try {
                const evt = new GamepadEvent('gamepadconnected', { gamepad: gamepads[i] });
                win.dispatchEvent(evt);
              } catch (e) {
                try {
                  const custEvt = new CustomEvent('gamepadconnected');
                  custEvt.gamepad = gamepads[i];
                  win.dispatchEvent(custEvt);
                } catch (err) {}
              }
            }
          }
          if (typeof win.autoBindGamepadsToPlayers === 'function') {
            win.autoBindGamepadsToPlayers();
          }
        }
      } catch (e) {}
    };

    syncWithIframe();
    const interval = setInterval(syncWithIframe, 500);
    return () => clearInterval(interval);
  }, [gamepadConnected]);

  // Listen for Controller Exit triggers posted from within the active emulator iframe
  useEffect(() => {
    const handleFrameMessage = (e) => {
      if (e.data?.type === 'RETRO_PLAYER_EXIT_GAME') {
        console.log('🎮 [EMULATOR MODAL] Exit command received from gamepad combo. Closing game.');
        handleClose();
      }
    };
    window.addEventListener('message', handleFrameMessage);
    return () => window.removeEventListener('message', handleFrameMessage);
  }, [onClose]);

  const focusEmulator = () => {
    try {
      if (iframeRef.current) {
        iframeRef.current.focus();
        iframeRef.current.contentWindow?.focus();
      }
    } catch (e) {}
  };

  const handleClose = () => {
    reportSessionEnd();
    if (iframeRef.current) {
      try {
        const win = iframeRef.current.contentWindow;
        if (win) {
          win.location.href = 'about:blank';
        }
      } catch (e) {}
      iframeRef.current.remove();
      iframeRef.current = null;
    }
    onClose();
  };

  const handleToggleEmulatorMenu = (e) => {
    e.stopPropagation();
    try {
      if (iframeRef.current?.contentWindow) {
        const win = iframeRef.current.contentWindow;
        const doc = win.document;

        // 1. Try small-screen / virtual gamepad hamburger toggle
        const openBtn = doc.querySelector('.ejs_virtualGamepad_open') || doc.querySelector('[class*="virtualGamepad_open"]');
        if (openBtn) {
          openBtn.click();
          return;
        }

        // 2. Try toggling EmulatorJS menu bar directly
        const menuBar = doc.querySelector('.ejs_menu_bar');
        if (menuBar) {
          menuBar.classList.toggle('ejs_menu_bar_hidden');
          return;
        }

        // 3. Try emulator instance methods
        const emu = win.EJS_emulator;
        if (emu) {
          if (typeof emu.toggleMenu === 'function') {
            emu.toggleMenu();
          } else if (typeof emu.openSettings === 'function') {
            emu.openSettings();
          }
        }
      }
    } catch (err) {
      console.warn('Failed to toggle emulator menu:', err);
    }
  };

  return (
    <div className="emulator-backdrop-iisu" onClick={focusEmulator}>
      <header className="emulator-topbar">
        <div className="emulator-topbar-left">
          <Gamepad2 size={20} style={{ color: game.systemColor || '#00c6ff', flexShrink: 0 }} />
          <span className="emulator-game-title" title={game.title}>{game.title}</span>
          <span className="tile-sys-badge emulator-sys-badge" style={{ '--sys-color': game.systemColor || '#00c6ff' }}>
            {game.systemIcon ? (
              <img src={game.systemIcon} alt="" className="tile-sys-badge-icon" />
            ) : (
              <span className="tile-sys-dot" />
            )}
            <span className="tile-sys-name">{game.systemName}</span>
          </span>
          {isLocalOffline ? (
            <span className="emulator-status-tag tag-offline" title="Running with local offline emulator core">
              <WifiOff size={11} /> <span>OFFLINE</span>
            </span>
          ) : (
            <span className="emulator-status-tag tag-cdn" title="Connected to online emulator core">
              <Wifi size={11} /> <span>CDN</span>
            </span>
          )}
          {gamepadConnected && (
            <span className="emulator-status-tag tag-gamepad">
              <span>GAMEPAD</span>
            </span>
          )}
        </div>

        <div className="emulator-topbar-right">
          <button
            className="emulator-menu-btn"
            onClick={handleToggleEmulatorMenu}
            title="RetroArch Control Panel & Settings"
          >
            <Menu size={18} />
            <span className="btn-label">Menu</span>
          </button>

          <button className="emulator-close-btn" onClick={handleClose} title="Close Game (ESC)">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="emulator-stage" ref={stageRef} onClick={focusEmulator}>
        {/* Isolated Engine */}
      </div>
    </div>
  );
}

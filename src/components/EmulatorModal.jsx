import React, { useEffect, useRef } from 'react';
import { X, Gamepad2, Download, Upload } from 'lucide-react';

export default function EmulatorModal({ game, gamepadConnected, onClose }) {
  const stageRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!stageRef.current) return;

    stageRef.current.innerHTML = '';

    let absoluteRomUrl;
    try {
      if (game.romUrl.startsWith('blob:') || game.romUrl.startsWith('data:') || game.romUrl.startsWith('http://') || game.romUrl.startsWith('https://')) {
        absoluteRomUrl = game.romUrl;
      } else {
        absoluteRomUrl = new URL(game.romUrl, window.location.origin).href;
      }
      console.log(`🎮 [EMULATOR LAUNCHING] Game: "${game.title}" | System Core: ${game.systemCore} | ROM URL: ${absoluteRomUrl}`);
    } catch (e) {
      console.error(`🚨 [EMULATOR ERROR] Invalid ROM URL construction for game "${game.title}":`, game.romUrl, e);
    }

    const cdnDataPath = 'https://cdn.emulatorjs.org/stable/data/';
    const core = game.systemCore || 'nes';

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
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100vw;
              height: 100vh;
              background: #000000;
              overflow: hidden;
            }
            #game {
              width: 100vw;
              height: 100vh;
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
            window.EJS_core = ${JSON.stringify(core)};
            window.EJS_gameID = ${JSON.stringify(game.id)};
            window.EJS_pathtodata = ${JSON.stringify(cdnDataPath)};
            window.EJS_startOnLoaded = true;
            window.EJS_backgroundColor = '#000000';
            window.EJS_language = 'en-US';

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

            // Controller Synchronization & Hardware Index Patch for EmulatorJS
            function patchEmulatorGamepad() {
              try {
                const emu = window.EJS_emulator;
                if (!emu) return;

                if (!emu._gamepadPatched) {
                  emu._gamepadPatched = true;
                  console.log('🎮 [PATCHING EMULATORJS GAMEPAD ENGINE] Overriding hardware index lookup & button mapper');

                  emu.gamepadEvent = function(e) {
                    if (!this.started) return;

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
                        if (!this.controls[i] || !this.controls[i][j] || this.controls[i][j].value2 === undefined) {
                          continue;
                        }
                        const controlValue = this.controls[i][j].value2;

                        if (["buttonup", "buttondown"].includes(e.type) && (controlValue === e.label || controlValue === e.index)) {
                          this.gameManager.simulateInput(i, j, (e.type === "buttonup" ? 0 : (special.includes(j) ? 0x7fff : 1)));
                        } else if (e.type === "axischanged") {
                          // Left Stick to D-Pad auto-fallback for all games
                          if (e.axis === 'LEFT_STICK_X') {
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
                          } else if (e.axis === 'LEFT_STICK_Y') {
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

                          if (typeof controlValue === "string" && controlValue.split(":")[0] === e.axis) {
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

                  const activeGps = emu.gamepad.gamepads || [];
                  if (!Array.isArray(emu.gamepadSelection) || emu.gamepadSelection.length === 0) {
                    emu.gamepadSelection = ['', '', '', ''];
                  }

                  let assignedAny = false;
                  for (let i = 0; i < activeGps.length; i++) {
                    const gp = activeGps[i];
                    if (!gp) continue;
                    const gpKey = gp.id + '_' + gp.index;
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

            window.autoBindGamepadsToPlayers = autoBindGamepadsToPlayers;

            function forwardGamepadConnected(gp) {
              if (!gp) return;
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
                autoBindGamepadsToPlayers();
              } catch (e) {}
            }

            window.addEventListener('gamepadconnected', function(e) {
              console.log('🎮 [EMULATORJS IFRAME GAMEPAD CONNECTED]:', e.gamepad?.id);
              autoBindGamepadsToPlayers();
            });

            // Sync gamepads across focus, click, and input events
            window.addEventListener('focus', syncAllGamepads);
            window.addEventListener('click', syncAllGamepads);
            window.addEventListener('keydown', syncAllGamepads);

            const syncTimer = setInterval(syncAllGamepads, 300);
            setTimeout(() => {
              clearInterval(syncTimer);
              setInterval(syncAllGamepads, 1200);
            }, 10000);

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
          </script>
          <script src="${cdnDataPath}loader.js" onerror="console.error('🚨 [EMULATORJS LOADER ERROR] Failed to load loader.js from CDN')"></script>
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
      if (game.isCustomBlob && game.romUrl && game.romUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(game.romUrl);
          console.log(`🧹 [BLOB CLEANUP] Revoked Object URL for custom ROM "${game.title}"`);
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
  }, [game]);

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

  // Export Save File (.sav) to user's computer
  const handleExportSave = () => {
    if (iframeRef.current && iframeRef.current.contentWindow?.EJS_emulator) {
      try {
        const emu = iframeRef.current.contentWindow.EJS_emulator;
        if (typeof emu.saveSaveFiles === 'function') {
          emu.saveSaveFiles();
        } else if (typeof emu.exportSave === 'function') {
          emu.exportSave();
        }
        console.log(`💾 [EXPORT SAVE] Downloaded .sav file for ${game.title}`);
      } catch (e) {
        console.error('Failed to export save file:', e);
      }
    }
  };

  return (
    <div className="emulator-backdrop-iisu" onClick={focusEmulator}>
      <div className="emulator-header-iisu">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff', fontFamily: 'var(--font-iisu)', fontWeight: 700 }}>
          <Gamepad2 size={22} style={{ color: game.systemColor || '#00c6ff' }} />
          <span>{game.title}</span>
          <span className="tile-sys-badge" style={{ '--sys-color': game.systemColor || '#00c6ff' }}>
            {game.systemIcon ? (
              <img src={game.systemIcon} alt="" className="tile-sys-badge-icon" />
            ) : (
              <span className="tile-sys-dot" />
            )}
            <span className="tile-sys-name">{game.systemName}</span>
          </span>
          {gamepadConnected ? (
            <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '0.2rem 0.55rem', borderRadius: '4px', border: '1px solid rgba(52,211,153,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.5px' }}>
              ● GAMEPAD READY
            </span>
          ) : (
            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', padding: '0.2rem 0.55rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', letterSpacing: '0.5px' }}>
              PRESS CONTROLLER BUTTON
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleExportSave}
            className="hud-btn"
            style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}
            title="Download Save File (.sav)"
          >
            <Download size={14} />
            <span>Export Save</span>
          </button>

          <button className="close-btn-iisu" onClick={handleClose} title="Close Game">
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="emulator-stage" ref={stageRef} onClick={focusEmulator}>
        {/* Isolated Engine */}
      </div>

      <div className="controls-bar">
        <div><span className="key-badge">Movement</span> D-Pad / Analog / WASD</div>
        <div><span className="key-badge">Action A / B</span> Buttons A & B / Z & X</div>
        <div><span className="key-badge">Start / Select</span> Start & Select / Enter & Shift</div>
        <div><span className="key-badge">Exit Game</span> Select + Start / Esc</div>
      </div>
    </div>
  );
}

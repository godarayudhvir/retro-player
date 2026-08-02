import React, { useEffect, useRef } from 'react';
import { X, Gamepad2, Download, Upload } from 'lucide-react';

export default function EmulatorModal({ game, onClose }) {
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
    iframe.allow = 'autoplay; gamepad; fullscreen';

    stageRef.current.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

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
          <div id="game"></div>
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
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
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
    <div className="emulator-backdrop-iisu">
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

      <div className="emulator-stage" ref={stageRef}>
        {/* Isolated Engine */}
      </div>

      <div className="controls-bar">
        <div><span className="key-badge">D-Pad / Joystick</span> Arrow Keys / WASD</div>
        <div><span className="key-badge">Action A / B</span> Z / X</div>
        <div><span className="key-badge">Select / Start</span> Shift / Enter</div>
      </div>
    </div>
  );
}

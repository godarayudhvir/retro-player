# 🌐 Hardware & Platform Compatibility Matrix

Retro Player is built on high-performance **client-side WebAssembly (WASM)**, modern **Web Audio API**, and the HTML5 **Gamepad API**.

> [!NOTE]
> **Status Legend:**
> - 🟢 **Verified**: Physically tested and confirmed working on hardware by the maintainer.
> - 🔵 **Expected (Untested)**: Implemented using standard W3C Gamepad & WebAssembly APIs; expected to work on compliant platforms but not physically tested on device.
> - 🟡 **Known Issue / Experimental**: Has known platform/sandbox restrictions or experimental browser environments.
> - 🔴 / ⚪ **Restricted / Unsupported**: Platform lacks a standalone WebAssembly/HTML5 browser runtime.

---

## 🖥️ Desktop & Laptops

| Platform / OS | Browser | Emulation Status | Gamepad Status | Notes & Specifications |
| :--- | :--- | :---: | :---: | :--- |
| **macOS (Apple Silicon & Intel)** | **Apple Safari** *(Recommended)* | 🟢 **Verified** | 🟢 **Verified** | Full WebKit & Metal hardware acceleration, native Game Controller framework integration (DualSense, Xbox, Switch, 8BitDo) with zero sandboxing hurdles. Use **File → Add to Dock** for standalone Web App mode. |
| **macOS (Apple Silicon & Intel)** | **Google Chrome** | 🟢 **Verified** | 🟡 **Note** | Hardware VSync acceleration & WASM. Note: In Chrome standalone PWA windows on macOS, controller detection may require granting macOS Input Monitoring/Bluetooth permissions. Browser tab mode works as expected. |
| **macOS** | **Arc / Brave / Edge** | 🟢 **Verified** | 🟢 **Verified** | Chromium engine, standard WASM and Gamepad API support. |
| **macOS** | **Mozilla Firefox** | 🔵 **Expected** | 🔵 **Expected** | Gecko engine, standard WASM and Gamepad API support. |
| **Windows 10 / 11** | **Google Chrome / Microsoft Edge** | 🔵 **Expected** | 🔵 **Expected** | Chromium V8 engine, standard Direct3D/Vulkan acceleration and XInput mapping. |
| **Windows 10 / 11** | **Mozilla Firefox** | 🔵 **Expected** | 🔵 **Expected** | Gecko engine, standard hardware acceleration and Gamepad support. |
| **Linux (Ubuntu / Arch / Debian / Fedora)** | **Chrome / Chromium / Firefox** | 🔵 **Expected** | 🔵 **Expected** | Native WebAssembly execution, standard udev controller mapping. |

---

## 📱 Mobile, Tablets & Handhelds

| Platform / Device | Browser / App Mode | Emulation Status | Gamepad Status | Notes & Specifications |
| :--- | :--- | :---: | :---: | :--- |
| **iOS / iPadOS (iPhone, iPad)** | **Safari / Chrome** (WebKit) | 🟢 **Verified** | 🟢 **Verified** | All emulation systems run smoothly. After downloading core and game assets, an overlay displaying `undefined` may appear; the game is fully loaded and initialized behind this screen. Simply tap/click anywhere on the screen to immediately dismiss the prompt and start gameplay. On-screen touch controls and Bluetooth gamepads are fully functional. |
| **Android (Phones & Tablets)** | **Google Chrome / Samsung Internet** | 🔵 **Expected** | 🔵 **Expected** | Native PWA installation with offline Service Worker, on-screen touch controls, standard USB-C/Bluetooth Gamepad API support. |
| **SteamOS (Valve Steam Deck / Legion Go)** | **Google Chrome / Chromium** | 🔵 **Expected** | 🔵 **Expected** | Native 1280x800 resolution support, built-in Steam Deck controls recognized via standard HTML5 Gamepad API. |
| **Retroid Pocket / Ayn Odin / Android Handhelds** | **Chrome / Kiwi Browser** | 🔵 **Expected** | 🔵 **Expected** | Physical integrated D-Pad and face buttons map via standard Gamepad API. |

---

## 📺 Smart TVs & Streaming Devices (10-Foot UI Mode)

Retro Player includes a dedicated **10-Foot UI Mode** optimized for viewing from 6–10 feet away with simplified navigation and large fonts.

| Platform / Device | Browser / Engine | Emulation Status | Gamepad Status | Notes & Controls |
| :--- | :--- | :---: | :---: | :--- |
| **LG webOS (OLED / QNED / NanoCell)** | **LG Web Browser** (Chromium) | 🔵 **Expected** | 🔵 **Expected** | Magic Remote pointer navigation and standard Bluetooth game controller pairing. |
| **Samsung Tizen OS (QLED / Crystal UHD)** | **Samsung Internet for TV** | 🔵 **Expected** | 🔵 **Expected** | Tizen Web runtime with standard Gamepad API connectivity. |
| **Amazon Fire OS (Fire TV Stick / Cube)** | **Amazon Silk Browser** | 🔵 **Expected** | 🔵 **Expected** | Fire TV Remote navigation and Bluetooth controller support. |
| **Google TV / Android TV (Chromecast, Shield)** | **Chrome / TV Bro / Puffin TV** | 🔵 **Expected** | 🔵 **Expected** | Android WebView / Chromium engine with standard remote & gamepad input. |
| **Roku OS** | *No Native Browser* | 🔴 *Mirroring Only* | 🔴 *N/A* | Roku OS lacks a WebAssembly browser; stream via AirPlay or Miracast screen mirroring. |
| **Apple tvOS (Apple TV 4K / HD)** | *No Native Browser* | 🔴 *AirPlay Only* | 🔴 *N/A* | tvOS lacks a standalone WebKit browser; stream via iOS/macOS AirPlay mirroring. |

---

## 🎮 Gaming Consoles

| Console | Browser | Emulation Status | Gamepad Status | Notes & Controls |
| :--- | :--- | :---: | :---: | :--- |
| **Xbox Series X\|S / Xbox One** | **Microsoft Edge for Xbox** | 🔵 **Expected** | 🔵 **Expected** | Native Chromium browser on Xbox; standard Xbox Wireless Controller mapping. |
| **PlayStation 5 / PlayStation 4** | *Integrated System Web Viewer* | 🟡 *Experimental* | 🟡 *Experimental* | Accessible via system messaging web link; controller support varies by firmware version. |
| **Nintendo Switch** | *Hidden NetFront Browser* | ⚪ *Restricted* | ⚪ *Restricted* | Requires DNS captive portal redirect; recommended to use the mobile/desktop web app instead. |

---

## ⚡ Verified Hardware & Testing Scope

- **Physically Verified Platforms**:
  - **macOS (Apple Safari & Google Chrome)**: Safari is recommended for native Game Controller framework integration (Xbox, PlayStation DualSense, Nintendo Switch Pro, 8BitDo) and standalone Web App mode (**File → Add to Dock**). Chrome tab mode is verified; Chrome standalone PWA on macOS may require granting system Input Monitoring permissions.
  - **iOS / iPadOS (Apple Safari & Google Chrome)**: Verified across multiple systems (NES, SNES, GBA, Genesis, etc.) with responsive on-screen touch controls and Bluetooth gamepads. Use Safari **Share → Add to Home Screen** for standalone app mode.
- **Other Platforms**: Implemented against standard **W3C Gamepad API**, **Web Audio**, and **WebAssembly** specifications.

---

## 📱 Note on iOS Browsers (WebKit Architecture)

Under Apple App Store guidelines, **all web browsers on iOS (Google Chrome, Firefox, Microsoft Edge, Brave, Opera) run Apple's WebKit engine under the hood**. 

* **Tested & Verified**: Both Safari and Chrome on iOS have been tested and verified across retro emulation cores with fluid gameplay, audio, and touch controls.
* **Core Startup Behavior**: Upon downloading the emulation core and ROM files, an initial overlay displaying `undefined` may appear on screen due to WebKit user-interaction gating. The emulation core and game are already fully loaded behind this screen—simply **tapping or clicking anywhere on the screen** immediately dismisses the prompt and starts the game.

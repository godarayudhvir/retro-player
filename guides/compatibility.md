# 🌐 Hardware & Platform Compatibility Matrix

> [!NOTE]
> **Status Legend:**
> - 🟢 **Verified**: Physically tested and confirmed working on hardware by the maintainer.
> - 🔴 **Not Working (Fix in progress)**: Known issue with an active fix in development.
> - ⚪ **Untested (Contributors Welcome)**: Unverified on device; contributors are welcome to test and submit a PR!
> - 🟡 **Experimental / Sandbox Restricted**: Functional with platform or browser sandbox caveats.
> - ⛔ **Unsupported**: Platform lacks a standalone WebAssembly/HTML5 browser runtime.

---

## 🎮 Gamepads & Controllers Compatibility

| Controller Model | Connection | Status | D-Pad & Buttons | Joysticks (L3/R3) | Triggers (L1/R1, L2/R2) | Menu (Start/Select/Guide) | Battery Telemetry | Touchpad | Rumble / Haptics | Motion / Gyro |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Sony PlayStation DualShock 4** | Bluetooth / USB | 🟢 **Verified** | 🟢 Supported | 🟢 Supported | 🟢 Supported | 🟢 Supported | ⚪ Untested | ⚪ Untested | ⚪ Untested | ⚪ Untested |
| **Sony PlayStation DualSense (PS5)** | Bluetooth / USB | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* |
| **Xbox Wireless Controller (Series X\|S / One)** | Bluetooth / USB | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⛔ *N/A (Hardware)* | ⚪ *Untested* | ⛔ *N/A (Hardware)* |
| **Nintendo Switch Pro Controller** | Bluetooth / USB | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⛔ *N/A (Hardware)* | ⚪ *Untested* | ⚪ *Untested* |
| **8BitDo Pro 2 / Ultimate** | Bluetooth / 2.4G / USB | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested* | ⛔ *N/A (Hardware)* | ⚪ *Untested* | ⚪ *Untested* |
| **Generic USB / Retro Gamepads (NES/SNES/Genesis)** | USB Wired | ⚪ *Untested* | ⚪ *Untested* | ⚪ *Untested / N/A* | ⚪ *Untested* | ⚪ *Untested* | ⛔ *N/A (Wired USB)* | ⛔ *N/A (Hardware)* | ⚪ *Untested / N/A* | ⛔ *N/A (Hardware)* |

---

## 🖥️ Desktop & Laptops

| Platform / OS | Browser | Emulation Status | Gamepad Status | Notes & Specifications |
| :--- | :--- | :---: | :---: | :--- |
| **macOS (Apple Silicon & Intel)** | **Apple Safari** *(Recommended)* | 🟢 **Verified** | 🟢 **Verified** | App UI, in-game emulation, and gamepads fully working. Standalone Web App supported (**File → Add to Dock**). |
| **macOS (Apple Silicon & Intel)** | **Google Chrome** | 🟢 **Verified** | 🔴 **Not Working (Fix in progress)** | App UI and in-game emulation working. **Gamepad input currently not working** (fix in progress). Use Safari in the meantime. |
| **macOS** | **Arc** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **macOS** | **Brave** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **macOS** | **Microsoft Edge** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **macOS** | **Mozilla Firefox** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Windows 10 / 11** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Windows 10 / 11** | **Microsoft Edge** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Windows 10 / 11** | **Mozilla Firefox** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Linux (Ubuntu / Arch / Debian / Fedora)** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Linux (Ubuntu / Arch / Debian / Fedora)** | **Chromium** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Linux (Ubuntu / Arch / Debian / Fedora)** | **Mozilla Firefox** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |

---

## 📱 Mobile, Tablets & Handhelds

| Platform / Device | Browser / App Mode | Emulation Status | Gamepad Status | Notes & Specifications |
| :--- | :--- | :---: | :---: | :--- |
| **iOS (iPhone)** | **Apple Safari** *(Recommended)* | 🟢 **Verified** | 🟢 **Verified** | App UI, in-game emulation, and on-screen touch controls working. Tap screen to dismiss initial overlay. Standalone Web App supported (**Share → Add to Home Screen**). |
| **iOS (iPhone)** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **iPadOS (iPad)** | **Apple Safari** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **iPadOS (iPad)** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Android (Phones & Tablets)** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Android (Phones & Tablets)** | **Samsung Internet** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Valve Steam Deck (SteamOS)** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Valve Steam Deck (SteamOS)** | **Chromium** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Lenovo Legion Go** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Lenovo Legion Go** | **Microsoft Edge** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Retroid Pocket (Android)** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Retroid Pocket (Android)** | **Kiwi Browser** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **AYN Odin (Android)** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **AYN Odin (Android)** | **Kiwi Browser** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |

---

## 📺 Smart TVs & Streaming Devices (10-Foot UI Mode)

Retro Player includes a dedicated **10-Foot UI Mode** optimized for viewing from 6–10 feet away with simplified navigation and large fonts.

| Platform / Device | Browser / Engine | Emulation Status | Gamepad Status | Notes & Specifications |
| :--- | :--- | :---: | :---: | :--- |
| **LG webOS TV (OLED / QNED)** | **LG Web Browser** (Chromium) | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Samsung Tizen TV (QLED / Crystal UHD)** | **Samsung Internet for TV** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Amazon Fire TV Stick** | **Amazon Silk Browser** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Amazon Fire TV Cube** | **Amazon Silk Browser** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Google TV (Chromecast)** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Google TV (Chromecast)** | **TV Bro** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Google TV (Chromecast)** | **Puffin TV** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Android TV (Smart TVs / Boxes)** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Android TV (Smart TVs / Boxes)** | **TV Bro** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Nvidia Shield TV** | **Google Chrome** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Nvidia Shield TV** | **TV Bro** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Roku OS** | *No Native Browser* | ⛔ *Unsupported* | ⛔ *N/A* | Roku OS lacks a WebAssembly browser; stream via AirPlay or Miracast screen mirroring. |
| **Apple tvOS (Apple TV 4K / HD)** | *No Native Browser* | ⛔ *Unsupported* | ⛔ *N/A* | tvOS lacks a standalone WebKit browser; stream via iOS/macOS AirPlay mirroring. |

---

## 🎮 Gaming Consoles

| Console | Browser | Emulation Status | Gamepad Status | Notes & Specifications |
| :--- | :--- | :---: | :---: | :--- |
| **Xbox Series X \| S** | **Microsoft Edge for Xbox** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **Xbox One** | **Microsoft Edge for Xbox** | ⚪ *Untested* | ⚪ *Untested* | Community verification needed. |
| **PlayStation 5** | *Integrated System Web Viewer* | 🟡 *Experimental* | 🟡 *Experimental* | Accessible via messaging web link; controller support varies by firmware. Community verification needed. |
| **PlayStation 4** | *Integrated System Web Viewer* | 🟡 *Experimental* | 🟡 *Experimental* | Accessible via messaging web link; controller support varies by firmware. Community verification needed. |
| **Nintendo Switch** | *Hidden NetFront Browser* | 🟡 *Experimental* | 🟡 *Experimental* | Requires DNS captive portal redirect. Community verification needed. |

---

## ⚡ Verified Hardware & Testing Scope

- **Physically Verified by Maintainer**:
  - **Controllers**: **Sony PlayStation DualShock 4** (Bluetooth & USB).
  - **macOS (Apple Silicon & Intel)**:
    - **Apple Safari**: App UI navigation, in-game emulation, and gamepad controls fully working. Standalone Web App mode supported (**File → Add to Dock**).
    - **Google Chrome**: App UI and in-game emulation working, but **gamepad input is currently not working** (fix in progress). Use Apple Safari in the meantime.
  - **iOS (iPhone)**:
    - **Apple Safari**: App UI, in-game emulation, and on-screen touch controls fully working. Standalone Web App mode supported (**Share → Add to Home Screen**).
- **Community Testing & Verification**:
  - All platforms, browsers, and gamepads marked as ⚪ **Untested** are implemented against standard **W3C Gamepad API**, **Web Audio**, and **WebAssembly** specifications.
  - If you test Retro Player on any of these devices, browsers, or gamepads, please open a PR or issue to help us keep this matrix accurate!

---

## 📱 Note on iOS Browsers (WebKit Architecture)

Under Apple App Store guidelines, **all web browsers on iOS (Google Chrome, Firefox, Microsoft Edge, Brave, Opera) run Apple's WebKit engine under the hood**. 

* **Tested & Verified**: Safari on iOS (iPhone) has been tested and verified across retro emulation cores with fluid gameplay, audio, and touch controls.
* **Core Startup Behavior**: Upon downloading the emulation core and ROM files, an initial overlay displaying `undefined` may appear on screen due to WebKit user-interaction gating. The emulation core and game are already fully loaded behind this screen—simply **tapping or clicking anywhere on the screen** immediately dismisses the prompt and starts the game.

---

## 🤝 How to Submit Compatibility Reports

Have you tested Retro Player on an untested device, browser, or gamepad? We welcome community reports to keep this matrix comprehensive and accurate:

1. **Test the Essentials**:
   - **Dashboard Navigation**: Verify spatial navigation (D-Pad, Arrow keys, or Touch).
   - **In-Game Emulation**: Verify game loading, audio synthesis, and input responsiveness.
   - **Gamepad Inputs**: Check face buttons, D-pad, joysticks, and triggers.
2. **Submit an Issue or Pull Request**:
   - Open a GitHub issue or PR detailing your **Device / OS**, **Browser Version**, and **Controller Model**.
   - Note any unique setup quirks or permission requirements.

---

## 🔗 Related Guides & Documentation

- [🎮 Controls & Keybindings Guide](controls.md)
- [📱 Cross-Device Experience Matrix](device-experience-matrix.md)
- [💾 Save States & In-Game Saves](save-states.md)
- [🐳 Docker Deployment Guide](docker.md)
- [☁️ Cloud & Self-Hosting Guide](hosting.md)

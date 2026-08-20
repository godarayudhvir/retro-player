# 🌐 Hardware & Platform Compatibility Matrix

Retro Player is built on high-performance **client-side WebAssembly (WASM)**, modern **Web Audio API**, and the HTML5 **Gamepad API**. This enables the emulator to run smoothly across desktops, mobile devices, handhelds, smart TVs, and consoles.

---

## 🖥️ Desktop & Laptops

| Platform / OS | Browser | Status | Performance & Features |
| :--- | :--- | :---: | :--- |
| **macOS (Apple Silicon & Intel)** | **Google Chrome** | 🟢 **Verified** | 60 FPS VSync, native WebAssembly, Web Audio SFX synthesizer, low-latency Gamepad API, PWA standalone install. |
| **macOS** | **Safari / Arc / Brave** | 🟢 **Compatible** | WebKit/Blink engine, full hardware acceleration, standalone Web App mode. |
| **macOS** | **Mozilla Firefox** | 🟢 **Compatible** | Gecko engine, standard WASM and Gamepad API support. |
| **Windows 10 / 11** | **Google Chrome / Microsoft Edge** | 🟢 **Compatible** | Chromium V8 engine, full Direct3D/Vulkan acceleration, Xbox & DualShock controller mapping. |
| **Windows 10 / 11** | **Mozilla Firefox** | 🟢 **Compatible** | Gecko engine, full hardware acceleration and Gamepad support. |
| **Linux (Ubuntu / Arch / Debian / Fedora)** | **Chrome / Chromium / Firefox** | 🟢 **Compatible** | Native WebAssembly execution, udev controller mapping, low input latency. |

---

## 📱 Mobile, Tablets & Handhelds

| Platform / Device | Browser / App Mode | Status | Notes & Specifications |
| :--- | :--- | :---: | :--- |
| **iOS / iPadOS (iPhone, iPad)** | **Safari / Chrome** (PWA Mode) | 🟢 **Compatible** | Dedicated Netflix-style mobile UI, touch virtual controls, Bluetooth Xbox/DualSense/Joy-Con controller pairing. Fullscreen "Add to Home Screen" PWA. |
| **Android (Phones & Tablets)** | **Google Chrome / Samsung Internet** | 🟢 **Compatible** | Native PWA installation with offline Service Worker, touch controls, USB-C/Bluetooth gamepad support. |
| **SteamOS (Valve Steam Deck / Legion Go)** | **Google Chrome / Chromium** | 🟢 **Compatible** | Native 1280x800 resolution support, built-in Steam Deck gamepad controls recognized instantly via Gamepad API. |
| **Retroid Pocket / Ayn Odin / Android Handhelds** | **Chrome / Kiwi Browser** | 🟢 **Compatible** | Physical integrated D-Pad and face buttons map directly via Gamepad API. |

---

## 📺 Smart TVs & Streaming Devices (10-Foot UI Mode)

Retro Player includes a dedicated **10-Foot UI Mode** optimized for viewing from 6–10 feet away with simplified navigation and large fonts.

| Platform / Device | Browser / Engine | Status | Notes & Controls |
| :--- | :--- | :---: | :--- |
| **LG webOS (OLED / QNED / NanoCell)** | **LG Web Browser** (Chromium) | 🟢 **Compatible** | Magic Remote pointer navigation and Bluetooth game controller pairing. |
| **Samsung Tizen OS (QLED / Crystal UHD)** | **Samsung Internet for TV** | 🟢 **Compatible** | Tizen Web runtime with Bluetooth Gamepad connectivity. |
| **Amazon Fire OS (Fire TV Stick / Cube)** | **Amazon Silk Browser** | 🟢 **Compatible** | Fire TV Remote navigation and Bluetooth controller support. |
| **Google TV / Android TV (Chromecast, Shield)** | **Chrome / TV Bro / Puffin TV** | 🟢 **Compatible** | Android WebView / Chromium engine with full Android TV remote & gamepad input. |
| **Roku OS** | *No Native Browser* | 🔴 *Screen Mirroring Only* | Roku OS does not include a WebAssembly web browser; stream via AirPlay or Miracast screen mirroring. |
| **Apple tvOS (Apple TV 4K / HD)** | *No Native Browser* | 🔴 *AirPlay Only* | tvOS lacks a standalone WebKit browser; stream via iOS/macOS AirPlay mirroring. |

---

## 🎮 Gaming Consoles

| Console | Browser | Status | Notes & Controls |
| :--- | :--- | :---: | :--- |
| **Xbox Series X\|S / Xbox One** | **Microsoft Edge for Xbox** | 🟢 **Compatible** | Native Chromium browser on Xbox; full native Xbox Wireless Controller navigation and audio output. |
| **PlayStation 5 / PlayStation 4** | *Integrated System Web Viewer* | 🟡 *Experimental* | Accessible via system messaging web link; controller support varies by firmware version. |
| **Nintendo Switch** | *Hidden NetFront Browser* | ⚪ *Restricted* | Requires DNS captive portal redirect; recommended to use the mobile/desktop web app instead. |

---

## ⚡ Recommended Environment

For the absolute best 60 FPS performance, lowest input latency, and full spatial gamepad navigation, we recommend:
- **Browser**: Any modern Chromium-based browser (**Google Chrome**, **Microsoft Edge**, **Brave**, **Arc**) or **Safari 16.4+**.
- **Controllers**: Bluetooth or USB-connected **Xbox Wireless Controller**, **Sony PlayStation DualSense / DualShock 4**, **Nintendo Switch Pro Controller**, or **8BitDo** Bluetooth Gamepads.

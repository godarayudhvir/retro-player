# WebRTC Multiplayer & Peer-to-Peer Netplay Architecture (`architecture/mirai/multiplayer.md`)

## 1. Description
The WebRTC Multiplayer specification details the future architecture for real-time peer-to-peer online netplay and local multiplayer emulation in Retro Player.

---

## 2. Detailed List of What It Will Do
- **P2P Room Creation**: Allow players to host emulation sessions and generate joinable room codes or shareable links.
- **Input Synchronization**: Stream input controller states (Player 1, Player 2) between host and client with low-latency WebRTC DataChannels.
- **Lobby UI Overlay**: In-game multiplayer lobby drawer displaying latency pings, connected player slots, and chat overlay.

---

## 3. Detailed Logic Behind It
- **Signaling Protocol**: WebSocket signaling server using PeerJS or custom Node/Socket.io service for exchanging SDP offers/answers and ICE candidates.
- **Rollback / Sync Engine**: Bind host EmulatorJS frame loop to send controller state buffers over RTCDataChannel `ordered: false, maxRetransmits: 0` for minimal lag.

---

## 4. Detailed Guide of How to Set It Up
1. Install signaling server dependencies: `npm install peer socket.io-client`.
2. Configure WebRTC TURN/STUN servers in project configuration.
3. Hook input listeners to dispatch input arrays over `rtcDataChannel.send()`.

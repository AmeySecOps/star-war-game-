# 🌌 Star Wars: Galactic Assault

[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas%202D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Procedural%20Synth-9cf?style=for-the-badge&logo=audio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20Assets-success?style=for-the-badge)](https://github.com/AmeySecOps/star-war-game-)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> *"It is a period of civil war. Rebel starfighters, striking from a hidden base, have won their first victory against the evil Galactic Empire..."*

**Star Wars: Galactic Assault** is a high-octane 2D arcade space combat simulator built entirely in vanilla JavaScript, HTML5 Canvas, and procedural Web Audio API. Experience 60 FPS dogfights across Outer Rim sectors, engage TIE fighter squadrons, deploy proton torpedoes, and destroy massive Imperial Star Destroyers and Darth Vader's TIE Advanced.

---

## ✨ Features

- 🚀 **100% Zero External Assets / Dependencies**: All ship models, capital ships, particle effects, laser bolts, and sound effects are generated procedurally in code.
- 🎨 **Procedural Vector Graphics Engine**:
  - High-precision vector rendering of iconic starfighters and capital dreadnoughts.
  - Dynamic starfield with parallax depth and hyperspace warp streaks.
  - Explosive particle engine with dynamic screen shake, debris fragmentation, and deflector shield ripples.
- 🔊 **Procedural Web Audio API Sound Synthesizer**:
  - Real-time generated blaster laser fire (Rebel red quad lasers, Imperial green turbolasers, Falcon quad cannons).
  - Authentic screaming TIE engine flybys.
  - Astromech R2-D2 emotional chirps and alert whistling.
  - Procedural 135 BPM cinematic battle score running live in-browser.
- 🛸 **Selectable Starfighter Fleet**: Choose between the **T-65B X-Wing**, **Millennium Falcon**, and **RZ-1 A-Wing**, each with distinct physics, hull armor, deflector shields, weapon loadouts, and unique flight abilities.
- 👾 **Imperial Enemies & Epic Boss Encounters**:
  - **TIE Fighters, Interceptors, & Bombers** with distinct AI attack patterns.
  - **Imperial Class Star Destroyer (ISD)** featuring destructible shield generator domes, multi-angle turbolaser batteries, and hangar TIE fighter deployments.
  - **Darth Vader (TIE Advanced x1)** featuring high-speed strafe maneuvers, deflector shielding, and rapid blasters.
  - Destructible asteroid belts with physics-based splitting.
- 🎯 **Advanced Combat Mechanics**:
  - Auto-locking homing Proton Torpedoes with smoke trails.
  - R2-D2 Astromech repair subroutines.
  - S-Foil attack vs. cruise velocity toggle.
  - 360° cursor-aimed turret tracking.
  - Combo multiplier system (up to x8) and local high-score persistence.
- 📱 **Cross-Platform Responsive Controls**: Full support for desktop keyboard/mouse and mobile virtual touch joysticks with on-screen action buttons.

---

## 🚀 Playable Starfighter Fleet

| Starfighter | Role & Class | Armor / Hull | Deflector Shields | Sublight Speed | Firepower | Special Ability |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **T-65B X-Wing** | Balanced Superiority Fighter | `100 HP` | `100 SP` | ★ ★ ★ ☆ | ★ ★ ★ ★ | **S-Foils Toggle (`[R]`)**: Open for 4-cannon attack formation; close for +45% cruise velocity. |
| **Millennium Falcon** | Heavy Armed Corellian Freighter | `220 HP` | `160 SP` | ★ ★ ☆ ☆ | ★ ★ ★ ★ ★ | **360° Quad Turret**: Independently aims at cursor / touch position with high damage output. |
| **RZ-1 A-Wing** | Interceptor / High Agility | `70 HP` | `70 SP` | ★ ★ ★ ★ ★ | ★ ★ ★ ☆ | **Hyper-Agility**: Extreme speed (10.5) and lightning-fast twin blaster fire rate. |

---

## 🛰️ Imperial Threats & Bosses

```
              Imperial Fleet Intel
 --------------------------------------------------
 [ TIE Fighter ]        Standard Imperial dogfighter (45 HP)
 [ TIE Interceptor ]    High-speed strafe interceptor (35 HP, 5.8 Spd)
 [ TIE Bomber ]         Heavy armored gunship (90 HP, 3.0 Spd)
 [ Star Destroyer ]     Sector 3+ Boss: Dual Shield Domes + Turbolasers + Hangar Spawns
 [ TIE Advanced x1 ]    Sector 4+ Boss: Lord Vader with Red Deflector Shields
```

- **Asteroids**: Floating obstacles with varying mass. Shooting large asteroids fractures them into smaller fragments.
- **Star Destroyer Tactics**: Target the twin bridge shield generator domes to disable the dreadnought's deflector shield before bombarding the main hull.

---

## 🎮 Controls

### 💻 Desktop (Keyboard & Mouse)

| Action | Primary Key | Secondary / Mouse |
| :--- | :---: | :---: |
| **Flight Movement** | `W` `A` `S` `D` | `Arrow Keys` |
| **Fire Primary Blasters** | `Space` | `Left Mouse Click` |
| **Launch Proton Torpedo** | `F` | `Right Mouse Click` |
| **Toggle S-Foils (X-Wing)**| `R` | Bottom HUD Button |
| **R2 Astromech Repair** | `E` | Bottom HUD Button |
| **Sublight Thruster Boost**| `Shift` (Hold) | — |
| **Mute / Unmute Audio** | `M` | Top HUD Button |

### 📱 Mobile / Touch Devices

- **Flight**: Drag the virtual joystick in the bottom-left corner (**FLIGHT JOY**).
- **Blasters**: Press and hold the **FIRE BLAST** button.
- **Torpedoes**: Tap the **TORP ORD** button.
- **Repair**: Tap the **R2 HEAL** button.

---

## 🛠️ Project Architecture

```
star-war-game-/
├── index.html        # Main HTML entrypoint, opening crawl, HUD overlay, modal screens
├── style.css         # Star Wars aesthetic styling, 3D perspective crawl, HUD glassmorphism
├── game.js           # 60 FPS physics engine, collision detection, enemy/boss AI, game loop
├── graphics.js       # Procedural vector rendering engine for starships, shields, & particles
├── audio.js          # Web Audio API procedural sound engine & real-time music synth
└── README.md         # Documentation and project manual
```

### Module Overview

- **`index.html`**: Defines the canvas layer, retro Star Wars perspective crawl, ship selection cards, combat HUD, and touch controller DOM elements.
- **`game.js`**: Drives the core game loop, input managers, entity state trees, homing torpedo trajectory math, collision meshes, sector wave progression, and localStorage high-scores.
- **`graphics.js` (`GraphicsRenderer`)**: Implements HTML5 Canvas 2D vector drawing for starships (cockpits, wings, panels, thrusters), shield bubbles, laser streaks, and starfield warp effects.
- **`audio.js` (`SoundEngine`)**: Generates dynamic audio using oscillators, biquad filters, white-noise buffers, and gain envelopes for blaster bolts, explosions, TIE roars, R2 chirps, and battle soundtracks.

---

## ⚡ Quick Start / Local Setup

No build step, package manager, or external dependencies are required. Run directly in any modern web browser.

### Option 1: Direct File Open
Simply double-click `index.html` or open it with any web browser (Chrome, Firefox, Edge, Safari).

### Option 2: Local HTTP Server (Recommended)

#### Using Python 3:
```bash
# Navigate to project directory
cd star-war-game-

# Start HTTP server
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

#### Using Node.js (`npx serve`):
```bash
npx serve .
```

#### Using VS Code Live Server:
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 🏆 Scoring & Multiplier Mechanics

- **Kill Streaks**: Eliminating enemies within 4 seconds increments your score multiplier (up to **x8**).
- **Targeting Reticle**: The combat computer automatically tracks the nearest enemy and displays a wireframe lock box with distance telemetry.
- **High Scores**: Saved automatically to your browser's `localStorage` under `sw_high_score`.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

### Disclaimer
*Star Wars and all related names, characters, ships, and lore are trademarks and copyrights of Lucasfilm Ltd. and The Walt Disney Company. This project is a non-commercial fan-made demonstration created for educational and entertainment purposes.*

---

<p align="center">
  <b>May the Force be with you!</b>
</p>

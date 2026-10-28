# Flashfire

Flashfire is an original browser-based 2D jetpack arena shooter built with Phaser, TypeScript, and Vite. It includes desktop, gamepad, and landscape-mobile controls.

## Features

- Six game modes, including Quick Deathmatch, Team Deathmatch, Survival, Gun Ladder, Control Point, and Training Range
- Eight arenas with unique layouts, hazards, and ambience
- Eleven weapons with a two-slot in-match inventory
- Random weapon, health, armor, and fuel supply drops
- Configurable controls, audio, graphics, accessibility, and touch settings
- Persistent progression and settings stored in the browser

Players deploy with the M9. A second weapon is collected automatically; when both slots are occupied, nearby weapons show a pickup prompt so the player can choose whether to replace the active weapon. Dropped items expire after a limited time.

## Getting Started

Install dependencies and start the development server:

```powershell
pnpm install
pnpm dev
```

Open the URL printed by Vite. The lobby is available at `/lobby`.

## Controls

| Action                 | Keyboard and mouse              |
| ---------------------- | ------------------------------- |
| Move                   | `A` / `D` or Left / Right Arrow |
| Jetpack                | `W`, Up Arrow, or `Space`       |
| Drop                   | `S` or Down Arrow               |
| Aim and fire           | Mouse                           |
| Reload                 | `R`                             |
| Grenade                | `G`                             |
| Switch weapon          | `1` / `2`                       |
| Pick or replace weapon | `E`                             |
| Pause                  | `Esc`                           |

Mobile play is restricted to landscape orientation and uses on-screen movement, aiming, firing, weapon, and pause controls. Gamepads use the analog sticks for movement and aiming, with face buttons for pickups, reload, and weapon switching.

## Quality Checks

```powershell
pnpm check
pnpm test:e2e
```

`pnpm check` runs ESLint, the unit suite, content validation, TypeScript checks, and a production build.

## Production

Create a standard production build:

```powershell
pnpm build
pnpm preview
```

Run the complete release verification pipeline:

```powershell
pnpm release:verify
```

The release pipeline verifies frozen content, builds the deployable artifact, validates hashes and cache rules, and runs production-preview tests. Deploy `.release/site`; retain `.release/sourcemaps` as a private debugging artifact.

## Asset Generation

Run `scripts/generate_assets.py` with Pillow to rebuild the original raster assets in `public/assets`.

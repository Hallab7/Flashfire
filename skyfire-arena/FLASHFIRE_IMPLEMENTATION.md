# Flashfire: Technical Implementation Specification

**Document status:** Source of truth for implementation  
**Target game:** Flashfire  
**Current prototype:** Skyfire Arena  
**Primary platform:** Web browser on desktop and mobile  
**Current engine:** Phaser 3.90.0 with Vite 7  
**Current scope:** Single-player and offline bot matches  
**Deferred feature:** Online multiplayer  

---

## 1. Purpose

This document defines the complete technical plan for turning the current Skyfire Arena prototype into **Flashfire**, a polished 2D jetpack arena shooter with no story campaign. Flashfire must deliver immediate, replayable combat through responsive movement, varied weapons, increasingly difficult AI opponents, multiple modes, and visually distinct maps.

This document is written to be executable by an AI coding agent. The agent must implement the phases in order, satisfy every acceptance criterion, and preserve a playable build after every phase.

### 1.1 Product principles

1. **Combat first:** the player must reach a live match within two interactions.
2. **No storyline:** progression is based on levels, maps, weapons, modes, difficulty, ranks, and mastery challenges.
3. **Readable action:** characters, projectiles, hazards, pickups, and platforms must remain distinguishable during heavy combat.
4. **Different weapons must feel different:** weapon variation must come from recoil, cadence, projectile behavior, magazine size, reload time, range, and movement tradeoffs, not only damage numbers.
5. **Skill must matter:** aim, jet management, positioning, weapon choice, map knowledge, and grenade timing determine success.
6. **Bots must be fair:** higher difficulty improves decisions and execution but does not grant impossible vision, instant reactions, or bullets that ignore the normal weapon simulation.
7. **Original identity:** do not copy Mini Militia names, characters, maps, user interface, sounds, animations, or visual assets. Flashfire may use the broad genre conventions of a 2D jetpack arena shooter.
8. **Future multiplayer readiness:** online multiplayer is not implemented now, but core simulation code must not be coupled to browser DOM state or assume that every actor is local.

### 1.2 Explicit non-goals for the first release

- Online multiplayer, matchmaking, parties, lobbies, or chat
- User accounts or cloud saves
- Real-money purchases, loot boxes, or advertisements
- Story campaign, dialogue, cutscenes, or quests
- User-generated maps
- Native Android or iOS packages
- Licensed weapon models or copied military branding assets

---

## 2. Existing Prototype Baseline

The existing project is located in `skyfire-arena/` and already provides:

- Phaser 3 Arcade Physics
- A responsive Vite browser build
- Desktop keyboard and mouse controls
- Mobile twin-stick controls
- Jetpack movement and fuel regeneration
- Rifle, shotgun, and plasma weapon behavior
- Four bots with basic movement and shooting
- Grenades
- Health, fuel, and weapon pickups
- Respawning and a score-limited match
- A single arena
- Original generated raster assets
- Desktop and mobile HUD layouts

The current prototype must be treated as a behavioral reference, not as the final architecture. Its main gameplay file is a monolith and must be decomposed before substantial content is added.

### 2.1 Baseline commands

```powershell
pnpm install
pnpm dev
pnpm build
```

### 2.2 Baseline constraints

- Do not break the current playable match while restructuring.
- Preserve the current generated assets until production-quality replacements are available.
- Keep the current controls functional during every phase.
- Rename the product without changing the package directory until the rename phase is complete.

---

## 3. Target Technology Stack

| Concern | Required technology | Implementation rule |
|---|---|---|
| Game engine | Phaser 3.90.x | Continue using Arcade Physics for the first release |
| Language | TypeScript 5.x | Migrate gameplay code from JavaScript during Phase 1 |
| Bundler | Vite 7.x | Use separate development, test, and production modes |
| Package manager | pnpm | Commit `pnpm-lock.yaml` |
| Unit tests | Vitest | Test pure simulation and configuration modules |
| Browser tests | Playwright | Test desktop and mobile playable flows |
| Formatting | Prettier | Run in CI and before phase completion |
| Linting | ESLint with TypeScript | No ignored errors in production code |
| Map authoring | Tiled JSON maps | One JSON file per map with validated object layers |
| Sprite authoring | PNG/WebP sprite sheets | Use original art only |
| Audio | Web Audio plus OGG/MP3 assets | Pool repeated sound instances |
| Persistence | Versioned `localStorage` adapter | No backend in the first release |

### 3.1 Required package scripts

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint src tests",
    "format": "prettier --write .",
    "check": "pnpm lint && pnpm test && pnpm build"
  }
}
```

---

## 4. Target Project Structure

```text
flashfire/
  public/
    assets/
      audio/
        music/
        sfx/
        ambience/
      fonts/
      maps/
      sprites/
        characters/
        weapons/
        projectiles/
        pickups/
        effects/
      tilesets/
      ui/
  scripts/
    generate-placeholder-assets.py
    validate-content.ts
  src/
    app/
      bootstrap.ts
      gameConfig.ts
    scenes/
      BootScene.ts
      PreloadScene.ts
      MainMenuScene.ts
      ModeSelectScene.ts
      LoadoutScene.ts
      ArenaScene.ts
      ResultsScene.ts
      SettingsScene.ts
    core/
      events/
        EventBus.ts
        GameEvents.ts
      math/
        fixedStep.ts
        seededRandom.ts
      state/
        MatchState.ts
        MatchStateMachine.ts
      types/
        ids.ts
        gameplay.ts
    entities/
      Actor.ts
      PlayerActor.ts
      BotActor.ts
      Projectile.ts
      Grenade.ts
      Pickup.ts
      Hazard.ts
    systems/
      ActorSystem.ts
      AISystem.ts
      AudioSystem.ts
      CombatSystem.ts
      DamageSystem.ts
      EffectsSystem.ts
      InputSystem.ts
      MapSystem.ts
      MatchSystem.ts
      MovementSystem.ts
      PickupSystem.ts
      ProjectileSystem.ts
      SpawnSystem.ts
      WeaponSystem.ts
    ai/
      BotBrain.ts
      BotPerception.ts
      NavigationGraph.ts
      behaviors/
        AttackBehavior.ts
        EvadeBehavior.ts
        PickupBehavior.ts
        RepositionBehavior.ts
        SearchBehavior.ts
    content/
      difficulties.ts
      maps.ts
      modes.ts
      pickups.ts
      progression.ts
      weapons.ts
    input/
      actions.ts
      DesktopInput.ts
      GamepadInput.ts
      TouchInput.ts
    ui/
      HudController.ts
      MenuController.ts
      MobileControls.ts
      ResultsController.ts
      SettingsController.ts
    graphics/
      AnimationController.ts
      CameraController.ts
      LightingController.ts
      ParticlePool.ts
      PostProcessing.ts
    persistence/
      SaveRepository.ts
      SaveMigrations.ts
      SettingsRepository.ts
    telemetry/
      LocalMatchStats.ts
    main.ts
    style.css
  tests/
    unit/
    integration/
    e2e/
    fixtures/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
```

### 4.1 Dependency boundaries

- `content/` contains configuration data and must not import Phaser.
- `core/` contains pure logic and must not access the DOM.
- `systems/` may depend on Phaser adapters but must communicate through typed events.
- `ui/` may read match snapshots but must not directly mutate actors.
- `scenes/` compose systems and control lifecycle; scenes must not contain weapon balance values.
- `persistence/` is the only layer allowed to access `localStorage`.
- `input/` converts device input into abstract actions.
- `graphics/` owns particles, camera effects, lighting, and animation playback.

---

## 5. Core Runtime Architecture

### 5.1 Match state machine

Every match must move through explicit states:

```text
BOOT -> PRELOAD -> MENU -> LOADOUT -> COUNTDOWN -> PLAYING
PLAYING -> PAUSED -> PLAYING
PLAYING -> ROUND_END -> RESULTS -> MENU or REMATCH
```

`MatchStateMachine` is the only module permitted to change the high-level match state. Systems subscribe to state transitions instead of checking arbitrary DOM visibility.

### 5.2 Fixed simulation step

- Run gameplay simulation at a fixed 60 Hz.
- Rendering may interpolate between simulation snapshots.
- Clamp accumulated frame time to prevent a backgrounded browser tab from simulating several seconds in one frame.
- Do not base damage, fire cadence, cooldowns, or AI reaction times on frame count.
- Represent simulation timestamps in integer milliseconds.

Recommended accumulator:

```ts
const STEP_MS = 1000 / 60;

while (accumulator >= STEP_MS) {
  simulate(STEP_MS);
  accumulator -= STEP_MS;
}
```

### 5.3 Entity identifiers

Every actor, projectile, pickup, and hazard must receive a stable typed ID.

```ts
type ActorId = string & { readonly __brand: 'ActorId' };
type ProjectileId = string & { readonly __brand: 'ProjectileId' };
type PickupId = string & { readonly __brand: 'PickupId' };
```

Do not use array positions as identities. This requirement reduces later multiplayer migration cost.

### 5.4 Event model

Required typed events include:

- `match:started`
- `match:ended`
- `actor:spawned`
- `actor:damaged`
- `actor:eliminated`
- `weapon:fired`
- `weapon:reloaded`
- `weapon:switched`
- `grenade:thrown`
- `explosion:created`
- `pickup:collected`
- `pickup:respawned`
- `objective:updated`
- `progression:unlocked`

Audio, effects, UI, and statistics must react to events. Combat logic must not directly manipulate HTML elements.

### 5.5 Object pools

Pool the following high-frequency objects:

- Bullets and energy projectiles
- Shell casings
- Muzzle flashes
- Hit sparks
- Smoke particles
- Jet exhaust particles
- Floating damage indicators
- Explosion sprites

Pool exhaustion must skip nonessential visual effects before skipping gameplay projectiles.

---

## 6. Data Contracts

### 6.1 Weapon definition

```ts
export interface WeaponDefinition {
  id: WeaponId;
  displayName: string;
  category: 'sidearm' | 'smg' | 'rifle' | 'shotgun' | 'lmg' | 'sniper' | 'launcher' | 'energy';
  fireMode: 'semi' | 'burst' | 'auto' | 'charge';
  damage: number;
  pellets: number;
  roundsPerMinute: number;
  magazineSize: number;
  reserveAmmo: number;
  reloadMs: number;
  projectileSpeed: number;
  projectileGravity: number;
  baseSpreadDeg: number;
  movingSpreadDeg: number;
  airborneSpreadDeg: number;
  recoilImpulse: number;
  maxRange: number;
  falloffStart: number;
  falloffEnd: number;
  minDamageMultiplier: number;
  movementMultiplier: number;
  pickupWeight: number;
  sfx: WeaponSoundSet;
  sprites: WeaponSpriteSet;
  effects: WeaponEffectSet;
}
```

### 6.2 Difficulty definition

```ts
export interface DifficultyDefinition {
  id: DifficultyId;
  displayName: string;
  botReactionMs: [number, number];
  aimErrorDeg: number;
  aimTrackingSpeed: number;
  burstDiscipline: number;
  dodgeProbability: number;
  grenadeProbability: number;
  pickupAwarenessRadius: number;
  hearingRadius: number;
  flankProbability: number;
  retreatHealthThreshold: number;
  jetEfficiency: number;
  teamCoordination: number;
  botHealthMultiplier: number;
  scoreMultiplier: number;
}
```

### 6.3 Map definition

```ts
export interface MapDefinition {
  id: MapId;
  displayName: string;
  tilemapKey: string;
  backgroundLayers: ParallaxLayerDefinition[];
  supportedModes: ModeId[];
  recommendedPlayers: [number, number];
  worldBounds: { width: number; height: number };
  spawnPointLayer: string;
  navigationLayer: string;
  pickupLayer: string;
  hazardLayer: string;
  ambience: string;
  music: string;
  lightingProfile: LightingProfileId;
}
```

### 6.4 Actor simulation state

```ts
export interface ActorState {
  id: ActorId;
  teamId: TeamId;
  position: Vec2;
  velocity: Vec2;
  aimAngle: number;
  facing: -1 | 1;
  health: number;
  armor: number;
  jetFuel: number;
  grounded: boolean;
  alive: boolean;
  activeWeaponId: WeaponId;
  inventory: InventoryState;
  statusEffects: StatusEffectState[];
  lastDamageAt: number;
  respawnAt: number | null;
}
```

### 6.5 Game mode contract

```ts
export interface GameMode {
  id: ModeId;
  createInitialState(context: MatchContext): ModeState;
  onActorEliminated(event: ActorEliminatedEvent, state: ModeState): void;
  update(stepMs: number, state: ModeState): void;
  getSpawnRequest(actorId: ActorId, state: ModeState): SpawnRequest;
  getResult(state: ModeState): MatchResult | null;
  getHudSnapshot(state: ModeState): ModeHudSnapshot;
}
```

---

## 7. Core Gameplay Specification

### 7.1 Player health and armor

- Base health: `100`
- Optional armor: `0-50`
- Armor absorbs 65% of incoming bullet damage until depleted.
- Explosion damage applies 50% to armor and 50% to health.
- Environmental instant-kill zones ignore armor.
- Health pickups restore `40` health and cannot exceed maximum health.
- Armor plates restore `25` armor and cannot exceed `50` armor.

### 7.2 Damage regions

Phase 2 must add separate hit regions:

| Region | Damage multiplier |
|---|---:|
| Head | 1.50 |
| Torso | 1.00 |
| Arms | 0.85 |
| Legs | 0.80 |

Explosion damage does not use body-region multipliers.

### 7.3 Damage falloff

```text
distance <= falloffStart: base damage
falloffStart < distance < falloffEnd: linearly interpolate damage
distance >= falloffEnd: base damage * minDamageMultiplier
```

Round final damage to the nearest integer after applying region, falloff, armor, and difficulty modifiers.

### 7.4 Jetpack movement

- Horizontal acceleration: `1100 px/s²`
- Maximum horizontal speed: `360 px/s`
- Base gravity: `860 px/s²`
- Jet acceleration: `-1450 px/s²`
- Maximum downward speed: `520 px/s`
- Maximum upward speed: `410 px/s`
- Fuel capacity: `100`
- Fuel consumption: `31 units/s`
- Ground regeneration: `25 units/s`
- Air regeneration after 700 ms without thrust: `9 units/s`
- Direction changes in air must retain momentum.
- Firing an LMG or launcher while airborne applies additional recoil impulse.
- Jet exhaust must communicate remaining fuel through color and intensity, not only through the HUD.

### 7.5 Respawning

- Default respawn delay: `1.25 s`
- Spawn protection: `0.75 s` or until the player fires
- The spawn system must reject points within `330 px` of a visible enemy when alternatives exist.
- Prefer the spawn point with the highest combined distance from enemies.
- Never respawn into an active hazard volume.
- Show a visible materialization effect before collision and damage become active.

### 7.6 Pickups

| Pickup | Effect | Default respawn |
|---|---|---:|
| Health kit | +40 health | 12 s |
| Armor plate | +25 armor | 16 s |
| Jet cell | Refill fuel | 10 s |
| Ammo box | Refill 40% reserve ammo | 12 s |
| Weapon crate | Equip configured weapon | 16 s |
| Frag grenade | +1 frag, maximum 3 | 14 s |

Pickups must use map-defined spawn points and emit a clear respawn signal 1 second before becoming collectible.

---

## 8. Weapon Arsenal and Balance

The values below are the initial balance baseline. All weapon data must live in `src/content/weapons.ts`; no weapon value may be duplicated in scene code.

The requested AK-47, AK-117, and B4 RPD labels are working design names. Before commercial release, complete a trademark and product-name review. If a name is not cleared, change only its display name while preserving the stable internal weapon ID and approved balance data. The default fallback for AK-117 is `AR-117`.

### 8.1 Guns

| Weapon | Category | Damage | RPM | Magazine | Reload | Speed | Spread | Falloff | Movement | Role |
|---|---|---:|---:|---:|---:|---:|---:|---|---:|---|
| M9 Pistol | Sidearm | 22 | 360 | 12 | 950 ms | 1050 | 1.2° | 440-760 | 1.00 | Reliable fallback |
| Viper Auto Pistol | Sidearm | 13 | 780 | 20 | 1150 ms | 980 | 3.0° | 330-620 | 0.98 | Close-range emergency weapon |
| AK-47 | Rifle | 27 | 600 | 30 | 1450 ms | 980 | 2.2° | 520-900 | 0.94 | High damage and strong recoil |
| AK-117 | Rifle | 20 | 810 | 36 | 1320 ms | 1020 | 1.5° | 500-920 | 0.96 | Fast, controllable assault rifle |
| Falcon Burst Rifle | Rifle | 24 | 720 burst | 27 | 1380 ms | 1060 | 1.1° | 580-980 | 0.95 | Accurate three-round burst |
| Vector-9 | SMG | 16 | 960 | 32 | 1180 ms | 900 | 3.2° | 270-560 | 1.02 | Mobile close-range pressure |
| B4 RPD | LMG | 18 | 720 | 75 | 2600 ms | 950 | 2.7° | 520-880 | 0.82 | Sustained fire and suppression |
| Ironclad Shotgun | Shotgun | 11 x 8 | 92 | 6 | 1550 ms | 790 | 12° | 180-430 | 0.90 | Close-range burst damage |
| Longbow DMR | Sniper | 75 | 52 | 5 | 2100 ms | 1500 | 0.2° | 900-1400 | 0.78 | High-skill precision weapon |
| Arc Carbine | Energy | 23 | 300 | 14 | 1250 ms | 730 | 0.8° | 520-840 | 0.94 | Slow visible projectiles |
| Hydra Launcher | Launcher | 80 splash | 42 | 1 | 2200 ms | 490 | 0.4° | none | 0.76 | Area denial and anti-camping |

### 8.2 Weapon-specific behavior

#### M9 Pistol

- Always available after respawn.
- No movement penalty while aiming.
- Moderate fire-rate cap prevents macro abuse.
- Highest weapon-switch speed.

#### AK-47

- First three shots remain reasonably accurate.
- Sustained fire increases vertical recoil and spread.
- Recoil recovers after 180 ms without firing.
- Strong audio and muzzle flash must communicate impact.

#### AK-117

- Lower damage than AK-47 but faster cadence and better airborne handling.
- Spread increases slowly during sustained fire.
- Intended as the most accessible rifle.

#### B4 RPD

- Large magazine and long reload.
- Movement speed reduced while equipped.
- Heat bloom increases spread after 25 continuous rounds.
- Airborne recoil pushes the player backward.
- Must never spawn at both teams' initial spawn points simultaneously.

#### Ironclad Shotgun

- Fires eight independently simulated pellets.
- Damage is capped at `88` before head multipliers.
- Pump delay prevents immediate follow-up shots.
- Pellet spread must be deterministic per shot seed.

#### Longbow DMR

- Requires 250 ms of stable aim to achieve full accuracy.
- Moving or jetting immediately increases spread.
- Headshots eliminate an unarmored opponent.
- Add a visible aim-line warning on Recruit and Regular difficulties only.

#### Arc Carbine

- Projectiles are slower but visually prominent.
- Projectiles illuminate nearby surfaces.
- Direct hits apply a 250 ms jet-regeneration delay.

#### Hydra Launcher

- Projectile follows an arc and collides with level geometry.
- Explosion damage falls off linearly over `150 px`.
- Self-damage is enabled at 50% strength.
- Minimum arming distance: `90 px`.

### 8.3 Grenades

| Grenade | Maximum carried | Fuse | Center damage | Radius | Special behavior |
|---|---:|---:|---:|---:|---|
| Frag grenade | 3 | 1.0 s | 85 | 155 px | Bounces and rolls |
| Sticky charge | 2 | 1.4 s | 70 | 125 px | Attaches to surfaces, not actors |
| Shock grenade | 2 | 0.9 s | 25 | 170 px | Disables jet thrust for 1.2 s |
| Smoke capsule | 2 | 0.6 s | 0 | 210 px | Blocks bot line of sight for 5 s |

### 8.4 Weapon levels

Weapons can be upgraded through offline progression. Upgrades must remain modest so basic weapons stay viable.

| Level | Requirement | Damage | Reload | Recoil | Cosmetic change |
|---|---|---:|---:|---:|---|
| Mk I | Initial unlock | 100% | 100% | 100% | Base finish |
| Mk II | 40 eliminations | 104% | 97% | 97% | Added accent |
| Mk III | 120 eliminations | 108% | 94% | 94% | Animated mastery stripe |

- Never increase magazine size through weapon levels.
- Apply the damage multiplier before rounding.
- Multiplayer, when implemented, may use normalized Mk I statistics in ranked play.

### 8.5 Loadout rules

- One primary weapon
- One pistol
- One grenade type
- One passive perk after account rank 5
- Weapon pickups can temporarily replace the primary weapon during a match.
- Players respawn with their selected loadout unless the mode overrides it.

Initial passive perks:

| Perk | Effect |
|---|---|
| Light Frame | +5% movement speed, -10 maximum armor |
| Fuel Recycler | +15% jet regeneration after delay |
| Quick Hands | -12% reload time |
| Blast Lining | -18% explosion damage |

---

## 9. Difficulty System

Difficulty changes bot intelligence and execution. It must not arbitrarily increase enemy bullet damage.

| Setting | Reaction | Aim error | Tracking | Dodge | Grenades | Flanking | Bot health | Score multiplier |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Recruit | 600-900 ms | 12° | 0.35 | 8% | 2% | 3% | 0.90x | 0.75x |
| Regular | 420-700 ms | 8° | 0.50 | 16% | 6% | 10% | 1.00x | 1.00x |
| Veteran | 260-480 ms | 5° | 0.68 | 28% | 12% | 22% | 1.00x | 1.35x |
| Elite | 170-330 ms | 3° | 0.82 | 40% | 18% | 35% | 1.08x | 1.70x |
| Flashpoint | 110-240 ms | 1.8° | 0.94 | 52% | 24% | 48% | 1.15x | 2.20x |

### 9.1 Bot fairness rules

- Bots require line of sight or recent sound information before attacking.
- Bots cannot track a player through solid geometry.
- Bots forget exact player position after a difficulty-dependent memory duration.
- Bots use the same projectile speed, spread, reload, ammo, jet fuel, and pickup rules as the player.
- Bots cannot react before their configured reaction delay.
- Bots may predict movement only after maintaining sight for at least 350 ms.
- Smoke blocks sight but not close-range hearing.
- Bot aim error must be applied as a smoothly changing offset, not random jitter every frame.

### 9.2 Difficulty unlocks

- Recruit and Regular: available immediately
- Veteran: complete three Regular matches
- Elite: win five Veteran matches
- Flashpoint: win each map on Elite

Difficulty progression is optional. Players may reset unlocks from settings.

---

## 10. AI Implementation

### 10.1 Bot state machine

```text
SPAWN
  -> SEEK_WEAPON
  -> PATROL
  -> ENGAGE
  -> REPOSITION
  -> EVADE
  -> SEEK_HEALTH
  -> SEEK_AMMO
  -> RETREAT
  -> DEAD
  -> SPAWN
```

### 10.2 Perception

Each bot maintains:

- Visible actors with line-of-sight timestamps
- Last known enemy positions
- Heard weapon and explosion events
- Nearby pickups and estimated value
- Immediate hazards and unsafe navigation edges
- Current target threat score

Threat score should consider distance, target health, target weapon, recent incoming damage, line of sight, and objective relevance.

### 10.3 Navigation

- Generate a navigation graph from Tiled object layers.
- Nodes represent platforms, ledges, jump points, jet routes, ladders if present, and safe landing zones.
- Edges include walk, drop, jet, and hazard-cost metadata.
- Recompute paths only when the target node changes or the current edge becomes invalid.
- Do not run A* every frame.
- Validate every map by spawning a bot at each spawn point and confirming that every other major platform is reachable.

### 10.4 Combat decisions

Bots must choose actions based on weapon range:

- Shotgun and SMG: close distance and use short jet bursts.
- Rifles: maintain medium range and use cover edges.
- LMG: hold strong platforms and suppress routes.
- Sniper: seek long sightlines and retreat when rushed.
- Launcher: avoid firing inside self-damage radius.

Bots should reload behind cover, when the magazine is empty, or when fewer than 35% of rounds remain and no enemy has been visible for 1 second.

### 10.5 Difficulty validation tests

Run 100 simulated matches per difficulty with fixed seeds. Record:

- Average bot accuracy
- Average reaction time
- Grenades thrown per minute
- Deaths caused by environmental hazards
- Pickup usage
- Player win rate against each difficulty

Target first-pass win rates for a competent test player:

| Difficulty | Target player win rate |
|---|---:|
| Recruit | 85-95% |
| Regular | 60-75% |
| Veteran | 40-55% |
| Elite | 20-35% |
| Flashpoint | 5-20% |

---

## 11. Playable Modes

No mode requires narrative content.

### 11.1 Quick Deathmatch

- Player versus four to seven bots
- First to score limit or highest score when time expires
- Default: 12 eliminations and 3 minutes
- Supports every map

### 11.2 Team Deathmatch

- Player plus AI allies versus AI opponents
- Default teams: 3v3 or 4v4 depending on map
- Friendly fire disabled by default
- First team to 30 eliminations or highest score at 6 minutes
- Team spawns must rotate when spawn pressure becomes unsafe

### 11.3 Survival

- Player fights increasingly difficult waves
- No enemy respawning inside a wave
- 20-second buy and loadout interval between waves
- Health restores by 20 after each completed wave
- Boss bot appears every fifth wave with a named behavior preset, not extra story
- Endless after wave 20 with score leaderboard stored locally

### 11.4 Gun Ladder

- Every two eliminations automatically advances the player's weapon
- Required order: pistol, SMG, AK-117, AK-47, shotgun, B4 RPD, Arc Carbine, Longbow DMR, Hydra Launcher, grenade elimination
- Dying does not remove progress on Recruit or Regular
- Dying removes one elimination of progress on Veteran and above
- First player to complete the ladder wins

### 11.5 Control Point

- One active capture zone moves between three predefined locations
- Zone changes after 45 seconds or when a team reaches 30 capture points
- One point per second while uncontested
- First to 100 points or highest score after 7 minutes
- Bots prioritize the objective based on difficulty and team role

### 11.6 Training Range

- No match timer
- Stationary, moving, airborne, and armored targets
- Every unlocked weapon is available
- Show accuracy, headshot rate, damage per second, reload time, and time-to-kill
- Include movement and jet-fuel practice lanes
- Settings changes apply immediately for sensitivity testing

---

## 12. Level and Map Progression

Flashfire launches with eight maps. Each map must provide different routes and combat rhythms, not only a background change.

### 12.1 Level table

| Level | Map | Visual identity | Primary mechanic | Unlock reward |
|---:|---|---|---|---|
| 1 | Outpost Kilo | Coastal jungle base at sunset | Balanced platforms and open center | M9 Pistol, AK-117 |
| 2 | Drydock 12 | Stormy shipyard and cranes | Moving cargo platforms and water kill zone | Frag grenade, Vector-9 |
| 3 | Ember Foundry | Industrial steel mill | Timed heat vents and conveyor belts | AK-47, Ironclad Shotgun |
| 4 | Canopy Ruins | Overgrown elevated research site | Breakable bridges and dense vertical routes | Smoke capsule, Falcon Burst Rifle |
| 5 | Frost Relay | Arctic communications station | Slippery surfaces and periodic whiteout | B4 RPD, Armor Plate perk |
| 6 | Neon Underpass | Rainy city transit tunnels | Trains, doors, and close-range lanes | Shock grenade, Arc Carbine |
| 7 | Sky Fortress | High-altitude military platform | Low gravity pockets and wind zones | Longbow DMR, Sticky charge |
| 8 | Blacksite Zero | Volcanic underground facility | Rotating hazard phases and restricted safe zones | Hydra Launcher, Flashpoint difficulty |

### 12.2 Map 1: Outpost Kilo

**Purpose:** onboarding and balanced competitive baseline.

- World size: `1600 x 900`
- Palette: deep teal, jungle green, coral, amber sunlight
- Three vertical tiers and two flanking tunnels
- No instant-kill hazards
- Central watchtower provides power position but has three attack routes
- Health and fuel pickups must be visible from the central lane
- Recommended modes: all modes
- Performance reference map for low-end devices

### 12.3 Map 2: Drydock 12

- World size: `1920 x 960`
- Palette: navy, rust red, wet steel, warning yellow
- Rain, water reflections, distant lightning, moving cranes
- Falling into water causes elimination after a 0.6-second recovery window
- Two moving cargo platforms follow deterministic tracks
- Shotgun and SMG routes run through containers
- Rifle sightlines exist above the container lanes
- Ambient waves and metal impacts must be spatialized

### 12.4 Map 3: Ember Foundry

- World size: `1760 x 960`
- Palette: charcoal, furnace orange, molten yellow, cool cyan machinery
- Heat vents telegraph for 1 second before activation
- Active vents deal 20 damage per second and push actors upward
- Conveyor belts alter horizontal movement by up to 90 px/s
- Furnace doors create temporary sightlines
- VFX must use pooled embers and heat distortion

### 12.5 Map 4: Canopy Ruins

- World size: `1880 x 1120`
- Palette: moss green, stone gray, turquoise technology, warm sun shafts
- Highest verticality of the first four maps
- Breakable bridges have visible damage states and respawn after 18 seconds
- Vines are visual only; they must not obscure collision edges
- Hidden lower route contains an ammo pickup but no health pickup
- Background includes at least four parallax layers

### 12.6 Map 5: Frost Relay

- World size: `1800 x 940`
- Palette: pale cyan, dark navy, safety orange, white fog
- Ice surfaces reduce ground friction by 60%
- Whiteout lasts 5 seconds every 45-60 seconds using seeded timing
- Whiteout reduces bot and player visibility equally
- Indoor relay rooms provide stable traction and clear sight
- Snow particles must scale down on mobile performance mode

### 12.7 Map 6: Neon Underpass

- World size: `2000 x 900`
- Palette: near-black, cyan, magenta, amber street lighting
- Two train tracks cross the lower map
- Trains use fixed warning lights and audio before arrival
- Service doors open on timed cycles, changing routes
- Wet surfaces reflect characters and muzzle flashes at reduced resolution
- Close-range combat dominates; long sightlines require exposed high platforms

### 12.8 Map 7: Sky Fortress

- World size: `1960 x 1080`
- Palette: cloud white, steel blue, gold sunlight, red warning accents
- Wind zones push airborne actors in indicated directions
- Low-gravity chambers reduce gravity and jet consumption by 35%
- Falling below world bounds causes immediate elimination
- Moving lift platforms connect disconnected wings
- Clouds and aircraft move in parallax without affecting gameplay visibility

### 12.9 Map 8: Blacksite Zero

- World size: `2100 x 1100`
- Palette: black basalt, toxic green, emergency red, volcanic orange
- Hazard cycle rotates every 35 seconds between lava rise, power outage, and security lockdown
- Every hazard has a 2-second visual and audio warning
- Safe routes change, but at least two valid routes must always remain
- Designed for advanced players and Flashpoint AI
- The Hydra Launcher spawn is exposed and contested

### 12.10 Tiled layer contract

Every map JSON must contain these named layers:

```text
background
decor_far
decor_mid
collision
one_way_platforms
hazards
spawn_points
pickup_points
navigation_nodes
navigation_edges
objectives
foreground
lighting
```

Map loading must fail with a clear development error if a required layer is missing.

---

## 13. Graphics and Art Direction

Graphics are a primary feature, not final-phase decoration.

### 13.1 Visual identity

- Stylized 2D military science fiction with warm natural light and saturated combat effects
- Characters use clear silhouettes, compact proportions, and visible jetpacks
- Environments use rich painted backgrounds while gameplay surfaces use cleaner values
- Avoid photorealism and avoid copying the visual language of Mini Militia
- Maintain at least 4.5:1 contrast for important HUD text
- Do not use one dominant hue across every map

### 13.2 Character asset specification

- Source character canvas: `192 x 192` per animation frame
- Display target: approximately `72-96 px` tall at 1280x720
- Required animations:

| Animation | Frames | Target rate |
|---|---:|---:|
| Idle | 8 | 8 fps |
| Run | 10 | 14 fps |
| Jet ascend | 6 | 12 fps |
| Jet lateral | 8 | 12 fps |
| Fall | 4 | 8 fps |
| Land | 5 | 14 fps |
| Reload pistol | 10 | weapon timed |
| Reload rifle | 14 | weapon timed |
| Reload LMG | 18 | weapon timed |
| Throw grenade | 9 | 14 fps |
| Damage reaction | 4 | 16 fps |
| Elimination | 10 | 16 fps |
| Respawn | 8 | 12 fps |

- Body and weapon must be separate render layers so aim rotation does not rotate the entire actor.
- Muzzle anchors, hand anchors, jet anchors, and shell-ejection anchors must be authored as metadata.
- Character palettes must support team tinting without recoloring skin, eyes, or weapon details.

### 13.3 Weapon art specification

- Minimum source width: `160 px`
- Separate world sprite, pickup sprite, loadout icon, and HUD silhouette
- Minimum visual differences between weapons: body length, barrel, stock, magazine, muzzle flash, projectile effect, and reload animation
- Do not reuse one weapon silhouette with color swaps.

### 13.4 Environment layers

Each map must use:

1. Sky or distant atmosphere
2. Far silhouettes
3. Mid-distance structures
4. Gameplay collision layer
5. Dynamic props and hazards
6. Foreground framing elements
7. Lighting and weather effects

Parallax movement must stay subtle enough that it does not cause motion sickness during fast jet movement.

### 13.5 Lighting

- Use additive sprite lights and low-resolution render textures, not expensive per-pixel dynamic lighting on all devices.
- Muzzle flashes light nearby geometry for 60-90 ms.
- Explosions light the scene for 180-300 ms.
- Energy projectiles carry a small colored light.
- Low graphics mode disables surface reflections and reduces dynamic lights to the nearest eight.

### 13.6 VFX requirements

Required effects:

- Distinct muzzle flash for each weapon category
- Shell casings for ballistic weapons
- Bullet impact by surface material
- Bloodless character hit sparks using team-neutral impact colors
- Jet flame with fuel-dependent intensity
- Smoke trails for launchers
- Grenade fuse indicator
- Explosion core, shockwave, debris, and smoke
- Pickup spawn and collection effects
- Spawn protection shield
- Headshot indicator
- Low-health screen treatment that does not obscure aim
- Environmental weather per map

### 13.7 Camera behavior

- Camera follows the local player with 8% aim-direction lead.
- Vertical lead increases while jetting upward.
- Maximum camera lead: `110 px` horizontal and `70 px` vertical.
- Screen shake intensity is categorized as small, medium, and large.
- Add a settings slider from 0-100% for shake.
- Camera never reveals areas outside map art bounds.

### 13.8 Graphics quality presets

| Feature | Low | Medium | High |
|---|---|---|---|
| Particle budget | 180 | 360 | 700 |
| Dynamic lights | 4 | 8 | 16 |
| Reflections | Off | Quarter resolution | Half resolution |
| Weather density | 40% | 70% | 100% |
| Background layers | 3 | 5 | All |
| Post-processing | Off | Color grade | Color grade, bloom, distortion |

Auto-select Medium on desktop and Low on touch devices with less than 4 GB reported memory. Always allow manual override.

---

## 14. User Interface

### 14.1 Required screens

- Boot and loading
- Main menu
- Mode selection
- Map selection
- Difficulty selection
- Loadout
- Match HUD
- Pause
- Results and statistics
- Weapon mastery
- Settings
- Credits and licenses

### 14.2 Main menu

The first screen must show the actual game arena moving in the background. Primary actions:

- Quick Match
- Modes
- Loadout
- Training
- Settings

Do not create a marketing landing page inside the game.

### 14.3 Match HUD

Required information:

- Health and armor
- Jet fuel
- Current weapon
- Magazine and reserve ammunition
- Grenade count and type
- Match score
- Remaining time or mode objective
- Reload state
- Kill feed
- Temporary pickup and unlock notifications

The HUD must preserve the center and immediate aim area. Test at 390x844 portrait, 844x390 landscape, 1280x720, 1440x900, and 1920x1080.

### 14.4 Results

Show:

- Victory or defeat
- Final score
- Eliminations, deaths, assists
- Accuracy and headshot rate
- Highest streak
- Damage dealt and received
- Pickups collected
- Weapon mastery progress
- Rank experience gained
- Rematch, change map, and main menu actions

### 14.5 Accessibility

- Remappable keyboard controls
- Left-handed touch layout option
- Touch control size and opacity sliders
- Aim sensitivity sliders by input type
- Reduced motion mode
- Screen shake slider
- Colorblind-safe team palettes
- High-contrast pickup outlines
- Independent music, effects, ambience, and UI volume
- Pause gameplay when browser focus is lost in single-player modes

---

## 15. Input Specification

### 15.1 Abstract actions

```ts
type InputAction =
  | 'moveLeft'
  | 'moveRight'
  | 'jet'
  | 'drop'
  | 'aim'
  | 'fire'
  | 'reload'
  | 'throwGrenade'
  | 'switchPrimary'
  | 'switchSecondary'
  | 'interact'
  | 'pause';
```

Gameplay systems consume actions, not raw keyboard key codes or pointer events.

### 15.2 Desktop defaults

| Action | Default |
|---|---|
| Move | `A` / `D` |
| Jet | `W` or `Space` |
| Drop | `S` |
| Aim | Mouse |
| Fire | Left mouse |
| Reload | `R` |
| Grenade | `G` |
| Primary | `1` |
| Pistol | `2` |
| Pause | `Escape` |

### 15.3 Touch

- Left virtual stick controls horizontal movement and upward jet thrust.
- Right virtual stick controls aim and fires after crossing a configurable dead zone.
- Grenade uses a dedicated icon button.
- Reload appears near the weapon HUD when the magazine is below capacity.
- Support fixed and floating stick positions.
- Touch controls must remain inside safe-area insets.

### 15.4 Gamepad

- Left stick: movement and jet direction
- Right stick: aim
- Right trigger: fire
- Left trigger: jet
- Left bumper: grenade
- X / Square: reload
- Y / Triangle: switch weapon
- Start: pause
- Add dead-zone and sensitivity settings.

---

## 16. Audio

### 16.1 Mix buses

- Master
- Music
- Weapon effects
- Explosions
- Character and jet effects
- Environment ambience
- Interface

### 16.2 Weapon audio

Every gun requires:

- Initial shot transient
- Mechanical body
- Tail suited to the map environment
- Reload start, insert, and finish sounds
- Empty magazine click
- Distant variant for non-player actors

Automatic weapons must use a loop-safe cadence system rather than spawning unlimited overlapping audio nodes.

### 16.3 Dynamic music

- Menu loop
- Normal combat layer
- High-intensity layer triggered by streak, low health, or contested objective
- Final 30-second layer
- Results stinger

Music transitions occur on musical bar boundaries when metadata is available.

---

## 17. Progression and Persistence

### 17.1 Player rank

- Rank range: 1-30
- Experience comes from match completion, difficulty multiplier, eliminations, assists, objectives, and challenges.
- Do not reward repeatedly restarting failed matches.
- Unlock maps through level completion and weapons through rank or map rewards.

### 17.2 Save schema

```ts
interface FlashfireSaveV1 {
  version: 1;
  profile: {
    displayName: string;
    rank: number;
    experience: number;
    totalMatches: number;
  };
  unlocks: {
    maps: MapId[];
    modes: ModeId[];
    difficulties: DifficultyId[];
    weapons: WeaponId[];
    perks: PerkId[];
  };
  mastery: Record<WeaponId, WeaponMasteryState>;
  records: Record<ModeId, ModeRecord>;
  settings: SettingsState;
}
```

### 17.3 Save rules

- Store one versioned JSON document in `localStorage`.
- Validate data before use.
- Preserve the last valid save if a write fails.
- Provide export and import as JSON files.
- Include save migrations for every schema version change.
- Never discard an unknown newer save version without confirmation.

---

## 18. Performance Budgets

### 18.1 Runtime targets

| Platform | Target | Minimum acceptable |
|---|---:|---:|
| Desktop 1080p | 60 fps | 55 fps |
| Mid-range mobile landscape | 60 fps | 45 fps |
| Low-end mobile landscape | 45 fps | 30 fps |

### 18.2 Budgets

- Maximum active gameplay projectiles: 180
- Maximum pooled visual particles: preset-dependent
- Maximum simultaneously audible weapon voices: 12
- Maximum uncompressed texture memory on High: 192 MB
- Maximum uncompressed texture memory on Low: 80 MB
- Initial compressed download target: under 15 MB
- Per-map compressed download target: under 8 MB
- Main JavaScript bundle target: under 700 KB gzip after Phaser chunk separation
- No frame may allocate large arrays in the main update loop.
- Avoid full-canvas filters every frame on mobile.

### 18.3 Profiling gates

Before completing Phases 4, 6, and 8:

- Capture a 60-second performance trace on desktop.
- Capture a 60-second performance trace at 390x844 mobile emulation.
- Run the heaviest map with maximum bots, projectiles, weather, and effects.
- Record average fps, 1% low fps, memory peak, draw calls, and active object counts.

---

## 19. Testing Strategy

### 19.1 Unit tests

Required unit coverage:

- Damage and falloff formulas
- Armor absorption
- Weapon cadence and reload state
- Ammo consumption and refill
- Grenade fuse and radial falloff
- Difficulty configuration validation
- Progression rewards
- Save validation and migrations
- Match state transitions
- Seeded random behavior
- Spawn scoring

### 19.2 Integration tests

- Player can spawn, move, jet, fire, reload, and respawn.
- Every weapon can damage and eliminate a bot.
- Pickups apply once and respawn.
- Smoke blocks bot sight.
- Difficulty changes bot reaction and accuracy profiles.
- Every game mode reaches a valid result state.
- Every map loads required layers and has valid navigation reachability.

### 19.3 Playwright tests

Required browser flows:

1. Load menu, start Quick Match, observe active HUD.
2. Fire until empty, reload, confirm magazine refills.
3. Collect a weapon and switch back to pistol.
4. Throw a grenade and confirm explosion effect.
5. Complete a short configured match and reach Results.
6. Start a rematch without reloading the page.
7. Pause and resume.
8. Run at desktop, mobile portrait, and mobile landscape viewports.
9. Confirm no uncaught exceptions or error-level console output.
10. Confirm text and controls remain inside the viewport.

### 19.4 Visual regression set

Maintain screenshots for:

- Main menu
- Loadout
- Each map at its primary spawn
- Every graphics quality preset
- Match HUD on desktop and mobile
- Pause and results screens
- Low health
- Explosion-heavy combat

### 19.5 Content validation

`scripts/validate-content.ts` must fail the build when:

- Weapon IDs are duplicated.
- Required weapon assets are missing.
- Damage, cadence, ammo, or range values are invalid.
- Map layers are missing.
- Spawn points are inside collision or hazards.
- A map does not support at least one mode.
- Unlock requirements reference nonexistent content.

---

## 20. Implementation Phases

Each phase ends with a playable build. Do not begin the next phase until the phase gate is satisfied.

### Phase 0: Preserve and Rename the Prototype

**Goal:** establish Flashfire identity and a verified baseline.

Implementation:

- Rename all player-visible Skyfire Arena text to Flashfire.
- Change package name to `flashfire`.
- Replace temporary title treatment with a Flashfire wordmark using original typography.
- Keep the directory name temporarily if external tooling depends on it.
- Record current desktop and mobile screenshots.
- Add `CHANGELOG.md` and phase checklist.
- Add TypeScript, ESLint, Prettier, Vitest, and Playwright configuration.
- Preserve the existing playable match behavior.

Acceptance gate:

- `pnpm check` passes.
- The menu, match, respawn, and rematch flow work.
- No visible Skyfire Arena name remains.
- Desktop and mobile screenshots show Flashfire branding.

**Playable build:** Flashfire Prototype 0.1.

### Phase 1: Modular Combat Foundation

**Goal:** replace the monolithic JavaScript architecture without changing the game feel.

Implementation:

- Migrate `src/main.js` to TypeScript modules.
- Implement scenes, systems, event bus, fixed-step simulation, and input actions.
- Add typed actor, weapon, projectile, pickup, and match state.
- Move all weapon data into `content/weapons.ts`.
- Add object pools.
- Implement pause, focus loss, and match state machine.
- Add unit tests for existing rifle, shotgun, plasma, grenade, damage, and respawn behavior.

Acceptance gate:

- Existing controls and combat feel remain recognizable.
- No scene contains hardcoded weapon balance values.
- Unit tests cover damage, reload, grenade, and respawn logic.
- No increasing object count is observed during a five-minute stress match.

**Playable build:** Combat Foundation Alpha 0.2.

### Phase 2: Full Arsenal and Loadouts

**Goal:** deliver materially different weapon choices.

Implementation:

- Add every gun and grenade in Section 8.
- Add separate head, torso, arm, and leg hit regions.
- Implement recoil, spread growth, damage falloff, movement penalties, self-damage, and weapon switching.
- Add loadout screen and pistol fallback.
- Add weapon pickup placement through map data.
- Add per-weapon HUD icons and ammo displays.
- Add generated placeholder art only until original production art is ready.
- Add Training Range metrics.

Acceptance gate:

- Every weapon can be selected, fired, reloaded, dropped or replaced, and used by bots.
- Every weapon has distinct visuals and sound.
- Automated time-to-kill tests stay within defined values.
- No weapon exceeds 55% selection rate in internal bot simulations after basic tuning.

**Playable build:** Arsenal Alpha 0.3.

### Phase 3: AI and Difficulty

**Goal:** create fair, scalable opponents.

Implementation:

- Implement perception, navigation graph, state machine, threat selection, pickup use, and weapon-aware tactics.
- Implement all five difficulty profiles.
- Add AI allies for team modes.
- Add smoke visibility blocking and sound perception.
- Add bot debug overlay available only in development.
- Add deterministic simulation seeds for repeatable AI tests.

Acceptance gate:

- Bots navigate all Outpost Kilo platforms without teleporting.
- Bots stop tracking through walls.
- Difficulty simulation metrics increase monotonically.
- Recruit remains intentionally forgiving.
- Flashpoint remains difficult without impossible reaction or aim values.

**Playable build:** Bot Challenge Alpha 0.4.

### Phase 4: Map Pipeline and First Four Maps

**Goal:** establish scalable map production and environmental variety.

Implementation:

- Integrate Tiled loader and layer validation.
- Convert Outpost Kilo to Tiled.
- Build Drydock 12, Ember Foundry, and Canopy Ruins.
- Implement moving platforms, kill zones, conveyors, vents, and breakable bridges.
- Add map selection and preview images.
- Add per-map ambience, lighting, and parallax profiles.
- Validate navigation and spawn safety for every map.

Acceptance gate:

- Four maps support Quick Deathmatch and Team Deathmatch.
- Each map has a distinct hazard or movement mechanic.
- No spawn point is immediately exposed to unavoidable enemy fire.
- Desktop and mobile performance remain within budget.

**Playable build:** Map Tour Alpha 0.5.

### Phase 5: Game Modes and Progression

**Goal:** create replayability without story content.

Implementation:

- Add Team Deathmatch, Survival, Gun Ladder, Control Point, and Training Range.
- Add rank, unlocks, mastery, perks, and versioned local saves.
- Add mode selection, difficulty selection, loadout, and results screens.
- Add local records and challenge tracking.
- Add save export, import, and reset.

Acceptance gate:

- Every mode reaches a result state and supports rematch.
- Progression survives browser restart.
- Corrupt save data falls back safely.
- Training metrics match unit-tested weapon values.

**Playable build:** Feature Beta 0.6.

### Phase 6: Production Graphics and Effects

**Goal:** replace prototype visuals with a coherent, polished art set.

Implementation:

- Create full character animation sheets.
- Create distinct production weapon art.
- Create tilesets, painted backgrounds, props, and hazards for the first four maps.
- Implement lighting profiles, weather, reflections, impact effects, and post-processing.
- Add graphics quality presets and automatic selection.
- Add camera lead, shake settings, and reduced-motion behavior.
- Replace every temporary generated sprite used in production gameplay.

Acceptance gate:

- No temporary placeholder assets remain in the first four maps.
- Characters and projectiles remain readable during maximum combat load.
- Low mode meets the mobile budget.
- Visual regression screenshots are approved for every map and viewport.

**Playable build:** Visual Beta 0.7.

### Phase 7: Remaining Maps and Content Completion

**Goal:** complete launch content.

Implementation:

- Build Frost Relay, Neon Underpass, Sky Fortress, and Blacksite Zero.
- Implement ice, whiteout, trains, service doors, wind, low gravity, lifts, and rotating hazard cycles.
- Finish all weapon, pickup, hazard, and map audio.
- Add map-specific bot navigation behavior.
- Add remaining unlock and mastery requirements.

Acceptance gate:

- All eight maps support their listed modes.
- Every map passes layer, spawn, navigation, and performance validation.
- All launch weapons and grenades have production assets.
- All progression unlocks are obtainable.

**Playable build:** Content Complete 0.8.

### Phase 8: Accessibility, Performance, and QA

**Goal:** prepare a stable release candidate.

Implementation:

- Complete remapping, gamepad support, left-handed touch layout, safe-area support, colorblind palettes, and audio controls.
- Profile and optimize object pools, draw calls, texture memory, audio voices, and bundle splitting.
- Complete unit, integration, browser, and visual regression suites.
- Run difficulty simulations and weapon balance tests.
- Test Chrome, Edge, Firefox, Android Chrome, and iOS Safari where available.
- Add privacy, credits, licenses, and version display.

Acceptance gate:

- All automated checks pass.
- No severity-1 or severity-2 bugs remain.
- No uncaught browser errors occur in a 30-minute soak test.
- Performance meets the minimum budgets.
- Save import/export and migration are verified.

**Playable build:** Release Candidate 0.9.

### Phase 9: Launch

**Goal:** produce the first public single-player release.

Implementation:

- Freeze content and balance values.
- Generate production build with source maps stored separately.
- Verify cache headers and asset hashing.
- Publish release notes and known limitations.
- Verify the deployed build, not only the local build.
- Tag version `1.0.0`.

Acceptance gate:

- Deployment serves the exact tested commit.
- A fresh browser can load, play, save, reload, and complete a match.
- All eight maps and six modes are available according to unlock rules.
- Multiplayer is clearly marked as not included; do not show a nonfunctional menu item.

**Playable build:** Flashfire 1.0.

---

## 21. Multiplayer-Later Constraints

Do not implement multiplayer in the phases above. The following architecture rules must be followed now so multiplayer can be added later:

- Simulation accepts timestamped input commands.
- Every actor and projectile has a stable ID.
- Randomness uses explicit seeds.
- Weapon configuration is shared data, not UI state.
- Match results come from `MatchSystem`, not DOM counters.
- Rendering reads simulation snapshots.
- Local player input is represented using the same command shape future remote inputs will use.
- Avoid browser-time APIs inside pure gameplay calculations.
- Do not promise deterministic Phaser Arcade Physics across machines; future multiplayer should use an authoritative server and reconciliation.

Future multiplayer phase will require:

- Authoritative Node.js game server
- WebSocket transport
- Snapshot interpolation
- Client prediction and reconciliation
- Lag compensation for projectile validation
- Matchmaking and lobby services
- Authentication and moderation
- Anti-cheat and server-side rate limiting

These features are intentionally outside Flashfire 1.0.

---

## 22. AI Coding Agent Execution Rules

An AI agent implementing this specification must follow these rules:

1. Read this entire file and the current source before editing.
2. Work on one phase at a time.
3. Keep the game playable after each implementation unit.
4. Do not replace working systems with mock buttons or placeholder screens.
5. Do not copy Mini Militia or another game's assets, maps, names, UI, or code.
6. Put balance values in typed content modules.
7. Add tests in the same change that introduces new simulation behavior.
8. Run `pnpm check` before declaring an implementation unit complete.
9. Run Playwright on desktop and mobile viewports for every UI or control change.
10. Inspect screenshots, not only test exit codes.
11. Validate continuous gameplay over several seconds, not only initial canvas rendering.
12. Report local checks, browser checks, deployment checks, and unavailable external checks separately.
13. Never claim multiplayer support before an authoritative server exists.
14. Never claim production graphics while placeholder assets remain.
15. Do not silently change balance values outside this document; update the balance table when intentional tuning is approved.

### 22.1 Required completion report per phase

```text
Phase:
Playable build version:
Implemented:
Source files changed:
Assets added or replaced:
Automated checks:
Desktop browser verification:
Mobile browser verification:
Performance measurements:
Known limitations:
Next phase prerequisites:
```

---

## 23. Definition of Done for Flashfire 1.0

Flashfire 1.0 is complete only when all statements below are true:

- The product is branded Flashfire everywhere.
- A new player can begin a match within two interactions.
- All six game modes are playable to completion.
- All eight maps load and provide distinct mechanics.
- All listed guns and grenades are functional and visually distinct.
- All five difficulty settings use verified bot profiles.
- Progression, unlocks, mastery, and settings persist locally.
- Desktop, touch, and gamepad controls work.
- Production graphics replace prototype placeholders.
- Audio, effects, UI, accessibility, and quality settings are complete.
- Unit, integration, browser, and content validation tests pass.
- Performance meets defined minimums.
- The deployed build matches the tested release commit.
- Online multiplayer is not represented as implemented.

---

## 24. Recommended First Implementation Task

Begin with **Phase 0 only**:

1. Rename visible branding from Skyfire Arena to Flashfire.
2. Add the TypeScript and test toolchain without changing behavior.
3. Capture baseline desktop and mobile match screenshots.
4. Add a minimal automated smoke test for menu, match start, firing, and HUD visibility.
5. Verify `pnpm check` and the local playable URL.

Do not add the full weapon roster before the modular combat foundation in Phase 1 is complete. Adding content to the current monolith would increase rework and make future AI implementation less reliable.

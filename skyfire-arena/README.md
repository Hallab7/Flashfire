# Skyfire Arena

An original browser-based 2D jetpack deathmatch prototype inspired by the fast arena movement of games such as Mini Militia. It uses original branding, artwork, maps, characters, and sound effects.

## Play

```powershell
pnpm install
pnpm dev
```

Open the local URL printed by Vite.

## Controls

- `A` / `D`: move
- `W` or `Space`: jetpack
- Mouse: aim and fire
- `R`: reload
- `G`: grenade
- `1`, `2`, `3`: switch between acquired weapons
- Touch devices: left stick moves and activates the jetpack; right stick aims and fires

## Match

The first side to 12 eliminations wins. The match ends after three minutes if neither side reaches the score limit. Weapon, health, and fuel pickups respawn during the match.

## Assets

Run `scripts/generate_assets.py` with Pillow to rebuild the original raster assets in `public/assets`.

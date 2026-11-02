# The Journey: 2D pixel Game Mode

Implementation guide: `Revs_Portfolio_GDD.md`. The existing portfolio and 3D archive remain available.

## Play

Run `npm run dev`, open the local URL, and select **Game Mode** in the header.

- Walk with WASD or arrow keys; press E or Space near anything with a gold marker.
- Click or tap open floor to walk there. Clicking an object finds a reachable approach cell and opens its notes after entering range.
- Touch screens also have a direction pad. Hold a direction to walk; release to stop.
- Five header destinations and **Route map** jump directly to any carriage. **Skip tutorial & board** starts inside the train.
- Escape closes a detail dialog; Escape in the world returns to the site. **Read portfolio** exits at any time.
- Sound starts muted. The sound button explicitly enables a quiet synthesized ambience, rail clatter, footsteps, and a boarding whistle.
- Everything you open earns a stamp on the ticket counter. Stamps are a keepsake in local storage and never restrict content. A cat and a few passengers answer with small speech bubbles.

## Structure

`GamifiedPortfolio.tsx` mounts only on entry. Its effect dynamically imports `pixel/engine.ts`, which loads Phaser and the landscape. The scene flow is Boot → Preload → Station → Train, with a persistent UI overlay that paints the vignette and the pixel dissolve between scenes. The train is one continuous 16-pixel tile grid. Arcade Physics uses a hidden tilemap collision layer generated from the same grid that A* reads.

Interactions have IDs, type, position, range, payload ID, and optional target scene. All gameplay interactions check range immediately before activation. Distant object selection routes to a reachable in-range floor cell; blocked routes cancel with a useful status message. Keyboard and touch input cancel click routes. Diagonal movement is normalized.

React owns native HTML detail dialogs, keyboard focus, the floating HUD over the full-screen canvas, area title banners, quick navigation, and the exit action. Opening a dialog clears movement and pauses gameplay. Tab remains within Game Mode; native dialogs trap focus and handle Escape. Background tabs stop movement and mute audio. Cleanup destroys the Phaser game, observer, audio context, timers, and React listeners. Visited flags in local storage are optional and never restrict content.

The shared education, experience, and skill data comes from the existing CV and portfolio. Projects retain the original portfolio's descriptions, technology tags, images, and repository access behavior. `GameProject.liveLink` supports a live demo when a verified URL is provided; no demo URLs were invented.

The regular page includes the same education, experience, and skill data. Projects, certifications, contact details, CV, and archive documents can all be read without gameplay.

## Graphics and desktop framing

The canvas fills the screen and the HUD floats over it as small chips. Whole-number camera zoom keeps every art pixel the same size; only short windows fall back to a fraction.

The station is a wide platform in front of a side-on train with a locomotive, under the dusk panorama with a little parallax. Lamps, string lights, drifting clouds, birds, fireflies, and steam add life, and the door opens as you approach.

Each carriage has its own wall color, floor pattern (planks, tile, or parquet), wall art, and furniture, painted once into a cached 384 × 312 texture. Moving scenery is drawn as a small tiling sprite over each baked window pane, so the carriage bitmap stays opaque and a missing panorama still leaves a usable window. Outside, the horizon, fields, and track scroll at different speeds so the train feels under way.

In-world text uses a built-in 5 × 7 bitmap font. Prompts appear as speech bubbles only near or under the pointer, so markers replace the permanent labels. Reduced motion turns off scrolling, particles, idle animation, and the dissolve.

Five carriage textures plus the shared connector use about 2.4 MiB of raw RGBA pixels. Measured at about 72 frames per second on an NVIDIA RTX 2060 at 1280 × 800; integrated graphics and phones have not been measured.

On desktop, camera zoom fits the complete carriage and follows the player horizontally. Phones retain the closer camera that follows both axes.

## Validation

`npm run test:game` runs 17 tests against the actual world, navigation, and texture painters: connections in both directions between every carriage, every object's reachable approach, solid props and walls, obstacle avoidance, unreachable destinations, corner cutting, range boundaries, six project terminals, normalized movement, large-object hit targets, desktop framing, opacity with missing scenery, and cached texture memory limits.

TypeScript, targeted ESLint, and the production build are separate checks. 
Browser verification covers the station, all five carriage interiors, click-to-walk with automatic interaction, boarding through the door, closing a dialog with Escape, and an emulated 375 × 812 phone layout. Real-device QA is still required; iPhone Safari and Android Chrome have not been tested.

Manual checks to complete on desktop, **iPhone Safari**, and **Android Chrome**:

1. Enter, dismiss/skip the tutorial, board from the station, and walk between every carriage.
2. Hold a direction into a wall or desk; verify that the player stays outside the solid object.
3. Tap behind furniture and tap distant terminals; verify routing and automatic interaction in range.
4. Open a dialog while walking; check movement stops, Tab remains in the dialog, and Escape closes it.
5. Enable/mute sound, switch tabs, and return; sound must stay muted after leaving the tab.
6. Exit/reopen several times; check one canvas, working controls, and no repeated interactions.
7. Rotate the device, use the direction pad, and test with reduced motion enabled.
8. Confirm the regular site does not fetch Phaser or `/game/countryside.webp` before entering Game Mode.

Asset generation details and the exact ImageGen prompt are in `public/game/ASSETS.md`.

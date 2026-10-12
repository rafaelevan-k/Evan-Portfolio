# The Journey: 2D pixel Game Mode

Implementation guide: `Revs_Portfolio_GDD.md`. The existing portfolio and 3D archive remain available.

## Play

Run `npm run dev`, open the local URL, and select **Game Mode** in the header.

- Walk with WASD or arrow keys; press E near a labeled object.
- Click or tap open floor to walk there. Clicking an object finds a reachable approach cell and opens its notes after entering range.
- Touch screens also have a direction pad. Hold a direction to walk; release to stop.
- Five header destinations and **Route map** jump directly to any carriage. **Skip tutorial & board** starts inside the train.
- Escape closes a detail dialog; Escape in the world returns to the site. **Read portfolio** exits at any time.
- Sound starts muted. The sound button explicitly enables a quiet synthesized ambience.

## Structure

`GamifiedPortfolio.tsx` mounts only on entry. Its effect dynamically imports `pixel/engine.ts`, which loads Phaser and the landscape. The scene flow is Boot → Preload → Station → Transition → Train, with a persistent UI overlay. The train is one continuous 16-pixel tile grid. Arcade Physics uses a hidden tilemap collision layer generated from the same grid that A* reads.

Interactions have IDs, type, position, range, payload ID, and optional target scene. All gameplay interactions check range immediately before activation. Distant object selection routes to a reachable in-range floor cell; blocked routes cancel with a useful status message. Keyboard and touch input cancel click routes. Diagonal movement is normalized.

React owns native HTML detail dialogs, keyboard focus, quick navigation, and the exit action. Opening a dialog clears movement and pauses gameplay. Tab remains within Game Mode; native dialogs trap focus and handle Escape. Background tabs stop movement and mute audio. Cleanup destroys the Phaser game, observer, audio context, timers, and React listeners. Visited flags in local storage are optional and never restrict content.

The shared education, experience, and skill data comes from the existing CV and portfolio. Projects retain the original portfolio's descriptions, technology tags, images, and repository access behavior. `GameProject.liveLink` supports a live demo when a verified URL is provided; no demo URLs were invented.

The regular page includes the same education, experience, and skill data. Projects, certifications, contact details, CV, and archive documents can all be read without gameplay.

## Graphics and desktop framing

The TrainScene has an opaque background. Scenery is baked only into the window panes; it cannot repeat vertically or show through gaps between carriages. The station uses one aspect-preserving landscape image instead of a repeating tile sprite.

Each carriage's floor, paneling, brass trim, woven runner, baked shadows, and window scenery is painted once into a cached 384 × 280 texture. Furnishings and characters have small extra pixel highlights and shading. Five carriage textures plus the shared connector use about 2.1 MiB of raw RGBA pixels. The interior shell uses 15 scene objects instead of the earlier 65, with no per-frame scenery updates, shaders, dynamic lighting, or particle effects. These are resource counts, not an FPS benchmark.

On desktop, camera zoom fits the complete carriage beneath the location bar and follows the player horizontally. Phones retain the closer camera that follows both axes. The walkability grid, collision bodies, and interaction ranges are unchanged.

## Validation

`npm run test:game` runs 17 tests against the actual world, navigation, and texture painters: connections in both directions between every carriage, every object's reachable approach, solid props and walls, obstacle avoidance, unreachable destinations, corner cutting, range boundaries, six project terminals, normalized movement, large-object hit targets, desktop framing, opacity with missing scenery, and cached texture memory limits.

TypeScript, targeted ESLint, and the production build are separate checks. The panorama, twelve traveler frames, and eighteen furnishing textures were rendered for visual asset review. The local page returned HTTP 200.

Desktop Chrome visual verification now covers station scenery, complete framing and quick navigation for all five carriage interiors, click-to-walk with automatic profile interaction, and closing that dialog with Escape. A full browser playthrough, real-device QA, and an FPS benchmark are still required; iPhone Safari and Android Chrome have not been tested.

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

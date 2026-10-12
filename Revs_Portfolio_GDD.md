# Revs Portfolio: The Journey — Game Design Document
Version: 1.0 | Platform: Desktop and mobile web | Genre: 2D top-down pixel-art exploration

## Vision
Visitors board a pixel-art train and explore a developer's portfolio by walking through themed carriages. No combat, mandatory quests, login, or locked content. Traditional portfolio pages remain accessible.

## Player experience
- Session target: 3–5 minutes for a full tour.
- Desktop: WASD/arrow keys, E to interact, mouse click to move or select, Escape to dismiss.
- Mobile: tap-to-move and tap-to-interact, optional virtual joystick; 44px+ touch targets.
- Support reduced motion, mute, skip tutorial, quick navigation, and accessible HTML alternative.

## Scene flow
BootScene -> PreloadScene -> StationScene -> TransitionScene -> TrainScene. UIScene overlays active world scenes. React owns detail dialogs and navigation; Phaser owns game simulation.

## StationScene
Spawn on platform. Conductor NPC teaches movement and interaction. Interact with train entrance to transition. Signboard opens quick navigation.

## TrainScene
A single continuous horizontal tilemap for five themed carriages: About, Projects, Experience, Skills, Contact. Connected passages remain walkable; no mandatory sequence.
- About: profile desk, story panels, education and introduction.
- Projects: interactive computer terminals with description, stack, images, GitHub and live-demo links.
- Experience: timeline wall, NPC conversations and role details.
- Skills: technology shelves and category displays.
- Contact: CV, email, social links and return-to-site action.

## Visual direction
16-bit inspired warm railway atmosphere; 16x16 or 32x32 tile grid, consistent sprite scale, crisp nearest-neighbor sampling, readable high-contrast UI, layered scenery and gentle parallax outside windows. Respect reduced-motion preferences.

## Mechanics
- Four-directional walking, normalized diagonal speed, idle/walk animations.
- Arcade Physics for simple wall/object collision, with map collision layers.
- Interaction object metadata: id, type, x, y, range, payloadId, optional targetScene.
- Proximity prompt; E and pointer interaction.
- Tap-to-move routes via A* on walkability grid, replanning or cancelling if blocked.
- On tapping a distant interactable, path to nearest reachable adjacent cell then interact when within range.
- Input priority: HTML modal > game UI > gameplay; opening modal stops movement and clears path.
- Camera follows player with bounded scroll and pixel-rounding.
- Optional saved visited-carriage flags, never a content gate.

## Acceptance criteria
1. Every content section accessible without gameplay via normal website.
2. All five carriages reachable on desktop and mobile.
3. Player cannot pass through solid tiles.
4. Tap-to-move avoids static obstacles and fails gracefully when destination unreachable.
5. Interactions never trigger outside configured range.
6. Detail panels are keyboard accessible and close reliably.
7. Audio is muted by default until user interaction or explicitly enabled.
8. Game assets lazy-load only when entering Game Mode.
9. Game can be exited and reopened without duplicate event listeners.
10. Real-device testing includes iPhone Safari and Android Chrome.

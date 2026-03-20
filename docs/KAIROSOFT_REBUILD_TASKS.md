# KAIROSOFT GAME DEV STORY - REBUILD TASK LIST
**Project:** Agent Office Visual Overhaul  
**Style:** Authentic Kairosoft Game Dev Story  
**Goal:** Pixel-perfect isometric office with animated workers

---

## 📋 TASK OVERVIEW

| Task ID | Component | Priority | Est. Time |
|---------|-----------|----------|-----------|
| KAIRO-01 | Isometric Grid System | P0 | 2h |
| KAIRO-02 | Floor Tiles & Textures | P0 | 1h |
| KAIRO-03 | Wall System & Windows | P0 | 2h |
| KAIRO-04 | Office Furniture (Desks) | P0 | 3h |
| KAIRO-05 | Office Furniture (Chairs) | P0 | 2h |
| KAIRO-06 | Office Props (Plants, Whiteboard, Cabinets) | P1 | 2h |
| KAIRO-07 | Vending Machine & Decor | P1 | 1h |
| KAIRO-08 | Meebit Worker Sprites (Static) | P0 | 3h |
| KAIRO-09 | Meebit Worker Animations (Walking) | P0 | 4h |
| KAIRO-10 | Meebit Worker Animations (Working) | P0 | 3h |
| KAIRO-11 | Speech Bubble System | P0 | 2h |
| KAIRO-12 | Stats HUD (Fans, Budget, Hype) | P0 | 2h |
| KAIRO-13 | Visual Effects (Hearts, Stars, Fire) | P1 | 3h |
| KAIRO-14 | Worker Pathfinding & Movement | P1 | 4h |
| KAIRO-15 | Room Types & Zones | P2 | 3h |
| KAIRO-16 | Sound Effects & Audio | P3 | 2h |
| KAIRO-17 | Save/Load Office State | P3 | 2h |

---

## 🔴 KAIRO-01: Isometric Grid System (P0)

### Description
Create proper isometric projection system for the office layout.

### Requirements
- [ ] 20x20 isometric tile grid
- [ ] Proper isometric math (rotateX 60°, rotateZ -45°)
- [ ] Click-to-tile coordinate conversion
- [ ] Tile highlight on hover
- [ ] Z-index layering for depth

### Technical Specs
```javascript
// Isometric conversion
function toIso(x, y) {
  return {
    isoX: (x - y) * tileWidth / 2,
    isoY: (x + y) * tileHeight / 2
  };
}
```

### Acceptance Criteria
- Grid renders correctly in isometric view
- Clicking tiles selects correct coordinates
- Depth sorting works properly

---

## 🔴 KAIRO-02: Floor Tiles & Textures (P0)

### Description
Create authentic wooden floor tile system with Kairosoft-style textures.

### Requirements
- [ ] 4 variations of wooden floor tiles
- [ ] Light/dark alternating pattern
- [ ] Tile connection edges
- [ ] Shadow under walls
- [ ] Carpet areas for different zones

### Assets Needed
- floor_wood_light.png
- floor_wood_dark.png
- floor_carpet.png
- floor_shadow.png

### Acceptance Criteria
- Floor tiles align perfectly in isometric grid
- No visible seams between tiles
- Proper shading and depth

---

## 🔴 KAIRO-03: Wall System & Windows (P0)

### Description
Build wall system with proper depth and window placement.

### Requirements
- [ ] Back wall with wooden texture
- [ ] Left wall (partial - isometric view)
- [ ] 3 windows with sky gradient
- [ ] Window frames and crossbars
- [ ] Wall shadows on floor
- [ ] Doorway/entrance

### Assets Needed
- wall_wood.png
- window_sky.png
- window_frame.png
- door_frame.png

### Acceptance Criteria
- Walls align with floor grid
- Windows show animated sky (optional)
- Proper depth sorting with furniture

---

## 🔴 KAIRO-04: Office Furniture - Desks (P0)

### Description
Create individual office desks with computers.

### Requirements
- [ ] 6 individual desks
- [ ] Desk sprite with depth (front, top, side visible)
- [ ] Computer monitor with glow
- [ ] Keyboard and mouse
- [ ] Papers/documents on desk
- [ ] Desk shadow on floor

### Assets Needed
- desk_base.png
- desk_computer.png
- desk_papers.png
- desk_shadow.png

### Technical Specs
```css
.desk {
  width: 80px;
  height: 60px;
  transform: rotateX(60deg) rotateZ(-45deg);
  /* Isometric sprite sheet */
}
```

### Acceptance Criteria
- Desks sit properly on floor tiles
- Computer monitor has subtle glow animation
- Workers can "sit" behind desks

---

## 🔴 KAIRO-05: Office Furniture - Chairs (P0)

### Description
Create office chairs that workers can sit in.

### Requirements
- [ ] Office chair sprite (back view)
- [ ] Chair animation (swivel slightly)
- [ ] Chair positioning relative to desk
- [ ] Empty chairs when workers away

### Assets Needed
- chair_office.png
- chair_shadow.png

### Acceptance Criteria
- Chairs align with desks
- Workers appear to sit in chairs
- Chairs have subtle idle animation

---

## 🟡 KAIRO-06: Office Props (P1)

### Description
Add decorative office props for atmosphere.

### Requirements
- [ ] Whiteboard with "Tasks!" text
- [ ] 2 Potted plants
- [ ] 2 Filing cabinets
- [ ] Wall clock
- [ ] Trash can
- [ ] Coffee maker

### Assets Needed
- prop_whiteboard.png
- prop_plant.png
- prop_cabinet.png
- prop_clock.png
- prop_trash.png

### Acceptance Criteria
- Props add visual interest
- Proper depth sorting
- Interactive on click (optional)

---

## 🟡 KAIRO-07: Vending Machine & Decor (P1)

### Description
Add Kairosoft-style vending machine and wall decorations.

### Requirements
- [ ] Vending machine with drinks
- [ ] Poster on wall
- [ ] Trophy shelf
- [ ] Motivational sign

### Assets Needed
- prop_vending.png
- deco_poster.png
- deco_trophy.png

### Acceptance Criteria
- Props fit Kairosoft aesthetic
- Workers can "use" vending machine (animation)

---

## 🔴 KAIRO-08: Meebit Worker Sprites - Static (P0)

### Description
Create static sprite system for Meebit workers at desks.

### Requirements
- [ ] 6 Meebit sprites (one per agent)
- [ ] Back-facing view (sitting at desk)
- [ ] Side-facing view (walking)
- [ ] Front-facing view (talking)
- [ ] Proper scaling for isometric view

### Assets Needed
- meebit_nexus_back.png
- meebit_glasses_back.png
- meebit_quill_back.png
- meebit_pixel_back.png
- meebit_gary_back.png
- meebit_sentry_back.png

### Technical Specs
```javascript
const meebitSprites = {
  nexus: {
    back: 'url(...)',
    side: 'url(...)',
    front: 'url(...)'
  }
};
```

### Acceptance Criteria
- All 6 Meebits visible at desks
- Sprites match agent colors/themes
- Proper isometric scaling

---

## 🔴 KAIRO-09: Meebit Worker Animations - Walking (P0)

### Description
Create walking animation system for Meebits.

### Requirements
- [ ] 4-frame walking animation
- [ ] Pathfinding between points
- [ ] Smooth movement across tiles
- [ ] Direction facing (8 directions)
- [ ] Walking speed variation

### Assets Needed
- meebit_walk_cycle.png (sprite sheet)

### Technical Specs
```javascript
function animateWalk(start, end) {
  // Interpolate position over time
  // Update sprite frame every 200ms
}
```

### Acceptance Criteria
- Workers walk smoothly between desks
- Animation loops correctly
- Proper z-index during movement

---

## 🔴 KAIRO-10: Meebit Worker Animations - Working (P0)

### Description
Create "working hard" animations for seated workers.

### Requirements
- [ ] Typing animation (hands moving)
- [ ] Head bob animation
- [ ] Occasional stretch/yawn
- [ ] Intense mode (faster typing)
- [ ] Sleep animation (low energy)

### Assets Needed
- meebit_typing.png
- meebit_stretch.png
- meebit_sleep.png

### Acceptance Criteria
- Workers look busy at desks
- Animation intensity scales with task priority
- Transitions between states

---

## 🔴 KAIRO-11: Speech Bubble System (P0)

### Description
Create speech bubble system like Kairosoft games.

### Requirements
- [ ] Bubble appears above worker
- [ ] Text: "Work!", "Research!", "Design!", etc.
- [ ] Bubble bounces in (pop animation)
- [ ] Fade out after 2 seconds
- [ ] Multiple bubble styles (work, tired, excited)

### Assets Needed
- bubble_work.png
- bubble_tired.png
- bubble_excited.png

### Acceptance Criteria
- Bubbles appear when workers active
- Proper positioning above heads
- Smooth animations

---

## 🔴 KAIRO-12: Stats HUD (Fans, Budget, Hype) (P0)

### Description
Create top HUD showing office stats like Kairosoft games.

### Requirements
- [ ] Budget display ($XX,XXX)
- [ ] Fans count
- [ ] Hype meter
- [ ] Current date
- [ ] Animated stat changes
- [ ] Pixel font styling

### Technical Specs
```css
.hud-stat {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  color: #FFD700;
  text-shadow: 2px 2px 0 #000;
}
```

### Acceptance Criteria
- Stats update in real-time
- Visual feedback when stats change
- Authentic Kairosoft styling

---

## 🟡 KAIRO-13: Visual Effects (P1)

### Description
Add particle effects and visual feedback.

### Requirements
- [ ] Hearts (when worker happy)
- [ ] Stars (when task complete)
- [ ] Zzz (when tired)
- [ ] Fire/sparks (when working hard)
- [ ] Level up effect

### Assets Needed
- fx_heart.png
- fx_star.png
- fx_zzz.png
- fx_fire.png

### Technical Specs
```javascript
function createParticle(type, x, y) {
  // Spawn particle at position
  // Animate upward
  // Fade out
}
```

### Acceptance Criteria
- Effects spawn at appropriate times
- Smooth animations
- Don't obstruct gameplay

---

## 🟡 KAIRO-14: Worker Pathfinding & Movement (P1)

### Description
Create system for workers to move around office.

### Requirements
- [ ] Workers walk to different desks
- [ ] Bathroom breaks (walk to door)
- [ ] Vending machine visits
- [ ] Meeting table gatherings
- [ ] Avoid obstacles (collision detection)

### Technical Specs
```javascript
function findPath(start, end) {
  // A* pathfinding
  // Return array of tile coordinates
}
```

### Acceptance Criteria
- Workers move naturally around office
- No walking through walls/furniture
- Idle behavior when not working

---

## 🟢 KAIRO-15: Room Types & Zones (P2)

### Description
Add different functional zones to office.

### Requirements
- [ ] Development zone (desks with computers)
- [ ] Meeting area (table + chairs)
- [ ] Break room (couch + vending)
- [ ] Boss office (separate room)
- [ ] Floor color indicates zone

### Acceptance Criteria
- Visual distinction between zones
- Workers prefer appropriate zones
- Zone-specific activities

---

## 🟢 KAIRO-16: Sound Effects (P3)

### Description
Add Kairosoft-style audio.

### Requirements
- [ ] Typing sounds
- [ ] Notification "ding"
- [ ] Background office ambience
- [ ] Footstep sounds
- [ ] UI click sounds

### Assets Needed
- sfx_typing.wav
- sfx_ding.wav
- sfx_footstep.wav

### Acceptance Criteria
- Audio enhances experience
- Volume controls
- Can be muted

---

## 🟢 KAIRO-17: Save/Load Office State (P3)

### Description
Save office layout and worker positions.

### Requirements
- [ ] Save to localStorage
- [ ] Worker positions
- [ ] Desk assignments
- [ ] Stats history
- [ ] Export/import JSON

### Acceptance Criteria
- Office state persists
- Can share office layouts
- Reset to default option

---

## 📊 IMPLEMENTATION ORDER

### Phase 1 (Week 1)
1. KAIRO-01: Isometric Grid
2. KAIRO-02: Floor Tiles
3. KAIRO-03: Walls & Windows
4. KAIRO-04: Desks
5. KAIRO-05: Chairs

### Phase 2 (Week 1-2)
6. KAIRO-08: Meebit Sprites
7. KAIRO-10: Working Animation
8. KAIRO-11: Speech Bubbles
9. KAIRO-12: Stats HUD

### Phase 3 (Week 2)
10. KAIRO-09: Walking Animation
11. KAIRO-06: Office Props
12. KAIRO-13: Visual Effects

### Phase 4 (Week 3)
13. KAIRO-14: Pathfinding
14. KAIRO-07: Vending Machine
15. KAIRO-15: Room Zones

### Phase 5 (Optional)
16. KAIRO-16: Sound
17. KAIRO-17: Save/Load

---

## 🎯 SUCCESS CRITERIA

- [ ] Looks like authentic Kairosoft Game Dev Story
- [ ] 6+ Meebit workers visible and animated
- [ ] Proper isometric depth sorting
- [ ] Speech bubbles appear above workers
- [ ] Stats HUD matches Kairosoft style
- [ ] Workers move and interact naturally
- [ ] Runs at 60fps

---

**Total Tasks: 17**  
**Estimated Development: 3 weeks**  
**Assigned to: Pixel (Design) + Nexus (Code)**

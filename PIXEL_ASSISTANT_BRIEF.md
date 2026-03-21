# PIXEL ASSISTANT AGENT - FURNITURE SPRITE GENERATOR

## Mission
Generate Kairosoft-style furniture sprites for Agent Office using DALL-E 3.

## API Key Location
API key stored securely in environment: `OPENAI_API_KEY`
(Do not commit API keys to repo - use env variable)

## Furniture Needed (32x32 or 64x64 pixel art)

### PRIORITY 1 (P0 - Critical)
1. **Individual Desk** - Wood texture, computer monitor, papers
2. **Office Chair** - Swivel chair, 4 directions (front, back, left, right)
3. **Commander Desk** - Larger executive desk
4. **Wood Floor Tile** - Warm wood planks pattern

### PRIORITY 2 (P1 - High)
5. **Meeting Table** - Large oval conference table
6. **Conference Chair** - Professional office chair
7. **Whiteboard** - With "TASKS!" text visible
8. **Potted Plant** - Small desk plant
9. **Filing Cabinet** - 2-drawer cabinet

## Style Guide
- **Style:** Kairosoft Game Dev Story pixel art
- **Colors:** Warm wood tones (#C4A77D, #8B6914, #5C4033)
- **Perspective:** Isometric (top-down with depth)
- **Lighting:** Top-left light source
- **Format:** PNG with transparency
- **Size:** 64x64 pixels per sprite

## DALL-E Prompts Template
```
"Kairosoft Game Dev Story style pixel art sprite, [ITEM DESCRIPTION], 
64x64 pixels, isometric view, warm wood tones, transparent background, 
video game asset, pixel perfect"
```

## Output Location
Save all generated sprites to:
`/root/.openclaw/workspace/mission-control-v2/assets/furniture/`

## Naming Convention
- desk_01.png, desk_02.png, etc.
- chair_front.png, chair_back.png, chair_left.png, chair_right.png
- floor_wood.png
- meeting_table.png
- whiteboard.png
- plant_01.png
- cabinet.png

## Report To
Report completion to Nexus with sprite count and file locations.
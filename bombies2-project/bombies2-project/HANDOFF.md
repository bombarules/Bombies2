# Bombies 2 — project handoff

Bombies 2 is a fresh base built from Bombies 5.6. The new work starts with real textured models from the owner's asset packs.

Start a new chat, upload this zip, and say: "Here is my Bombies project. Read HANDOFF.md and continue from there."

## What Bombies is
A mobile-first 3D zombie survival shooter (formerly "Shot Bomba: Outbreak") that runs in the browser with three.js r128, plus an Android app and a GitHub Pages copy. The hero is the owner's likeness (BombaRules): man in his 40s, charcoal pinstripe suit over a black shirt, long dark beard with gray, black sunglasses, slicked-back hair.

- Bombies 2 game link: https://claude.ai/artifact/3Wzndr2WHTbiCb8qLnE8N4
- Old Bombies 5.6 link (left unchanged): https://claude.ai/artifact/Fa49f1M4nrQW9R6TVCoeCA
- GitHub Pages: https://bombarules.github.io/bombies/
- Android package: com.shotbomba.outbreak, app name "Bombies", version 6.1 (versionCode 45), debug-signed
- Kids game (separate): web/shot-bomba-kids.html (raccoon Bomba throwing food at ghosts)

## Folder map
- src/core1.js — renderer, textures, geometry helpers (mergeParts, P_, M, cyl)
- src/core2.js — character builder: bodies, faces, 12 face blendshapes, hands/poses, hair shells and strands, beard, burn shader
- src/world.js — maps: Washington Park (lake with planar reflections, boathouse, geese, cars) and the parking garage; Dead Zone flooding and emergency lights; reflection rendering
- src/ar_model.js — the AR-15 rifle: mesh from sm_rifle.fbx (quantized, base64) plus Rifle_Olive base color, normal (Unity/OpenGL) and occlusion-roughness-metal maps at 1024 px, all embedded
- src/qbz_model.js — the QBZ-191 rifle from qbz-191-free (OBJ): body and magazine materials, each with base color, normal and roughness/metal maps (1024 px body, 512 px magazine), embedded
- src/tacgear.js — tactical gear built from parts and attached to bones: high-cut helmet with ear cups, rails and NVG mount, plate carrier with mag pouches, patch and radio, backpack with antenna and orange light, battle belt, knee pads, thigh holster, respirator mask; glowing red zombie eyes (emissive eyes plus additive halo sprite). Gear sets: TAC_HERO, TAC_MATE, ZTAC[0..2]
- src/core3_rest.js — HERO_LOOK, decodeTexModel (shared decoder for the textured rifles), gun models (AR-15 and QBZ-191 textured rifles, pump shotgun, .357 Magnum, RPG-7) with attachment variants and glow-highlight parts, GUNS stats, zombie looks
- src/core4.js — game systems: shooting, damage, explosions, grenades, audio (surround panner), HUD, waves, menus/states, emotions and face animation, hand grips
- src/horde.js — Horde mode: six difficulties, crowd of thousands (one instanced mesh), weapon ladder, unlimited ammo, tank with heavy machine gun and cannon, kill goal
- src/core5.js — main loop, camera, first/third person, view model, movement (sprint, crouch, slide, prone, jump, knee landing), zombie AI (vision cone, hearing, feeding, crowd slots), driving, loadout/mods/character screens, settings pages, controller + Bluetooth gamepad, traps, toxic gas, Dead Zone rules, loading screen hook
- src/template.html — the page shell (HTML, CSS, on-screen controller, BombaRules loading screen). The build script swaps in the joined JavaScript.
- build/assemble.py — joins src/*.js into web/bombies.html (verified to reproduce the published game exactly)
- build/make_offline.py — makes web/github-pages/index.html and android/app/assets/index.html with three.js and the font built in
- web/bombies.html — the current game (what the link shows)
- web/github-pages/ — upload these files to the bombies repository
- android/app/ — apktool project of the Android app (WebView wrapper, native Bombies refresh-rate bridge HzBridge/HzRun, BombaRules Android 12 splash, zombie-bomb icon)
- android/bombies.apk — the current installable app
- assets/ — zombie-bomb icon, BombaRules logo, GameSoul.md (Dead Zone design), Godot porting guide PDF

## How to rebuild
1. Edit files in src/.
2. `python3 build/assemble.py` -> web/bombies.html (publish this to the game link).
3. `python3 build/make_offline.py` -> GitHub Pages and Android copies (needs three@0.128.0 and @fontsource/bebas-neue unpacked in build/vendor/).
4. Android: `java -jar apktool.jar b android/app -o unsigned.apk` then `java -jar uber-apk-signer.jar -a unsigned.apk`. Raise versionCode/versionName in android/app/apktool.yml and AndroidManifest.xml each time so it installs over the old app.

## Features in place
- Maps: Washington Park (default) and parking garage; weather (clear, rain, storm, lightning); day lighting
- Modes: Survival (endless waves), Horde (Just born, Crawling, Walking, Jogging, Running, Running for your life) and Dead Zone (from GameSoul.md: hazmat engineer, flooded garage, wading slowdown and splashes, 3 rounds with time-based mutation, tank Bombies from round 2, win/lose screens)
- Weapons: M21 rifle, pump shotgun, .357 Magnum (thumbs-back two-hand grip), RPG-7 (rocket with smoke trail and backblast). Mods for each; the mods screen shows the gun alone with the selected part glowing orange
- Lethal: frag, Molotov, toxic gas grenade. Traps: proximity mine, shock snare (L1 place, R1 switch)
- Perks: Field Medic, Fast Hands, Steady Aim. Loadout includes a Character slot (outfit, hair, glasses, beard; You or Hazmat engineer)
- Movement: sprint, crouch, slide, drop-to-prone, jump, knee landing, recoil, knockdown by blasts with get-up
- Zombies: 13 looks (originals plus hospital patient, construction worker, nurse, businessman, police officer, firefighter, jogger); wander/investigate/chase/attack/feed, vision cone, hearing, sneak attacks, crowd spacing, limb damage, crawlers, burning, ragdoll-style falls
- Driving two cars with enter animation; flashlight; Alley Shot mini-game
- Settings: Audio (master, music, effects, voice lines, surround), Graphics (Smooth/High/Ultra, FOV 80-120, first/third person, weather, screen Hz, FPS limit), Controls (drift, sensitivity, invert; controller always over the game, Bluetooth on/off, controller pick, right-stick axes, pairing help, controller map with L1/R1/L2/R2), Cheats (god, ammo, one-shot, incendiary, explosive, big heads, speed, slow-mo zombies only, no zombies, ghost)
- On-screen controller: see-through over the game on tall phones and desktop, B bottom / A right, L1/R1 on the top edge; mirrors a Bluetooth controller
- BombaRules loading screen (4 s phone, 3 s desktop)

## Bombies 2 changes
- The M21 is replaced by an AR-15 built from sm_rifle.fbx with the Rifle_Olive PBR maps (MeshStandardMaterial, linear colors to match the rest of the game).
- The mesh is split into body, holo sight, magazine and barrel so the mods glow still works. Optic: Holo sight (default) or 1.5x/3x/5x scopes on the top rail. Barrel: Short, Standard, Suppressor, Light. Magazine: 20 or 30 rounds.
- Hand targets moved to the pistol grip and handguard (HB.rifle in core4.js); aim line set to the holo window center (sight 0.065).
- build/models/ holds the converter: fbx_to_json.js (node, three@0.128.0 FBXLoader) then bake_rifle.py writes src/ar_model.js.
- The file list in build/assemble.py now includes ar_model.js before core3_rest.js.

- Rifle mods now start with a Rifle choice: AR-15 (holo sight) or QBZ-191 (iron sights, longer barrel, +15% damage, slightly slower fire, less spread, a bit more recoil). Loadout lists it as "Assault Rifle".
- QBZ-191: the source magazine sat 1.3 cm off to the side and 1.4 cm low; bake_qbz.py seats it in the magwell. Hand targets and magazine position switch with the model in applyAttachments (core5.js).
- Sight heights: AR holo 0.065, QBZ irons 0.072 (sightX 0.005), magnified scopes use the scope center.
- GitHub: https://github.com/bombarules/Bombies.git (root holds index.html, manifest.json, icons, .nojekyll). Upload the contents of the GitHub zip to replace them.

- New default hero: "Operator in black" (Character slot): the owner's face, beard and shades under a black helmet, black combat shirt and pants, plate carrier, pack, gloves (third person and first-person hands/sleeves). Outfits now save under sb-outfit2 so everyone starts as the operator; "You (BombaRules)" in the suit and the Hazmat engineer are still selectable.
- Gloves: a look's gloves color is used for its hands (core2 buildBodyGeos).
- The rescued survivor ally is now a squad teammate: olive plate carrier and helmet over a blue shirt, olive pants, gloves.
- Three zombie soldier looks (end of ZLOOKS, tac index): olive army with respirator, black ops with respirator and NVG mount, grey SWAT. About 40% of spawned zombies are soldiers (makeZombie in core4.js). Horde mode's instanced crowd is unchanged.
- Two more heroes in the Character slot, from the GameSoul squad concept art:
  - Scarred veteran: gray short hair, stubble, red scars on forehead and cheek, olive uniform and gloves, olive plate carrier with radio, neck gaiter, holster, knee pads (TAC_VET).
  - Street survivor: young, messy dark hair, gray-green hoodie with hood and drawstrings, light chest rig (no plates), holster, knee pads (TAC_SURV).
  - Both are cosmetic for now (same speed and health). First-person sleeves and gloves match each character.
- applyOutfit now also hides the sunglass lenses when glasses are off (older bug: lenses stayed on).
- Special Bombies (tacgear.js, makeZombie/spawnEnemy in core4.js):
  - Armored tank: raw-flesh brute body (spec 'brute') in riveted olive armor: chest and back plates, shoulder pauldrons, bracers, dome helmet with an orange eye slit, back tanks with antenna. Wider and taller; 4x health, slower. Dead Zone from round 2 (18%), Survival from wave 3 (8%).
  - Gaunt runner: bald, gray, thin (spec 'gaunt'); 70% of runners.
  - Toxic spitter (spec 'spitter'): yellow-green skin, glowing yellow bulbs on head and shoulders, slime drips, yellow glowing eyes. From wave 2 (12%, not in Horde). Lobs a glowing glob every 3-5 s from 3.5-17 m: 11 damage on a direct hit, 5 if it splashes at your feet; the head bulb shrinks when it spits and regrows (updateSpitters, called from the main loop).
- Story (owner's bible): Bombies: Dead Zone. Jessa, the former site foreman, leads the squad (veteran, street survivor, hazmat engineer); corporate security locked them in; they only work for each other. Dr. Hale, lead chemical engineer who created the Bombies, stayed behind, taunts them over the intercom, triggers mutations, releases special infected, seals doors, and builds ever-worse Bombies toward the final power station core. Locations in the bible: flooded parking garage, collapsed factory, collapsed overpass, sewer tunnels, power station boss arena.
- Jessa (Character slot "Jessa (squad leader)"): female, olive coveralls, black harness straps, gloves, holster, scar. Picking her sets the Pipe Wrench as primary.
- Pipe Wrench (GUNS.wrench, melee:true): primary or secondary in the loadout. Swing hits up to 2 Bombies within 2.3 m in front (meleeSwing in core4.js), staggers and pushes them back, never needs ammo. Mods: Cord wrap (quicker) or Bare steel (+25% damage, slower). Her jury-rigged weld gun is not built yet.
- Dr. Hale (src/hale.js): intercom panel with a portrait rendered from his 3D model (lab coat, round glasses, slicked gray hair, glowing mutated prosthetic arm, flask of mutagen). Speaks with a low synthetic voice when Voice lines are on; text always shows. Lines: run intro, wave taunts, Jessa-specific taunts, Dead Zone round lines, first tank, first spitter, low health, game over, mid-round mutation surge (Dead Zone, 40 s into a round), and releasing special infected right after a wave is cleared (Survival from wave 3, 40%; Dead Zone 70%).
- Dead Zone round 4 = power station core boss fight (startBossRound): red alarm lighting, blinking warning triangles, a destructible generator core in the middle (blocks the boss's slams when you stand behind it; the boss charging into it stuns him; it explodes when destroyed and hurts the boss if close), three live cables dangling into the flood water that arc on a 7-second cycle (hurt you, stun and burn the boss, kill regular Bombies). Hale's Colossus: giant rebar-fused brute with glowing yellow mutagen cracks and eyes, 260 HP, slam, charge and roar (roar summons spitters and runners), roars at 66% and 33% health. Kill it to win (+5000).
- Intro cinematic (src/intro_video.js, 535 KB H.264): the owner's 5-second video plays before the first Dead Zone run of a session with a BOMBIES / DEAD ZONE title; tap, key or pad button skips.
- Concept picture for the look: dark flooded corridor, black-clad operator, squad, red-eyed zombie soldiers.

## Assets received but not used yet (need the matching 3D model)
- Pistol_* PBR set (4096 px): needs the pistol FBX.
- M1911_low PBR sets, both the Height version and the Unreal version with OcclusionRoughnessMetallic maps (Frame, Slide, Barrel, Grip, Magazine, Ammo): needs the M1911_low FBX or OBJ.
- haracter.mb (Maya 2023, "Modular Casual Soldier" with UE-style skeleton) plus Cap, Shirt_RolledUp_Blue, Bulletproof_Light (Bege), Holster_Hard (Bege), Drops_Tactical (Bege): needs an FBX export with skin and skeleton, plus the Head, Arms, Eye, Jeans textures the scene references.

## Still to do
- Dead Zone: squad switching (military veteran, street survivor), collapsed factory with sealing doors, boss Bombie, special infected; open questions in GameSoul.md
- Photo-based textures (Poly Haven / ambientCG) for a more realistic look
- Test the Bluetooth right-stick detection and every outfit combination on real devices
- Optional: rebuild in Godot (see the guide PDF)

## Working style the owner likes
- Sends phone screenshots with red markups; wants fixes shown on the published link plus a new GitHub zip and Android APK each time
- Plays on Android phone and iPhone (through GitHub Pages added to the home screen) and on a desktop monitor

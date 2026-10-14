# Huck It: Project Plan

_An ultimate frisbee offense trainer. Status: **planning complete**. No code yet. Last updated 2026-10-13._

## 1. Vision

A 2D, top-down ultimate frisbee game that teaches new players **how to play offense**: the rules that matter when you have the disc, and offensive strategy. From above, players can see what's hard to see from the sideline or the field: spacing, open lanes, the force, and how cuts create space.

### Scope: offense only
- **The player is always on offense.** There is no mode where the player controls or plays defense.
- **The CPU always plays defense, mainly person-to-person ("man") marking.** Each defender guards one offensive player, and the marker on the thrower applies a force (forehand or backhand). Its job is to be a realistic, readable opponent, so the lessons can show *why* offensive strategy works against it.
- Defensive ideas come up only as **things the offense has to read and beat** (the force, the marker, a defender trailing a cutter). They are not taught as skills for the player.

### Audience
- **Main audience:** brand-new players, such as college club rookies and high school players.
- **Also:** coaches and captains teaching a practice, who can use the game as a whiteboard that moves.

### What success looks like
After 20–30 minutes with the game, a beginner can explain:
- how a point starts (the pull) and how a goal is scored
- that you can't run with the disc, and how the stall count works
- every way the offense can turn the disc over
- what the force is, and why the offense throws to the open side
- how a vertical stack works, and the difference between an under cut and a deep cut
- when to cut, when to clear, and when to look for the dump

### Project goal
**Learning game development and shipping a useful teaching tool, equally.** Build the core game logic and the canvas drawing ourselves so they're understood well. Use React for what it does well (screens, menus, HUD, settings), and GitHub for hosting and automatic deploys.

---

## 2. Title screen and modes

All three modes are on the title screen. Modes that aren't finished yet show as **"Coming soon"** until they're built (see the build order in section 9).

```
┌─────────────────────────────────────────┐
│               HUCK IT                   │
│    learn ultimate offense, from above   │
│                                         │
│   ▶ Lessons          learn the rules    │
│                      and strategy       │
│   ▶ Play             run possessions    │
│                      vs. CPU defense    │
│   ▶ Whiteboard       draw & animate     │
│                      offensive plays    │
│                                         │
│   ⚙ Settings                            │
│   New to ultimate? Start with Lesson 1  │
└─────────────────────────────────────────┘
```

### 2.1 Lessons
- Short scripted scenarios, 1–3 minutes each: `① Explain → ② Watch → ③ Try it → ④ Recap`.
  1. **Explain:** a short text card (at most about three sentences), optionally with a diagram.
  2. **Watch:** a scripted play on the field, with pause, step and slow motion.
  3. **Try it:** a small challenge against the CPU man defense.
  4. **Recap:** a one-sentence takeaway, plus 1–3 stars.
- **Unlocking:** every lesson is open from the start, but the menu marks the **recommended next lesson** and shows a ✓ on finished ones.
- Two tracks: **Rules** and **Strategy** (see sections 3 and 4).

### 2.2 Play (offensive possessions)
- 7v7. You are always the offense (Blue). The CPU (Red) plays man defense.
- **Pick a control mode** before starting (see section 5): **Quarterback** or **Player**.
- **Pick a starting situation:**

  | Option | Where the disc starts |
  |---|---|
  | Pull | The CPU pulls; your team picks up where it lands |
  | Midfield | Middle of the field |
  | Sideline | Trapped near a sideline |
  | Red zone | Within about 20 yards of the endzone you're attacking |

- **Pick the session length:** 5 possessions, 10 possessions, or endless.
- **Each possession ends** in either:
  - **Goal:** you score, and the next possession starts.
  - **Turnover:** play stops, a short replay shows what went wrong (for example, "break-side throw, the marker blocked it"), and the next possession starts. The CPU never goes on offense.
- **Stats:** goals, completions, best completion streak, and turnovers by type.
  - Shown live in the top bar.
  - A summary screen at the end of a 5- or 10-possession session.
  - Running stats in endless mode.
- **Coach pop-ups:** the first time each rule comes up (first stall, first out-of-bounds, and so on), the game pauses and explains it.
- A **play-by-play log** names the rule behind each event.
- **Watch option:** the AI runs your offense so you can see good decisions against man defense.

### 2.3 Whiteboard
- Drag players into place and draw cuts and throws.
- Play the drawn play forward against the CPU man defense, step through it, and rewind.
- Preset formations: vertical stack, horizontal stack, endzone set.
- Save and load plays, stored in the browser. Sharing by link comes later.

### 2.4 Later ideas (not in scope yet)
- Offense against other CPU defenses (poaching, zone/cup).
- An optional pixel-art skin (see section 7).
- Local 2-player.
- Sharing plays and lesson results by link.

### 2.5 Out of scope
- The player controlling or learning **defense**.

---

## 3. Rules to cover (USA Ultimate only)

| Rule | Simulated? | Notes |
|---|---|---|
| Field: 70×40 yd field with 20 yd endzones, brick marks 20 yd from each goal line | Yes | Drawn to scale |
| 7 players per side | Yes | |
| Scoring: catch in the endzone you're attacking | Yes | |
| The pull and pickup | Yes | When the possession starts with a pull |
| Pull out of bounds → **brick** | Yes | Disc starts at the brick mark |
| No running with the disc; pivot foot | Yes | Thrower is locked in place |
| Stall count: 10 seconds, marker within 10 ft | Yes | Count shown over the marker |
| Turnovers: drop, hits the ground, block, interception, out of bounds, stall | Yes | Each one has a coach explanation and a replay |
| Receiver must land in bounds | Yes | "Caught out of bounds" is a turnover |
| Turnover in an endzone → carry to the goal line | Text only | Possessions end on a turnover, so this is explained but not played out |
| Callahan | Text only | Taught as an offensive risk: careless throws near your own endzone |
| Fouls, picks, travels, contact | Text only | Lesson cards |
| Spirit of the Game / self-refereeing | Text only | Its own lesson card |
| Time caps, timeouts, gender ratio | Not planned | |

---

## 4. Strategy to cover (offense)

### Offensive concepts
- **Vertical stack:** cutters line up down the middle so the lanes on both sides stay open.
- **Horizontal stack:** cutters spread across the field, with three handlers.
- **Cutting:** under cuts (toward the disc) vs. deep cuts (into space). Timing, one cutter at a time, and **clearing** out of the lane after a cut.
- **Handlers:** dumps and swings (reset passes) when the stall count gets high.
- **Hucks:** long throws hang in the air, which gives defenders time to catch up. Throw into space ahead of the receiver.
- **Red zone offense:** tighter spacing near the endzone.

### Reading the defense (offense's point of view)
- **The force:** spotting whether the marker is forcing forehand or backhand, and therefore which side is open.
- **Open side vs. break side:** why open-side throws are the default and break throws are riskier.
- **Beating your defender:** cuts work because the defender reacts late. Change of direction and timing create separation.

### CPU defense behavior (person-to-person)
- **Matchups:** each Red defender is assigned one Blue player and stays with them.
- **Marker:** stands on the break side of the thrower, about 1–2 yards away, and starts the stall count once within 10 ft. Can block break-side throws with some probability.
- **Downfield defenders:** position slightly deep and on the open side of their player. They react after a short delay, so sharp cuts get open.
- **On a throw:** the one or two closest defenders sprint to the disc to try to block or intercept it.
- **Settings:** force forehand or force backhand, chosen in lessons or in Play.
- **One difficulty level, tuned for teaching:** defenders are good enough that bad decisions get punished (break throws get blocked, throws to covered cutters get picked off). They are also forgiving enough that the *right* decision reliably works. When a beginner makes the correct read, it should succeed.
- **Not included for now:** zone, poaching, switching, and the CPU playing offense.

---

## 4b. Lesson list (draft)

Every lesson uses both views, and each row notes which view leads.

### Rules track
| # | Lesson | Main view | Watch | Try it (challenge) |
|---|---|---|---|---|
| R1 | The field & scoring | Sky | Field zones light up: playing field, endzones, brick marks. A cutter catches in the endzone for a goal | Complete a pass into the endzone |
| R2 | The pull & pickup | Sky → Handler | Both teams on their goal lines, the pull floats down, the offense picks it up | Pick up the pull and complete your first pass |
| R3 | No running: the pivot | Handler | The thrower catches, stops and pivots. Running with the disc is flagged as a travel | Complete 3 passes in a row (the thrower is locked in place) |
| R4 | The stall count | Handler | The marker steps up and counts 1…10 right in your face | Complete a pass before stall 5, three times |
| R5 | Turnovers | Sky | Short clips of a drop, a throw hitting the ground, a block, and an interception | Complete 5 passes without a turnover |
| R6 | Out of bounds | Sky | Throw sails out, and a receiver catches with a foot out. Plus brick and endzone pickups | Complete a pass near the sideline with the receiver landing in bounds |
| R7 | Spirit & fouls | Sky | Text cards with short demos of a foul, a pick and a travel call | Quiz: 3 questions |

### Strategy track
| # | Lesson | Main view | Watch | Try it (challenge) |
|---|---|---|---|---|
| S1 | The force: open vs. break side | Handler → Sky | The marker sets up. Handler view shows the blocked side, Sky view shades the open and break sides | Complete 3 open-side passes before stall 7 |
| S2 | The vertical stack | Sky | The stack forms down the middle, and the open lanes on both sides light up | Drag cutters into a correct stack (whiteboard-style) |
| S3 | Under cuts & timing | Handler | A cutter breaks toward the disc. The thrower sees the defender trailing and throws on time | Call an under cut and complete it |
| S4 | Deep cuts & hucks | Sky | Deep cut, the huck floats, the defender closes in. Throwing to space vs. at the player | Complete a huck of 30+ yards |
| S5 | Clearing space | Sky | A cutter who doesn't clear blocks the next cutter's lane, then the same play done right | Run 3 cuts in a row without two cutters in the same lane |
| S6 | Dumps & swings | Handler | Stall 6, nothing open downfield. The handler turns, dumps, and the swing resets the force | Reset with a dump after stall 5, then swing to the other side |
| S7 | The horizontal stack | Sky | Cutters spread across the field, with three handlers | Score from midfield using the horizontal stack |
| S8 | Red zone offense | Sky + Handler | Tight spacing near the endzone, and quick under/in cuts | Score from the red zone within 3 passes |
| S9 | Putting it together | Both | A full possession with AI narration of each decision | Score a full possession from the pull |

---

## 5. Control modes (Play)

Both modes work with **mouse/keyboard or touch** (a phone held sideways).

### 5.1 Quarterback mode: you are always the thrower and you direct the cutters
You control whoever has the disc, and you tell the cutters **where** and **when** to cut.

| Action | Mouse / touch |
|---|---|
| Throw to a teammate (the throw leads them) | Click or tap the teammate |
| Throw to space | Click or tap open grass |
| Call a cut (where + when) | **Drag** from a cutter to a spot. The cutter starts the cut the moment you let go, so *when* you release is the timing |
| Tell a cutter to clear out | Drag a cutter back toward the stack, or tap the cutter and choose "Clear" |
| Pause | Esc / P, or the pause button |

- **Both ways at once (default):** AI cutters make cuts on their own, and you can call a cut at any time to override them. A setting called **"Cutters wait for my call"** turns off the automatic cuts for full control.
- After a catch, control moves to the new thrower automatically.
- **What it teaches:** throwing decisions, cut timing, spacing, and reading the force.

### 5.2 Player mode: you are one player for the whole point
- Choose **Handler** or **Cutter** before the session starts.
- **Without the disc:** move your player with WASD or the arrow keys, an on-screen joystick on touch, **or** by clicking or tapping a spot to run there. All of them work at the same time.
- **Call for the disc:** Space (or a "Call" button on touch). It signals that you're open, and the AI thrower is more likely to throw to you if you really are open.
- **With the disc:** you can't move (pivot rule). Click or tap a teammate or open grass to throw.
- **Teammates:** AI. They cut, clear and throw on their own.
- **What it teaches:**
  - **Cutter:** getting open, timing, clearing space.
  - **Handler:** being available for the dump, resets, throwing decisions.

---

## 6. UI and UX

### Main game screen (same layout in every mode)
```
┌──────────────────────────────────────────────────────────────────┐
│ ☰ Menu   Possession 4/10 · Goals 2 · Streak 5   Attacking →  ⏸ 1×│
├──────────────────────────────────────────────────────┬───────────┤
│┌──────┬──────────────────────────────────┬──────┐    │ PLAY-BY-  │
││      │      · · · OPEN SIDE · · ·       │ YOU  │    │ PLAY      │
││      │   ●B4 ───under──►                │SCORE │    │           │
││      │ ●B2  ★B1 ○R1  ●B3 ●B5 ●B6 ●B7    │ HERE │    │ B1→B4 8yd │
││      │      "Stall 4"  ○R3 ○R5 ○R6 ○R7  │      │    │ Turnover: │
││      │      ····· BREAK SIDE ·····      │      │    │  out of   │
│└──────┴──────────────────────────────────┴──────┘    │  bounds ▸ │
├──────────────────────────────────────────────────────┤           │
│ 💡 Your throw! Click a teammate. Drag a cutter to    │           │
│    call a cut. Green = open.                         │           │
└──────────────────────────────────────────────────────┴───────────┘
  ★ = player holding the disc   ● = Blue (you)   ○ = Red (CPU defense)
```
- **The field takes up most of the screen.**
- **Top bar:** possession progress and stats, the attack direction, pause and speed.
- **Hint bar:** always says what to do right now, in plain words.
- **Play-by-play:** each event gets one line, and tapping ▸ shows the rule behind it.
- **Player mode:** your player gets a highlight ring and a "YOU" label, and the touch joystick appears in the lower left.

### Camera views: Sky view and Handler view
Offense looks different from above than it does with the disc in your hands, and the game teaches both. Press **V** (or tap the view button) to switch views at any time. Lessons can also switch views automatically, or show both at once.

| | **Sky view** | **Handler view** |
|---|---|---|
| Camera | Whole field from straight above, fixed | Follows whoever has the disc, rotated so the attacking endzone is always **up** the screen |
| Zoom | All 110 × 40 yards | Close in: about 35–40 yards ahead of the thrower, and a few yards behind |
| What it teaches | The big picture: stack shape, spacing, lanes, where the open space is | What the thrower actually sees: the marker in their face, which lanes are open right now, when a cutter breaks free, the dump behind |
| Extras | All teaching overlays | A **vision cone**: players behind the thrower are dimmed (you have to turn to see the dump), and the marker's blocked side is shaded. A **mini-map** of the Sky view sits in the corner |

- **Default views:** Lessons pick the view per step. Quarterback mode defaults to Sky view. Player mode defaults to Handler view when you have the disc.
- **Side-by-side option:** on wide screens, show Sky view large with Handler view as a picture-in-picture. Good for lessons such as "watch the cut from above, then see the same moment as the thrower."
- **How it's drawn:** Handler view applies a rotate + zoom + follow transform on the canvas before drawing. The picture-in-picture is a second, small canvas drawn in Sky view. The game logic doesn't change. Views are purely a rendering choice.

### Teaching overlays (toggleable)
- **Open / break side shading** around the thrower, plus an arrow for the force direction
- **Stall count** above the marker, turning red as it climbs
- **Matchup lines** connecting each defender to the player they're guarding
- **Cut paths:** dashed lines labeled "under" or "deep" (including cuts you called)
- **Open teammate rings:** green rings around receivers who are open
- **Throw preview:** a line colored green, yellow or red, with a text label (OPEN / CONTESTED / BREAK SIDE / OUT OF BOUNDS)
- **Slow motion and pause:** 0.5×, 1×, 1.5×

Overlays are on by default in lessons, and can be toggled in Play.

### Core loop: one possession (Quarterback mode)
1. **Setup:** the disc starts at the chosen spot (or the CPU pulls), and your player picks it up.
2. **You have the disc:** the thrower can't move. The Red marker steps up on the break side, and the stall bubble ticks 1, 2, 3…
3. **Direct and read:** drag cutters to call cuts, and watch their defenders trail behind.
4. **Aim and throw:** the hover preview shows the risk, then click to throw. The disc arcs, and long throws float.
5. **Result:**
   - **Catch:** the receiver becomes the thrower, and the loop repeats.
   - **Goal:** celebrate, update the stats, and start the next possession.
   - **Turnover:** play stops, a coach card (shown the first time for each type) and a replay explain it, then the next possession starts.

### UX principles
- **Teach by doing, not reading.**
- **Explain each rule once.** Coach pop-ups appear the first time only, and the log keeps the rule for later.
- **Always one clear action** in the hint bar.
- **Slow motion is always available.**
- **Colors are never the only signal:** text labels back up every color.
- **Mouse/keyboard and touch are equal citizens.**

---

## 7. Art direction

- **Phase 1: whiteboard dots.** Numbered circles on a clean field, styled like a coach's whiteboard. Blue is the offense, Red is the CPU defense, and the disc is white with a ground shadow to show height.
- **Phase 2 (later): pixel-art skin.** Small top-down characters with running, throwing and catching animations. It's an optional toggle, so the dot view stays available for clarity.
- Keep the sprite and drawing code isolated so the skin can be swapped without touching game logic.

---

## 8. Tech approach

### Stack
| Piece | Choice | Why |
|---|---|---|
| UI framework | **React** | Menus, lessons, HUD, settings and the whiteboard tools are all regular UI |
| Language | **TypeScript** | Catches mistakes early, and makes the game logic self-documenting |
| Field rendering | **HTML `<canvas>`** (2D), drawn by our own code inside one React component | Fast animation of 14 players + disc. Rotating and zooming for Handler view is a few lines (`ctx.rotate` / `ctx.scale`) |
| Build tool | **Vite** (React + TypeScript template) | Fast dev server with hot reload, and a static build for hosting |
| Routing | **React Router** with a `HashRouter` (URLs like `/#/lessons/s1`) | GitHub Pages can't route single-page-app URLs on its own. Hash URLs avoid 404s on refresh |
| Tests | **Vitest** | Same config as Vite. Runs the game logic headlessly |
| Saving | Browser **localStorage** | Lesson progress, settings and whiteboard plays. No server needed |
| Hosting | **GitHub Pages**, deployed by a **GitHub Actions** workflow | Every push to `main` builds and publishes the site automatically. Free, and shared as a link |

### Repo and deployment (GitHub)
- **Repo:** [`nguillet23/huckit`](https://github.com/nguillet23/huckit) (public). The site will live at `https://nguillet23.github.io/huckit/`.
- **Vite `base` setting:** set to `/huckit/` so assets load correctly from the GitHub Pages sub-path.
- **Workflow (`.github/workflows/deploy.yml`):** on every push to `main`:
  1. Install dependencies.
  2. Run the type check and tests.
  3. Build.
  4. Publish the `dist/` folder with GitHub's official Pages actions.

  A failing test blocks the deploy.
- **Branches:** work on feature branches, merge to `main` through pull requests, and `main` is always the live site.
- **Later:** a custom domain if you want one.

### Architecture
The **game logic is plain TypeScript with no React and no canvas**, so it can be tested headlessly and reused by every mode:

```
src/
  sim/              game logic only: field, players, disc, rules, CPU man
                    defense, AI cutters/throwers, commands, events, replays
  render/           canvas drawing of the logic's state
    camera.ts         Sky view / Handler view transforms (rotate, zoom, follow)
    drawField.ts      field, lines, endzones, brick marks
    drawPlayers.ts    dot skin now, pixel-art skin later
    drawOverlays.ts   open/break shading, cut paths, throw preview, vision cone
  input/            mouse, touch, keyboard, joystick → logic commands
  components/       React UI
    FieldCanvas.tsx   the <canvas>; runs the game loop and calls render/
    TopBar.tsx, HintBar.tsx, PlayByPlay.tsx, CoachCard.tsx, MiniMap.tsx,
    Joystick.tsx, ViewToggle.tsx
  pages/            one per screen (React Router routes)
    TitlePage         mode select              /#/
    LessonMenuPage    lesson list, ✓s, next    /#/lessons
    LessonPage        runs one lesson script   /#/lessons/:id
    PlaySetupPage     control mode, start spot, session length   /#/play
    PlayPage          possessions (Quarterback / Player)          /#/play/run
    SummaryPage       end-of-session stats
    WhiteboardPage    drag, draw, animate plays                   /#/whiteboard
    SettingsPage
  lessons/          one data file per lesson (text, scripted moves, challenge)
  content/          rule and strategy text for coach cards and the log
  state/            settings + progress (React context, saved to localStorage)
tests/              Vitest tests for sim/ (rules, turnovers, AI sanity)
```

### React and the game loop
React shouldn't re-render 60 times a second. To avoid that:
- The game logic's state lives in a **`useRef`**, not React state. A `requestAnimationFrame` loop inside `FieldCanvas` steps the logic and redraws the canvas directly.
- React only re-renders when something the **UI** shows changes: a logic event (completion, turnover, goal), the stall count ticking, or a pause. The loop pushes these into React state when they happen.
- Input on the canvas (click, drag, keys, joystick) is turned into logic commands. React components such as the pause button and view toggle send commands the same way.

### How the logic talks to the UI
- **Input → logic:** commands such as `throwTo(target)`, `callCut(cutter, spot)`, `movePlayer(dir)` and `callForDisc()`.
- **Logic → UI:** a stream of events such as `pickup`, `completion`, `drop`, `block`, `interception`, `handblock`, `out`, `caught_out`, `stall`, `brick`, `goal` and `possession_end`. The HUD turns these into log lines, coach cards and replays.
- **Replays:** the logic records a short history of positions, so a turnover can be replayed.

### Coordinates and phases
- **Coordinates:** yards. x runs 0–110 along the length (the endzones are 0–20 and 90–110), and y runs 0–40 across the width.
- **Phases:** `setup → (pull →) pickup → play ⇄ flight → goal | turnover → replay → next possession → summary`

---

## 9. Build order (milestones)

All three modes are on the title screen from the start. Unfinished ones show "Coming soon". The core engine comes first because every mode depends on it.

1. **Foundation:**
   - Create the GitHub repo and the Vite + React + TypeScript project, with the GitHub Actions deploy to Pages working on day one (even if it's an empty title screen).
   - Draw the field to scale on a canvas, with dot players.
   - Build the logic core: movement, disc flight, catches, turnovers, stall.
   - Build the CPU man defense.
   - Write Vitest tests for the logic.
2. **Play: Quarterback mode.** Throwing, calling cuts, AI cutters, the start-spot and session-length options, stats, coach cards, the play-by-play log and turnover replays.
3. **Lessons: Rules track.** The lesson framework and the rules lessons.
4. **Lessons: Strategy track.** Stacks, cutting and clearing, dumps and swings, reading the force, hucks, red zone.
5. **Play: Player mode.** Keyboard, joystick and click movement, Handler or Cutter role, calling for the disc.
6. **Whiteboard.** Drag players, draw plays, animate them against the CPU defense, save and load.
7. **Polish:** the pixel-art skin, sound, mobile tuning, hosting, and testing with real new players.

---

## 10. Decisions

**Decided:**
- [x] **Scope:** offense only. The player never plays defense.
- [x] **CPU defense:** person-to-person (man) marking, with a forehand or backhand force.
- [x] **Platform:** a React + TypeScript website (Vite), with the field drawn on an HTML canvas, hosted on GitHub Pages and deployed by GitHub Actions. (Replaces the earlier Phaser choice.)
- [x] **Modes:** Lessons, Play and Whiteboard, all selectable from the title screen.
- [x] **Rule set:** USA Ultimate only.
- [x] **Project goal:** learning game dev and shipping a useful tool, equally.
- [x] **Art:** whiteboard dots first, an optional pixel-art skin later.
- [x] **Controls:** two Play modes. Quarterback (always the thrower, directs where and when cutters cut) and Player (one player for the whole point).
- [x] **Player mode movement:** keyboard and touch joystick **and** click-to-run.
- [x] **Player mode position:** the player picks Handler or Cutter.
- [x] **Possession start:** the player picks pull, midfield, sideline or red zone.
- [x] **Session length:** the player picks 5, 10 or endless.
- [x] **Lesson unlocking:** suggested order, nothing locked.
- [x] **Old prototype:** deleted. Starting fresh.
- [x] **CPU difficulty:** one level, tuned for teaching.
- [x] **Quarterback cuts:** both. AI cutters cut on their own and you can call cuts any time. "Cutters wait for my call" is an optional setting.
- [x] **Views:** Sky view (whole field from above) and Handler view (from behind the thrower, looking downfield).
- [x] **Handler view style:** flat top-down, rotated so the attack direction is up and zoomed in on the thrower. No 3D tilt.
- [x] **Lesson list:** approved as drafted in section 4b (7 rules lessons, 9 strategy lessons).
- [x] **Name:** **Huck It**. Repo [`nguillet23/huckit`](https://github.com/nguillet23/huckit), created 2026-10-13.

**Still open:** nothing blocking. Details get settled as each milestone is built.

---

## 11. Next steps

1. Write the full script for each lesson: the exact text cards, the demo play step by step, and the star thresholds for each challenge. This can happen alongside Milestones 1–2, since lessons are built in Milestone 3.
2. Start Milestone 1 (foundation) when you're ready to write code.

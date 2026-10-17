// Expands routine templates into renderable items (PRD D2, REVIEW.md).
//
// A template item names a generator (`use`) plus its parameters; the generator
// returns { bars, repeat | repeatEach | repeatGroup } in the grid notation described
// in app.js. Each template is expanded once per lead hand (`leads`, default R and L).
// Runs in the browser (window.DrumExpand) and in Node (module.exports) for checks.
(function (root) {
  'use strict';

  const CELLS = {
    Q: 'x...',
    E: 'x.x.',
    S: 'xxxx',
    ES: 'x.xx',
    SE: 'xxx.',
    D: 'x..x', // dotted 8th + 16th
    T: 'xxx', // 8th-note triplet
    R: '....',
  };
  const HAND_LANES = ['cr', 'rd', 'hh', 't1', 't2', 'sd', 'ft'];
  const FOOT_LANES = ['bd', 'hf']; // kick, hi-hat pedal
  const AROUND = ['sd', 't1', 't2', 'ft'];
  const DEFAULT_TIMES = 2;

  const GROOVES = {
    '8beat': {
      hh: ['x.x.', 'x.x.', 'x.x.', 'x.x.'],
      sd: ['....', 'x...', '....', 'x...'],
      bd: ['x...', '....', 'x.x.', '....'],
    },
    // Two-handed 16ths on the hi-hat; the right hand moves to the snare on 2 and 4.
    '16beat': {
      hh: ['xxxx', '.xxx', 'xxxx', '.xxx'],
      sd: ['....', 'x...', '....', 'x...'],
      bd: ['x...', '....', 'x.x.', '....'],
    },
  };

  function grid(cell) {
    if (CELLS[cell]) return CELLS[cell];
    if (/^[xXgo.]{3,4}$/.test(cell)) return cell;
    throw new Error(`unknown cell: ${cell}`);
  }

  const empty = (len) => '.'.repeat(len);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const otherHand = (hand) => (hand === 'R' ? 'L' : 'R');

  function groove(name) {
    if (!GROOVES[name]) throw new Error(`unknown groove: ${name}`);
    return clone(GROOVES[name]);
  }

  function ensureLane(bar, lane, slotsPerBeat = 4) {
    if (!bar[lane]) bar[lane] = Array(4).fill(empty(slotsPerBeat));
    return bar[lane];
  }

  // 16th-slot indices (0-15) -> four beat grids.
  function fromSlots(slots, mark = 'x') {
    const chars = Array(16).fill('.');
    slots.forEach((s) => { chars[s] = mark; });
    return [0, 1, 2, 3].map((b) => chars.slice(b * 4, b * 4 + 4).join(''));
  }

  // Groove bar with a crash on 1; the hi-hat comes back on the "and".
  function withCrash(bar) {
    ensureLane(bar, 'cr')[0] = 'x...';
    if (bar.hh) bar.hh[0] = '.' + bar.hh[0].slice(1);
    return bar;
  }

  // Put a cell on one beat of a lane. When a hand lane gets a busy cell (triplet or
  // 3+ hits), both hands are needed there, so other hand lanes rest on that beat.
  function setBeat(bar, lane, beat, cellGrid) {
    const hits = [...cellGrid].filter((c) => c !== '.').length;
    if (HAND_LANES.includes(lane) && (cellGrid.length === 3 || hits >= 3)) {
      for (const other of HAND_LANES) {
        if (other !== lane && bar[other]) bar[other][beat] = empty(cellGrid.length);
      }
    }
    // Keep slot counts aligned across a voice: a triplet beat clears same-voice lanes.
    ensureLane(bar, lane)[beat] = cellGrid;
    const voice = HAND_LANES.includes(lane) ? HAND_LANES : FOOT_LANES;
    for (const other of voice) {
      if (other !== lane && bar[other] && bar[other][beat].length !== cellGrid.length) {
        bar[other][beat] = empty(cellGrid.length);
      }
    }
  }

  // Grid sticking (REVIEW 1-1/1-2): the hands keep alternating on a fixed grid and only
  // the notes are played, so on-grid positions always fall to the lead hand.
  //   subdivision 16: slots 0 2 = lead, 1 3 = other (E = R.R., S = RLRL)
  //   subdivision 8:  slot 0 = lead, slot 2 = other (Q = R, E = RL)
  // Triplet beats alternate continuously across consecutive triplet beats (RLR LRL).
  function gridSticking(grids, lead = 'R', subdivision = 16, beats = [0, 1, 2, 3]) {
    const off = otherHand(lead);
    let tripletRun = 0;
    return grids.map((g, beat) => {
      const active = beats.includes(beat);
      if (g.length === 3) {
        const run = tripletRun++;
        return [...g].map((c, slot) => {
          if (c === '.' || !active) return '.';
          return (slot + 3 * run) % 2 === 0 ? lead : off;
        }).join('');
      }
      tripletRun = 0;
      return [...g].map((c, slot) => {
        if (c === '.' || !active) return '.';
        if (subdivision === 8 && slot % 2 === 1) throw new Error('8分グリッドの項目に16分の音がある');
        const step = subdivision === 8 ? slot / 2 : slot;
        return step % 2 === 0 ? lead : off;
      }).join('');
    });
  }

  function stickingKey(lane) {
    return FOOT_LANES.includes(lane) ? 'feet' : 'hands';
  }

  // --- Generators -----------------------------------------------------------

  // Accompaniment under a drill lane (REVIEW 足のドリル): nothing, quarter-note hi-hat,
  // or the 8-beat groove (the drill lane replaces that lane of the groove).
  function accompaniment(kind) {
    if (kind === 'hhQuarter') return { hh: ['x...', 'x...', 'x...', 'x...'] };
    if (kind === '8beat') return groove('8beat');
    return {};
  }

  // Progressive overload: start from all `from` cells and bring in `to`, keeping only
  // bars that add a new transition (bar wrap included). Rotations of the same bar are
  // the same exercise when looped, so beat position is not a reason to keep a bar.
  // `stages` repeats the bars over several accompaniments, in order.
  function progression({ from, to, lane = 'sd', subdivision = 16, stages = ['none'], lead }) {
    const bits = (m) => [0, 1, 2, 3].map((i) => (m >> (3 - i)) & 1);
    const count = (m) => bits(m).reduce((a, b) => a + b, 0);
    const masks = [...Array(16).keys()].sort((a, b) => count(a) - count(b) || b - a);

    const seen = new Set();
    const patterns = [];
    for (const mask of masks) {
      const cells = bits(mask).map((b) => (b ? to : from));
      const transitions = cells.map((c, i) => `${c}>${cells[(i + 1) % 4]}`);
      if (patterns.length && transitions.every((t) => seen.has(t))) continue;
      transitions.forEach((t) => seen.add(t));
      patterns.push(cells);
    }

    const bars = [];
    for (const stage of stages) {
      for (const cells of patterns) {
        const bar = accompaniment(stage);
        cells.forEach((cell, beat) => setBeat(bar, lane, beat, grid(cell)));
        bar[stickingKey(lane)] = gridSticking(bar[lane], lead, subdivision);
        bars.push(bar);
      }
    }
    return { bars, repeatEach: true };
  }

  // One lane laid out from 16th-slot positions over a groove (REVIEW 1-3 / 5-2 / ghosts):
  // the base bar, base + each single, base + every pair of `pairs`, base + each of
  // `combos`, then any extra bars. Added hits use `addMark` (e.g. g = ghost).
  function positions({ groove: grooveName = '8beat', lane = 'bd', base = [0, 8], singles = [], pairs = [], combos = [], extra = [], includeBase = true, addMark = 'x' }) {
    const make = (adds, baseSlots = base) => {
      const bar = groove(grooveName);
      const chars = [...fromSlots(baseSlots).join('')];
      adds.forEach((s) => { if (chars[s] === '.') chars[s] = addMark; });
      bar[lane] = [0, 1, 2, 3].map((b) => chars.slice(b * 4, b * 4 + 4).join(''));
      return bar;
    };
    const bars = includeBase ? [make([])] : [];
    singles.forEach((s) => bars.push(make([s])));
    pairs.forEach((a, i) => pairs.slice(i + 1).forEach((b) => bars.push(make([a, b]))));
    combos.forEach((adds) => bars.push(make(adds)));
    extra.forEach((slots) => bars.push(make([], slots)));
    return { bars, repeatEach: true };
  }

  // One irregular lane over a real groove (PRD §5.4-2). `targets` lists the beats
  // changed in each bar, in a fixed order (D5). With `merge`, the cell is added on top
  // of the groove's hits instead of replacing them.
  function perturb({ groove: grooveName, lane, cell, targets, merge = false, showSticking = false, lead, footLead }) {
    const cellGrid = grid(cell);
    const bars = targets.map((targetBeats) => {
      const bar = groove(grooveName);
      targetBeats.forEach((beat) => {
        const current = (bar[lane] || [])[beat];
        const merged = merge && current && current.length === cellGrid.length
          ? [...cellGrid].map((c, i) => (c !== '.' ? c : current[i])).join('')
          : cellGrid;
        setBeat(bar, lane, beat, merged);
      });
      if (showSticking) {
        bar[stickingKey(lane)] = gridSticking(bar[lane], FOOT_LANES.includes(lane) ? footLead : lead, 16, targetBeats);
      }
      return bar;
    });
    return { bars, repeatEach: true };
  }

  // Repeating one-beat accent shapes with `count` accents (4 / 6 / 4 shapes). Bars are
  // written out (no repeat signs) so the stroke marks show each change of shape.
  function accents({ count, lane = 'sd', writeOut = 2, lead }) {
    const bars = [];
    for (let m = 15; m >= 0; m--) {
      const bits = [0, 1, 2, 3].map((i) => (m >> (3 - i)) & 1);
      if (bits.reduce((a, b) => a + b, 0) !== count) continue;
      const shape = bits.map((b) => (b ? 'X' : 'x')).join('');
      for (let k = 0; k < writeOut; k++) {
        const bar = { [lane]: [shape, shape, shape, shape] };
        bar.hands = gridSticking(bar[lane], lead, 16);
        bars.push(bar);
      }
    }
    return { bars };
  }

  // A sticking pattern (rudiment) voiced on the kit in different ways.
  //   snare        all strokes on the snare
  //   right-tom    R on the high tom, L on the snare
  //   around       beat by beat: snare, tom 1, tom 2, floor tom
  //   doubles-kick double strokes move to the kick, same side foot (RR -> right foot)
  // 6-stroke groups (double paradiddle, paradiddle-diddle) are counted in triplets.
  // With an L lead the hands of the pattern are swapped.
  function sticking({ pattern, orchestration = 'snare', lead = 'R' }) {
    const groups = pattern.trim().split(/\s+/);
    let seq = groups.join('');
    if (lead === 'L') seq = [...seq].map(otherHand).join('');
    const groupLen = groups[0].length;
    const perBeat = groupLen % 3 === 0 && groupLen % 4 !== 0 ? 3 : 4;
    const bar = {};
    const hands = Array.from({ length: 4 }, () => Array(perBeat).fill('.'));
    const feet = Array.from({ length: 4 }, () => Array(perBeat).fill('.'));

    for (let i = 0; i < perBeat * 4; i++) {
      const beat = Math.floor(i / perBeat);
      const slot = i % perBeat;
      const k = i % seq.length;
      const hand = seq[k];
      const isDouble = hand === seq[(k + 1) % seq.length] || hand === seq[(k - 1 + seq.length) % seq.length];
      const mark = k % groupLen === 0 ? 'X' : 'x';

      let lane = 'sd';
      if (orchestration === 'right-tom') lane = hand === 'R' ? 't1' : 'sd';
      if (orchestration === 'around') lane = AROUND[beat];
      if (orchestration === 'doubles-kick' && isDouble) lane = 'bd';

      const laneGrids = ensureLane(bar, lane, perBeat);
      laneGrids[beat] = laneGrids[beat].slice(0, slot) + mark + laneGrids[beat].slice(slot + 1);
      (lane === 'bd' ? feet : hands)[beat][slot] = hand;
    }
    bar.hands = hands.map((s) => s.join(''));
    if (bar.bd) bar.feet = feet.map((s) => s.join(''));
    return { bars: [bar], repeat: true };
  }

  // Hand-foot cells used inside fills: hands on the fill drum, kick on the rest.
  const HAND_FOOT = {
    RLK: { hands: 'xx.', kick: '..x' }, // triplet: right, left, kick
  };

  // Groove-and-fill bars (REVIEW 2-2 / 2-3 / 2-4). Each entry of `cells` is one fill:
  // a cell name (repeated over `beats`) or an array of `beats` cells.
  //   unit 1: one bar = crash on 1 + groove + fill on the last `beats` beats
  //   unit 2: groove bar (crash on 1) + a full fill bar, repeated as a pair
  // `around` moves beat by beat snare -> floor tom; `reverse` goes floor tom -> snare.
  function fills({ groove: grooveName = '8beat', beats, cells, around = false, reverse = false, unit = 1, lead }) {
    const start = 4 - beats;
    const path = reverse ? [...AROUND].reverse() : AROUND;
    const lanes = around ? path.slice(4 - beats) : Array(beats).fill('sd');
    const bars = [];
    for (const entry of cells) {
      const fillCells = Array.isArray(entry) ? entry : Array(beats).fill(entry);
      if (fillCells.length !== beats) throw new Error('fills: cells must match beats');

      const fillBar = unit === 1 ? withCrash(groove(grooveName)) : groove(grooveName);
      const fixedHands = {};
      for (let i = 0; i < beats; i++) {
        const beat = start + i;
        const handFoot = HAND_FOOT[fillCells[i]];
        const cellGrid = handFoot ? handFoot.hands : grid(fillCells[i]);
        for (const lane of [...HAND_LANES, ...FOOT_LANES]) {
          if (fillBar[lane]) fillBar[lane][beat] = empty(cellGrid.length);
        }
        ensureLane(fillBar, lanes[i])[beat] = cellGrid;
        if (handFoot) {
          ensureLane(fillBar, 'bd')[beat] = handFoot.kick;
          ensureLane(fillBar, 'feet')[beat] = handFoot.kick.replace('x', 'R');
          fixedHands[beat] = `${lead}${otherHand(lead)}.`; // hand-foot cells keep R L (or L R)
        }
      }
      // One stroke stream across the fill, whichever drum each beat is on.
      const stream = [0, 1, 2, 3].map((beat) => (beat >= start ? fillBar[lanes[beat - start]][beat] : '....'));
      fillBar.hands = gridSticking(stream, lead, 16, [0, 1, 2, 3].filter((b) => b >= start))
        .map((g, beat) => fixedHands[beat] || g);

      if (unit === 2) bars.push(withCrash(groove(grooveName)));
      bars.push(fillBar);
    }
    return unit === 1 ? { bars, repeatEach: true } : { bars, repeatGroup: 2 };
  }

  // The 8-beat skeleton (REVIEW 骨格の変化): kick on 1 and 3, snare on 2 and 4.
  const SKELETON = { kick1: ['bd', 0], kick2: ['bd', 8], snare1: ['sd', 4], snare2: ['sd', 12] };
  const SKELETON_SHIFTS = [null, -2, -1, 2, 1]; // remove, 8th / 16th early, 8th / 16th late

  function skeletonBar() {
    return { hh: ['x.x.', 'x.x.', 'x.x.', 'x.x.'], sd: fromSlots([4, 12]), bd: fromSlots([0, 8]) };
  }

  function setSlot(bar, lane, slot, mark) {
    const beat = slot >> 2;
    const grids = ensureLane(bar, lane);
    grids[beat] = grids[beat].slice(0, slot & 3) + mark + grids[beat].slice((slot & 3) + 1);
  }

  // One skeleton hit changed per pair of bars: a normal bar, then the changed bar.
  // An early kick on 1 lands at the end of the normal bar (an anticipation).
  function skeleton({ anchors }) {
    const bars = [];
    for (const name of anchors) {
      const [lane, slot] = SKELETON[name];
      for (const shift of SKELETON_SHIFTS) {
        const normal = skeletonBar();
        const changed = skeletonBar();
        setSlot(changed, lane, slot, '.');
        if (shift !== null) {
          const target = slot + shift;
          if (target < 0) setSlot(normal, lane, 16 + target, 'x');
          else setSlot(changed, lane, target, 'x');
        }
        bars.push(normal, changed);
      }
    }
    return { bars, repeatGroup: 2 };
  }

  // Hi-hat opens (REVIEW ハイハットの開閉): a normal 8-beat bar, then the same bar with the
  // hi-hat open (o) on the given 16th slots. The next hi-hat note closes it (+).
  function hihatOpen({ sets }) {
    const bars = [];
    for (const slots of sets) {
      const changed = groove('8beat');
      slots.forEach((slot) => setSlot(changed, 'hh', slot, 'o'));
      bars.push(groove('8beat'), changed);
    }
    return { bars, repeatGroup: 2 };
  }

  function literal({ bars, repeat = false, repeatEach = false, subdivision, lane = 'sd', lead }) {
    const out = clone(bars);
    if (subdivision) out.forEach((bar) => { bar.hands = gridSticking(bar[lane], lead, subdivision); });
    return { bars: out, repeat, repeatEach };
  }

  const GENERATORS = { progression, positions, perturb, accents, sticking, fills, skeleton, hihatOpen, literal };

  // --- Stroke marks ---------------------------------------------------------

  // Up / down strokes from accents (REVIEW 3-1): for each hand, compare a stroke with
  // that hand's next stroke in the loop. Accent -> soft = down (↓, stop low),
  // soft -> accent = up (↑, lift to prepare). Full and tap strokes are not marked.
  function loopsOf(item) {
    const indices = item.bars.map((_, i) => i);
    if (item.repeatEach) return indices.map((i) => [i]);
    if (item.repeatGroup) {
      const loops = [];
      for (let i = 0; i < indices.length; i += item.repeatGroup) loops.push(indices.slice(i, i + item.repeatGroup));
      return loops;
    }
    return [indices];
  }

  function addStrokes(item) {
    const accented = item.bars.some((bar) => HAND_LANES.some((lane) => (bar[lane] || []).some((g) => g.includes('X'))));
    if (!accented) return;
    item.bars.forEach((bar) => {
      if (bar.hands) bar.strokes = bar.hands.map((g) => empty(g.length));
    });

    for (const loop of loopsOf(item)) {
      const events = [];
      for (const index of loop) {
        const bar = item.bars[index];
        if (!bar.hands) continue;
        bar.hands.forEach((g, beat) => [...g].forEach((hand, slot) => {
          if (hand !== 'R' && hand !== 'L') return;
          const accent = HAND_LANES.some((lane) => bar[lane] && bar[lane][beat][slot] === 'X');
          events.push({ bar, beat, slot, hand, accent });
        }));
      }
      for (const hand of ['R', 'L']) {
        const strokes = events.filter((e) => e.hand === hand);
        strokes.forEach((e, i) => {
          const next = strokes[(i + 1) % strokes.length];
          const mark = e.accent && !next.accent ? '↓' : !e.accent && next.accent ? '↑' : '.';
          const row = e.bar.strokes[e.beat];
          e.bar.strokes[e.beat] = row.slice(0, e.slot) + mark + row.slice(e.slot + 1);
        });
      }
    }
  }

  // Empty lanes follow the slot count of the lane that plays on that beat (a lane
  // created later defaults to a 16th grid even where another lane is in triplets).
  function alignSlots(bar) {
    for (const voice of [HAND_LANES, FOOT_LANES]) {
      for (let beat = 0; beat < 4; beat++) {
        const lanes = voice.filter((lane) => bar[lane]);
        const playing = lanes.find((lane) => /[^.]/.test(bar[lane][beat]));
        if (!playing) continue;
        const len = bar[playing][beat].length;
        lanes.forEach((lane) => {
          if (bar[lane][beat].length !== len && !/[^.]/.test(bar[lane][beat])) bar[lane][beat] = empty(len);
        });
      }
    }
  }

  // --- Expansion ------------------------------------------------------------

  function expandItem(spec, lead = 'R') {
    const generate = GENERATORS[spec.use];
    if (!generate) throw new Error(`unknown generator: ${spec.use}`);
    const result = generate({ ...spec, lead, footLead: lead });
    const leads = spec.leads || ['R', 'L'];
    let title = spec.title;
    if (leads.length > 1 && spec.leadLabel) {
      title += ` — ${lead === 'R' ? '右' : '左'}${spec.leadLabel}リード`;
    } else if (leads.length > 1) {
      const hasHiHat = result.bars.some((bar) => bar.hh);
      title += lead === 'R' ? ' — R リード' : ` — L リード${hasHiHat ? '(左手ハイハット)' : ''}`;
    }
    result.bars.forEach(alignSlots);
    const item = { category: spec.category, title, intent: spec.intent, times: spec.times || DEFAULT_TIMES, ...result };
    addStrokes(item);
    markCloses(item);
    return item;
  }

  // The first hi-hat note after an open one is the close: mark it c (drawn with +).
  function markCloses(item) {
    for (const loop of loopsOf(item)) {
      const hits = [];
      for (const index of loop) {
        const hh = item.bars[index].hh;
        if (!hh) continue;
        hh.forEach((g, beat) => [...g].forEach((c, slot) => { if (c !== '.') hits.push({ hh, beat, slot, c }); }));
      }
      if (!hits.some((h) => h.c === 'o')) continue;
      hits.forEach((h, i) => {
        const next = hits[(i + 1) % hits.length];
        if (h.c !== 'o' || next.c === 'o') return;
        const row = next.hh[next.beat];
        next.hh[next.beat] = row.slice(0, next.slot) + 'c' + row.slice(next.slot + 1);
      });
    }
  }

  function expandAll(specs) {
    return specs.map((routine) => ({
      title: routine.title,
      items: routine.items.flatMap((spec) => (spec.leads || ['R', 'L']).map((lead) => {
        try {
          return expandItem(spec, lead);
        } catch (err) {
          return { category: spec.category, title: spec.title, intent: spec.intent, error: err.message, bars: [] };
        }
      })),
    }));
  }

  const api = { CELLS, GROOVES, expandItem, expandAll, gridSticking };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DrumExpand = api;
})(typeof window !== 'undefined' ? window : globalThis);

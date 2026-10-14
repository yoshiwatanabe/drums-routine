// Expands routine templates into renderable items (PRD D2).
//
// A template item names a generator (`use`) plus its parameters; the generator
// returns { bars, repeat, repeatEach } in the grid notation described in app.js.
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
  const HAND_LANES = ['cr', 'hh', 't1', 't2', 'sd', 'ft'];
  const AROUND = ['sd', 't1', 't2', 'ft'];

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

  function groove(name) {
    if (!GROOVES[name]) throw new Error(`unknown groove: ${name}`);
    return clone(GROOVES[name]);
  }

  function ensureLane(bar, lane) {
    if (!bar[lane]) bar[lane] = ['....', '....', '....', '....'];
    return bar[lane];
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
    const voice = HAND_LANES.includes(lane) ? HAND_LANES : ['bd'];
    for (const other of voice) {
      if (other !== lane && bar[other] && bar[other][beat].length !== cellGrid.length) {
        bar[other][beat] = empty(cellGrid.length);
      }
    }
  }

  // Alternating R/L over the hits of the given beats (others left blank).
  function alternate(grids, beats = [0, 1, 2, 3], lead = 'R') {
    let hand = lead;
    return grids.map((g, beat) => [...g].map((c) => {
      if (c === '.' || !beats.includes(beat)) return '.';
      const current = hand;
      hand = hand === 'R' ? 'L' : 'R';
      return current;
    }).join(''));
  }

  function stickingKey(lane) {
    return lane === 'bd' ? 'feet' : 'hands';
  }

  // --- Generators -----------------------------------------------------------

  // Progressive overload: start from all `from` cells, bring in `to` one step at a
  // time, and keep only bars that add a new transition (incl. bar wrap) or put `to`
  // on a beat it has not been on yet.
  function progression({ from, to, lane = 'sd', groove: grooveName, sticking }) {
    const masks = [];
    for (let m = 0; m < 16; m++) masks.push(m);
    const bits = (m) => [0, 1, 2, 3].map((i) => (m >> (3 - i)) & 1);
    const count = (m) => bits(m).reduce((a, b) => a + b, 0);
    masks.sort((a, b) => count(a) - count(b) || b - a);

    const seenTransitions = new Set();
    const seenPositions = new Set();
    const bars = [];
    for (const mask of masks) {
      const cells = bits(mask).map((b) => (b ? to : from));
      const transitions = cells.map((c, i) => `${c}>${cells[(i + 1) % 4]}`);
      const positions = cells.map((c, i) => (c === to ? i : -1)).filter((i) => i >= 0);
      const isNew = bars.length === 0
        || transitions.some((t) => !seenTransitions.has(t))
        || positions.some((p) => !seenPositions.has(p));
      if (!isNew) continue;
      transitions.forEach((t) => seenTransitions.add(t));
      positions.forEach((p) => seenPositions.add(p));

      const bar = grooveName ? groove(grooveName) : {};
      cells.forEach((cell, beat) => setBeat(bar, lane, beat, grid(cell)));
      if (sticking === 'alternate') bar[stickingKey(lane)] = alternate(bar[lane]);
      bars.push(bar);
    }
    return { bars, repeatEach: true };
  }

  // Overlay two same-length grids: a hit in either one is kept.
  function overlay(base, top) {
    return [...top].map((c, i) => (c !== '.' ? c : base[i])).join('');
  }

  // One irregular lane over a real groove (PRD §5.4-2). Order is fixed (D5):
  // single beat at 4, 3, 2, 1, then the whole bar. With `merge`, the cell is added
  // on top of the groove's hits instead of replacing them (keeps the backbeat).
  function perturb({ groove: grooveName, lane, cell, beats = [3, 2, 1, 0], wholeBar = true, merge = false, sticking }) {
    const cellGrid = grid(cell);
    const targets = beats.map((b) => [b]);
    if (wholeBar) targets.push([0, 1, 2, 3]);
    const bars = targets.map((targetBeats) => {
      const bar = groove(grooveName);
      targetBeats.forEach((beat) => {
        const current = (bar[lane] || [])[beat];
        const merged = merge && current && current.length === cellGrid.length ? overlay(current, cellGrid) : cellGrid;
        setBeat(bar, lane, beat, merged);
      });
      if (sticking === 'alternate') bar[stickingKey(lane)] = alternate(bar[lane], targetBeats);
      return bar;
    });
    return { bars, repeatEach: true };
  }

  // Repeating one-beat accent shapes with `count` accents (4 / 6 / 4 shapes).
  function accents({ count, lane = 'sd' }) {
    const shapes = [];
    for (let m = 15; m >= 0; m--) {
      const bits = [0, 1, 2, 3].map((i) => (m >> (3 - i)) & 1);
      if (bits.reduce((a, b) => a + b, 0) === count) shapes.push(bits.map((b) => (b ? 'X' : 'x')).join(''));
    }
    const bars = shapes.map((shape) => ({
      [lane]: [shape, shape, shape, shape],
      hands: ['RLRL', 'RLRL', 'RLRL', 'RLRL'],
    }));
    return { bars, repeatEach: true };
  }

  // A sticking pattern (e.g. paradiddle) voiced on the kit in different ways.
  //   snare        all strokes on the snare
  //   right-tom    R on the high tom, L on the snare
  //   around       beat by beat: snare, tom 1, tom 2, floor tom
  //   doubles-kick double strokes move to the kick (feet alternate)
  function sticking({ pattern, orchestration = 'snare' }) {
    const groups = pattern.trim().split(/\s+/);
    const seq = groups.join('');
    const groupLen = groups[0].length;
    const bar = {};
    const hands = ['....', '....', '....', '....'].map((s) => [...s]);
    const feet = ['....', '....', '....', '....'].map((s) => [...s]);
    let foot = 'R';

    for (let i = 0; i < 16; i++) {
      const beat = i >> 2;
      const slot = i & 3;
      const k = i % seq.length;
      const hand = seq[k];
      const isDouble = hand === seq[(k + 1) % seq.length] || hand === seq[(k - 1 + seq.length) % seq.length];
      const mark = k % groupLen === 0 ? 'X' : 'x';

      let lane = 'sd';
      if (orchestration === 'right-tom') lane = hand === 'R' ? 't1' : 'sd';
      if (orchestration === 'around') lane = AROUND[beat];
      if (orchestration === 'doubles-kick' && isDouble) lane = 'bd';

      const laneGrids = ensureLane(bar, lane);
      laneGrids[beat] = laneGrids[beat].slice(0, slot) + mark + laneGrids[beat].slice(slot + 1);
      if (lane === 'bd') {
        feet[beat][slot] = foot;
        foot = foot === 'R' ? 'L' : 'R';
      } else {
        hands[beat][slot] = hand;
      }
    }
    bar.hands = hands.map((s) => s.join(''));
    if (bar.bd) bar.feet = feet.map((s) => s.join(''));
    return { bars: [bar], repeat: true };
  }

  // Groove for three bars, fill on the last `beats` beats of bar 4, crash back on 1.
  function fill({ groove: grooveName = '8beat', cells, beats, around = false }) {
    const fillCells = Array.isArray(cells) ? cells : Array(beats).fill(cells);
    if (fillCells.length !== beats) throw new Error('fill: cells must match beats');

    const first = groove(grooveName);
    ensureLane(first, 'cr')[0] = 'x...';
    first.hh[0] = '.' + first.hh[0].slice(1);

    const fillBar = groove(grooveName);
    const start = 4 - beats;
    const lanes = around ? AROUND.slice(4 - beats) : Array(beats).fill('sd');
    for (let i = 0; i < beats; i++) {
      const beat = start + i;
      for (const lane of [...HAND_LANES, 'bd']) {
        if (fillBar[lane]) fillBar[lane][beat] = empty(grid(fillCells[i]).length);
      }
      ensureLane(fillBar, lanes[i])[beat] = grid(fillCells[i]);
    }
    // One stroke stream across the fill, whichever drum each beat is on.
    const stream = [0, 1, 2, 3].map((beat) => {
      const lane = beat >= start ? lanes[beat - start] : null;
      return lane ? fillBar[lane][beat] : '....';
    });
    fillBar.hands = alternate(stream, [0, 1, 2, 3].filter((b) => b >= start));

    return { bars: [first, groove(grooveName), groove(grooveName), fillBar], repeat: true };
  }

  function literal({ bars, repeat = false, repeatEach = false }) {
    return { bars: clone(bars), repeat, repeatEach };
  }

  const GENERATORS = { progression, perturb, accents, sticking, fill, literal };

  function expandItem(spec) {
    const generate = GENERATORS[spec.use];
    if (!generate) throw new Error(`unknown generator: ${spec.use}`);
    return { category: spec.category, title: spec.title, intent: spec.intent, times: spec.times, ...generate(spec) };
  }

  function expandAll(specs) {
    return specs.map((routine) => ({
      title: routine.title,
      items: routine.items.map((spec) => {
        try {
          return expandItem(spec);
        } catch (err) {
          return { category: spec.category, title: spec.title, intent: spec.intent, error: err.message, bars: [] };
        }
      }),
    }));
  }

  const api = { CELLS, GROOVES, expandItem, expandAll };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DrumExpand = api;
})(typeof window !== 'undefined' ? window : globalThis);

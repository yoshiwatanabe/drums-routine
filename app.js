// Renders practice routines as drum notation.
//
// Grid notation (PRD §5): each bar has one string per lane per beat.
//   4 chars = straight 16th grid, 3 chars = 8th-note triplet.
//   x = hit, X = accent, g = ghost, o = open hi-hat, . = nothing
// Sticking lanes (hands / feet) use the same grid shape with R / L.
(() => {
  const VF = Vex.Flow;

  const LANES = {
    cr: { key: 'a/5/x2', line: 5.5 },
    hh: { key: 'g/5/x2', line: 5 },
    t1: { key: 'e/5', line: 4 },
    t2: { key: 'd/5', line: 3.5 },
    sd: { key: 'c/5', line: 3 },
    ft: { key: 'a/4', line: 2 },
    bd: { key: 'f/4', line: 1 },
  };
  const UP_LANES = ['cr', 'hh', 't1', 't2', 'sd', 'ft'];
  const DOWN_LANES = ['bd'];
  const STRAIGHT = { 1: '16', 2: '8', 3: '8d', 4: 'q' };
  const TRIPLET = { 1: '8', 2: 'q' };
  const CATEGORY = {
    drill: 'ドリル',
    fill: 'フィルイン',
    groove: 'グルーヴ',
    technique: '奏法',
    accent: 'アクセント',
    sticking: 'スティッキング',
  };
  const SCALE = 1.2;
  const ROW_HEIGHT = 210;
  const STAVE_TOP = 50; // VexFlow adds 4 lines of space above the staff, so line 0 sits at +40.
  const HANDS_OFFSET = 62;
  const FEET_OFFSET = 70;
  const ABOVE = VF.Modifier.Position.ABOVE;
  const BELOW = VF.Modifier.Position.BELOW;

  function hasHits(bar, lanes) {
    return lanes.some((lane) => (bar[lane] || []).some((grid) => /[^.]/.test(grid)));
  }

  function makeNote(keys, duration, isRest, stem) {
    const note = new VF.StaveNote({
      keys,
      duration: duration + (isRest ? 'r' : ''),
      stem_direction: stem,
      clef: 'percussion',
    });
    if (duration.endsWith('d')) VF.Dot.buildAndAttach([note], { all: true });
    return note;
  }

  // Rests are never dotted: in a 16th beat, split them at the 8th-note midpoint.
  function pushRest(segments, start, end, slots) {
    if (slots === 4 && start < 2 && end > 2 && !(start === 0 && end === 4)) {
      segments.push({ start, len: 2 - start, rest: true });
      segments.push({ start: 2, len: end - 2, rest: true });
    } else {
      segments.push({ start, len: end - start, rest: true });
    }
  }

  // Split one beat into notes and rests, following common drum engraving:
  // a note may sustain until the next onset (x..x = dotted 8th + 16th), but a note
  // starting on an off-16th never crosses the 8th midpoint (xx.. = 16 16 8-rest).
  function segmentBeat(grids, slots) {
    const onsets = [];
    for (let i = 0; i < slots; i++) {
      if (grids.some((g) => g.grid[i] !== '.')) onsets.push(i);
    }
    const segments = [];
    if (onsets.length === 0) {
      segments.push({ start: 0, len: slots, rest: true });
      return segments;
    }
    if (onsets[0] > 0) pushRest(segments, 0, onsets[0], slots);
    onsets.forEach((start, i) => {
      const end = i + 1 < onsets.length ? onsets[i + 1] : slots;
      if (slots === 4 && start % 2 === 1 && end - start > 1) {
        segments.push({ start, len: 1, rest: false });
        pushRest(segments, start + 1, end, slots);
      } else {
        segments.push({ start, len: end - start, rest: false });
      }
    });
    return segments;
  }

  function buildBeat(bar, beat, lanes, stem, stickingLane, stickings) {
    const grids = lanes
      .filter((lane) => bar[lane])
      .map((lane) => ({ lane, grid: bar[lane][beat] }));
    const slots = grids.length ? grids[0].grid.length : 4;
    if (grids.some((g) => g.grid.length !== slots)) {
      throw new Error(`${beat + 1}拍目: レーン間でスロット数が違う (${grids.map((g) => `${g.lane}=${g.grid}`).join(', ')})`);
    }
    if (slots !== 3 && slots !== 4) {
      throw new Error(`${beat + 1}拍目: スロット数は 3 (3連) か 4 (16分) のみ`);
    }

    const segments = segmentBeat(grids, slots);
    const wholeBeat = segments.length === 1;
    const table = slots === 4 ? STRAIGHT : TRIPLET;
    const sticking = (bar[stickingLane] || [])[beat] || '';
    const restKey = stem > 0 ? 'e/5' : 'e/4';

    const notes = segments.map((seg) => {
      const duration = wholeBeat ? 'q' : table[seg.len];
      if (!duration) throw new Error(`${beat + 1}拍目: 表せない音価 (${seg.len}スロット)`);
      if (seg.rest) return makeNote([restKey], duration, true, stem);

      const hits = grids
        .filter((g) => g.grid[seg.start] !== '.')
        .sort((a, b) => LANES[a.lane].line - LANES[b.lane].line);
      const note = makeNote(hits.map((h) => LANES[h.lane].key), duration, false, stem);
      const marks = hits.map((h) => h.grid[seg.start]);

      marks.forEach((mark, i) => {
        if (mark === 'g') {
          note.addModifier(new VF.Parenthesis(VF.Modifier.Position.LEFT), i);
          note.addModifier(new VF.Parenthesis(VF.Modifier.Position.RIGHT), i);
        }
      });
      if (marks.includes('X')) {
        note.addModifier(new VF.Articulation('a>').setPosition(stem > 0 ? ABOVE : BELOW), 0);
      }
      if (marks.includes('o')) {
        note.addModifier(new VF.Articulation('ah').setPosition(ABOVE), hits.length - 1);
      }
      const hand = sticking[seg.start];
      if (hand && hand !== '.') stickings.push({ note, text: hand, above: stem > 0 });
      return note;
    });

    return { notes, isTuplet: slots === 3 && !wholeBeat };
  }

  function drawBar(ctx, stave, bar) {
    const parts = [];
    if (hasHits(bar, UP_LANES)) parts.push({ lanes: UP_LANES, stem: 1, sticking: 'hands' });
    if (hasHits(bar, DOWN_LANES)) parts.push({ lanes: DOWN_LANES, stem: -1, sticking: 'feet' });
    if (!parts.length) return;

    const voices = [];
    const beams = [];
    const tuplets = [];
    const stickings = [];
    for (const part of parts) {
      const voiceNotes = [];
      for (let beat = 0; beat < 4; beat++) {
        const { notes, isTuplet } = buildBeat(bar, beat, part.lanes, part.stem, part.sticking, stickings);
        if (isTuplet) {
          tuplets.push(new VF.Tuplet(notes, {
            num_notes: 3,
            notes_occupied: 2,
            location: part.stem > 0 ? VF.Tuplet.LOCATION_TOP : VF.Tuplet.LOCATION_BOTTOM,
          }));
        }
        if (notes.length > 1) {
          beams.push(...VF.Beam.generateBeams(notes, {
            stem_direction: part.stem,
            groups: [new VF.Fraction(1, 4)],
          }));
        }
        voiceNotes.push(...notes);
      }
      const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
      voice.addTickables(voiceNotes);
      voices.push(voice);
    }

    new VF.Formatter().joinVoices(voices).formatToStave(voices, stave);
    voices.forEach((voice) => voice.draw(ctx, stave));
    beams.forEach((beam) => beam.setContext(ctx).draw());
    tuplets.forEach((tuplet) => tuplet.setContext(ctx).draw());

    // Sticking goes on fixed rows (hands above the staff, feet below) so letters line up.
    ctx.save();
    ctx.setFont('Arial', 15, 'bold');
    const handsY = stave.getYForLine(0) - HANDS_OFFSET;
    const feetY = stave.getYForLine(4) + FEET_OFFSET;
    for (const { note, text, above } of stickings) {
      const x = (note.getNoteHeadBeginX() + note.getNoteHeadEndX()) / 2;
      ctx.fillText(text, x - ctx.measureText(text).width / 2, above ? handsY : feetY);
    }
    ctx.restore();
  }

  function renderItem(item, container) {
    // Lay out in unscaled units, then scale up so the score reads from the kit.
    const width = container.clientWidth;
    const logicalWidth = width / SCALE;
    const barsPerRow = Math.min(logicalWidth >= 700 ? 2 : 1, item.bars.length);
    const barWidth = Math.floor(logicalWidth / barsPerRow);
    const rows = Math.ceil(item.bars.length / barsPerRow);

    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    renderer.resize(width, rows * ROW_HEIGHT * SCALE);
    const ctx = renderer.getContext();
    ctx.scale(SCALE, SCALE);

    item.bars.forEach((bar, i) => {
      const col = i % barsPerRow;
      const row = Math.floor(i / barsPerRow);
      const stave = new VF.Stave(col * barWidth, row * ROW_HEIGHT + STAVE_TOP, barWidth - 1);
      if (col === 0) stave.addClef('percussion');
      if (i === 0) stave.addTimeSignature('4/4');
      if (item.repeat && i === 0) stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      if (item.repeat && i === item.bars.length - 1) stave.setEndBarType(VF.Barline.type.REPEAT_END);
      stave.setContext(ctx).draw();
      drawBar(ctx, stave, bar);
    });
  }

  // --- App shell -----------------------------------------------------------

  const routines = window.ROUTINES || [];
  const els = {
    title: document.getElementById('routine-title'),
    counter: document.getElementById('counter'),
    items: document.getElementById('items'),
    prev: document.getElementById('prev'),
    next: document.getElementById('next'),
  };
  let index = Math.min(Math.max(parseInt(location.hash.slice(1), 10) - 1 || 0, 0), Math.max(routines.length - 1, 0));
  let renderedWidth = 0;

  function render() {
    const routine = routines[index];
    if (!routine) return;
    els.title.textContent = routine.title;
    els.counter.textContent = `${index + 1} / ${routines.length}`;
    els.prev.disabled = index === 0;
    els.next.disabled = index === routines.length - 1;
    els.items.innerHTML = '';

    routine.items.forEach((item, k) => {
      const section = document.createElement('section');
      section.className = 'item';
      const heading = document.createElement('h2');
      const category = document.createElement('span');
      category.className = 'category';
      category.textContent = `${k + 1}. ${CATEGORY[item.category] || item.category}`;
      heading.append(category, item.title);
      const intent = document.createElement('p');
      intent.className = 'intent';
      intent.textContent = item.intent || '';
      const score = document.createElement('div');
      score.className = 'score';
      section.append(heading, intent, score);
      els.items.appendChild(section);

      try {
        renderItem(item, score);
      } catch (err) {
        console.error(item.title, err);
        score.classList.add('error');
        score.textContent = `描画エラー: ${err.message}`;
      }
    });
    renderedWidth = els.items.clientWidth;
  }

  function go(delta) {
    const target = index + delta;
    if (target < 0 || target >= routines.length) return;
    index = target;
    history.replaceState(null, '', `#${index + 1}`);
    render();
    window.scrollTo(0, 0);
  }

  els.prev.addEventListener('click', () => go(-1));
  els.next.addEventListener('click', () => go(1));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  let touchStart = null;
  document.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) go(dx < 0 ? 1 : -1);
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (els.items.clientWidth !== renderedWidth) render();
    }, 200);
  });

  render();
})();

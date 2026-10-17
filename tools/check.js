// Expands all routine templates and checks the grids are renderable.
// Usage: node tools/check.js [--print]
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { expandAll } = require('../expand.js');

const ROOT = path.join(__dirname, '..');
const HAND_LANES = ['cr', 'rd', 'hh', 't1', 't2', 'sd', 'ft'];
const FOOT_LANES = ['bd', 'hf'];
const LANES = [...HAND_LANES, ...FOOT_LANES];
const STICKINGS = { hands: HAND_LANES, feet: FOOT_LANES };

function load(file, name) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox);
  return sandbox.window[name] || [];
}

function checkBar(bar) {
  const errors = [];
  for (const key of Object.keys(bar)) {
    if (!LANES.includes(key) && !STICKINGS[key] && key !== 'strokes') errors.push(`unknown lane "${key}"`);
    if (!Array.isArray(bar[key]) || bar[key].length !== 4) errors.push(`${key}: needs 4 beats`);
  }
  for (let beat = 0; beat < 4; beat++) {
    for (const [stick, voice] of Object.entries(STICKINGS)) {
      const grids = voice.filter((l) => bar[l]).map((l) => bar[l][beat]);
      const lengths = new Set(grids.map((g) => g.length));
      if (lengths.size > 1) errors.push(`beat ${beat + 1}: ${stick} voice mixes slot counts (${grids.join(' ')})`);
      for (const g of grids) {
        if (!/^[xXgoc.]{3,4}$/.test(g)) errors.push(`beat ${beat + 1}: bad grid "${g}"`);
      }
      const sticking = bar[stick] && bar[stick][beat];
      if (sticking && grids.length && sticking.length !== grids[0].length) {
        errors.push(`beat ${beat + 1}: ${stick} sticking "${sticking}" does not match grid length`);
      }
      if (sticking && grids.length) {
        [...sticking].forEach((s, slot) => {
          if (s !== '.' && grids.every((g) => g[slot] === '.')) errors.push(`beat ${beat + 1}: ${stick} "${s}" on an empty slot`);
        });
      }
    }
  }
  return errors;
}

const routines = expandAll(load('routines.js', 'ROUTINE_SPECS')).concat(load('test-routines.js', 'TEST_ROUTINES'));
const print = process.argv.includes('--print');
let failures = 0;

for (const routine of routines) {
  console.log(`\n# ${routine.title}`);
  for (const item of routine.items) {
    const problems = item.error ? [item.error] : [];
    item.bars.forEach((bar, i) => checkBar(bar).forEach((e) => problems.push(`bar ${i + 1}: ${e}`)));
    failures += problems.length;
    console.log(`  ${problems.length ? 'NG' : 'ok'}  [${item.category}] ${item.title} — ${item.bars.length} bar(s)`);
    problems.forEach((p) => console.log(`        ! ${p}`));
    if (print) {
      item.bars.forEach((bar, i) => {
        console.log(`      bar ${i + 1}`);
        for (const key of ['hands', ...LANES, 'feet']) {
          if (bar[key]) console.log(`        ${key.padEnd(5)} ${bar[key].map((g) => g.padEnd(4)).join(' | ')}`);
        }
      });
    }
  }
}

console.log(failures ? `\n${failures} problem(s)` : '\nall ok');
process.exit(failures ? 1 : 0);

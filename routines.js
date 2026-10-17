// Practice routines as templates (PRD D2, decisions in REVIEW.md). Each item names a
// generator in expand.js (`use`) and its parameters, and is expanded once per lead
// hand (`leads`, default R and L). Cells: Q E S ES SE D T R, or a raw grid.
// 16th slots for `positions`: beat n starts at 4(n-1); e = +1, & = +2, a = +3.
const FILL_CELLS = ['E', 'S', 'SE', 'ES', 'D', 'xx.x', '.xxx', 'T'];
const FOOT_STAGES = ['none', 'hhQuarter', '8beat'];

// One routine per rudiment: snare, right hand to tom, around the toms, doubles to kick.
function rudiment(name, pattern, leads = ['R'], note = '') {
  const base = { use: 'sticking', category: 'sticking', pattern, leads };
  return {
    title: `ルーディメント: ${name}`,
    items: [
      { ...base, orchestration: 'snare', title: `${name} (スネア)`, intent: `${pattern}。各グループの頭にアクセント${note}` },
      { ...base, orchestration: 'right-tom', title: `${name}: 右手をタムへ`, intent: 'R はハイタム、L はスネア' },
      { ...base, orchestration: 'around', title: `${name}: タム回し`, intent: '1拍ごとにスネア → タム1 → タム2 → フロア' },
      { ...base, orchestration: 'doubles-kick', title: `${name}: ダブルをキックへ`, intent: 'RR は右足ダブル、LL は左足ダブル (ツインペダル)' },
    ],
  };
}

// Foot drill: the hand drill cells on the kick, over three accompaniments in a row.
function footDrill(from, to, subdivision = 16) {
  return {
    use: 'progression', category: 'drill', lane: 'bd', from, to, subdivision, stages: FOOT_STAGES, leadLabel: '足',
    title: `${from} → ${to} (キック)`,
    intent: '3小節ずつ: 足だけ → ハイハット4分の上 → 8ビートの中。足は左右交互 (ツインペダル)',
  };
}

window.ROUTINE_SPECS = [
  {
    title: '基礎: 4分 → 8分 → 16分',
    items: [
      {
        use: 'progression', category: 'drill', lane: 'sd', from: 'Q', to: 'E', subdivision: 8,
        title: 'Q → E (スネア)',
        intent: '8分グリッドで手を動かし続け、音符の位置だけ叩く。拍の頭は常にリードの手',
      },
      {
        use: 'progression', category: 'drill', lane: 'sd', from: 'E', to: 'S',
        title: 'E → S (スネア)',
        intent: '16分グリッドで手を動かし続ける。8分は R R (L は空振り)、16分は RLRL',
      },
      {
        use: 'positions', category: 'groove', lane: 'bd', base: [0, 8], singles: [2, 4, 6, 10, 12, 14],
        title: 'キックの8分位置 パート1',
        intent: '基本形 (1・3拍) にキックを1か所足し、位置を 1& → 2 → 2& → 3& → 4 → 4& と動かす',
      },
      {
        use: 'positions', category: 'groove', lane: 'bd', base: [0, 8], pairs: [2, 6, 10, 14], includeBase: false,
        title: 'キックの8分位置 パート2',
        intent: '基本形に、裏拍 (1& 2& 3& 4&) から2か所を足す全組み合わせ',
      },
    ],
  },
  {
    title: '足のドリル',
    items: [
      footDrill('Q', 'E', 8),
      footDrill('E', 'S'),
      footDrill('E', 'SE'),
      footDrill('E', 'ES'),
      footDrill('E', 'D'),
      footDrill('E', 'T'),
    ],
  },
  {
    title: 'フィルの手順 (ドリル)',
    items: [
      {
        use: 'progression', category: 'drill', lane: 'sd', from: 'E', to: 'SE',
        title: 'E → SE (スネア)',
        intent: 'SE = 16-16-8。16分グリッドで RLR (最後の L は空振り)',
      },
      {
        use: 'progression', category: 'drill', lane: 'sd', from: 'E', to: 'ES',
        title: 'E → ES (スネア)',
        intent: 'ES = 8-16-16。16分グリッドで R.RL',
      },
      {
        use: 'progression', category: 'drill', lane: 'sd', from: 'E', to: 'D',
        title: 'E → 付点8分+16分 (スネア)',
        intent: 'D = 付点8分+16分。16分グリッドで R..L',
      },
    ],
  },
  {
    title: 'フィル: 8ビートの中で',
    items: [
      {
        use: 'fills', category: 'fill', beats: 1, cells: FILL_CELLS, times: 4,
        title: '4拍目フィル (8種類)',
        intent: '1拍目クラッシュ + 8ビート + 4拍目だけフィル。E / S / SE / ES / D / xx.x / .xxx / 3連',
      },
      {
        use: 'fills', category: 'fill', beats: 2, cells: FILL_CELLS.map((c) => [c, c]), times: 4,
        title: '3・4拍目フィル パート1 (同じセル)',
        intent: '4拍目フィルを2拍に伸ばす。フィルに入るタイミングが1拍早くなる',
      },
      {
        use: 'fills', category: 'fill', beats: 2, times: 4,
        cells: [['E', 'S'], ['E', 'SE'], ['E', 'ES'], ['E', 'T'], ['D', 'S'], ['SE', 'S'], ['ES', 'S'], ['S', 'T']],
        title: '3・4拍目フィル パート2 (後ろほど細かく)',
        intent: '終わりに向かって密度が上がり、次の1拍目に向かう形',
      },
      {
        use: 'fills', category: 'fill', beats: 4, around: true, unit: 2, cells: FILL_CELLS, times: 4,
        title: '1小節タム回し (8種類)',
        intent: '8ビート1小節 + フィル1小節。1拍ごとにスネア → タム1 → タム2 → フロア',
      },
      {
        use: 'fills', category: 'fill', beats: 4, around: true, reverse: true, unit: 2, cells: FILL_CELLS, times: 4,
        title: '1小節タム逆回り (8種類)',
        intent: '1拍ごとにフロア → タム2 → タム1 → スネア。低い方から上がっていく',
      },
    ],
  },
  {
    title: 'フィルの譜読み (日替わり)',
    items: [
      {
        use: 'fillReading', category: 'fill', cells: FILL_CELLS, kicks: 0, times: 4,
        title: '段階1: 4拍目フィル、手だけ',
        intent: '1拍目クラッシュ + 8ビート + 4拍目フィル。太鼓はスネア → ハイ → ミッド → フロアの順に「留まる / 次へ / スネアに戻る」だけで動く',
      },
      {
        use: 'fillReading', category: 'fill', cells: FILL_CELLS, kicks: 1, times: 4,
        title: '段階2: 4拍目フィル + キック1回',
        intent: '手の1打をキックに置き換える。手の動きはそのままで、置き換えた手と同じ側の足で踏む',
      },
      {
        use: 'fillReading', category: 'fill', cells: ['S', 'SE', 'ES', 'xx.x', '.xxx', 'T'], kicks: [2, 3], times: 4,
        title: '段階3: 4拍目フィル + キック2〜3回',
        intent: '手の2〜3打をキックに置き換える。手が最低1打は残るセルだけ',
      },
      {
        use: 'fillReading', category: 'fill', cells: FILL_CELLS, full: true, perDay: 4, times: 4,
        title: '段階4: 1小節ぎっしりのフィル',
        intent: '8ビート1小節 + フィル1小節。同じルールで、1拍の中でも太鼓が移動する',
      },
    ],
  },
  {
    title: '3連',
    items: [
      {
        use: 'progression', category: 'drill', lane: 'sd', from: 'E', to: 'T',
        title: 'E → T (スネア)',
        intent: '8分 (2つ割り) と3連 (3つ割り) の切り替え。3連は RLR LRL と交互に続く',
      },
      {
        use: 'literal', category: 'drill', repeatEach: true, subdivision: 16,
        title: '休符入りの3連',
        intent: '3連の一部を抜く形。手は3連で動かし続け、抜けたところは空振り',
        bars: [
          { sd: ['xxx', 'xxx', 'xxx', 'xxx'] },
          { sd: ['x.x', 'x.x', 'x.x', 'x.x'] },
          { sd: ['xx.', 'xx.', 'xx.', 'xx.'] },
          { sd: ['.xx', '.xx', '.xx', '.xx'] },
          { sd: ['x.x', 'xx.', '.xx', 'xxx'] },
        ],
      },
      {
        use: 'literal', category: 'groove', repeatEach: true, subdivision: 16,
        title: '4分3連 (キメ)',
        intent: '2拍に3つ。スネアとキックを同時に。3・4拍目 → 1・2拍目 → 1小節ずっと',
        bars: [
          { hh: ['x.x.', 'x.x.', '...', '...'], sd: ['....', 'x...', 'x.x', '.x.'], bd: ['x...', '....', 'x.x', '.x.'] },
          { hh: ['...', '...', 'x.x.', 'x.x.'], sd: ['x.x', '.x.', '....', 'x...'], bd: ['x.x', '.x.', 'x.x.', '....'] },
          { sd: ['x.x', '.x.', 'x.x', '.x.'], bd: ['x.x', '.x.', 'x.x', '.x.'] },
        ],
      },
      {
        use: 'fills', category: 'fill', beats: 1, cells: ['RLK'], times: 4,
        title: '手足の3連 R L K (4拍目)',
        intent: '右手・左手・キックの3連。ロックの定番フィル',
      },
      {
        use: 'fills', category: 'fill', beats: 2, cells: ['RLK'], times: 4,
        title: '手足の3連 R L K (3・4拍目)',
        intent: '2拍続ける。キックが3連の最後に来る感覚を保つ',
      },
      {
        use: 'fills', category: 'fill', beats: 4, unit: 2, cells: ['RLK'], times: 4,
        title: '手足の3連 R L K (1小節、スネア)',
        intent: '8ビート1小節 + R L K を1小節',
      },
      {
        use: 'fills', category: 'fill', beats: 4, around: true, unit: 2, cells: ['RLK'], times: 4,
        title: '手足の3連 R L K (1小節、タム回し)',
        intent: '手の部分を1拍ごとにスネア → タム1 → タム2 → フロア',
      },
      {
        use: 'perturb', category: 'groove', groove: '8beat', lane: 'sd', cell: 'T', showSticking: true,
        targets: [[2], [1], [0]],
        title: '3連の位置を動かす',
        intent: 'フィルらしくない位置 (3拍目 → 2拍目 → 1拍目) に急に3連が入る',
      },
    ],
  },
  {
    title: 'アクセント',
    items: [
      {
        use: 'accents', category: 'accent', count: 1,
        title: '1拍にアクセント1つ (4通り)',
        intent: '各形を2小節ずつ。上向きの矢印 = 振り上げて準備、下向き = アクセントの後で低く止める',
      },
      {
        use: 'accents', category: 'accent', count: 2,
        title: '1拍にアクセント2つ (6通り)',
        intent: '同じ手に続くアクセントと、左右に分かれるアクセントの違いを感じる',
      },
      {
        use: 'accents', category: 'accent', count: 3,
        title: '1拍にアクセント3つ (4通り)',
        intent: 'ノンアクセントの1打を小さく保つ',
      },
    ],
  },
  {
    title: 'アクセント語彙 (小節をまたぐ形)',
    items: [
      {
        use: 'literal', category: 'accent', repeat: true, subdivision: 16,
        title: '3つ区切り (3+3+3+3+4)',
        intent: 'アクセントが3つおきに来て、拍の頭からずれていく',
        bars: [{ sd: ['XxxX', 'xxXx', 'xXxx', 'Xxxx'] }],
      },
      {
        use: 'literal', category: 'accent', repeat: true, subdivision: 16,
        title: '3-3-2 (16分)',
        intent: '2拍ごとに 3+3+2。ポップスのキメでよく出る形',
        bars: [{ sd: ['XxxX', 'xxXx', 'XxxX', 'xxXx'] }],
      },
      {
        use: 'literal', category: 'accent', repeat: true, subdivision: 16,
        title: '3-3-2 (8分取り)',
        intent: '1小節で 3+3+2。ロック、ポップスのキメ',
        bars: [{ sd: ['Xxxx', 'xxXx', 'xxxx', 'Xxxx'] }],
      },
      {
        use: 'literal', category: 'accent', repeat: true, subdivision: 16,
        title: '3+3+3+3+2+2',
        intent: '3つ区切りを2つ区切りで締める。フィルの定番',
        bars: [{ sd: ['XxxX', 'xxXx', 'xXxx', 'XxXx'] }],
      },
      {
        use: 'literal', category: 'accent', repeat: true, subdivision: 16,
        title: '3つ区切り (2小節で一巡)',
        intent: '3 × 10 + 2。2小節かけて小節の頭に戻る',
        bars: [
          { sd: ['XxxX', 'xxXx', 'xXxx', 'XxxX'] },
          { sd: ['xxXx', 'xXxx', 'XxxX', 'xxXx'] },
        ],
      },
      {
        use: 'literal', category: 'accent', repeat: true, subdivision: 16,
        title: 'ソン・クラーベ 3-2',
        intent: 'ラテン、ファンク、ポップス。1小節目に3つ、2小節目に2つ',
        bars: [
          { sd: ['Xxxx', 'xxXx', 'xxxx', 'Xxxx'] },
          { sd: ['xxxx', 'Xxxx', 'Xxxx', 'xxxx'] },
        ],
      },
      {
        use: 'literal', category: 'accent', repeat: true, subdivision: 16,
        title: 'ソン・クラーベ 2-3',
        intent: '3-2 の小節を入れ替えた形',
        bars: [
          { sd: ['xxxx', 'Xxxx', 'Xxxx', 'xxxx'] },
          { sd: ['Xxxx', 'xxXx', 'xxxx', 'Xxxx'] },
        ],
      },
    ],
  },
  {
    title: 'ゴーストノート',
    items: [
      {
        use: 'literal', category: 'drill', repeat: true, subdivision: 16,
        title: '強弱の2段階 (スネア)',
        intent: '16分で手を動かし続け、2・4拍の頭だけアクセント、他はすべてゴースト (括弧)',
        bars: [{ sd: ['gggg', 'Xggg', 'gggg', 'Xggg'] }],
      },
      {
        use: 'positions', category: 'groove', lane: 'sd', base: [4, 12], addMark: 'g', singles: [3, 7, 11, 15],
        title: '8ビート + ゴースト1か所 パート1 (a)',
        intent: '拍の最後の16分 (a) にゴースト。右手ハイハットならゴーストは左手',
      },
      {
        use: 'positions', category: 'groove', lane: 'sd', base: [4, 12], addMark: 'g', singles: [1, 5, 9, 13], includeBase: false,
        title: '8ビート + ゴースト1か所 パート2 (e)',
        intent: '拍の2つ目の16分 (e) にゴースト',
      },
      {
        use: 'positions', category: 'groove', lane: 'sd', base: [4, 12], addMark: 'g', includeBase: false,
        combos: [[3, 5], [11, 13], [3, 11], [5, 13], [3, 13], [7, 15]],
        title: '8ビート + ゴースト2か所',
        intent: 'バックビートの直前の a と直後の e など、よく聞く組み合わせ',
      },
    ],
  },
  {
    title: 'ハイハットの開閉',
    items: [
      {
        use: 'hihatOpen', category: 'groove', sets: [[2], [6], [10], [14]],
        title: 'オープン1か所 (裏拍)',
        intent: '普通の8ビート → 開閉の入った小節。○ で開き、次の + で足で閉じる',
      },
      {
        use: 'hihatOpen', category: 'groove', sets: [[2, 6], [2, 10], [2, 14], [6, 10], [6, 14], [10, 14]],
        title: 'オープン2か所 (裏拍の組み合わせ)',
        intent: '2& と 3& なら小節の真ん中で2回開く',
      },
      {
        use: 'hihatOpen', category: 'groove', sets: [[2, 6, 10, 14]],
        title: '全部の裏拍でオープン (ディスコ)',
        intent: '表で閉じ、裏で開く',
      },
      {
        use: 'hihatOpen', category: 'groove', sets: [[3], [7], [11], [15]],
        title: '16分の a でオープン',
        intent: '短く開いてすぐ閉じる。ファンク、16ビート系',
      },
      {
        use: 'literal', category: 'groove', repeatEach: true,
        title: 'ライド + 足のハイハット (2・4拍)',
        intent: 'ライドを刻みながら、足でハイハットを2・4拍に踏む (譜面の下の ×)',
        bars: [
          { rd: ['x.x.', 'x.x.', 'x.x.', 'x.x.'], sd: ['....', 'x...', '....', 'x...'], bd: ['x...', '....', 'x...', '....'], hf: ['....', 'x...', '....', 'x...'] },
          { rd: ['x...', 'x...', 'x...', 'x...'], sd: ['....', 'x...', '....', 'x...'], bd: ['x...', '....', 'x.x.', '....'], hf: ['....', 'x...', '....', 'x...'] },
        ],
      },
    ],
  },
  {
    title: '骨格の変化',
    items: [
      {
        use: 'skeleton', category: 'groove', anchors: ['snare1', 'snare2'],
        title: 'スネアの骨格',
        intent: '普通の8ビート → 2拍目か4拍目のスネアを 抜く / 8分前 / 16分前 / 8分後 / 16分後',
      },
      {
        use: 'skeleton', category: 'groove', anchors: ['kick1', 'kick2'],
        title: 'キックの骨格',
        intent: '1拍目か3拍目のキックを変える。1拍目の前倒しは前の小節の終わりに入る (食い)',
      },
    ],
  },
  {
    title: 'キック: 16分の位置と連打',
    items: [
      {
        use: 'positions', category: 'groove', lane: 'bd', base: [0, 8], singles: [3, 7, 11, 15],
        title: 'キックの16分位置 パート1 (a)',
        intent: '基本形 (1・3拍) に、拍の最後の16分 (a) のキックを1か所足す',
      },
      {
        use: 'positions', category: 'groove', lane: 'bd', base: [0, 8], singles: [1, 5, 9, 13], includeBase: false,
        extra: [[0, 3, 4, 7, 8, 11, 12, 15]],
        title: 'キックの16分位置 パート2 (e)',
        intent: '拍の2つ目の16分 (e) に足す。最後は1小節ずっと付点8分+16分',
      },
      {
        use: 'perturb', category: 'technique', groove: '8beat', lane: 'bd', cell: 'S', showSticking: true,
        targets: [[3], [2], [1], [0], [2, 3], [0, 1, 2, 3]],
        title: 'キック16分 (ツインペダル)',
        intent: '16分連打を 1拍 (4 → 1拍目) → 2拍 → 1小節と伸ばす。手のリードと足のリードをそろえる',
      },
    ],
  },
  rudiment('パラディドル', 'RLRR LRLL', ['R'], '。左右対称なので L 始まりは不要'),
  rudiment('インバーテッド・パラディドル', 'RLLR LRRL', ['R'], '。左右対称なので L 始まりは不要'),
  rudiment('リバース・パラディドル', 'RRLR LLRL', ['R'], '。左右対称なので L 始まりは不要'),
  rudiment('ダブル・パラディドル', 'RLRLRR LRLRLL', ['R'], '。6打を3連で取る'),
  rudiment('パラディドル・ディドル', 'RLRRLL', ['R', 'L'], '。6打を3連で取る'),
];

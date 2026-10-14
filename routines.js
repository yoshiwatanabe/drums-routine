// Rendering-verification routines (PRD §11-1). Grid notation is described in app.js.
window.ROUTINES = [
  {
    title: '描画検証 1: 基本・休符・付点・オープン',
    items: [
      {
        category: 'drill',
        title: 'SE を4回 (スネア)',
        intent: '16分-16分-8分。手のスティッキングを譜面の上に表示',
        repeat: true,
        bars: [
          { sd: ['xxx.', 'xxx.', 'xxx.', 'xxx.'], hands: ['RLR.', 'LRL.', 'RLR.', 'LRL.'] },
        ],
      },
      {
        category: 'groove',
        title: '8ビート + 付点8分/休符のキック',
        intent: '1拍目キック = 付点8分+16分 (x..x)、3拍目 = 16-16-休-16 (xx.x)',
        bars: [
          {
            hh: ['x.x.', 'x.x.', 'x.x.', 'x.x.'],
            sd: ['....', 'x...', '....', 'x...'],
            bd: ['x..x', '....', 'xx.x', '....'],
          },
        ],
      },
      {
        category: 'groove',
        title: 'ハイハットのオープン + 表拍アクセント',
        intent: '4拍目ウラでオープン (o)。表拍のハイハットにアクセント',
        bars: [
          {
            hh: ['X.x.', 'X.x.', 'X.x.', 'X.o.'],
            sd: ['....', 'x...', '....', 'x...'],
            bd: ['x...', '....', 'x.x.', '....'],
          },
        ],
      },
      {
        category: 'groove',
        title: 'ゴーストノート入り',
        intent: 'スネアのゴースト (g) を括弧付きで表示',
        bars: [
          {
            hh: ['x.x.', 'x.x.', 'x.x.', 'x.x.'],
            sd: ['...g', 'x..g', '.g..', 'x...'],
            bd: ['x...', '..x.', 'x...', '....'],
          },
        ],
      },
    ],
  },
  {
    title: '描画検証 2: アクセント・スティッキング',
    items: [
      {
        category: 'accent',
        title: '反復型アクセント (1つ目 → 2つ目)',
        intent: '1小節目は各拍の頭、2小節目は各拍の2つ目',
        repeat: true,
        bars: [
          { sd: ['Xxxx', 'Xxxx', 'Xxxx', 'Xxxx'], hands: ['RLRL', 'RLRL', 'RLRL', 'RLRL'] },
          { sd: ['xXxx', 'xXxx', 'xXxx', 'xXxx'], hands: ['RLRL', 'RLRL', 'RLRL', 'RLRL'] },
        ],
      },
      {
        category: 'accent',
        title: '3つ区切り (3+3+3+3+4)',
        intent: '16分のアクセントが3つおきに来て、拍の頭からずれていく',
        repeat: true,
        bars: [
          { sd: ['XxxX', 'xxXx', 'xXxx', 'Xxxx'], hands: ['RLRL', 'RLRL', 'RLRL', 'RLRL'] },
        ],
      },
      {
        category: 'sticking',
        title: 'パラディドル (スネア)',
        intent: 'RLRR LRLL。各グループの頭にアクセント',
        repeat: true,
        bars: [
          { sd: ['Xxxx', 'Xxxx', 'Xxxx', 'Xxxx'], hands: ['RLRR', 'LRLL', 'RLRR', 'LRLL'] },
        ],
      },
      {
        category: 'sticking',
        title: 'パラディドル × バスドラ',
        intent: 'ダブルの部分をキックに置き換え。足のスティッキングは譜面の下',
        repeat: true,
        bars: [
          {
            sd: ['xx..', 'xx..', 'xx..', 'xx..'],
            bd: ['..xx', '..xx', '..xx', '..xx'],
            hands: ['RL..', 'LR..', 'RL..', 'LR..'],
            feet: ['..RL', '..RL', '..RL', '..RL'],
          },
        ],
      },
    ],
  },
  {
    title: '描画検証 3: 3連',
    items: [
      {
        category: 'groove',
        title: '4拍目だけキックが3連 (L1)',
        intent: '8ビートの中で、キックだけ1拍分3連になる',
        bars: [
          {
            hh: ['x.x.', 'x.x.', 'x.x.', 'x.x.'],
            sd: ['....', 'x...', '....', 'x...'],
            bd: ['x...', '....', 'x...', 'xxx'],
            feet: ['R...', '....', 'R...', 'RLR'],
          },
        ],
      },
      {
        category: 'groove',
        title: 'キックが1小節3連 (L2: 3:2)',
        intent: 'ハイハット8分の下で、キックが3連を続ける',
        bars: [
          {
            hh: ['x.x.', 'x.x.', 'x.x.', 'x.x.'],
            sd: ['....', 'x...', '....', 'x...'],
            bd: ['xxx', 'xxx', 'xxx', 'xxx'],
            feet: ['RLR', 'LRL', 'RLR', 'LRL'],
          },
        ],
      },
      {
        category: 'drill',
        title: 'スネア3連 (休符入り)',
        intent: '1小節目は3連のみ、2小節目は休符を含む3連 (x.x / xx. / .xx)',
        repeat: true,
        bars: [
          { sd: ['xxx', 'xxx', 'xxx', 'xxx'], hands: ['RLR', 'LRL', 'RLR', 'LRL'] },
          { sd: ['x.x', 'xx.', '.xx', 'xxx'], hands: ['R.L', 'RL.', '.LR', 'LRL'] },
        ],
      },
    ],
  },
];

// Practice routines as templates (PRD D2, decisions in REVIEW.md). Each item names a
// generator in expand.js (`use`) and its parameters, and is expanded once per lead
// hand (`leads`, default R and L). Cells: Q E S ES SE D T R, or a raw grid.
// 16th slots for `positions`: beat n starts at 4(n-1); e = +1, & = +2, a = +3.
const FILL_CELLS = ['E', 'S', 'SE', 'ES', 'D', 'xx.x', '.xxx', 'T'];

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
        intent: '2-2 のフィルを2拍に伸ばす。フィルに入るタイミングが1拍早くなる',
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
      {
        use: 'literal', category: 'accent', repeat: true, subdivision: 16,
        title: '3つ区切り (3+3+3+3+4)',
        intent: 'アクセントが3つおきに来て、拍の頭からずれていく',
        bars: [{ sd: ['XxxX', 'xxXx', 'xXxx', 'Xxxx'] }],
      },
      {
        use: 'literal', category: 'accent', repeat: true, subdivision: 16,
        title: '3-3-2',
        intent: '2拍ごとに 3+3+2。ポップスのキメでよく出る形',
        bars: [{ sd: ['XxxX', 'xxXx', 'XxxX', 'xxXx'] }],
      },
    ],
  },
  {
    title: 'パラディドル展開',
    items: [
      {
        use: 'sticking', category: 'sticking', pattern: 'RLRR LRLL', orchestration: 'snare', leads: ['R'],
        title: 'パラディドル (スネア)',
        intent: '左右対称の手順なので L 始まりは不要 (2拍ずらすと同じ)',
      },
      {
        use: 'sticking', category: 'sticking', pattern: 'RLRR LRLL', orchestration: 'right-tom', leads: ['R'],
        title: 'パラディドル: 右手をタムへ',
        intent: 'R はハイタム、L はスネア。手順は同じで音色だけ変わる',
      },
      {
        use: 'sticking', category: 'sticking', pattern: 'RLRR LRLL', orchestration: 'around', leads: ['R'],
        title: 'パラディドル: タム回し',
        intent: '1拍ごとにスネア → タム1 → タム2 → フロア',
      },
      {
        use: 'sticking', category: 'sticking', pattern: 'RLRR LRLL', orchestration: 'doubles-kick', leads: ['R'],
        title: 'パラディドル: ダブルをキックへ',
        intent: 'RR は右足ダブル、LL は左足ダブル (ツインペダル)',
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
];

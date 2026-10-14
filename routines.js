// Practice routines as templates (PRD D2). Each item names a generator in
// expand.js (`use`) and its parameters. Cells: Q E S ES SE D T R, or a raw grid.
window.ROUTINE_SPECS = [
  {
    title: '基礎: 4分 → 8分 → 16分',
    items: [
      {
        use: 'progression', category: 'drill', lane: 'sd', from: 'Q', to: 'E', sticking: 'alternate',
        title: 'Q → E (スネア)',
        intent: '4分の中に8分を1拍ずつ入れる。新しい遷移か新しい拍位置が出る小節だけを残している',
      },
      {
        use: 'progression', category: 'drill', lane: 'sd', from: 'E', to: 'S', sticking: 'alternate',
        title: 'E → S (スネア)',
        intent: '8分の中に16分を入れる。16分の入りと抜けでテンポが揺れないように',
      },
      {
        use: 'progression', category: 'groove', lane: 'bd', groove: '8beat', from: 'Q', to: 'E',
        title: '8ビートでキックの8分を増やす',
        intent: '手は8ビートのまま、キックだけ4分 → 8分へ',
      },
    ],
  },
  {
    title: 'フィル: SE / ES',
    items: [
      {
        use: 'progression', category: 'drill', lane: 'sd', from: 'E', to: 'SE', sticking: 'alternate',
        title: 'E → SE (スネア)',
        intent: 'ドリル。8分の流れの中で SE (16-16-8) を出し入れする',
      },
      {
        use: 'fill', category: 'fill', groove: '8beat', cells: 'SE', beats: 1,
        title: '8ビート + 4拍目 SE フィル',
        intent: '3小節グルーヴ → 4小節目の4拍目だけフィル → 1拍目クラッシュで戻る',
      },
      {
        use: 'fill', category: 'fill', groove: '8beat', cells: 'SE', beats: 2,
        title: '8ビート + 3・4拍目 SE フィル',
        intent: 'フィルを2拍に伸ばす。フィル前で溜めない',
      },
      {
        use: 'fill', category: 'fill', groove: '8beat', cells: 'SE', beats: 4, around: true,
        title: '8ビート + 1小節 SE タム回し',
        intent: 'スネア → タム1 → タム2 → フロアタム',
      },
      {
        use: 'fill', category: 'fill', groove: '8beat', cells: 'ES', beats: 4, around: true,
        title: '8ビート + 1小節 ES タム回し',
        intent: 'ES (8-16-16) で回す。拍の頭が8分になるので SE と感覚が違う',
      },
    ],
  },
  {
    title: 'アクセント',
    items: [
      {
        use: 'accents', category: 'accent', count: 1,
        title: '1拍にアクセント1つ (4通り)',
        intent: 'RLRL のまま、アクセントの位置だけ動かす',
      },
      {
        use: 'accents', category: 'accent', count: 2,
        title: '1拍にアクセント2つ (6通り)',
        intent: '同じ手に連続するアクセントと、左右に分かれるアクセントの違いを感じる',
      },
      {
        use: 'accents', category: 'accent', count: 3,
        title: '1拍にアクセント3つ (4通り)',
        intent: 'ノンアクセントの1打を小さく保つ',
      },
      {
        use: 'literal', category: 'accent', repeat: true,
        title: '3つ区切り (3+3+3+3+4)',
        intent: 'アクセントが3つおきに来て、拍の頭からずれていく',
        bars: [{ sd: ['XxxX', 'xxXx', 'xXxx', 'Xxxx'], hands: ['RLRL', 'RLRL', 'RLRL', 'RLRL'] }],
      },
      {
        use: 'literal', category: 'accent', repeat: true,
        title: '3-3-2',
        intent: '2拍ごとに 3+3+2。ポップスのキメでよく出る形',
        bars: [{ sd: ['XxxX', 'xxXx', 'XxxX', 'xxXx'], hands: ['RLRL', 'RLRL', 'RLRL', 'RLRL'] }],
      },
    ],
  },
  {
    title: 'パラディドル展開',
    items: [
      {
        use: 'sticking', category: 'sticking', pattern: 'RLRR LRLL', orchestration: 'snare',
        title: 'パラディドル (スネア)',
        intent: '各グループの頭にアクセント',
      },
      {
        use: 'sticking', category: 'sticking', pattern: 'RLRR LRLL', orchestration: 'right-tom',
        title: 'パラディドル: 右手をタムへ',
        intent: 'R はタム1、L はスネア。手順は同じで音色だけ変わる',
      },
      {
        use: 'sticking', category: 'sticking', pattern: 'RLRR LRLL', orchestration: 'around',
        title: 'パラディドル: タム回し',
        intent: '1拍ごとにスネア → タム1 → タム2 → フロアタム',
      },
      {
        use: 'sticking', category: 'sticking', pattern: 'RLRR LRLL', orchestration: 'doubles-kick',
        title: 'パラディドル: ダブルをキックへ',
        intent: 'RR / LL の部分をキック (ツインペダル R L) に置き換える',
      },
    ],
  },
  {
    title: '変則: キック',
    items: [
      {
        use: 'perturb', category: 'groove', groove: '8beat', lane: 'bd', cell: 'T', sticking: 'alternate',
        title: 'キックだけ3連 (1拍 → 1小節)',
        intent: '4拍目 → 3拍目 → 2拍目 → 1拍目の1拍だけ3連、最後に1小節ずっと3連 (3:2)',
      },
      {
        use: 'perturb', category: 'groove', groove: '8beat', lane: 'bd', cell: 'D',
        title: 'キックの付点8分 (x..x)',
        intent: '1拍だけキックが付点8分+16分。ウラの16分を食い気味にしない',
      },
      {
        use: 'perturb', category: 'technique', groove: '16beat', lane: 'bd', cell: 'S', sticking: 'alternate',
        title: '16ビート + キック16分 (ツインペダル)',
        intent: '1拍ずつキックを16分にする。手の16分とずれないように',
      },
    ],
  },
  {
    title: '変則: スネア',
    items: [
      {
        use: 'perturb', category: 'groove', groove: '8beat', lane: 'sd', cell: '...x', merge: true,
        title: 'スネアの16分ウラ',
        intent: '1拍だけ、拍の最後の16分にスネアが足される。2・4拍のバックビートは残す',
      },
      {
        use: 'perturb', category: 'groove', groove: '8beat', lane: 'sd', cell: 'T', sticking: 'alternate',
        title: 'スネア3連 (両手)',
        intent: '1拍だけ両手でスネア3連。ハイハットは休む',
      },
    ],
  },
];

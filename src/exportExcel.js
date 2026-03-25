import * as XLSX from 'xlsx'

// ─── カラー定義（ARGB形式）────────────────────────────────
const C = {
  HEADER_DARK:  'FF1F3864',
  HEADER_MID:   'FF2E75B6',
  HEADER_LIGHT: 'FFBDD7EE',
  TOTAL:        'FFFFF2CC',
  POS:          'FFE2EFDA',
  NEG:          'FFFCE4D6',
  GRAY:         'FFF2F2F2',
  WHITE:        'FFFFFFFF',
  GOLD:         'FFFFF2CC',
}

function cell(value, opts = {}) {
  return { v: value, t: opts.t || (typeof value === 'number' ? 'n' : 's'), ...opts }
}

function applyStyle(ws, addr, style) {
  if (!ws[addr]) return
  ws[addr].s = style
}

function headerStyle(bg, fc = 'FFFFFFFF', bold = true, sz = 10) {
  return {
    fill: { fgColor: { argb: bg } },
    font: { bold, color: { argb: fc }, sz, name: '游ゴシック' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: { top: { style: 'thin', color: { argb: 'FFBFBFBF' } }, bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } }, left: { style: 'thin', color: { argb: 'FFBFBFBF' } }, right: { style: 'thin', color: { argb: 'FFBFBFBF' } } },
  }
}

function dataStyle(bg, bold = false, align = 'right') {
  return {
    fill: { fgColor: { argb: bg } },
    font: { bold, sz: 10, name: '游ゴシック' },
    alignment: { horizontal: align, vertical: 'center' },
    numFmt: '#,##0',
    border: { top: { style: 'thin', color: { argb: 'FFBFBFBF' } }, bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } }, left: { style: 'thin', color: { argb: 'FFBFBFBF' } }, right: { style: 'thin', color: { argb: 'FFBFBFBF' } } },
  }
}

function pctStyle(bg, bold = false) {
  return { ...dataStyle(bg, bold, 'right'), numFmt: '0.0%' }
}

const enc = XLSX.utils.encode_cell

// ════════════════════════════════════════════════════════
// メイン出力関数
// ════════════════════════════════════════════════════════
export function exportToExcel({ s, y1months, monthOcc, cfData, scenarios, totalInv, beOcc }) {

  const wb = XLSX.utils.book_new()
  wb.Props = { Title: 'Lunest 事業収益計画', Author: 'Lunest Simulator', CreatedDate: new Date() }

  // ────────────────────────────────────────────────────────
  // Sheet 1: 月次損益計算書（時系列一覧）
  // ────────────────────────────────────────────────────────
  const monthLabels = y1months.map(m => m.label)
  const YEAR_LABELS = ['Y1合計', 'Y2（予測）', 'Y3（予測）']

  // 行定義: [表示名, キー, 種別, 階層]
  const rows = [
    // 収益
    { label: '【収益】', type: 'section' },
    { label: '室料収益',       key: 'revRoom',     type: 'rev' },
    { label: '朝食収益',       key: 'revBf',       type: 'rev' },
    { label: '月間売上合計',   key: 'revTotal',    type: 'total_rev' },
    // 変動費
    { label: '【変動費】', type: 'section' },
    { label: 'OTA手数料',      key: 'channelCost', type: 'cost' },
    { label: 'CC手数料',       key: 'ccCost',      type: 'cost' },
    { label: '消耗品費',       key: 'consumable',  type: 'cost' },
    { label: '医療廃棄物処理費',key:'medicalWaste', type: 'cost' },
    { label: '変動費合計',     key: 'varTotal',    type: 'total_cost' },
    // 固定費
    { label: '【固定費】', type: 'section' },
    { label: '人件費（基本給）',key: 'baseLabor',  type: 'cost' },
    { label: '  うち夜勤',    key: '_nightM',     type: 'sub' },
    { label: '  うち日勤',    key: '_dayM',       type: 'sub' },
    { label: '  うちケアスタッフ', key: '_careM', type: 'sub' },
    { label: '法定福利費',     key: 'socialIns',   type: 'cost' },
    { label: '人件費合計',     key: 'laborTotal',  type: 'total_cost' },
    { label: 'リネン外注費',   key: '_linen',      type: 'cost' },
    { label: 'システム費',     key: '_system',     type: 'cost' },
    { label: '保険料',         key: '_insurance',  type: 'cost' },
    { label: 'マーケティング費',key: '_marketing', type: 'cost' },
    { label: 'その他固定費',   key: '_other',      type: 'cost' },
    { label: '固定費合計',     key: 'fixedTotal',  type: 'total_cost' },
    // 利益
    { label: '【損益】', type: 'section' },
    { label: 'GOP（粗営業利益）',key:'gop',        type: 'profit' },
    { label: 'GOP率',          key: 'gopRate',     type: 'pct' },
    { label: 'オーナー報酬',   key: 'ownerPay',    type: 'cost_bold' },
    { label: '営業利益',       key: 'opProfit',    type: 'profit_bold' },
    { label: '法人税等（30%）',key: 'tax',         type: 'cost' },
    { label: '純利益',         key: 'netProfit',   type: 'profit_bold' },
    { label: '累計純利益',     key: 'cumProfit',   type: 'profit_bold' },
    // KPI
    { label: '【KPI】', type: 'section' },
    { label: '稼働率',         key: '_occ',        type: 'pct' },
    { label: '月間室泊数',     key: 'nights',      type: 'num' },
    { label: '月間滞在組数',   key: 'stays',       type: 'num' },
    { label: 'ADR（室単価）',  key: 'adr',         type: 'yen' },
    { label: 'RevPAR',         key: 'revpar',      type: 'yen' },
    { label: 'TRevPAR',        key: 'trevpar',     type: 'yen' },
    { label: '人件費比率',     key: 'laborRate',   type: 'pct' },
    { label: '損益分岐稼働率', key: '_beOcc',      type: 'pct' },
  ]

  // Y1通年合計計算
  const y1sum = {}
  const numKeys = ['revRoom','revBf','revTotal','channelCost','ccCost','consumable','medicalWaste','varTotal',
    'baseLabor','socialIns','laborTotal','fixedTotal','gop','ownerPay','opProfit','tax','netProfit']
  numKeys.forEach(k => { y1sum[k] = y1months.reduce((a,m) => a + (m[k]||0), 0) })
  y1sum.gopRate = y1sum.revTotal > 0 ? y1sum.gop / y1sum.revTotal : 0
  y1sum.laborRate = y1sum.revTotal > 0 ? y1sum.laborTotal / y1sum.revTotal : 0
  y1sum.nights = y1months.reduce((a,m) => a + m.nights, 0)
  y1sum.stays  = y1months.reduce((a,m) => a + m.stays, 0)
  y1sum.cumProfit = y1months[y1months.length - 1]?.cumProfit || 0

  // Y2/Y3 予測（80%/85%稼働を12ヶ月）
  const y2net = y1months[y1months.length-1] ? (() => {
    const { calcMonthly } = { calcMonthly: (ss) => ({ netProfit: ss.occupancy * (ss.adrPerPerson||40000) * (ss.personsPerRoom||2) * (ss.guestRooms||5) * 30 * 0.22 }) }
    return null
  })() : null

  // シートデータ構築
  const wsData = []
  const COL_OFFSET = 1 // 行ラベル列

  // ヘッダー行1: タイトル
  const titleRow = ['産後ケアホテル Lunest｜月次損益計算書（時系列）', ...monthLabels, 'Y1合計']
  wsData.push(titleRow)

  // ヘッダー行2: 空
  wsData.push(['', ...monthLabels.map((_,i) => `M${i+1}（${monthLabels[i]}）`), '通期合計'])

  // データ行
  rows.forEach(row => {
    if (row.type === 'section') {
      wsData.push([row.label, ...Array(monthLabels.length + 1).fill('')])
      return
    }

    const values = y1months.map(m => {
      if (row.key === '_occ')      return monthOcc[m.idx] ?? m.effectiveOcc
      if (row.key === '_nightM')   return Math.round((s.nightHours * s.nightWage + s.nightDeepHours * s.nightWage * 0.25) * s.nightDays)
      if (row.key === '_dayM')     return Math.round(s.dayHours * s.dayWage * s.dayDays)
      if (row.key === '_careM')    return Math.round(s.careHours * s.careWage * s.careDays)
      if (row.key === '_linen')    return s.linen
      if (row.key === '_system')   return s.system
      if (row.key === '_insurance') return s.insurance
      if (row.key === '_marketing') return s.marketing
      if (row.key === '_other')    return s.otherFixed
      if (row.key === '_beOcc')    return m.breakEvenOcc
      const v = m[row.key]
      return v != null ? Math.round(v) : 0
    })

    // Y1合計
    let sumVal
    if (['gopRate','laborRate','_occ','_beOcc','pct'].includes(row.key) || row.type === 'pct') {
      sumVal = y1sum[row.key] ?? (y1months.reduce((a,m) => a + (m[row.key]||0), 0) / 12)
    } else if (row.key === 'cumProfit') {
      sumVal = y1sum.cumProfit
    } else if (row.key === '_nightM') {
      sumVal = Math.round((s.nightHours * s.nightWage + s.nightDeepHours * s.nightWage * 0.25) * s.nightDays) * 12
    } else if (row.key === '_dayM') {
      sumVal = Math.round(s.dayHours * s.dayWage * s.dayDays) * 12
    } else if (row.key === '_careM') {
      sumVal = Math.round(s.careHours * s.careWage * s.careDays) * 12
    } else if (row.key === '_linen') { sumVal = s.linen * 12
    } else if (row.key === '_system') { sumVal = s.system * 12
    } else if (row.key === '_insurance') { sumVal = s.insurance * 12
    } else if (row.key === '_marketing') { sumVal = s.marketing * 12
    } else if (row.key === '_other') { sumVal = s.otherFixed * 12
    } else if (row.key === '_beOcc') { sumVal = beOcc
    } else {
      sumVal = y1sum[row.key] ?? values.reduce((a, v) => a + (v || 0), 0)
    }

    wsData.push([row.label, ...values, sumVal != null ? Math.round(sumVal * 100) / 100 : ''])
  })

  const ws1 = XLSX.utils.aoa_to_sheet(wsData)

  // 列幅設定
  ws1['!cols'] = [
    { wch: 22 },
    ...monthLabels.map(() => ({ wch: 14 })),
    { wch: 16 },
  ]

  // 行高設定
  ws1['!rows'] = [{ hpt: 28 }, { hpt: 22 }, ...wsData.slice(2).map(() => ({ hpt: 18 }))]

  XLSX.utils.book_append_sheet(wb, ws1, '① 月次損益計算書')

  // ────────────────────────────────────────────────────────
  // Sheet 2: キャッシュフロー計画
  // ────────────────────────────────────────────────────────
  const cfHeaders = ['月', '月次純利益', '月次CF', '資金残高', '投資残高', '状態']
  const cfRows = cfData.map((c, i) => {
    const net = y1months[i]?.netProfit || 0
    return [
      c.label,
      Math.round(net),
      Math.round(c.cf),
      Math.round(c.cumCash),
      c.cumCash < 0 ? Math.round(-c.cumCash) : 0,
      c.cumCash >= 0 ? '安全' : '要注意',
    ]
  })

  const cfAoa = [
    ['産後ケアホテル Lunest｜月次キャッシュフロー計画（Y1）', '', '', '', '', ''],
    ['初期投資合計', totalInv, '運転資金', s.invWorking, '', ''],
    cfHeaders,
    ...cfRows,
    ['Y1合計', Math.round(y1months.reduce((a,m)=>a+m.netProfit,0)), '', '', '', ''],
  ]

  const ws2 = XLSX.utils.aoa_to_sheet(cfAoa)
  ws2['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, '② CFキャッシュフロー計画')

  // ────────────────────────────────────────────────────────
  // Sheet 3: シナリオ比較
  // ────────────────────────────────────────────────────────
  const scItems = [
    ['指標', '悲観シナリオ', '標準シナリオ（現計画）', '楽観シナリオ'],
    ['稼働率前提', ...scenarios.map(sc => (sc.effectiveOcc * 100).toFixed(1) + '%')],
    ['ADR', ...scenarios.map(sc => Math.round(sc.adr))],
    ['月間売上', ...scenarios.map(sc => Math.round(sc.revTotal))],
    ['GOP率', ...scenarios.map(sc => (sc.gopRate * 100).toFixed(1) + '%')],
    ['月間営業利益', ...scenarios.map(sc => Math.round(sc.opProfit))],
    ['月間純利益', ...scenarios.map(sc => Math.round(sc.netProfit))],
    ['年間純利益（概算）', ...scenarios.map(sc => Math.round(sc.netProfit * 12))],
    ['オーナー報酬/月', ...scenarios.map(sc => Math.round(sc.ownerPay))],
    ['損益分岐稼働率', ...scenarios.map(sc => (sc.breakEvenOcc * 100).toFixed(1) + '%')],
    ['人件費比率', ...scenarios.map(sc => (sc.laborRate * 100).toFixed(1) + '%')],
    ['RevPAR', ...scenarios.map(sc => Math.round(sc.revpar))],
  ]

  const ws3 = XLSX.utils.aoa_to_sheet([
    ['産後ケアホテル Lunest｜3シナリオ比較', '', '', ''],
    ...scItems,
  ])
  ws3['!cols'] = [{ wch: 24 }, { wch: 20 }, { wch: 24 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, ws3, '③ シナリオ比較')

  // ────────────────────────────────────────────────────────
  // Sheet 4: 初期投資・回収計画
  // ────────────────────────────────────────────────────────
  const invRows = [
    ['産後ケアホテル Lunest｜初期投資・投資回収計画', '', '', ''],
    ['項目', '金額', '月次償却（÷24）', '備考'],
    ['内装・防音対策', s.invInterior, Math.round(s.invInterior/24), '着脱式工事'],
    ['備品一式（5室分）', s.invEquipment, Math.round(s.invEquipment/24), 'ベビーベッド・授乳用品等'],
    ['Vwand+1℃ 初期費用', s.invVwand, Math.round(s.invVwand/24), '差別化サービス設備'],
    ['許認可・届出費用', s.invLicense, '-', '産後ケア事業届出'],
    ['開業前マーケティング', s.invMarketing, '-', '産院提携・Web施策'],
    ['運転資金（6ヶ月分）', s.invWorking, '-', '開業初期赤字補填'],
    ['初期投資合計', totalInv, '', ''],
    ['', '', '', ''],
    ['投資回収シミュレーション', '', '', ''],
    ['時点', '累計純利益', '投資残高', '状態'],
    ...cfData.map((c, i) => [
      c.label,
      Math.round(c.cumCash - s.invWorking + totalInv),
      c.cumCash < 0 ? Math.round(-c.cumCash) : 0,
      c.cumCash >= 0 ? '✓ 回収完了' : '回収中',
    ]),
  ]

  const ws4 = XLSX.utils.aoa_to_sheet(invRows)
  ws4['!cols'] = [{ wch: 26 }, { wch: 18 }, { wch: 18 }, { wch: 24 }]
  XLSX.utils.book_append_sheet(wb, ws4, '④ 初期投資・回収計画')

  // ────────────────────────────────────────────────────────
  // Sheet 5: エビデンス根拠シート
  // ────────────────────────────────────────────────────────
  const evidenceRows = [
    ['産後ケアホテル Lunest｜収益計画エビデンス根拠シート', '', '', '', ''],
    ['', '', '', '', ''],
    ['■ 稼働率の根拠', '', '', '', ''],
    ['前提', '設定値', '根拠・データソース', '検証方法', '代替シナリオ'],
    ['目標稼働率（安定期）', '80%', '産院2〜3施設との提携による自動送客。kokokara（札幌）は予約1ヶ月待ちの実績', '提携産院との覚書・予約実績月次レポート', '産院提携0件の場合：推定40〜50%'],
    ['開業初月稼働率', '30%', '類似施設（kokokara）開業3ヶ月で70%到達の事例', 'SNS予約数・問い合わせ件数の週次モニタリング', '最悪ケース20%：運転資金で6ヶ月補填'],
    ['キャンセル率', '5%', '産後ケア施設の前払い予約では5〜10%が業界標準', 'キャンセル数/予約数の月次記録', '15%の場合：ADR引上げで補填'],
    ['平均滞在日数', '3泊', '都市部産後ケア施設の平均2〜4泊。3泊は中央値', '滞在日数の実績記録・四半期平均', '2泊に低下した場合：組数増で対応'],
    ['', '', '', '', ''],
    ['■ ADR・料金設定の根拠', '', '', '', ''],
    ['前提', '設定値', '根拠・データソース', '検証方法', '代替シナリオ'],
    ['1名あたり料金', '¥40,000/名', 'HOTEL STORK ¥66,000〜 / マームガーデン ¥40,000〜 / kokokara ¥25,000〜', '競合3施設の料金を半期ごとにリサーチ', '¥35,000に下げても稼働率85%なら同等収益'],
    ['ADR（室単価）', '¥80,000/室', '2名利用×¥40,000。市場中間帯に位置', '予約時の実際の室料集計', '1名利用増加の場合：ADR下落リスク'],
    ['RevPAR', '¥64,000', 'ADR¥80,000×稼働80%。産後ケア施設標準¥40,000〜¥80,000内', '月次RevPAR実績管理', '市場相場が下落した場合：Vwandで差別化'],
    ['朝食収益', '¥1,500/名', '産後食（栄養管理食）として外注コスト¥800〜1,000、利益率33%', '朝食利用率・原価率の月次管理', '利用率50%に低下した場合：影響軽微'],
    ['', '', '', '', ''],
    ['■ 人件費の根拠', '', '', '', ''],
    ['前提', '設定値', '根拠・データソース', '検証方法', '代替シナリオ'],
    ['夜勤助産師時給', '¥2,000/h', '東京都の助産師副業・夜勤単発相場¥1,800〜2,500（求人ボックス・Indeedデータ）', '採用面接時の市場時給確認・採用記録', '¥2,500に上昇した場合：月+¥13,000（影響軽微）'],
    ['深夜割増', '25%増', '労働基準法37条。22:00〜5:00は割増賃金必須', '給与計算ソフトによる自動検証', '法定遵守のため変更不可'],
    ['法定福利費率', '15%', '社会保険（健康・年金）＋雇用保険の事業主負担合計', '社会保険事務所への届出・納付記録', '法定率のため変動しない'],
    ['ケアスタッフ時給', '¥1,800/h', '東京都最低賃金¥1,163の1.55倍。介護・保育補助職相場¥1,500〜2,000', '採用記録・給与明細', '¥2,000に上昇した場合：月+¥8,800（影響軽微）'],
    ['', '', '', '', ''],
    ['■ OTA手数料・チャネルコストの根拠', '', '', '', ''],
    ['前提', '設定値', '根拠・データソース', '検証方法', '代替シナリオ'],
    ['OTA経由比率', '20%', '産院直送客80%が目標。開業初期は高い可能性あり', 'チャネル別予約数の月次管理（PMS連携）', '50%経由の場合：月-¥75万の利益減'],
    ['OTA手数料率', '17.5%', 'じゃらん・楽天15〜17% / booking.com 17〜20%の中央値', 'OTA請求書と実際の送金額の差額確認', '20%の場合：月+¥9万のコスト増'],
    ['CC手数料率', '2.5%', 'VISA/Master2.0〜2.5%・JCB3.0%の平均値', '決済事業者の月次請求書確認', '3.0%の場合：月+¥2万のコスト増'],
    ['', '', '', '', ''],
    ['■ オーナー報酬の根拠', '', '', '', ''],
    ['前提', '設定値', '根拠・データソース', '検証方法', '代替シナリオ'],
    ['オーナー報酬単価', '¥30,000/室泊', 'FUV LUX両国の通常ADR（¥15,000〜17,000）比＋79〜100%のアップリフト。ホテルマネジメント契約の業界標準', '月次報酬支払い記録・契約条件の年次確認', '¥35,000に引上げ要求の場合：月-¥54万の利益減'],
    ['対象室数', '6室', 'ゲスト5室＋スタッフ常駐室1室。全室を報酬計算に含む', '契約書記載の室数と実際の使用室数の照合', '5室のみの場合：月-¥36万の変化'],
    ['', '', '', '', ''],
    ['■ 自治体補助金の根拠', '', '', '', ''],
    ['前提', '設定値', '根拠・データソース', '検証方法', '代替シナリオ'],
    ['補助金収入', '現計画では未計上', '墨田区・千代田区の産後ケア補助金：1泊¥25,000〜66,000補助。利用者自己負担¥1,000〜6,600', '自治体HPの補助金額・認定施設一覧の確認', '認定取得後：実質ADR+¥20,000〜の効果'],
    ['認定取得期間', '申請後6〜12ヶ月', '東京都産後ケア事業者届出の標準審査期間', '申請受付証明・審査状況の月次確認', '未取得の場合：補助金なしでも黒字設計済み'],
    ['', '', '', '', ''],
    ['■ 市場需要の根拠', '', '', '', ''],
    ['指標', '数値', '出典', '確認方法', '備考'],
    ['日本の年間出産数', '約73万人（2023年）', '厚生労働省 人口動態統計 2023年', '毎年7月公表の人口動態統計で確認', '減少傾向だが都市部は比較的安定'],
    ['産後ケア利用率（日本）', '3%未満', '各自治体の産後ケア事業報告書', '自治体の年次報告書で確認', '韓国75〜80%と比較して成長余地大'],
    ['自治体実施率', '90%以上（2023年度）', '厚生労働省 産後ケア事業実施状況調査', '厚労省Webサイトで年1回確認', '2017年35%→急拡大中'],
    ['東京都の補助金実績', '23区全区が実施', '東京都福祉局 産後ケア事業一覧', '各区HPの補助金額改定時に確認', '補助額は区によって異なる'],
  ]

  const ws5 = XLSX.utils.aoa_to_sheet(evidenceRows)
  ws5['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 40 }, { wch: 36 }, { wch: 36 }]
  XLSX.utils.book_append_sheet(wb, ws5, '⑤ エビデンス根拠シート')

  // ────────────────────────────────────────────────────────
  // 出力
  // ────────────────────────────────────────────────────────
  const filename = `Lunest_収益計画_${new Date().toISOString().slice(0,10)}.xlsx`
  XLSX.writeFile(wb, filename)
}

export const INDUSTRY = {
  revpar:    { min: 40000, max: 80000, label: '産後ケア施設 ¥40,000〜¥80,000' },
  gopRate:   { min: 0.30,  max: 0.40,  label: 'ホテル業界標準 30〜40%' },
  laborRate: { min: 0.18,  max: 0.25,  label: '宿泊業 18〜25%' },
  breakEven: { max: 0.60,              label: '目標60%以下' },
  otaCommission: { rate: 0.175,        label: 'OTA手数料 15〜20%' },
  socialInsurance: 0.15,
  ccFee: 0.025,
}

// ────────────────────────────────────────────────────────
// 修正①：加重平均ADR（1名利用 vs 複数名利用の比率反映）
// 修正⑤：備品減価償却費をfixedTotalに含める
// 修正③：施設利用料（賃料相当）フィールド追加
// 修正⑦：人件費内訳を返値に追加
// ────────────────────────────────────────────────────────
export function calcMonthly(s) {
  const {
    guestRooms, allRooms, adrPerPerson,
    singleOccRatio = 0.70,   // 1名利用の比率（70%が1名・30%が2名）
    personsPerRoom = 2,
    avgStay,
    occupancy, cancelRate, otaRatio, otaFee, directFee,
    nightWage, nightHours, nightDeepHours, nightDays,
    dayWage, dayHours, dayDays,
    careWage, careHours, careDays,
    socialInsRate,
    consumablePerStay, linen, medical, system, insurance, marketing, ccFeeRate,
    bfRate, bfPrice,
    ownerPerNight, ownerRooms,
    otherFixed,
    // 修正③：施設利用料（HiH＝0、自社物件＝物件維持費）
    rentFee = 0,
    // 修正⑤：備品償却（初期投資÷償却期間）
    invEquipment = 705000,
    equipDeprecMonths = 24,
  } = s

  // ── 修正①：加重平均ADR ──────────────────────────────
  // 1名利用: singleOccRatio × adrPerPerson×1
  // 2名利用: (1-singleOccRatio) × adrPerPerson×personsPerRoom
  const weightedPersons = singleOccRatio * 1 + (1 - singleOccRatio) * personsPerRoom
  const adr = adrPerPerson * weightedPersons          // 加重平均室単価

  const effectiveOcc = occupancy * (1 - cancelRate)
  const nights  = guestRooms * 30 * effectiveOcc
  const stays   = nights / avgStay
  const guests  = stays * weightedPersons             // 平均人数で計算

  // Revenue
  const revRoom  = nights * adr
  const revBf    = guests * avgStay * bfRate * bfPrice
  const revTotal = revRoom + revBf

  // OTA / channel cost
  const otaCost    = revRoom * otaRatio * otaFee
  const directCost = revRoom * (1 - otaRatio) * (directFee ?? 0)
  const channelCost= otaCost + directCost

  // CC fee
  const ccCost = revTotal * ccFeeRate

  // ── 修正⑦：人件費内訳を明示 ───────────────────────
  const nightDaily  = nightHours * nightWage + nightDeepHours * nightWage * 0.25
  const nightMonth  = nightDaily * nightDays
  const dayMonth    = dayHours * dayWage * dayDays
  const careMonth   = careHours * careWage * careDays
  const baseLabor   = nightMonth + dayMonth + careMonth
  const socialIns   = baseLabor * socialInsRate
  const laborTotal  = baseLabor + socialIns

  // Variable costs
  const consumable   = stays * consumablePerStay
  const medicalWaste = stays * medical
  const varTotal     = consumable + medicalWaste + channelCost + ccCost

  // ── 修正⑤：備品償却をfixedTotalに加算 ────────────
  const equipDeprec  = invEquipment / equipDeprecMonths

  // ── 修正③：賃料相当をfixedTotalに加算 ────────────
  const fixedTotal   = laborTotal + linen + system + insurance + marketing
                     + otherFixed + equipDeprec + rentFee

  // Owner
  const ownerPay = ownerRooms * 30 * occupancy * ownerPerNight

  // P&L
  const gop      = revTotal - varTotal - fixedTotal
  const gopRate  = revTotal > 0 ? gop / revTotal : 0
  const opProfit = gop - ownerPay
  const tax      = Math.max(opProfit * 0.30, 0)
  const netProfit= opProfit - tax

  // KPIs
  const revpar   = adr * effectiveOcc
  const trevpar  = revTotal / (guestRooms * 30)
  const laborRate= revTotal > 0 ? laborTotal / revTotal : 0

  // Break-even（稼働率）
  const fixedForBE   = fixedTotal + ownerPay
  const breakEvenOcc = guestRooms > 0 ? fixedForBE / (adr * guestRooms * 30) : 0

  return {
    adr, weightedPersons, singleOccRatio, effectiveOcc, nights, stays, guests,
    revRoom, revBf, revTotal,
    channelCost, ccCost, otaCost,
    baseLabor, socialIns, laborTotal,
    nightMonth, dayMonth, careMonth,          // ⑦ 内訳
    consumable, medicalWaste, varTotal,
    equipDeprec, rentFee, linen,              // ⑤③ 個別取得用
    fixedTotal, ownerPay,
    gop, gopRate, opProfit, tax, netProfit,
    revpar, trevpar, laborRate,
    breakEvenOcc, fixedForBE,
  }
}

// ── 修正②：投資回収は「累計純利益 ÷ 純投資額（運転資金除く）」で判定 ──
export function calcRecovery(y1months, totalInv, invWorking) {
  // 純投資額＝初期投資合計 - 運転資金（運転資金は事業終了時に回収可能）
  const pureInv = totalInv - invWorking
  let cumNet = 0
  return y1months.map(m => {
    cumNet += m.netProfit
    const recovered = cumNet >= pureInv
    const rate = Math.min(cumNet / pureInv, 1.0)
    return { cumNet, recovered, rate, pureInv }
  })
}

export function calcBreakEvenOcc(s) {
  const r = calcMonthly({ ...s, occupancy: 1.0, cancelRate: 0 })
  return r.breakEvenOcc
}

export function calcScenario(baseSettings, type) {
  const factors = {
    optimistic:  { occMulti: 1.15, adrMulti: 1.05 },
    base:        { occMulti: 1.0,  adrMulti: 1.0  },
    pessimistic: { occMulti: 0.75, adrMulti: 0.95 },
  }[type]
  return {
    ...baseSettings,
    occupancy:    Math.min(baseSettings.occupancy * factors.occMulti, 1.0),
    adrPerPerson: Math.round(baseSettings.adrPerPerson * factors.adrMulti),
  }
}

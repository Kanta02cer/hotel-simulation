export const INDUSTRY = {
  revpar: { min: 40000, max: 80000, label: '産後ケア施設 ¥40,000〜¥80,000' },
  gopRate: { min: 0.30, max: 0.40, label: 'ホテル業界標準 30〜40%' },
  laborRate: { min: 0.18, max: 0.25, label: '宿泊業 18〜25%' },
  breakEven: { max: 0.60, label: '目標60%以下' },
  otaCommission: { rate: 0.175, label: 'OTA手数料 15〜20%' },
  socialInsurance: 0.15,
  ccFee: 0.025,
};

export function calcMonthly(s) {
  const {
    guestRooms, allRooms, adrPerPerson, personsPerRoom, avgStay,
    occupancy, cancelRate, otaRatio, otaFee, directFee,
    nightWage, nightHours, nightDeepHours, nightDays,
    dayWage, dayHours, dayDays,
    careWage, careHours, careDays,
    socialInsRate,
    consumablePerStay, linen, medical, system, insurance, marketing, ccFeeRate,
    bfRate, bfPrice,
    ownerPerNight, ownerRooms,
    otherFixed,
  } = s;

  const adr = adrPerPerson * personsPerRoom;
  const effectiveOcc = occupancy * (1 - cancelRate);
  const nights = guestRooms * 30 * effectiveOcc;
  const stays = nights / avgStay;
  const guests = stays * personsPerRoom;

  // Revenue
  const revRoom = nights * adr;
  const revBf = guests * avgStay * bfRate * bfPrice;
  const revTotal = revRoom + revBf;

  // OTA commission
  const otaCost = revRoom * otaRatio * otaFee;
  const directCost = revRoom * (1 - otaRatio) * directFee;
  const channelCost = otaCost + directCost;

  // CC fee
  const ccCost = revTotal * ccFeeRate;

  // Labor
  const nightDaily = nightHours * nightWage + nightDeepHours * nightWage * 0.25;
  const nightMonth = nightDaily * nightDays;
  const dayMonth = dayHours * dayWage * dayDays;
  const careMonth = careHours * careWage * careDays;
  const baseLabor = nightMonth + dayMonth + careMonth;
  const socialIns = baseLabor * socialInsRate;
  const laborTotal = baseLabor + socialIns;

  // Variable costs
  const consumable = stays * consumablePerStay;
  const medicalWaste = stays * medical;
  const varTotal = consumable + medicalWaste + channelCost + ccCost;

  // Fixed costs
  const fixedTotal = laborTotal + linen + system + insurance + marketing + otherFixed;

  // Owner
  const ownerPay = ownerRooms * 30 * occupancy * ownerPerNight;

  // P&L
  const gop = revTotal - varTotal - fixedTotal;
  const gopRate = revTotal > 0 ? gop / revTotal : 0;
  const opProfit = gop - ownerPay;
  const tax = Math.max(opProfit * 0.30, 0);
  const netProfit = opProfit - tax;

  // KPIs
  const revpar = adr * effectiveOcc;
  const trevpar = revTotal / (guestRooms * 30);
  const laborRate = revTotal > 0 ? laborTotal / revTotal : 0;

  // Break-even
  const fixedForBE = fixedTotal + ownerPay;
  const breakEvenOcc = guestRooms > 0 ? fixedForBE / (adr * guestRooms * 30) : 0;

  return {
    adr, effectiveOcc, nights, stays, guests,
    revRoom, revBf, revTotal,
    channelCost, ccCost, otaCost,
    baseLabor, socialIns, laborTotal,
    consumable, medicalWaste, varTotal,
    fixedTotal, ownerPay,
    gop, gopRate, opProfit, tax, netProfit,
    revpar, trevpar, laborRate,
    breakEvenOcc,
    fixedForBE,
  };
}

export function calcCashflow(settings, initialInvestment, monthlyResults) {
  let cash = initialInvestment.workingCapital;
  return monthlyResults.map((m, i) => {
    cash += m.netProfit;
    return { month: i + 1, cf: m.netProfit, cumulative: cash };
  });
}

export function calcBreakEvenOcc(s) {
  const r = calcMonthly({ ...s, occupancy: 1.0, cancelRate: 0 });
  return r.breakEvenOcc;
}

export function calcScenario(baseSettings, type) {
  const factors = {
    optimistic: { occMulti: 1.15, adrMulti: 1.05 },
    base:       { occMulti: 1.0,  adrMulti: 1.0  },
    pessimistic:{ occMulti: 0.75, adrMulti: 0.95 },
  }[type];
  return {
    ...baseSettings,
    occupancy: Math.min(baseSettings.occupancy * factors.occMulti, 1.0),
    adrPerPerson: baseSettings.adrPerPerson * factors.adrMulti,
  };
}

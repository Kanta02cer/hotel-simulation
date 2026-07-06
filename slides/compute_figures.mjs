import { calcMonthly } from './calc.mjs'
const DEFAULT = {
  guestRooms:5, allRooms:6, personsPerRoom:2, avgStay:3, singleOccRatio:0.70,
  adrPerPerson:40000, bfRate:0.70, bfPrice:1500,
  otaRatio:0.20, otaFee:0.175, directFee:0.00, cancelRate:0.05, occupancy:0.80,
  nightWage:2000, nightHours:16.25, nightDeepHours:7.0, nightDays:30,
  dayWage:2000, dayHours:8.0, dayDays:30, careWage:1800, careHours:8.0, careDays:22,
  socialInsRate:0.15, consumablePerStay:5903, medical:300, ccFeeRate:0.025,
  linen:50000, system:50000, insurance:30000, marketing:100000, otherFixed:30000,
  rentFee:0, ownerPerNight:30000, ownerRooms:6,
  invInterior:500000, invEquipment:705000, equipDeprecMonths:24, invVwand:100000,
  invLicense:200000, invMarketing:300000, invWorking:7000000,
}
const MONTH_OCC=[0.30,0.40,0.50,0.55,0.60,0.65,0.70,0.72,0.75,0.78,0.80,0.80]
const MONTHS=['4月','5月','6月','7月','8月','9月','10月','11月','12月','1月','2月','3月']
const totalInv = DEFAULT.invInterior+DEFAULT.invEquipment+DEFAULT.invVwand+DEFAULT.invLicense+DEFAULT.invMarketing+DEFAULT.invWorking
const m = calcMonthly(DEFAULT)  // stable month (80%)
const R = n => Math.round(n)
// Y1 by month
let cumNet=0, y1rev=0, y1op=0, y1net=0
const pureInv = totalInv - DEFAULT.invWorking
let recoveryMonth=null
const months = MONTHS.map((label,i)=>{
  const r = calcMonthly({...DEFAULT, occupancy:MONTH_OCC[i]})
  cumNet+=r.netProfit; y1rev+=r.revTotal; y1op+=r.opProfit; y1net+=r.netProfit
  if(recoveryMonth===null && cumNet>=pureInv) recoveryMonth=label
  return {label, occ:MONTH_OCC[i], rev:R(r.revTotal), op:R(r.opProfit), net:R(r.netProfit), cum:R(cumNet)}
})
// scenarios
const defs=[['悲観',0.75,0.95],['標準',1.00,1.00],['楽観',1.15,1.05]]
const scenarios = defs.map(([label,occM,adrM])=>{
  const ss={...DEFAULT, occupancy:Math.min(DEFAULT.occupancy*occM,1.0), adrPerPerson:Math.round(DEFAULT.adrPerPerson*adrM)}
  const r=calcMonthly(ss)
  let y1=0; MONTH_OCC.forEach(o=>{ y1+=calcMonthly({...ss,occupancy:Math.min(o*occM,1.0)}).netProfit })
  return {label, occ:ss.occupancy, adr:R(r.adr), rev:R(r.revTotal), gopRate:r.gopRate, net:R(r.netProfit), y1net:R(y1), owner:R(r.ownerPay), be:r.breakEvenOcc}
})
// owner sensitivity by occ
const ownerTab=[0.4,0.5,0.6,0.7,0.8,0.9,1.0].map(occ=>{
  const r=calcMonthly({...DEFAULT,occupancy:occ})
  return {occ, rev:R(r.revTotal), owner:R(r.ownerPay), op:R(r.opProfit), net:R(r.netProfit)}
})
const out={
  stable:{adr:R(m.adr), revpar:R(m.revpar), rev:R(m.revTotal), revRoom:R(m.revRoom), revBf:R(m.revBf),
    labor:R(m.laborTotal), gop:R(m.gop), gopRate:m.gopRate, laborRate:m.laborRate,
    op:R(m.opProfit), net:R(m.netProfit), owner:R(m.ownerPay), be:m.breakEvenOcc,
    channelCost:R(m.channelCost), ccCost:R(m.ccCost), consumable:R(m.consumable), equipDeprec:R(m.equipDeprec)},
  totalInv, pureInv, recoveryMonth,
  y1:{rev:R(y1rev), op:R(y1op), net:R(y1net), recoveryRate:y1net/pureInv},
  months, scenarios, ownerTab
}
console.log(JSON.stringify(out,null,1))

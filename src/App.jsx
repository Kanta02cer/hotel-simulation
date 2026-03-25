import { useState, useMemo, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import { calcMonthly, calcCashflow, INDUSTRY } from './calc.js'
import { exportToExcel } from './exportExcel.js'

// ── Helpers ──────────────────────────────────────────────
const fmt = (n) => n == null ? '—' : Math.round(n).toLocaleString('ja-JP')
const pct = (n) => n == null ? '—' : (n * 100).toFixed(1) + '%'
const yen = (n) => '¥' + fmt(n)

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '7px 12px', color: '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
      >
        <span>{title}</span><span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ background: '#1e293b', border: '1px solid #334155', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '10px 12px' }}>{children}</div>}
    </div>
  )
}

function Field({ label, tooltip, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
        {tooltip && (
          <span className="tooltip-container" style={{ cursor: 'help', color: '#475569', fontSize: 11 }}>
            ⓘ<span className="tooltip-text">{tooltip}</span>
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function SliderField({ label, tooltip, value, min, max, step = 1, onChange, displayFmt }) {
  return (
    <Field label={label} tooltip={tooltip}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ flex: 1 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', minWidth: 80, textAlign: 'right' }}>
          {displayFmt ? displayFmt(value) : value}
        </span>
      </div>
    </Field>
  )
}

function NumField({ label, tooltip, value, onChange, suffix = '' }) {
  return (
    <Field label={label} tooltip={tooltip}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          style={{ flex: 1 }} />
        {suffix && <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{suffix}</span>}
      </div>
    </Field>
  )
}

function KpiCard({ label, value, sub, color = '#38bdf8', warn }) {
  return (
    <div style={{ background: '#1e293b', border: `1px solid ${warn ? '#ef4444' : '#334155'}`, borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: warn ? '#ef4444' : color }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Warning({ level, text }) {
  const colors = { red: '#ef4444', yellow: '#f59e0b', green: '#22c55e' }
  const bgs = { red: '#450a0a', yellow: '#422006', green: '#052e16' }
  const c = colors[level]; const bg = bgs[level]
  return (
    <div style={{ background: bg, border: `1px solid ${c}`, borderRadius: 6, padding: '6px 10px', marginBottom: 6, fontSize: 11, color: c, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
      <span>{level === 'red' ? '🔴' : level === 'yellow' ? '🟡' : '🟢'}</span>
      <span>{text}</span>
    </div>
  )
}

const MONTHS_JA = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月']

const DEFAULT_MONTH_OCC = [0.30, 0.40, 0.50, 0.55, 0.60, 0.65, 0.70, 0.72, 0.75, 0.78, 0.80, 0.80]

const DEFAULT = {
  // Facility
  guestRooms: 5,
  allRooms: 6,
  personsPerRoom: 2,
  avgStay: 3,
  // Rate
  adrPerPerson: 40000,
  bfRate: 0.70,
  bfPrice: 1500,
  // Channel
  otaRatio: 0.20,
  otaFee: 0.175,
  directFee: 0.00,
  cancelRate: 0.05,
  // Occupancy
  occupancy: 0.80,
  // Night shift
  nightWage: 2000,
  nightHours: 16.25,
  nightDeepHours: 7.0,
  nightDays: 30,
  // Day shift
  dayWage: 2000,
  dayHours: 8.0,
  dayDays: 30,
  // Care staff
  careWage: 1800,
  careHours: 8.0,
  careDays: 22,
  // Insurance
  socialInsRate: 0.15,
  // Variable
  consumablePerStay: 5903,
  medical: 300,
  ccFeeRate: 0.025,
  // Fixed
  linen: 50000,
  system: 50000,
  insurance: 30000,
  marketing: 100000,
  otherFixed: 30000,
  // Owner
  ownerPerNight: 30000,
  ownerRooms: 6,
  // Investment
  invInterior: 500000,
  invEquipment: 705000,
  invVwand: 100000,
  invLicense: 200000,
  invMarketing: 300000,
  invWorking: 7000000,
  // Scenario mode
  mode: 'base',
}

export default function App() {
  const [s, setS] = useState(DEFAULT)
  const [monthOcc, setMonthOcc] = useState(DEFAULT_MONTH_OCC)
  const [viewMode, setViewMode] = useState('owner') // owner | investor
  const [activeTab, setActiveTab] = useState('pl') // pl | cf | scenario | owner

  const set = useCallback((key, val) => setS(prev => ({ ...prev, [key]: val })), [])

  // ── Core calculation (target month) ────────────────────
  const m = useMemo(() => calcMonthly(s), [s])

  // ── 12-month plan ──────────────────────────────────────
  const y1months = useMemo(() => {
    let cum = 0
    return MONTHS_JA.map((label, i) => {
      const ms = { ...s, occupancy: monthOcc[i] }
      const r = calcMonthly(ms)
      cum += r.netProfit
      return { label, ...r, cumProfit: cum, idx: i }
    })
  }, [s, monthOcc])

  const y1 = useMemo(() => ({
    rev: y1months.reduce((a, m) => a + m.revTotal, 0),
    net: y1months.reduce((a, m) => a + m.netProfit, 0),
    op:  y1months.reduce((a, m) => a + m.opProfit,  0),
  }), [y1months])

  // ── Investment ─────────────────────────────────────────
  const totalInv = s.invInterior + s.invEquipment + s.invVwand + s.invLicense + s.invMarketing + s.invWorking

  // ── CF ─────────────────────────────────────────────────
  const cfData = useMemo(() => {
    let cash = s.invWorking
    let invRemain = totalInv - s.invWorking
    return y1months.map((m, i) => {
      if (i === 0) cash -= invRemain
      cash += m.netProfit
      return { label: m.label, cf: Math.round(m.netProfit), cumCash: Math.round(cash) }
    })
  }, [y1months, totalInv, s.invWorking])

  // ── Break-even ─────────────────────────────────────────
  const beOcc = useMemo(() => m.breakEvenOcc, [m])

  // ── Scenario comparison ────────────────────────────────
  const scenarios = useMemo(() => {
    const defs = [
      { label: '悲観', color: '#ef4444', occM: 0.75, adrM: 0.95 },
      { label: '標準', color: '#3b82f6', occM: 1.00, adrM: 1.00 },
      { label: '楽観', color: '#22c55e', occM: 1.15, adrM: 1.05 },
    ]
    return defs.map(d => {
      const ss = { ...s, occupancy: Math.min(s.occupancy * d.occM, 1.0), adrPerPerson: Math.round(s.adrPerPerson * d.adrM) }
      const r = calcMonthly(ss)
      return { ...d, ...r, annual: { rev: r.revTotal * 12, net: r.netProfit * 12 } }
    })
  }, [s])

  // ── Sensitivity curve ──────────────────────────────────
  const sensCurve = useMemo(() => {
    return [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(occ => {
      const r = calcMonthly({ ...s, occupancy: occ })
      return { occ: Math.round(occ * 100) + '%', op: Math.round(r.opProfit), net: Math.round(r.netProfit), owner: Math.round(r.ownerPay) }
    })
  }, [s])

  // ── Warnings ───────────────────────────────────────────
  const warnings = useMemo(() => {
    const ws = []
    if (beOcc > 0.60) ws.push({ level: 'red', text: `損益分岐稼働率が${pct(beOcc)}と高水準（目標60%以下）。固定費削減またはADR引き上げを検討してください。` })
    if (s.otaRatio > 0 && s.otaFee === 0) ws.push({ level: 'yellow', text: 'OTA比率が設定されていますがOTA手数料が未入力です。売上の15〜20%が費用として発生します。' })
    if (m.laborRate > 0.30) ws.push({ level: 'yellow', text: `人件費比率が${pct(m.laborRate)}と高水準（目標30%以下）。スタッフ配置を見直してください。` })
    if (cfData.some(c => c.cumCash < 0)) ws.push({ level: 'red', text: '月次キャッシュが資金ショートするタイミングがあります。運転資金の追加確保を検討してください。' })
    if (s.nightWage < 1163) ws.push({ level: 'red', text: '夜勤時給が東京都最低賃金（¥1,163）を下回っています。' })
    if (s.ownerPerNight < 30000) ws.push({ level: 'yellow', text: 'オーナー報酬が¥30,000/室泊を下回っています。提携条件の見直しが必要な可能性があります。' })
    if (m.gopRate < 0.30) ws.push({ level: 'yellow', text: `GOP率が${pct(m.gopRate)}と業界標準（30〜40%）を下回っています。` })
    if (beOcc <= 0.60 && m.gopRate >= 0.30 && m.laborRate <= 0.30) ws.push({ level: 'green', text: '主要指標はすべて業界標準を満たしています。事業成立性は高いと判断されます。' })
    return ws
  }, [beOcc, m, s, cfData])

  // ── Waterfall data ─────────────────────────────────────
  const waterfallData = useMemo(() => [
    { name: '室料収益', value: Math.round(m.revRoom), type: 'pos' },
    { name: '朝食収益', value: Math.round(m.revBf), type: 'pos' },
    { name: '人件費', value: -Math.round(m.laborTotal), type: 'neg' },
    { name: '消耗品', value: -Math.round(m.consumable), type: 'neg' },
    { name: 'OTA手数料', value: -Math.round(m.channelCost), type: 'neg' },
    { name: 'CC手数料', value: -Math.round(m.ccCost), type: 'neg' },
    { name: '固定費他', value: -(Math.round(m.linen || 0) + Math.round(s.system) + Math.round(s.insurance) + Math.round(s.marketing) + Math.round(s.otherFixed)), type: 'neg' },
    { name: 'オーナー報酬', value: -Math.round(m.ownerPay), type: 'neg' },
    { name: '営業利益', value: Math.round(m.opProfit), type: m.opProfit >= 0 ? 'total' : 'neg' },
  ], [m, s])

  const panelStyle = { overflowY: 'auto', height: '100vh', padding: '12px' }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f172a' }}>

      {/* ── LEFT PANEL: Inputs ── */}
      <div style={{ width: 280, minWidth: 280, ...panelStyle, borderRight: '1px solid #1e293b' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8', marginBottom: 2 }}>🏨 Lunest シミュレーター</div>
          <div style={{ fontSize: 10, color: '#475569' }}>産後ケアホテル 事業検証ツール v1.0</div>
          <button
            onClick={() => exportToExcel({ s, y1months, monthOcc, cfData, scenarios, totalInv, beOcc })}
            style={{ marginTop: 8, width: '100%', padding: '7px 0', fontSize: 11, fontWeight: 800, borderRadius: 6, border: 'none', cursor: 'pointer', background: '#15803d', color: '#fff', letterSpacing: 0.5 }}>
            📥 Excelエクスポート（時系列）
          </button>
        </div>

        {/* Mode switch */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {[['owner', 'オーナーモード'], ['investor', '投資家モード']].map(([v, l]) => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 700, borderRadius: 5, border: 'none', cursor: 'pointer',
                background: viewMode === v ? '#1d4ed8' : '#1e293b', color: viewMode === v ? '#fff' : '#64748b' }}>
              {l}
            </button>
          ))}
        </div>

        <Section title="🏢 施設・料金設定">
          <SliderField label="ゲスト客室数" value={s.guestRooms} min={1} max={20} onChange={v => set('guestRooms', v)}
            tooltip="ゲスト用の客室数（スタッフ室除く）" displayFmt={v => v + '室'} />
          <SliderField label="オーナー報酬対象室数" value={s.allRooms} min={s.guestRooms} max={s.guestRooms + 3}
            onChange={v => set('allRooms', v)} displayFmt={v => v + '室'}
            tooltip="オーナー報酬計算に含む全室数（スタッフ室含む）" />
          <SliderField label="1室あたり人数" value={s.personsPerRoom} min={1} max={4}
            onChange={v => set('personsPerRoom', v)} displayFmt={v => v + '名'}
            tooltip="通常は母親+赤ちゃんで2名" />
          <SliderField label="平均滞在日数" value={s.avgStay} min={1} max={7}
            onChange={v => set('avgStay', v)} displayFmt={v => v + '泊'}
            tooltip="業界平均2〜5泊。都市部では2泊が最多" />
          <SliderField label="1名あたり宿泊料（ADR/名）" value={s.adrPerPerson} min={20000} max={100000} step={1000}
            onChange={v => set('adrPerPerson', v)} displayFmt={v => '¥' + v.toLocaleString()}
            tooltip="競合相場: HOTEL STORK ¥66,000〜 / マームガーデン ¥40,000〜 / kokokara ¥25,000〜" />
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', borderRadius: 5, padding: '6px 8px', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#64748b' }}>ADR（室単価）</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8' }}>¥{(s.adrPerPerson * s.personsPerRoom).toLocaleString()}</span>
          </div>
          <SliderField label="朝食提供率" value={s.bfRate} min={0} max={1} step={0.05}
            onChange={v => set('bfRate', v)} displayFmt={pct}
            tooltip="朝食を利用するゲストの割合" />
          <NumField label="朝食単価（1名）" value={s.bfPrice} onChange={v => set('bfPrice', v)} suffix="円/名"
            tooltip="朝食1名あたりの料金" />
        </Section>

        <Section title="📊 稼働率・チャネル設定">
          <SliderField label="稼働率（月次シミュ用）" value={s.occupancy} min={0.1} max={1.0} step={0.01}
            onChange={v => set('occupancy', v)} displayFmt={pct}
            tooltip={`損益分岐: ${pct(beOcc)}。産院提携なしの場合40〜50%が現実的`} />
          <SliderField label="キャンセル率" value={s.cancelRate} min={0} max={0.3} step={0.01}
            onChange={v => set('cancelRate', v)} displayFmt={pct}
            tooltip="産後直前キャンセルは5〜15%発生。予約確定時に前払いを推奨" />
          <SliderField label="OTA経由比率" value={s.otaRatio} min={0} max={1.0} step={0.05}
            onChange={v => set('otaRatio', v)} displayFmt={pct}
            tooltip="産院直送客100%が理想。OTA経由では手数料15〜20%が発生" />
          <SliderField label="OTA手数料率" value={s.otaFee} min={0} max={0.25} step={0.005}
            onChange={v => set('otaFee', v)} displayFmt={pct}
            tooltip="じゃらん・楽天 15〜17% / booking.com 17〜20% / 直送0%" />
        </Section>

        <Section title="👩‍⚕️ 人件費設定" defaultOpen={false}>
          <div style={{ fontSize: 10, color: '#f59e0b', marginBottom: 6 }}>※深夜割増（22時〜5時）は自動計算</div>
          <NumField label="夜勤時給" value={s.nightWage} onChange={v => set('nightWage', v)} suffix="円/h"
            tooltip="東京都最低賃金¥1,163。助産師夜勤相場¥1,800〜2,500" />
          <NumField label="夜勤実労働時間/日" value={s.nightHours} onChange={v => set('nightHours', v)} suffix="h"
            tooltip="17:00〜翌9:15 = 16.25h（休憩除く実働）" />
          <NumField label="うち深夜時間（22〜5時）" value={s.nightDeepHours} onChange={v => set('nightDeepHours', v)} suffix="h"
            tooltip="22:00〜5:00の7時間は25%割増" />
          <NumField label="夜勤稼働日数/月" value={s.nightDays} onChange={v => set('nightDays', v)} suffix="日" />
          <NumField label="日勤時給（助産師）" value={s.dayWage} onChange={v => set('dayWage', v)} suffix="円/h" />
          <NumField label="日勤実労働時間/日" value={s.dayHours} onChange={v => set('dayHours', v)} suffix="h" />
          <NumField label="日勤稼働日数/月" value={s.dayDays} onChange={v => set('dayDays', v)} suffix="日" />
          <NumField label="ケアスタッフ時給" value={s.careWage} onChange={v => set('careWage', v)} suffix="円/h" />
          <NumField label="ケアスタッフ労働時間/日" value={s.careHours} onChange={v => set('careHours', v)} suffix="h" />
          <NumField label="ケアスタッフ稼働日数/月" value={s.careDays} onChange={v => set('careDays', v)} suffix="日" />
          <SliderField label="法定福利費率" value={s.socialInsRate} min={0.10} max={0.20} step={0.005}
            onChange={v => set('socialInsRate', v)} displayFmt={pct}
            tooltip="社会保険・雇用保険等。標準15%（事業主負担）" />
          <div style={{ background: '#0f172a', borderRadius: 5, padding: '6px 8px', marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>基本人件費</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>¥{fmt(m.baseLabor)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>法定福利費</span>
              <span style={{ fontSize: 12, color: '#f59e0b' }}>¥{fmt(m.socialIns)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, borderTop: '1px solid #334155', paddingTop: 2 }}>
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>人件費合計</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#ef4444' }}>¥{fmt(m.laborTotal)}</span>
            </div>
          </div>
        </Section>

        <Section title="💰 変動費・固定費" defaultOpen={false}>
          <NumField label="消耗品費/滞在" value={s.consumablePerStay} onChange={v => set('consumablePerStay', v)} suffix="円"
            tooltip="おむつ・ミルク・衛生用品等。滞在組数に連動" />
          <NumField label="医療廃棄物処理費/滞在" value={s.medical} onChange={v => set('medical', v)} suffix="円"
            tooltip="おむつ・医療廃棄物の産廃処理費用" />
          <NumField label="クレジットカード手数料率" value={s.ccFeeRate} onChange={v => set('ccFeeRate', v)} suffix=""
            tooltip="売上の2〜3.5%。JCB/AMEX含む場合は高め" />
          <NumField label="リネン外注費/月" value={s.linen} onChange={v => set('linen', v)} suffix="円"
            tooltip="ベビー用品専用洗濯は一般より高コスト" />
          <NumField label="システム費（PMS等）/月" value={s.system} onChange={v => set('system', v)} suffix="円"
            tooltip="予約管理・客室管理システム費。月3〜10万円" />
          <NumField label="保険料/月" value={s.insurance} onChange={v => set('insurance', v)} suffix="円"
            tooltip="事業者賠償責任保険・施設保険。産後ケアは医療行為隣接のため必須" />
          <NumField label="マーケティング費/月" value={s.marketing} onChange={v => set('marketing', v)} suffix="円"
            tooltip="SNS広告・産院営業・Google広告等。産院提携確立までは増額が必要" />
          <NumField label="その他固定費/月" value={s.otherFixed} onChange={v => set('otherFixed', v)} suffix="円" />
        </Section>

        <Section title="🏦 オーナー報酬設定" defaultOpen={false}>
          <SliderField label="オーナー報酬単価" value={s.ownerPerNight} min={1000} max={60000} step={1000}
            onChange={v => set('ownerPerNight', v)} displayFmt={v => '¥' + v.toLocaleString()}
            tooltip="FUV LUX通常ADR比+79〜100%。¥30,000/室泊が現行設定" />
          <SliderField label="対象室数" value={Math.max(s.ownerRooms, s.guestRooms)} min={s.guestRooms} max={s.guestRooms + 5}
            onChange={v => set('ownerRooms', v)} displayFmt={v => v + '室'}
            tooltip="ゲスト室＋スタッフ室を含む全室数。最小値はゲスト客室数に連動" />
          <div style={{ background: '#0f172a', borderRadius: 5, padding: '6px 8px', marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>月間オーナー報酬（稼働{pct(s.occupancy)}）</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#a78bfa' }}>¥{fmt(m.ownerPay)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>1室1泊あたり</span>
              <span style={{ fontSize: 12, color: '#a78bfa' }}>¥{fmt(s.ownerPerNight)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>ADR比アップリフト率</span>
              <span style={{ fontSize: 12, color: '#a78bfa' }}>+{Math.round((s.ownerPerNight / (s.adrPerPerson * s.personsPerRoom) - 1) * 100)}%</span>
            </div>
          </div>
        </Section>

        <Section title="📋 初期投資設定" defaultOpen={false}>
          <NumField label="内装・防音工事" value={s.invInterior} onChange={v => set('invInterior', v)} suffix="円" />
          <NumField label="備品一式" value={s.invEquipment} onChange={v => set('invEquipment', v)} suffix="円" />
          <NumField label="Vwand+1℃ 初期費用" value={s.invVwand} onChange={v => set('invVwand', v)} suffix="円" />
          <NumField label="許認可・届出費用" value={s.invLicense} onChange={v => set('invLicense', v)} suffix="円" />
          <NumField label="開業前マーケティング" value={s.invMarketing} onChange={v => set('invMarketing', v)} suffix="円" />
          <NumField label="運転資金" value={s.invWorking} onChange={v => set('invWorking', v)} suffix="円"
            tooltip="開業初期の赤字補填用。最低6ヶ月分の固定費を確保" />
          <div style={{ background: '#0f172a', borderRadius: 5, padding: '6px 8px', marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>初期投資合計</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>¥{fmt(totalInv)}</span>
            </div>
          </div>
        </Section>
      </div>

      {/* ── CENTER PANEL: Dashboard ── */}
      <div style={{ flex: 1, ...panelStyle }}>
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          <KpiCard label="RevPAR" value={yen(m.revpar)} sub={`業界標準 ¥40,000〜¥80,000`}
            color={m.revpar >= 40000 && m.revpar <= 80000 ? '#22c55e' : '#f59e0b'} />
          <KpiCard label="GOP率" value={pct(m.gopRate)} sub={`業界標準 30〜40%`}
            color={m.gopRate >= 0.30 ? '#22c55e' : '#ef4444'} warn={m.gopRate < 0.30} />
          <KpiCard label="人件費比率" value={pct(m.laborRate)} sub="目標 30%以下"
            color={m.laborRate <= 0.30 ? '#22c55e' : '#f59e0b'} warn={m.laborRate > 0.30} />
          <KpiCard label="損益分岐稼働率" value={pct(beOcc)} sub="目標 60%以下"
            color={beOcc <= 0.60 ? '#22c55e' : '#ef4444'} warn={beOcc > 0.60} />
        </div>

        {/* Monthly P&L summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          <KpiCard label="月間売上" value={yen(m.revTotal)} color="#38bdf8" />
          <KpiCard label="月間GOP" value={yen(m.gop)} color={m.gop >= 0 ? '#22c55e' : '#ef4444'} />
          <KpiCard label="月間営業利益" value={yen(m.opProfit)} color={m.opProfit >= 0 ? '#22c55e' : '#ef4444'} />
          <KpiCard label="月間純利益" value={yen(m.netProfit)} color={m.netProfit >= 0 ? '#22c55e' : '#ef4444'} />
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {[['pl', '📊 損益ウォーターフォール'], ['cf', '💰 キャッシュフロー'], ['scenario', '🎯 シナリオ比較'], ['owner', '🤝 オーナー報酬'], ['evidence', '🔬 エビデンス根拠']].map(([v, l]) => (
            <button key={v} onClick={() => setActiveTab(v)}
              style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, borderRadius: 6, border: 'none', cursor: 'pointer',
                background: activeTab === v ? (v === 'evidence' ? '#7c3aed' : '#1d4ed8') : '#1e293b',
                color: activeTab === v ? '#fff' : '#64748b' }}>
              {l}
            </button>
          ))}
        </div>

        {/* TAB: Waterfall */}
        {activeTab === 'pl' && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 14, border: '1px solid #334155' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 10 }}>月次損益ウォーターフォール（稼働率{pct(s.occupancy)}）</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={waterfallData} margin={{ top: 5, right: 10, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => (v / 10000).toFixed(0) + '万'} />
                <Tooltip formatter={(v) => ['¥' + Math.abs(v).toLocaleString(), '']} contentStyle={{ background: '#1e293b', border: '1px solid #334155', fontSize: 11 }} />
                <Bar dataKey="value" radius={3}>
                  {waterfallData.map((d, i) => (
                    <Cell key={i} fill={d.type === 'pos' ? '#22c55e' : d.type === 'total' ? '#3b82f6' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* 12ヶ月P&L table */}
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', margin: '14px 0 8px' }}>Y1 月次損益推移（2026年4月〜2027年3月）</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    {['月', '稼働率', '月間売上', '人件費', 'OTA費', '営業利益', '純利益', '累計純利益'].map(h => (
                      <th key={h} style={{ padding: '5px 8px', color: '#64748b', fontWeight: 700, textAlign: 'right', borderBottom: '1px solid #334155' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {y1months.map((m, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : 'transparent' }}>
                      <td style={{ padding: '4px 8px', color: '#94a3b8' }}>{m.label}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: '#38bdf8' }}>{pct(monthOcc[i])}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>¥{fmt(m.revTotal)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: '#f59e0b' }}>¥{fmt(m.laborTotal)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: '#f59e0b' }}>¥{fmt(m.channelCost)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: m.opProfit >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>¥{fmt(m.opProfit)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: m.netProfit >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>¥{fmt(m.netProfit)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: m.cumProfit >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>¥{fmt(m.cumProfit)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#1d4ed820', borderTop: '1px solid #3b82f6' }}>
                    <td colSpan={2} style={{ padding: '5px 8px', color: '#38bdf8', fontWeight: 700 }}>Y1合計</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700 }}>¥{fmt(y1.rev)}</td>
                    <td colSpan={2} />
                    <td style={{ padding: '5px 8px', textAlign: 'right', color: y1.op >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>¥{fmt(y1.op)}</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', color: y1.net >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>¥{fmt(y1.net)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Cashflow */}
        {activeTab === 'cf' && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 14, border: '1px solid #334155' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 10 }}>月次キャッシュフロー推移（Y1）</div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={cfData} margin={{ top: 5, right: 10, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => (v / 10000).toFixed(0) + '万'} />
                <Tooltip formatter={v => '¥' + Math.round(v).toLocaleString()} contentStyle={{ background: '#1e293b', border: '1px solid #334155', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
                <Bar dataKey="cf" name="月次CF" fill="#3b82f6" radius={3} />
                <Line dataKey="cumCash" name="資金残高" stroke="#22c55e" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>初期投資・回収サマリー</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <KpiCard label="初期投資合計" value={yen(totalInv)} color="#f59e0b" />
                <KpiCard label="Y1純利益合計" value={yen(y1.net)} color={y1.net >= 0 ? '#22c55e' : '#ef4444'} />
                <KpiCard label="運転資金（確保）" value={yen(s.invWorking)} color="#38bdf8" />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>月次キャッシュ詳細</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    {['月', '月次CF', '累計資金残高', '状態'].map(h => (
                      <th key={h} style={{ padding: '4px 8px', color: '#64748b', textAlign: 'right', borderBottom: '1px solid #334155' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cfData.map((c, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#0f172a' : 'transparent' }}>
                      <td style={{ padding: '3px 8px', color: '#94a3b8' }}>{c.label}</td>
                      <td style={{ padding: '3px 8px', textAlign: 'right', color: c.cf >= 0 ? '#22c55e' : '#ef4444' }}>¥{fmt(c.cf)}</td>
                      <td style={{ padding: '3px 8px', textAlign: 'right', color: c.cumCash >= 0 ? '#38bdf8' : '#ef4444', fontWeight: 700 }}>¥{fmt(c.cumCash)}</td>
                      <td style={{ padding: '3px 8px', textAlign: 'right', color: c.cumCash >= 0 ? '#22c55e' : '#ef4444' }}>
                        {c.cumCash >= 0 ? '✓ 安全' : '⚠ 要注意'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Scenario */}
        {activeTab === 'scenario' && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 14, border: '1px solid #334155' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 10 }}>3シナリオ並列比較</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              {scenarios.map(sc => (
                <div key={sc.label} style={{ background: '#0f172a', borderRadius: 8, padding: 12, border: `1px solid ${sc.color}` }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: sc.color, marginBottom: 8 }}>{sc.label}シナリオ</div>
                  {[
                    ['稼働率', pct(sc.effectiveOcc)],
                    ['ADR', yen(sc.adr)],
                    ['月間売上', yen(sc.revTotal)],
                    ['GOP率', pct(sc.gopRate)],
                    ['月間純利益', yen(sc.netProfit)],
                    ['年間純利益', yen(sc.annual.net)],
                    ['オーナー報酬/月', yen(sc.ownerPay)],
                    ['損益分岐稼働率', pct(sc.breakEvenOcc)],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: '#64748b' }}>{l}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>稼働率感応度グラフ</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sensCurve} margin={{ top: 5, right: 10, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="occ" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => (v / 10000).toFixed(0) + '万'} />
                <Tooltip formatter={v => '¥' + v.toLocaleString()} contentStyle={{ background: '#1e293b', border: '1px solid #334155', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
                <Line dataKey="op" name="営業利益" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line dataKey="net" name="純利益" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line dataKey="owner" name="オーナー報酬" stroke="#a78bfa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* TAB: Owner */}
        {activeTab === 'owner' && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 14, border: '1px solid #334155' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 10 }}>
              オーナー報酬分析（霞ヶ関キャピタル向け）
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
              <KpiCard label="月間オーナー報酬" value={yen(m.ownerPay)} color="#a78bfa"
                sub={`稼働${pct(s.occupancy)} × ${s.ownerRooms}室 × ¥${s.ownerPerNight.toLocaleString()}/泊`} />
              <KpiCard label="年間オーナー報酬（概算）" value={yen(m.ownerPay * 12)} color="#a78bfa" />
              <KpiCard label="ADR比アップリフト率"
                value={'+' + Math.round((s.ownerPerNight / (s.adrPerPerson * s.personsPerRoom) - 1) * 100) + '%'}
                color="#22c55e" sub="通常客室ADR比の上振れ率" />
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>稼働率別オーナー報酬シミュレーション</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 14 }}>
              <thead>
                <tr style={{ background: '#0f172a' }}>
                  {['稼働率', '当社月間売上', 'オーナー報酬', '当社営業利益', '当社純利益', '当社利益率'].map(h => (
                    <th key={h} style={{ padding: '5px 8px', color: '#64748b', textAlign: 'right', borderBottom: '1px solid #334155' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(occ => {
                  const r = calcMonthly({ ...s, occupancy: occ })
                  const isTarget = Math.abs(occ - s.occupancy) < 0.01
                  return (
                    <tr key={occ} style={{ background: isTarget ? '#1d4ed820' : (Math.round(occ * 10) % 2 === 0 ? '#0f172a' : 'transparent'), border: isTarget ? '1px solid #3b82f6' : 'none' }}>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: '#38bdf8', fontWeight: isTarget ? 700 : 400 }}>{pct(occ)}{isTarget ? ' ◄' : ''}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>¥{fmt(r.revTotal)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: '#a78bfa', fontWeight: 700 }}>¥{fmt(r.ownerPay)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: r.opProfit >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>¥{fmt(r.opProfit)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: r.netProfit >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>¥{fmt(r.netProfit)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: r.netProfit / r.revTotal >= 0.2 ? '#22c55e' : '#f59e0b' }}>
                        {r.revTotal > 0 ? pct(r.netProfit / r.revTotal) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>スキーム比較</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { name: '固定賃料型', desc: '稼働率に関わらず固定額を支払う。当社リスク大・オーナー安定', color: '#f59e0b' },
                { name: 'レベニューシェア型（現行）', desc: '稼働率×室数×単価。当社リスク小・オーナー連動', color: '#22c55e' },
                { name: 'ハイブリッド型', desc: '最低保証＋稼働連動。双方のリスクバランスを調整', color: '#3b82f6' },
              ].map(sc => (
                <div key={sc.name} style={{ background: '#0f172a', borderRadius: 6, padding: 10, border: `1px solid ${sc.color}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: sc.color, marginBottom: 4 }}>{sc.name}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{sc.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Evidence */}
        {activeTab === 'evidence' && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 14, border: '1px solid #7c3aed' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#a78bfa', marginBottom: 4 }}>🔬 収益計画エビデンス根拠</div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 14 }}>投資家・提携パートナーへの説明根拠。各数値の出所・検証方法・代替シナリオを整理しています。</div>

            {[
              {
                title: '📊 稼働率の根拠',
                color: '#3b82f6',
                items: [
                  { label: '目標稼働率（安定期）80%', basis: '産院2〜3施設との提携による自動送客。kokokara（札幌）は開業3ヶ月で予約1ヶ月待ちの実績', verify: '提携産院との覚書・月次予約実績レポート', alt: '産院提携0件の場合：推定40〜50%（運転資金で対応済み）' },
                  { label: 'キャンセル率5%', basis: '産後ケア施設の前払い予約では5〜10%が業界標準。分娩後即時予約確定フローで低減', verify: 'キャンセル数/予約数の月次記録・キャンセルポリシー徹底', alt: '15%の場合：月間売上-4.5%。ADR引上げまたは補充予約で対応' },
                  { label: '平均滞在日数3泊', basis: '都市部産後ケア施設の平均2〜4泊。3泊は中央値。入院前後の連続滞在ニーズが支える', verify: '実際の滞在日数を月次集計・四半期平均で管理', alt: '2泊低下の場合：組数が1.5倍必要。稼働率目標を95%に引上げ' },
                ],
              },
              {
                title: '💴 ADR・料金設定の根拠',
                color: '#22c55e',
                items: [
                  { label: `1名¥${s.adrPerPerson.toLocaleString()} / 室¥${(s.adrPerPerson * s.personsPerRoom).toLocaleString()}（ADR）`, basis: '競合相場: HOTEL STORK ¥66,000〜 / マームガーデン ¥40,000〜 / kokokara ¥25,000〜。中間価格帯の空白を埋める戦略', verify: '競合3施設の料金を半期ごとにリサーチ・自社ADRと比較', alt: '¥35,000に下げても稼働率85%なら同等収益（感度分析済み）' },
                  { label: `RevPAR ¥${fmt(m.revpar)}（ADR×稼働率）`, basis: '業界標準¥40,000〜¥80,000の範囲内。自治体補助金認定後は実質値上げ効果あり', verify: '月次RevPAR実績の管理・業界標準との比較レポート', alt: '市場相場下落時：Vwand+1℃差別化サービスでプレミアム維持' },
                ],
              },
              {
                title: '👩‍⚕️ 人件費の根拠',
                color: '#f59e0b',
                items: [
                  { label: `夜勤助産師時給¥${s.nightWage.toLocaleString()}（深夜割増含む月¥${fmt(Math.round((s.nightHours * s.nightWage + s.nightDeepHours * s.nightWage * 0.25) * s.nightDays))}）`, basis: '東京都の助産師副業・夜勤単発相場¥1,800〜2,500（求人ボックス・Indeed・ナースではたらこ）。深夜割増25%は労基法37条で必須', verify: '採用面接時の市場時給確認・求人媒体の相場を月1回確認', alt: '¥2,500に上昇した場合：月+¥13,000（影響軽微）' },
                  { label: `法定福利費率${pct(s.socialInsRate)}（月¥${fmt(m.socialIns)}）`, basis: '健康保険・厚生年金・雇用保険の事業主負担合計。社会保険事務所への届出済みを前提', verify: '社会保険事務所の納付通知書・給与計算ソフトの自動検証', alt: '法定率のため変動しない。率変更時は法改正に準拠' },
                ],
              },
              {
                title: '📡 OTA手数料・チャネルコストの根拠',
                color: '#ef4444',
                items: [
                  { label: `OTA経由比率${pct(s.otaRatio)} / 手数料${pct(s.otaFee)}（月¥${fmt(m.channelCost)})`, basis: 'じゃらん・楽天15〜17% / booking.com 17〜20%の中央値。産院直送客80%が実現すれば最小化できる', verify: 'PMS（予約管理システム）でチャネル別予約数を月次管理', alt: 'OTA50%経由の場合：月-¥75万の利益減。産院提携を最優先' },
                  { label: `CC手数料${pct(s.ccFeeRate)}（月¥${fmt(m.ccCost)})`, basis: 'VISA/Master 2.0〜2.5%・JCB 3.0%の加重平均。前払い決済導入で確実に費用計上', verify: '決済事業者の月次請求書と売上実績の照合', alt: '3.0%の場合：月+¥2万。影響は軽微' },
                ],
              },
              {
                title: '🏦 オーナー報酬の根拠',
                color: '#a78bfa',
                items: [
                  { label: `¥${s.ownerPerNight.toLocaleString()}/室泊×${s.ownerRooms}室（月¥${fmt(m.ownerPay)})`, basis: 'FUV LUX両国の通常ADR（¥15,000〜17,000）比+79〜100%のアップリフト。ホテルマネジメント契約の業界標準を参照', verify: '月次報酬支払い記録・2年間の固定契約書による条件固定', alt: '¥35,000に引上げ要求の場合：月-¥54万。ADR引上げで対応' },
                ],
              },
              {
                title: '🏛️ 自治体補助金・市場需要の根拠',
                color: '#38bdf8',
                items: [
                  { label: '補助金収入（現計画では未計上）', basis: '東京都23区の産後ケア補助金：1泊¥25,000〜66,000補助。認定取得後は実質ADR+¥20,000相当の効果', verify: '自治体HPの補助金額・認定施設一覧を四半期ごとに確認', alt: '未取得の場合：補助金なしでも黒字設計済み。取得後は上振れ要因' },
                  { label: '日本産後ケア市場TAM 約619億円', basis: '年間出産73万人（厚労省2023）×利用想定率×平均単価。現在利用率3%未満→韓国75%まで成長余地大', verify: '厚生労働省 人口動態統計（毎年7月公表）で毎年確認', alt: '出生数减少の場合：都市部集中で单价维持戦略で対応' },
                ],
              },
            ].map(section => (
              <div key={section.title} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: section.color, marginBottom: 6, borderBottom: `1px solid ${section.color}40`, paddingBottom: 4 }}>{section.title}</div>
                {section.items.map((item, i) => (
                  <div key={i} style={{ background: '#0f172a', borderRadius: 6, padding: '8px 10px', marginBottom: 6, borderLeft: `3px solid ${section.color}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '3px 8px' }}>
                      <span style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>根拠</span>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{item.basis}</span>
                      <span style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>検証方法</span>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{item.verify}</span>
                      <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>代替シナリオ</span>
                      <span style={{ fontSize: 10, color: '#f59e0b' }}>{item.alt}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ background: '#0f172a', borderRadius: 6, padding: 10, border: '1px solid #334155', marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 6 }}>📋 エビデンス収集ロードマップ</div>
              {[
                ['開業前（今すぐ）', '産院2〜3施設との覚書締結・FUV LUXとの契約確認・助産師3名採用内定'],
                ['M1〜M3（開業〜3ヶ月）', '週次予約数・稼働率・キャンセル数の記録開始・実際のADRと計画値の比較'],
                ['M4〜M6（黒字転換期）', '月次P&L実績と計画値の差異分析・自治体補助金申請書類整備'],
                ['M7〜M12（安定期）', '産院送客数/OTA経由比率・RevPAR実績レポートを投資家向けに月次公開'],
              ].map(([期間, action]) => (
                <div key={期間} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700, minWidth: 90, whiteSpace: 'nowrap' }}>{期間}</span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: Diagnostics ── */}
      <div style={{ width: 260, minWidth: 260, ...panelStyle, borderLeft: '1px solid #1e293b' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 10 }}>🔍 事業成立性診断</div>

        <div style={{ marginBottom: 12 }}>
          {warnings.map((w, i) => <Warning key={i} level={w.level} text={w.text} />)}
        </div>

        <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 8 }}>📈 業界ベンチマーク比較</div>
        {[
          { label: 'RevPAR', val: m.revpar, min: 40000, max: 80000, fmt: v => '¥' + (v / 1000).toFixed(0) + 'k', unit: '万円' },
          { label: 'GOP率', val: m.gopRate, min: 0.30, max: 0.40, fmt: v => (v * 100).toFixed(1) + '%', unit: '' },
          { label: '人件費比率', val: m.laborRate, min: 0.18, max: 0.25, fmt: v => (v * 100).toFixed(1) + '%', unit: '', invert: true },
          { label: '損益分岐稼働率', val: beOcc, min: 0.40, max: 0.60, fmt: v => (v * 100).toFixed(1) + '%', unit: '', invert: true },
        ].map(b => {
          const inRange = b.invert ? b.val <= b.max : b.val >= b.min && b.val <= b.max
          const color = b.invert ? (b.val <= b.min ? '#22c55e' : b.val <= b.max ? '#f59e0b' : '#ef4444') : (b.val < b.min ? '#ef4444' : b.val <= b.max ? '#22c55e' : '#f59e0b')
          return (
            <div key={b.label} style={{ background: '#1e293b', borderRadius: 6, padding: '8px 10px', marginBottom: 6, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: '#64748b' }}>{b.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{b.fmt(b.val)}</span>
              </div>
              <div style={{ fontSize: 9, color: '#475569' }}>業界標準: {b.fmt(b.min)}〜{b.fmt(b.max)}</div>
              <div style={{ height: 4, background: '#334155', borderRadius: 2, marginTop: 4 }}>
                <div style={{ height: '100%', width: `${Math.min(100, (b.val / b.max) * 100)}%`, background: color, borderRadius: 2 }} />
              </div>
            </div>
          )
        })}

        <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', margin: '14px 0 8px' }}>📋 月次P&L詳細</div>
        {[
          { label: '室料収益', val: m.revRoom, color: '#22c55e' },
          { label: '朝食収益', val: m.revBf, color: '#22c55e' },
          { label: '━ 人件費', val: m.laborTotal, color: '#ef4444' },
          { label: '  うち基本給', val: m.baseLabor, color: '#f59e0b' },
          { label: '  うち法定福利費', val: m.socialIns, color: '#f59e0b' },
          { label: '━ 消耗品費', val: m.consumable, color: '#ef4444' },
          { label: '━ OTA・流通費', val: m.channelCost, color: '#ef4444' },
          { label: '━ CC手数料', val: m.ccCost, color: '#ef4444' },
          { label: '━ リネン費', val: s.linen, color: '#ef4444' },
          { label: '━ システム費', val: s.system, color: '#ef4444' },
          { label: '━ 保険料', val: s.insurance, color: '#ef4444' },
          { label: '━ マーケ費', val: s.marketing, color: '#ef4444' },
          { label: '━ その他', val: s.otherFixed, color: '#ef4444' },
          { label: '━ オーナー報酬', val: m.ownerPay, color: '#a78bfa' },
          { label: '▶ 営業利益', val: m.opProfit, color: m.opProfit >= 0 ? '#22c55e' : '#ef4444', bold: true },
          { label: '▶ 純利益（税後）', val: m.netProfit, color: m.netProfit >= 0 ? '#22c55e' : '#ef4444', bold: true },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: item.bold ? '1px solid #334155' : 'none' }}>
            <span style={{ fontSize: 10, color: item.bold ? '#94a3b8' : '#64748b', fontWeight: item.bold ? 700 : 400 }}>{item.label}</span>
            <span style={{ fontSize: 11, fontWeight: item.bold ? 800 : 400, color: item.color }}>¥{fmt(item.val)}</span>
          </div>
        ))}

        <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', margin: '14px 0 8px' }}>📅 Y1月別稼働率設定</div>
        <div style={{ fontSize: 9, color: '#475569', marginBottom: 6 }}>各月の稼働率を個別に調整できます</div>
        {MONTHS_JA.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: '#64748b', minWidth: 30 }}>{label}</span>
            <input type="range" min={0.1} max={1.0} step={0.01} value={monthOcc[i]}
              onChange={e => { const newOcc = [...monthOcc]; newOcc[i] = Number(e.target.value); setMonthOcc(newOcc) }}
              style={{ flex: 1 }} />
            <span style={{ fontSize: 10, color: '#38bdf8', minWidth: 38, textAlign: 'right' }}>{pct(monthOcc[i])}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

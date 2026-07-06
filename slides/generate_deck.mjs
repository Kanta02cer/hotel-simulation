import pptxgen from 'pptxgenjs'

// ── KC Brand tokens (from official logo.svg + FY2025 IR deck analysis) ──
const RED='E50012', CORAL='EE835C', PEACH='F4AF8F', PEACHLT='FBEDE7'
const INK='1A1A1A', GRAY='6E6E6E', GRAYLT='D6D6D6', GRAYXL='F2F2F2'
const MAROON='C97B84', WHITE='FFFFFF'
const JP='Meiryo', SERIF='Times New Roman'
const MARK='kc_mark.png'

const W=13.333, H=7.5, ML=0.7, MR=0.7, CW=W-ML-MR
const sh = () => ({ type:'outer', color:'000000', blur:7, offset:3, angle:90, opacity:0.12 })
const yen = n => '¥'+Math.round(n).toLocaleString('ja-JP')
const man = n => (n/10000).toLocaleString('ja-JP',{maximumFractionDigits:0})

const pres = new pptxgen()
pres.layout='LAYOUT_WIDE'
pres.author='霞ヶ関キャピタル株式会社'
pres.company='Kasumigaseki Capital Co., Ltd.'
pres.title='産後ケアホテル「Lunest」事業性評価'

// ── shared footer + wordmark lockup ──
function wordmark(slide,x,y,scale=1){
  slide.addImage({path:MARK, x, y, w:0.24*scale, h:0.287*scale})
  slide.addText('KASUMIGASEKI CAPITAL',{x:x+0.30*scale, y:y-0.03*scale, w:2.6, h:0.34*scale,
    fontFace:SERIF, fontSize:9*scale, color:INK, bold:false, charSpacing:1.2, valign:'middle', margin:0})
}
function footer(slide,n){
  slide.addImage({path:MARK, x:ML, y:7.02, w:0.17, h:0.203})
  slide.addText('KASUMIGASEKI CAPITAL',{x:ML+0.22, y:6.98, w:3, h:0.28, fontFace:SERIF,
    fontSize:7.5, color:GRAY, charSpacing:1, valign:'middle', margin:0})
  slide.addText('Copyright © Kasumigaseki Capital Co., Ltd. All Rights Reserved.',
    {x:W-5.7, y:6.98, w:5.0, h:0.28, fontFace:JP, fontSize:7.5, color:GRAY, align:'right', valign:'middle', margin:0})
  slide.addText(String(n),{x:W-0.65, y:6.98, w:0.35, h:0.28, fontFace:SERIF, fontSize:9, color:GRAY, align:'right', valign:'middle', margin:0})
}
// ── content slide title + thin KC rule ──
function head(slide,title,lead){
  slide.addText(title,{x:ML, y:0.42, w:CW, h:0.55, fontFace:JP, fontSize:23, bold:true, color:INK, valign:'middle', margin:0})
  slide.addShape(pres.shapes.LINE,{x:ML, y:1.06, w:CW, h:0, line:{color:GRAYLT, width:1}})
  if(lead) slide.addText(lead,{x:ML, y:1.14, w:CW, h:0.42, fontFace:JP, fontSize:11.5, color:GRAY, valign:'middle', margin:0})
}
function newContent(title,lead){ const s=pres.addSlide(); s.background={color:WHITE}; head(s,title,lead); return s }
// small coral square index/section badge
function badge(slide,x,y,num,size=0.42){
  slide.addShape(pres.shapes.RECTANGLE,{x, y, w:size, h:size, fill:{color:CORAL}})
  slide.addText(num,{x, y, w:size, h:size, fontFace:SERIF, fontSize:size*44, color:WHITE, bold:true, align:'center', valign:'middle', margin:0})
}

const CHAPTERS=[
  'エグゼクティブ・サマリー',
  '事業概要とスキーム',
  '市場環境',
  '当社（KC）経済性',
  'オペレーター損益と収益構造',
  '論点・リスクと提案',
  '次のアクション',
]

// ══════════ 1. COVER ══════════
{
  const s=pres.addSlide(); s.background={color:WHITE}
  wordmark(s, ML, 0.55, 1.15)
  // category label
  s.addText('社内検討資料 ／ 投資委員会付議前 事前評価',{x:ML, y:2.55, w:CW, h:0.4, fontFace:JP, fontSize:13, color:CORAL, bold:true, margin:0})
  s.addText('産後ケアホテル「Lunest」',{x:ML, y:3.0, w:CW, h:0.9, fontFace:JP, fontSize:40, bold:true, color:INK, margin:0})
  s.addText('事業性評価 ― Hotel-in-Hotel スキームの経済性と論点',{x:ML, y:3.95, w:CW, h:0.6, fontFace:JP, fontSize:20, color:INK, margin:0})
  s.addShape(pres.shapes.LINE,{x:ML, y:4.75, w:4.2, h:0, line:{color:RED, width:2}})
  // bottom-right meta block (KC cover convention)
  s.addText([
    {text:'2026年7月6日', options:{fontSize:11, color:INK, bold:true, breakLine:true}},
    {text:'霞ヶ関キャピタル株式会社', options:{fontSize:10.5, color:INK, breakLine:true}},
    {text:'東証プライム（証券コード：3498）', options:{fontSize:9, color:GRAY}},
  ],{x:W-4.9, y:6.15, w:4.2, h:0.9, fontFace:JP, align:'right', lineSpacingMultiple:1.15, margin:0})
  s.addText('その課題を、価値へ。',{x:ML, y:6.5, w:5, h:0.35, fontFace:JP, fontSize:11, italic:true, color:GRAY, margin:0})
}

// ══════════ 2. INDEX ══════════
{
  const s=pres.addSlide(); s.background={color:WHITE}
  s.addText('Index',{x:ML, y:0.55, w:CW, h:0.7, fontFace:SERIF, fontSize:30, bold:true, color:INK, margin:0})
  s.addShape(pres.shapes.LINE,{x:ML, y:1.32, w:CW, h:0, line:{color:GRAYLT, width:1}})
  let y=1.75
  CHAPTERS.forEach((c,i)=>{
    badge(s, ML, y, '0'+(i+1), 0.5)
    s.addText(c,{x:ML+0.75, y:y, w:8.5, h:0.5, fontFace:JP, fontSize:16, bold:true, color:INK, valign:'middle', margin:0})
    s.addText(String((i===0?3:i*2+3)).padStart(2,'0'),{x:W-1.4, y:y, w:0.7, h:0.5, fontFace:SERIF, fontSize:13, color:GRAY, align:'right', valign:'middle', margin:0})
    s.addShape(pres.shapes.LINE,{x:ML, y:y+0.62, w:CW, h:0, line:{color:GRAYXL, width:0.75}})
    y+=0.72
  })
  footer(s,2)
}

// ── section divider ──
function divider(n){
  const s=pres.addSlide(); s.background={color:WHITE}
  badge(s, ML, 2.9, '0'+n, 0.9)
  s.addText(CHAPTERS[n-1],{x:ML+1.25, y:2.9, w:9.5, h:0.9, fontFace:JP, fontSize:28, bold:true, color:INK, valign:'middle', margin:0})
  s.addShape(pres.shapes.LINE,{x:ML+1.25, y:3.95, w:5.5, h:0, line:{color:GRAYLT, width:1}})
  s.addText(String(n).padStart(2,'0')+' / 07',{x:ML+1.25, y:4.02, w:3, h:0.35, fontFace:SERIF, fontSize:11, color:CORAL, margin:0})
  footer(s, '')
  return s
}

// ══════════ 01 divider + EXEC SUMMARY ══════════
divider(1)
{
  const s=newContent('エグゼクティブ・サマリー','本件は当社にとって高い賃料アップリフトが見込める一方、オペレーター側の採算に構造的な論点があり、契約条件の再設計を前提に推進を提案する。')
  // Left: recommendation box
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ML, y:1.75, w:5.55, h:3.0, rectRadius:0.06, fill:{color:PEACHLT}, line:{color:CORAL, width:1}, shadow:sh()})
  s.addText('結論（提案）',{x:ML+0.25, y:1.9, w:5.0, h:0.35, fontFace:JP, fontSize:13, bold:true, color:RED, margin:0})
  s.addText([
    {text:'条件付きで推進を提案', options:{bold:true, fontSize:15, color:INK, breakLine:true, paraSpaceAfter:6}},
    {text:'当社の賃料収入は魅力的（FAV LUX通常ADR比＋約80〜100%）。', options:{fontSize:11.5, color:INK, breakLine:true, bullet:{indent:14}}},
    {text:'ただし現行条件ではオペレーター採算が成立せず、収入源の持続性にリスク。', options:{fontSize:11.5, color:INK, breakLine:true, bullet:{indent:14}}},
    {text:'報酬体系のハイブリッド化（最低保証＋レベニューシェア）を前提に付議を推奨。', options:{fontSize:11.5, color:INK, bullet:{indent:14}}},
  ],{x:ML+0.25, y:2.3, w:5.05, h:2.35, fontFace:JP, valign:'top', lineSpacingMultiple:1.05, margin:0})
  // Right: 4 KPI callouts (2x2)
  const kpis=[
    ['当社 年間賃料収入', '¥51.8', '百万円 ／ 稼働80%・6室・¥30,000/室泊', RED],
    ['賃料アップリフト', '+約87', '％（FAV LUX通常ADR比）', CORAL],
    ['オペレーター Y1損益', '▲18.3', '百万円 ／ 立ち上がり期の累計', INK],
    ['損益分岐稼働率', '86.8', '％（オペレーター・目標60%超）', RED],
  ]
  const bx=6.55, bw=3.15, bh=1.42, gx=0.28, gy=0.18
  kpis.forEach((k,i)=>{
    const x=bx+(i%2)*(bw+gx), y=1.75+Math.floor(i/2)*(bh+gy)
    s.addShape(pres.shapes.RECTANGLE,{x, y, w:bw, h:bh, fill:{color:WHITE}, line:{color:GRAYLT, width:1}, shadow:sh()})
    s.addText(k[0],{x:x+0.15, y:y+0.12, w:bw-0.3, h:0.3, fontFace:JP, fontSize:10, color:GRAY, margin:0})
    s.addText([{text:k[1], options:{fontSize:30, bold:true, color:k[3]}}],{x:x+0.13, y:y+0.4, w:bw-0.26, h:0.6, fontFace:JP, valign:'middle', margin:0})
    s.addText(k[2],{x:x+0.15, y:y+0.99, w:bw-0.3, h:0.35, fontFace:JP, fontSize:8.5, color:GRAY, margin:0})
  })
  s.addText('※ 数値は事業シミュレーター基準ケース（本リポジトリ既定値）に基づく試算。詳細と前提は各章・Appendix参照。',
    {x:ML, y:5.05, w:CW, h:0.35, fontFace:JP, fontSize:9, color:GRAY, margin:0})
  footer(s,3)
}

// ══════════ 02 divider + 事業概要・スキーム ══════════
divider(2)
{
  const s=newContent('事業概要とスキーム','FAV LUX 両国の一部客室を産後ケアホテルへ転用する Hotel-in-Hotel（HiH）モデル。当社は物件オーナーとして稼働連動の賃料（オーナー報酬）を受領する。')
  // Left facts
  const facts=[
    ['ブランド', 'Lunest（産後ケアホテル）'],
    ['立地・物件', 'FAV LUX 両国（当社グループ保有ホテル内）'],
    ['客室規模', 'ゲスト5室＋スタッフ室（報酬対象6室）'],
    ['提供価値', '母子の宿泊＋助産師による産後ケア'],
    ['当社の役割', '物件オーナー（賃料＝オーナー報酬を受領）'],
    ['報酬形態', 'レベニューシェア型　¥30,000／室泊'],
  ]
  let y=1.85
  facts.forEach(f=>{
    s.addText(f[0],{x:ML, y, w:1.9, h:0.5, fontFace:JP, fontSize:11, bold:true, color:RED, valign:'middle', margin:0})
    s.addText(f[1],{x:ML+1.95, y, w:4.1, h:0.5, fontFace:JP, fontSize:11.5, color:INK, valign:'middle', margin:0})
    s.addShape(pres.shapes.LINE,{x:ML, y:y+0.52, w:6.0, h:0, line:{color:GRAYXL, width:0.75}})
    y+=0.62
  })
  // Right: scheme diagram
  const dx=7.25
  const box=(x,y,w,h,fill,line,txt,tc,fs=11)=>{
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h,rectRadius:0.05,fill:{color:fill},line:{color:line,width:1.25},shadow:sh()})
    s.addText(txt,{x,y,w,h,fontFace:JP,fontSize:fs,bold:true,color:tc,align:'center',valign:'middle',margin:2})
  }
  box(dx+1.55, 1.85, 2.6, 0.95, RED, RED, [{text:'霞ヶ関キャピタル',options:{color:WHITE,fontSize:12,breakLine:true}},{text:'物件オーナー（FAV LUX 両国）',options:{color:WHITE,fontSize:8.5}}], WHITE)
  box(dx+1.55, 3.55, 2.6, 0.95, PEACHLT, CORAL, [{text:'オペレーター（Lunest）',options:{color:INK,fontSize:12,breakLine:true}},{text:'産後ケア運営',options:{color:GRAY,fontSize:8.5}}], INK)
  box(dx-0.15, 5.25, 2.15, 0.85, WHITE, GRAY, [{text:'提携産院',options:{color:INK,fontSize:11,breakLine:true}},{text:'送客',options:{color:GRAY,fontSize:8.5}}], INK)
  box(dx+3.7, 5.25, 2.15, 0.85, WHITE, GRAY, [{text:'利用者',options:{color:INK,fontSize:11,breakLine:true}},{text:'産後の母子',options:{color:GRAY,fontSize:8.5}}], INK)
  // arrows
  const arw=(x1,y1,x2,y2,c)=>s.addShape(pres.shapes.LINE,{x:Math.min(x1,x2),y:Math.min(y1,y2),w:Math.abs(x2-x1),h:Math.abs(y2-y1),line:{color:c,width:1.5,endArrowType:'triangle',beginArrowType:'none'},flipH:x2<x1,flipV:y2<y1})
  // owner comp up (operator -> KC), service down
  s.addShape(pres.shapes.LINE,{x:dx+2.5,y:3.55,w:0,h:-0.75,line:{color:CORAL,width:2,endArrowType:'triangle'}})
  s.addText('賃料（¥30,000/室泊）',{x:dx-1.35,y:2.9,w:1.9,h:0.5,fontFace:JP,fontSize:8.5,bold:true,color:CORAL,align:'right',valign:'middle',margin:0})
  s.addShape(pres.shapes.LINE,{x:dx+3.2,y:2.8,w:0,h:0.75,line:{color:RED,width:2,endArrowType:'triangle'}})
  s.addText('物件提供',{x:dx+3.35,y:2.9,w:1.5,h:0.5,fontFace:JP,fontSize:8.5,bold:true,color:RED,valign:'middle',margin:0})
  s.addShape(pres.shapes.LINE,{x:dx+1.0,y:5.25,w:0.9,h:-0.7,line:{color:GRAY,width:1.5,endArrowType:'triangle'}})
  s.addShape(pres.shapes.LINE,{x:dx+3.8,y:4.55,w:0.9,h:0.7,line:{color:GRAY,width:1.5,endArrowType:'triangle'}})
  footer(s,5)
}

// ══════════ 03 divider + 市場環境 ══════════
divider(3)
{
  const s=newContent('市場環境','国内の産後ケア利用率は諸外国比で著しく低く、潜在需要は大きい。都市部の中価格帯には供給空白が存在する。')
  // stat callouts row
  const stats=[
    ['約619','億円','産後ケア市場 TAM（推計）',RED],
    ['約3','％','日本の産後ケア利用率',CORAL],
    ['75','％','韓国の産後ケア利用率',GRAY],
    ['約73','万人','国内 年間出生数（2023）',INK],
  ]
  const sw=2.85, sgap=0.18
  stats.forEach((k,i)=>{
    const x=ML+i*(sw+sgap)
    s.addShape(pres.shapes.RECTANGLE,{x, y:1.8, w:sw, h:1.55, fill:{color:i===1?PEACHLT:WHITE}, line:{color:GRAYLT, width:1}, shadow:sh()})
    s.addText([{text:k[0],options:{fontSize:34,bold:true,color:k[3]}},{text:' '+k[1],options:{fontSize:13,bold:true,color:k[3]}}],
      {x:x+0.15,y:1.98,w:sw-0.3,h:0.75,fontFace:JP,valign:'middle',margin:0})
    s.addText(k[2],{x:x+0.15,y:2.78,w:sw-0.3,h:0.45,fontFace:JP,fontSize:10,color:GRAY,margin:0})
  })
  // comparison chart: utilization JP vs KR
  s.addText('産後ケア利用率の国際比較',{x:ML, y:3.7, w:6, h:0.35, fontFace:JP, fontSize:12, bold:true, color:INK, margin:0})
  s.addChart(pres.charts.BAR,[{name:'利用率', labels:['日本','韓国'], values:[3,75]}],{
    x:ML, y:4.1, w:5.6, h:2.5, barDir:'bar', chartColors:[CORAL],
    valAxisMaxVal:100, valAxisMinVal:0, showValue:true, dataLabelPosition:'outEnd', dataLabelColor:INK,
    dataLabelFontFace:JP, dataLabelFontSize:11, dataLabelFormatCode:'0"%"',
    catAxisLabelColor:INK, catAxisLabelFontFace:JP, catAxisLabelFontSize:12,
    valAxisHidden:true, valGridLine:{style:'none'}, catGridLine:{style:'none'}, showLegend:false,
    chartArea:{fill:{color:WHITE}} })
  // right insight
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:6.75, y:3.7, w:CW-6.05, h:2.9, rectRadius:0.06, fill:{color:GRAYXL}, line:{color:GRAYLT,width:1}})
  s.addText('示唆',{x:7.0, y:3.85, w:5, h:0.35, fontFace:JP, fontSize:12, bold:true, color:RED, margin:0})
  s.addText([
    {text:'利用率3%→韓国並みには大きな成長余地。', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:8}},
    {text:'競合はHOTEL STORK（¥66,000〜）／マームガーデン（¥40,000〜）／kokokara（¥25,000〜）。中価格帯に空白。', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:8}},
    {text:'自治体の産後ケア補助（1泊¥25,000〜66,000）認定取得で実質単価の上振れ余地。', options:{bullet:{indent:14}}},
  ],{x:7.0, y:4.25, w:CW-6.5, h:2.25, fontFace:JP, fontSize:11, color:INK, valign:'top', lineSpacingMultiple:1.05, margin:0})
  footer(s,7)
}

// ══════════ 04 divider + 当社(KC)経済性 ══════════
divider(4)
{
  const s=newContent('当社（KC）経済性 ― オーナー報酬の魅力','当社は物件オーナーとして稼働連動の賃料を受領。通常のFAV LUX客室収益を大きく上回るアップリフトが見込める。')
  // left: owner comp by occupancy column chart
  s.addText('稼働率別 当社オーナー報酬（月額）',{x:ML, y:1.85, w:6, h:0.35, fontFace:JP, fontSize:12, bold:true, color:INK, margin:0})
  const occs=[0.4,0.5,0.6,0.7,0.8,0.9,1.0]
  s.addChart(pres.charts.BAR,[{name:'オーナー報酬（万円/月）', labels:occs.map(o=>Math.round(o*100)+'%'),
    values:occs.map(o=>Math.round(6*30*o*30000/10000))}],{
    x:ML, y:2.25, w:6.0, h:3.9, barDir:'col', chartColors:[CORAL],
    showValue:true, dataLabelPosition:'outEnd', dataLabelColor:INK, dataLabelFontFace:JP, dataLabelFontSize:9,
    catAxisLabelColor:INK, catAxisLabelFontFace:JP, catAxisLabelFontSize:10, catAxisTitle:'稼働率',
    valAxisHidden:true, valGridLine:{style:'none'}, catGridLine:{style:'none'}, showLegend:false,
    chartArea:{fill:{color:WHITE}} })
  // highlight callout for 80%
  s.addText('目標稼働80%：¥4,320,000/月（年 ¥51,840,000）',{x:ML, y:6.15, w:6.0, h:0.35, fontFace:JP, fontSize:10.5, bold:true, color:RED, align:'center', margin:0})
  // right: uplift explainer + table
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:7.1, y:1.85, w:CW-6.4, h:1.5, rectRadius:0.06, fill:{color:PEACHLT}, line:{color:CORAL,width:1}, shadow:sh()})
  s.addText([
    {text:'賃料アップリフト　', options:{fontSize:12, bold:true, color:INK}},
    {text:'+約87%', options:{fontSize:22, bold:true, color:RED}},
  ],{x:7.35, y:2.0, w:CW-6.9, h:0.6, fontFace:JP, valign:'middle', margin:0})
  s.addText('FAV LUX 通常ADR（¥15,000〜17,000）比。保有アセットの収益単価を約2倍に引き上げる効果。',
    {x:7.35, y:2.6, w:CW-6.9, h:0.65, fontFace:JP, fontSize:10, color:INK, margin:0})
  // small table: KC income annualized
  const rows=[
    [{text:'項目',options:{bold:true,color:WHITE,fill:{color:GRAY},fontFace:JP,align:'left'}},{text:'月額',options:{bold:true,color:WHITE,fill:{color:GRAY},fontFace:JP,align:'right'}},{text:'年額',options:{bold:true,color:WHITE,fill:{color:MAROON},fontFace:JP,align:'right'}}],
    ['オーナー報酬（60%）', yen(3240000), yen(38880000)],
    ['オーナー報酬（80%）', yen(4320000), yen(51840000)],
    ['オーナー報酬（100%）', yen(5400000), yen(64800000)],
  ]
  s.addTable(rows,{x:7.1, y:3.6, w:CW-6.4, colW:[2.55,1.7,1.68], rowH:[0.42,0.5,0.5,0.5],
    fontFace:JP, fontSize:11, color:INK, valign:'middle', align:'right', border:{type:'solid',color:GRAYLT,pt:0.75},
    fill:{color:WHITE}})
  s.addText('※ 稼働に連動するため下振れ時は減収。最低保証の有無が当社収入の安定性を左右する（第6章）。',
    {x:7.1, y:5.75, w:CW-6.4, h:0.7, fontFace:JP, fontSize:9.5, color:GRAY, valign:'top', margin:0})
  footer(s,9)
}

// ══════════ 05 divider + オペレーター損益 ══════════
divider(5)
{
  const s=newContent('オペレーター損益 ― 収益構造の論点','安定月（稼働80%）でも、GOPがオーナー報酬を下回り営業赤字。損益分岐稼働率は86.8%と目標（60%）を大きく上回る。')
  // GOP vs Owner comparison bars (manual, controlled)
  const baseY=5.9, maxH=3.0, scale=maxH/4320000
  const cx1=ML+0.9, cx2=ML+3.0, bw=1.35
  const gopH=3040631*scale, ownH=4320000*scale
  s.addText('安定月の比較（稼働80%）',{x:ML, y:1.8, w:6, h:0.3, fontFace:JP, fontSize:12, bold:true, color:INK, margin:0})
  s.addShape(pres.shapes.RECTANGLE,{x:cx1, y:baseY-gopH, w:bw, h:gopH, fill:{color:GRAY}})
  s.addText([{text:'GOP',options:{fontSize:11,color:INK,breakLine:true}},{text:'¥3.04M',options:{fontSize:13,bold:true,color:INK}}],{x:cx1-0.2, y:baseY-gopH-0.65, w:bw+0.4, h:0.6, fontFace:JP, align:'center', margin:0})
  s.addShape(pres.shapes.RECTANGLE,{x:cx2, y:baseY-ownH, w:bw, h:ownH, fill:{color:CORAL}})
  s.addText([{text:'オーナー報酬',options:{fontSize:11,color:INK,breakLine:true}},{text:'¥4.32M',options:{fontSize:13,bold:true,color:RED}}],{x:cx2-0.35, y:baseY-ownH-0.65, w:bw+0.7, h:0.6, fontFace:JP, align:'center', margin:0})
  s.addShape(pres.shapes.LINE,{x:ML+0.4, y:baseY, w:4.6, h:0, line:{color:GRAY,width:1}})
  // gap callout
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ML+0.4, y:6.05, w:4.6, h:0.6, rectRadius:0.05, fill:{color:RED}})
  s.addText('差額 ▲¥1.28M/月 → 営業赤字',{x:ML+0.4, y:6.05, w:4.6, h:0.6, fontFace:JP, fontSize:12.5, bold:true, color:WHITE, align:'center', valign:'middle', margin:0})
  // right: P&L table (operator, stable month)
  const pl=[
    [{text:'月次P&L（稼働80%・安定月）',options:{bold:true,color:WHITE,fill:{color:GRAY},fontFace:JP,align:'left',colspan:2}}],
    ['売上高', yen(6083610)],
    ['　室料収益', yen(5928000)],
    ['　朝食収益', yen(155610)],
    ['人件費', '▲'+man(2158320)+'万'],
    ['変動費・固定費 他', '▲'+man(6083610-3040631-2158320)+'万'],
    [{text:'GOP（オーナー報酬控除前利益）',options:{bold:true}}, {text:yen(3040631),options:{bold:true}}],
    [{text:'オーナー報酬（賃料）',options:{color:RED}}, {text:'▲'+yen(4320000),options:{color:RED}}],
    [{text:'営業利益',options:{bold:true,fill:{color:PEACHLT}}}, {text:'▲'+yen(1279369),options:{bold:true,color:RED,fill:{color:PEACHLT}}}],
  ]
  s.addTable(pl,{x:7.0, y:1.8, w:CW-6.3, colW:[3.5,2.43], rowH:0.44, fontFace:JP, fontSize:11, color:INK,
    valign:'middle', align:'right', border:{type:'solid',color:GRAYLT,pt:0.75}, fill:{color:WHITE}})
  s.addText('損益分岐稼働率 86.8％（目標60%を大幅超過）／ 人件費比率 35.5％（宿泊業標準18〜25%超）',
    {x:7.0, y:6.05, w:CW-6.3, h:0.6, fontFace:JP, fontSize:10, bold:true, color:RED, valign:'top', margin:0})
  footer(s,11)
}

// ══════════ Y1 monthly ══════════
{
  const s=newContent('オペレーター Y1 月次推移','立ち上がり期の稼働ランプ（30%→80%）を織り込むと、Y1累計は▲18.3百万円。運転資金¥7.0百万円では資金が枯渇する。')
  const months=['4月','5月','6月','7月','8月','9月','10月','11月','12月','1月','2月','3月']
  const net=[-2009573,-1863532,-1717491,-1644471,-1571451,-1498430,-1425410,-1396202,-1352390,-1308577,-1279369,-1279369]
  let c=0; const cum=net.map(v=>c+=v)
  s.addChart([
    {type:pres.charts.BAR, data:[{name:'月次純損益（万円）', labels:months, values:net.map(v=>Math.round(v/10000))}],
      options:{chartColors:[CORAL], barDir:'col'}},
    {type:pres.charts.LINE, data:[{name:'累計純損益（万円）', labels:months, values:cum.map(v=>Math.round(v/10000))}],
      options:{chartColors:[RED], lineSize:2.5, lineSmooth:false}},
  ],{ x:ML, y:1.85, w:8.4, h:4.6, catAxisLabelColor:INK, catAxisLabelFontFace:JP, catAxisLabelFontSize:9,
    valAxisLabelColor:GRAY, valAxisLabelFontFace:JP, valAxisLabelFontSize:9, valGridLine:{color:GRAYXL,size:0.5},
    catGridLine:{style:'none'}, showLegend:true, legendPos:'b', legendFontFace:JP, legendFontSize:10,
    chartArea:{fill:{color:WHITE}} })
  // right summary cards
  const cards=[['Y1 売上高', yen(57414069), INK],['Y1 累計純損益', '▲'+yen(18346266), RED],['運転資金', yen(7000000), INK],['資金不足額', '▲約'+man(18346266-7000000)+'万円', RED]]
  cards.forEach((k,i)=>{
    const y=1.9+i*1.15
    s.addShape(pres.shapes.RECTANGLE,{x:9.4, y, w:CW-8.7, h:1.0, fill:{color:i%2?PEACHLT:WHITE}, line:{color:GRAYLT,width:1}, shadow:sh()})
    s.addText(k[0],{x:9.6, y:y+0.12, w:CW-9.1, h:0.3, fontFace:JP, fontSize:10, color:GRAY, margin:0})
    s.addText(k[1],{x:9.6, y:y+0.42, w:CW-9.1, h:0.5, fontFace:JP, fontSize:17, bold:true, color:k[2], valign:'middle', margin:0})
  })
  footer(s,12)
}

// ══════════ シナリオ ══════════
{
  const s=newContent('シナリオ分析','悲観・標準・楽観のいずれでもY1は赤字。現行の報酬条件では感応度の範囲内で採算が成立しない点が本質的論点。')
  const rows=[
    [{text:'指標',options:{bold:true,color:WHITE,fill:{color:GRAY},align:'left'}},
     {text:'悲観',options:{bold:true,color:WHITE,fill:{color:GRAY}}},
     {text:'標準',options:{bold:true,color:WHITE,fill:{color:GRAY}}},
     {text:'楽観',options:{bold:true,color:WHITE,fill:{color:MAROON}}}],
    ['安定期 稼働率','60%','80%','92%'],
    ['加重平均ADR', yen(49400), yen(52000), yen(54600)],
    ['月間売上（安定月）', yen(4340408), yen(6083610), yen(7337012)],
    ['GOP率','33.6%','50.0%','57.0%'],
    ['月間純損益（安定月）','▲'+yen(1780413),'▲'+yen(1279369),'▲'+yen(783712)],
    [{text:'Y1純損益（実績見込）',options:{bold:true}},{text:'▲'+yen(23074863),options:{bold:true,color:RED}},{text:'▲'+yen(18346266),options:{bold:true,color:RED}},{text:'▲'+yen(13668500),options:{bold:true,color:RED,fill:{color:PEACHLT}}}],
    ['当社オーナー報酬/月', yen(3240000), yen(4320000), yen(4968000)],
  ]
  s.addTable(rows,{x:ML, y:1.9, w:CW, colW:[3.3,2.87,2.87,2.89], rowH:[0.5,0.5,0.5,0.5,0.5,0.5,0.55,0.5],
    fontFace:JP, fontSize:12, color:INK, valign:'middle', align:'right',
    border:{type:'solid',color:GRAYLT,pt:0.75}, fill:{color:WHITE}})
  s.addText('注：Y1純損益は月別稼働（立ち上がり期込み）の合算。当社オーナー報酬は当社にとっての収入であり、オペレーター側では費用（賃料相当）。',
    {x:ML, y:6.1, w:CW, h:0.5, fontFace:JP, fontSize:9.5, color:GRAY, valign:'top', margin:0})
  footer(s,14)
}

// ══════════ 06 divider + 論点リスク ══════════
divider(6)
{
  const s=newContent('論点・リスクの整理','当社の収入は魅力的だが、その原資はオペレーターの支払能力に依存する。持続性の確保が最大の論点。')
  const risks=[
    ['カウンターパーティ・リスク','高','オペレーター採算が現行条件で不成立。赤字継続なら賃料支払の持続性に懸念。',RED],
    ['資金ショート・リスク','高','Y1累計赤字▲18.3百万円に対し運転資金7.0百万円。年度内に枯渇の可能性。',RED],
    ['稼働・送客リスク','中','目標稼働80%は産院提携（2〜3件）が前提。提携未確定なら40〜50%も。',CORAL],
    ['チャネルコスト','中','OTA経由比率が上振れると手数料15〜20%が利益を圧迫。産院直送の徹底が鍵。',CORAL],
    ['当社収入の変動性','中','レベニューシェアのため下振れ時に当社賃料も減少。最低保証がない。',CORAL],
  ]
  let y=1.85
  risks.forEach(r=>{
    s.addShape(pres.shapes.RECTANGLE,{x:ML, y, w:CW, h:0.92, fill:{color:WHITE}, line:{color:GRAYLT,width:1}, shadow:sh()})
    s.addText(r[0],{x:ML+0.2, y:y+0.1, w:3.4, h:0.72, fontFace:JP, fontSize:12.5, bold:true, color:INK, valign:'middle', margin:0})
    // severity chip
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ML+3.7, y:y+0.28, w:0.65, h:0.38, rectRadius:0.05, fill:{color:r[3]}})
    s.addText(r[1],{x:ML+3.7, y:y+0.28, w:0.65, h:0.38, fontFace:JP, fontSize:12, bold:true, color:WHITE, align:'center', valign:'middle', margin:0})
    s.addText(r[2],{x:ML+4.6, y:y+0.1, w:CW-4.8, h:0.72, fontFace:JP, fontSize:11, color:INK, valign:'middle', margin:0})
    y+=1.0
  })
  footer(s,15)
}

// ══════════ 提案 ══════════
{
  const s=newContent('提案 ― 条件再設計の選択肢','当社の賃料水準を確保しつつオペレーターの持続性を担保するため、以下を組み合わせて付議することを提案する。')
  const opts=[
    ['①','報酬体系のハイブリッド化','最低保証＋レベニューシェアへ。当社収入の下限を確保しつつ上振れも享受。双方のリスクを配分。'],
    ['②','均衡水準の提示','オペレーターが稼働80%で均衡する賃料は約¥21,000/室泊（年約¥36.3百万円）。¥30,000との差は交渉余地。'],
    ['③','前提条件化','産院提携2〜3件の締結と、運転資金の積み増し（6ヶ月分固定費）を実行条件として付す。'],
    ['④','段階的ランプ','立ち上がり期は賃料を減額し、稼働の安定に応じて段階的に引き上げるスキームで初期赤字を緩和。'],
  ]
  const cw=(CW-0.4)/2, chh=2.15
  opts.forEach((o,i)=>{
    const x=ML+(i%2)*(cw+0.4), y=1.85+Math.floor(i/2)*(chh+0.3)
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x, y, w:cw, h:chh, rectRadius:0.06, fill:{color:WHITE}, line:{color:GRAYLT,width:1}, shadow:sh()})
    badge(s, x+0.25, y+0.25, o[0], 0.55)
    s.addText(o[1],{x:x+0.95, y:y+0.28, w:cw-1.1, h:0.5, fontFace:JP, fontSize:14, bold:true, color:INK, valign:'middle', margin:0})
    s.addText(o[2],{x:x+0.28, y:y+0.95, w:cw-0.56, h:1.05, fontFace:JP, fontSize:11, color:INK, valign:'top', lineSpacingMultiple:1.05, margin:0})
  })
  footer(s,16)
}

// ══════════ 07 divider + 次のアクション ══════════
divider(7)
{
  const s=newContent('次のアクションとスケジュール','投資委員会付議に向け、条件交渉と前提条件の充足を並行して進める。')
  const steps=[
    ['即時','条件交渉','報酬体系（ハイブリッド／均衡水準）をオペレーターと協議し、条件案を確定。'],
    ['〜1ヶ月','デューデリ','産院提携の覚書ドラフト確認、オペレーターの資金計画・運転資金の裏付け精査。'],
    ['〜2ヶ月','付議','投資委員会へ付議。感応度・最低保証条件を明記した投資判断資料を提出。'],
    ['開業後','モニタリング','月次で稼働・送客比率・賃料支払状況をトラッキングし、段階賃料の見直しに反映。'],
  ]
  let y=1.95
  steps.forEach((st,i)=>{
    s.addText(st[0],{x:ML, y, w:1.5, h:0.9, fontFace:SERIF, fontSize:14, bold:true, color:RED, valign:'middle', align:'center', margin:0})
    s.addShape(pres.shapes.RECTANGLE,{x:ML+1.7, y, w:CW-1.7, h:0.9, fill:{color:i%2?PEACHLT:GRAYXL}, line:{color:GRAYLT,width:0.75}})
    s.addText(st[1],{x:ML+1.95, y, w:2.6, h:0.9, fontFace:JP, fontSize:13, bold:true, color:INK, valign:'middle', margin:0})
    s.addText(st[2],{x:ML+4.6, y, w:CW-6.3, h:0.9, fontFace:JP, fontSize:11, color:INK, valign:'middle', margin:0})
    y+=1.05
  })
  s.addText('その課題を、価値へ。 ― 条件を再設計すれば、当社の資産価値向上と社会課題（産後ケア空白）の解決を両立できる。',
    {x:ML, y:6.3, w:CW, h:0.35, fontFace:JP, fontSize:11, italic:true, bold:true, color:CORAL, margin:0})
  footer(s,18)
}

// ══════════ Appendix ══════════
{
  const s=newContent('Appendix ― 前提・エビデンス根拠','主要数値の出所と検証方法。数値は事業シミュレーターの基準ケース（当リポジトリ既定パラメータ）に基づく試算値。')
  const ev=[
    ['稼働率80%（安定期）','産院2〜3施設との提携による自動送客。kokokara（札幌）は開業3ヶ月で予約1ヶ月待ちの実績。','提携覚書・月次予約実績'],
    ['ADR ¥40,000/名（室¥80,000・加重平均¥52,000）','競合：STORK¥66,000〜／マームガーデン¥40,000〜／kokokara¥25,000〜の中間価格帯。加重平均は1名利用70%を反映。','競合料金の半期リサーチ'],
    ['オーナー報酬¥30,000/室泊','FAV LUX通常ADR（¥15,000〜17,000）比＋79〜100%のアップリフト。','報酬支払記録・固定契約'],
    ['市場TAM 約619億円','年間出生73万人（厚労省2023）×利用想定率×平均単価。利用率3%→韓国75%へ成長余地。','人口動態統計（毎年7月）'],
  ]
  const rows=[[{text:'項目',options:{bold:true,color:WHITE,fill:{color:GRAY},align:'left'}},{text:'根拠',options:{bold:true,color:WHITE,fill:{color:GRAY},align:'left'}},{text:'検証方法',options:{bold:true,color:WHITE,fill:{color:MAROON},align:'left'}}]]
  ev.forEach((e,i)=>rows.push(e.map((c,j)=>({text:c,options:{align:'left',fontFace:JP,fill:{color:i%2?PEACHLT:WHITE},color:j===0?INK:GRAY, bold:j===0}}))))
  s.addTable(rows,{x:ML, y:1.9, w:CW, colW:[3.2,6.0,2.73], rowH:[0.42,0.85,0.85,0.85,0.85],
    fontFace:JP, fontSize:10.5, color:INK, valign:'middle', border:{type:'solid',color:GRAYLT,pt:0.75}, fill:{color:WHITE}})
  s.addText('免責：本資料は社内検討用の試算であり、投資判断・勧誘を目的とするものではない。実績値は前提条件の変動により変化する。',
    {x:ML, y:6.35, w:CW, h:0.4, fontFace:JP, fontSize:9, italic:true, color:GRAY, margin:0})
  footer(s,20)
}

await pres.writeFile({fileName:'Lunest_事業性評価_KC.pptx'})
console.log('written')

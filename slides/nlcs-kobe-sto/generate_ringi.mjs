import pptxgen from 'pptxgenjs'

// ── KC Brand tokens (公式ロゴ + FY2025 IR資料 準拠) ──
const RED='E50012', CORAL='EE835C', PEACH='F4AF8F', PEACHLT='FBEDE7'
const INK='1A1A1A', GRAY='6E6E6E', GRAYLT='D6D6D6', GRAYXL='F2F2F2'
const MAROON='C97B84', WHITE='FFFFFF'
const JP='Meiryo', SERIF='Times New Roman'
const MARK='kc_mark.png'

const W=13.333, H=7.5, ML=0.7, MR=0.7, CW=W-ML-MR
const sh = () => ({ type:'outer', color:'000000', blur:7, offset:3, angle:90, opacity:0.12 })

const pres = new pptxgen()
pres.layout='LAYOUT_WIDE'
pres.author='霞ヶ関キャピタル株式会社'
pres.company='Kasumigaseki Capital Co., Ltd.'
pres.title='NLCS神戸 学生寮STOプロジェクト KC参画 稟議資料'

function wordmark(slide,x,y,scale=1){
  slide.addImage({path:MARK, x, y, w:0.24*scale, h:0.287*scale})
  slide.addText('KASUMIGASEKI CAPITAL',{x:x+0.30*scale, y:y-0.03*scale, w:2.6, h:0.34*scale,
    fontFace:SERIF, fontSize:9*scale, color:INK, charSpacing:1.2, valign:'middle', margin:0})
}
function footer(slide,n){
  slide.addImage({path:MARK, x:ML, y:7.02, w:0.17, h:0.203})
  slide.addText('KASUMIGASEKI CAPITAL',{x:ML+0.22, y:6.98, w:3, h:0.28, fontFace:SERIF,
    fontSize:7.5, color:GRAY, charSpacing:1, valign:'middle', margin:0})
  slide.addText('社外秘 ／ Copyright © Kasumigaseki Capital Co., Ltd. All Rights Reserved.',
    {x:W-6.2, y:6.98, w:5.5, h:0.28, fontFace:JP, fontSize:7.5, color:GRAY, align:'right', valign:'middle', margin:0})
  // n==='' の扉ページは番号非表示。それ以外は物理ページ番号を自動採番。
  if(n!=='') slide.addText(String(pres.slides.length),{x:W-0.65, y:6.98, w:0.35, h:0.28, fontFace:SERIF, fontSize:9, color:GRAY, align:'right', valign:'middle', margin:0})
}
function head(slide,title,lead){
  slide.addText(title,{x:ML, y:0.42, w:CW, h:0.55, fontFace:JP, fontSize:22, bold:true, color:INK, valign:'middle', margin:0})
  slide.addShape(pres.shapes.LINE,{x:ML, y:1.05, w:CW, h:0, line:{color:GRAYLT, width:1}})
  if(lead) slide.addText(lead,{x:ML, y:1.13, w:CW, h:0.5, fontFace:JP, fontSize:11.5, color:GRAY, valign:'top', lineSpacingMultiple:1.05, margin:0})
}
function newContent(title,lead){ const s=pres.addSlide(); s.background={color:WHITE}; head(s,title,lead); return s }
function badge(slide,x,y,num,size=0.42){
  slide.addShape(pres.shapes.RECTANGLE,{x, y, w:size, h:size, fill:{color:CORAL}})
  slide.addText(num,{x, y, w:size, h:size, fontFace:SERIF, fontSize:size*44, color:WHITE, bold:true, align:'center', valign:'middle', margin:0})
}
// generic KC table
function kctable(slide,rows,opts){
  slide.addTable(rows,{fontFace:JP, color:INK, valign:'middle',
    border:{type:'solid',color:GRAYLT,pt:0.75}, fill:{color:WHITE}, ...opts})
}
const hcell = (t,fill=GRAY,align='left') => ({text:t,options:{bold:true,color:WHITE,fill:{color:fill},fontFace:JP,align,valign:'middle'}})

const CHAPTERS=[
  '稟議事項（決裁のお願い）',
  '案件概要',
  'なぜSTOを組み合わせるか',
  'KC参画の意義とメリット',
  '事業性・収益の論点',
  '参画パターンと推奨スタンス',
  'リスクと対応方針',
  '補助金制約と確認済事項',
  'スケジュールと決裁',
]

// ══════════ 1. COVER ══════════
{
  const s=pres.addSlide(); s.background={color:WHITE}
  s.addImage({path:'kc_logo.png', x:ML, y:0.5, w:2.35, h:0.63})
  s.addText('社内稟議資料 ／ 新規事業案件',{x:ML, y:2.5, w:CW, h:0.4, fontFace:JP, fontSize:13, color:CORAL, bold:true, margin:0})
  s.addText('NLCS神戸 学生寮STOプロジェクト',{x:ML, y:2.95, w:CW, h:0.85, fontFace:JP, fontSize:36, bold:true, color:INK, margin:0})
  s.addText('当社（KC）参画に関する稟議 ― 教育 × 不動産 × STO への参入',{x:ML, y:3.85, w:CW, h:0.55, fontFace:JP, fontSize:18, color:INK, margin:0})
  s.addShape(pres.shapes.LINE,{x:ML, y:4.6, w:4.2, h:0, line:{color:RED, width:2}})
  s.addText([
    {text:'2026年7月6日', options:{fontSize:11, color:INK, bold:true, breakLine:true}},
    {text:'起案：新規事業／井上', options:{fontSize:10, color:INK, breakLine:true}},
    {text:'霞ヶ関キャピタル株式会社', options:{fontSize:10.5, color:INK, breakLine:true}},
    {text:'東証プライム（証券コード：3498）', options:{fontSize:9, color:GRAY}},
  ],{x:W-4.9, y:5.95, w:4.2, h:1.1, fontFace:JP, align:'right', lineSpacingMultiple:1.15, margin:0})
  s.addText('その課題を、価値へ。',{x:ML, y:6.5, w:5, h:0.35, fontFace:JP, fontSize:11, italic:true, color:GRAY, margin:0})
}

// ══════════ 2. INDEX ══════════
{
  const s=pres.addSlide(); s.background={color:WHITE}
  s.addText('Index',{x:ML, y:0.55, w:CW, h:0.7, fontFace:SERIF, fontSize:30, bold:true, color:INK, margin:0})
  s.addShape(pres.shapes.LINE,{x:ML, y:1.32, w:CW, h:0, line:{color:GRAYLT, width:1}})
  const pages=[3,6,8,11,13,15,17,19,21]
  let y=1.62
  CHAPTERS.forEach((c,i)=>{
    badge(s, ML, y, '0'+(i+1), 0.46)
    s.addText(c,{x:ML+0.72, y:y, w:9.5, h:0.46, fontFace:JP, fontSize:15, bold:true, color:INK, valign:'middle', margin:0})
    s.addText(String(pages[i]).padStart(2,'0'),{x:W-1.4, y:y, w:0.7, h:0.46, fontFace:SERIF, fontSize:13, color:GRAY, align:'right', valign:'middle', margin:0})
    s.addShape(pres.shapes.LINE,{x:ML, y:y+0.56, w:CW, h:0, line:{color:GRAYXL, width:0.75}})
    y+=0.585
  })
  footer(s,2)
}

// ══════════ 03 稟議事項（決裁のお願い）══════════
{
  const s=newContent('稟議事項 ― ご決裁いただきたい事項','本件は投資実行の決裁ではなく、当社が本プロジェクトに「アレンジャー／スキーム検討支援」として参画し、次段階の検討を進めることの承認を求めるものである。')
  const items=[
    ['1','本件を当社の新規事業案件として正式に検討・推進すること','教育×不動産×STOの実証案件として位置付け'],
    ['2','当社の初期スタンスを「アレンジャー型（スキーム検討支援）」とすること','資金を大きく張らず、関係者を繋ぎPR・知見を獲得する低リスク形態'],
    ['3','STO事業者・外部専門家（弁護士等）へのヒアリング／相談の実施','組成可否・CF・担保・補助金・販売可否・金商法論点の精査'],
    ['4','対外開示・プレスリリースの可能性を含む案件として扱うこと','「国内先進事例」としての発信可能性を検証'],
  ]
  let y=1.85
  items.forEach(it=>{
    s.addShape(pres.shapes.RECTANGLE,{x:ML, y, w:CW, h:0.92, fill:{color:WHITE}, line:{color:GRAYLT,width:1}, shadow:sh()})
    badge(s, ML+0.22, y+0.24, it[0], 0.44)
    s.addText(it[1],{x:ML+0.95, y:y+0.1, w:7.4, h:0.72, fontFace:JP, fontSize:13, bold:true, color:INK, valign:'middle', margin:0})
    s.addText(it[2],{x:ML+8.5, y:y+0.1, w:CW-8.7, h:0.72, fontFace:JP, fontSize:10, color:GRAY, valign:'middle', margin:0})
    y+=1.02
  })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ML, y:y+0.02, w:CW, h:0.62, rectRadius:0.05, fill:{color:PEACHLT}, line:{color:CORAL,width:1}})
  s.addText([
    {text:'※ 投資・貸付の実行判断は本稟議の対象外。', options:{bold:true, color:RED}},
    {text:'　CF・担保・補助金制約・STO販売可否が明確化した後、次段階で別途付議する。', options:{color:INK}},
  ],{x:ML+0.25, y:y+0.02, w:CW-0.5, h:0.62, fontFace:JP, fontSize:11, valign:'middle', margin:0})
  footer(s,3)
}

// ══════════ 04 エグゼクティブサマリー ══════════
{
  const s=newContent('エグゼクティブ・サマリー','通常のKCスキームでも検討可能な案件だが、STOを組み合わせることで新しい投資家層・資金調達チャネル・事業領域の知見を獲得できる。まずは低リスクのアレンジャー参画から開始したい。')
  // left recommendation
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ML, y:1.8, w:5.55, h:3.05, rectRadius:0.06, fill:{color:PEACHLT}, line:{color:CORAL, width:1}, shadow:sh()})
  s.addText('結論',{x:ML+0.25, y:1.95, w:5.0, h:0.35, fontFace:JP, fontSize:13, bold:true, color:RED, margin:0})
  s.addText([
    {text:'アレンジャー参画から着手を提案', options:{bold:true, fontSize:15, color:INK, breakLine:true, paraSpaceAfter:6}},
    {text:'教育×不動産×STOはKCのブランド・新規事業戦略に合致。', options:{fontSize:11, color:INK, breakLine:true, bullet:{indent:14}}},
    {text:'STO組成ノウハウを獲得し、他アセット（ホテル・物流・ヘルスケア等）へ横展開可能。', options:{fontSize:11, color:INK, breakLine:true, bullet:{indent:14}}},
    {text:'初期は低リスクのアレンジャー型。投資判断は論点精査後に次段階で付議。', options:{fontSize:11, color:INK, bullet:{indent:14}}},
  ],{x:ML+0.25, y:2.35, w:5.05, h:2.4, fontFace:JP, valign:'top', lineSpacingMultiple:1.05, margin:0})
  // right KPI 2x2
  const kpis=[
    ['案件規模', '約20', '億円 ／ STO組成のミニマム水準', INK],
    ['想定利回り', '7', '％ ／ 原資はCF精査が必要', CORAL],
    ['対象アセット', '学生寮', '＋任意追加施設（六甲山・NLCS神戸）', INK],
    ['KC初期スタンス', 'アレンジャー', '低リスク・スキーム検討支援', RED],
  ]
  const bx=6.55, bw=3.15, bh=1.44, gx=0.28, gy=0.17
  kpis.forEach((k,i)=>{
    const x=bx+(i%2)*(bw+gx), y=1.8+Math.floor(i/2)*(bh+gy)
    s.addShape(pres.shapes.RECTANGLE,{x, y, w:bw, h:bh, fill:{color:WHITE}, line:{color:GRAYLT, width:1}, shadow:sh()})
    s.addText(k[0],{x:x+0.15, y:y+0.12, w:bw-0.3, h:0.3, fontFace:JP, fontSize:10, color:GRAY, margin:0})
    s.addText([{text:k[1], options:{fontSize:k[1].length>=4?22:30, bold:true, color:k[3]}}],{x:x+0.13, y:y+0.42, w:bw-0.26, h:0.6, fontFace:JP, valign:'middle', margin:0})
    s.addText(k[2],{x:x+0.15, y:y+1.02, w:bw-0.3, h:0.35, fontFace:JP, fontSize:8.5, color:GRAY, margin:0})
  })
  s.addText('※ 案件規模・利回りは初期情報に基づく仮置き。STO事業者・八光エルアールへの確認により精緻化する。',
    {x:ML, y:5.1, w:CW, h:0.35, fontFace:JP, fontSize:9, color:GRAY, margin:0})
  footer(s,4)
}

// ── divider ──
function divider(n){
  const s=pres.addSlide(); s.background={color:WHITE}
  badge(s, ML, 2.9, '0'+n, 0.9)
  s.addText(CHAPTERS[n-1],{x:ML+1.25, y:2.9, w:10.5, h:0.9, fontFace:JP, fontSize:26, bold:true, color:INK, valign:'middle', margin:0})
  s.addShape(pres.shapes.LINE,{x:ML+1.25, y:3.95, w:5.5, h:0, line:{color:GRAYLT, width:1}})
  s.addText(String(n).padStart(2,'0')+' / 09',{x:ML+1.25, y:4.02, w:3, h:0.35, fontFace:SERIF, fontSize:11, color:CORAL, margin:0})
  footer(s,'')
  return s
}

// ══════════ 05 案件概要（divider 02 → content）══════════
divider(2)
{
  const s=newContent('案件概要','NLCS神戸は六甲山に開校予定の国際ボーディングスクール（North London Collegiate School Kobe）。その学生寮・関連施設を対象に、STOを活用した資金調達を検討する。')
  // left: overview facts
  const facts=[
    ['対象','NLCS神戸 学生寮・関連施設'],
    ['所在','兵庫県神戸市・六甲山'],
    ['事業主体','八光エルアール株式会社'],
    ['案件規模','約20億円（STO組成のミニマム水準）'],
    ['想定利回り','7％（原資はCF精査が必要）'],
    ['上位構想','寄付・投資・ネーミングライツ・卒業生基金を\n組み合わせた教育エコシステム'],
  ]
  let y=1.85
  facts.forEach(f=>{
    const hh = f[1].includes('\n')?0.7:0.52
    s.addText(f[0],{x:ML, y, w:1.7, h:hh, fontFace:JP, fontSize:11, bold:true, color:RED, valign:'middle', margin:0})
    s.addText(f[1].replace('\n','\n'),{x:ML+1.75, y, w:4.4, h:hh, fontFace:JP, fontSize:11.5, color:INK, valign:'middle', margin:0})
    s.addShape(pres.shapes.LINE,{x:ML, y:y+hh, w:6.1, h:0, line:{color:GRAYXL, width:0.75}})
    y+=hh+0.12
  })
  // right: 関係者 table
  s.addText('主要関係者',{x:7.15, y:1.8, w:5, h:0.35, fontFace:JP, fontSize:12, bold:true, color:INK, margin:0})
  const rows=[
    [hcell('関係者'), hcell('役割')],
    ['八光エルアール','事業主体。NLCS神戸の開発・運営'],
    ['当社（KC）','資金・ブランド・調達支援、スキーム検討'],
    ['STO事業者','デジタル証券・Progmat等（組成・販売候補）'],
    ['投資家','国内外富裕層・保護者・神戸富裕層・財団関係者'],
    ['NLCS Kobe Foundation','（構想）寄付・奨学金・ネーミングライツの受け皿'],
  ]
  kctable(s,rows,{x:7.15, y:2.2, w:CW-6.45, colW:[2.15,3.53], rowH:[0.42,0.62,0.62,0.62,0.62,0.72], fontSize:10.5, align:'left'})
  footer(s,6)
}

// ══════════ 06 なぜSTOか（divider 03 → content）══════════
divider(3)
{
  const s=newContent('なぜKC通常スキームにSTOを組み合わせるのか','通常スキームでも資金調達は可能だが投資家層が機関・法人に偏る。STOを重ねることで投資家層の拡大と、教育支援・地域貢献という社会的意義の付与が可能になる。')
  // two flow boxes
  const box=(x,y,w,h,fill,line,txt,tc,fs=11)=>{
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h,rectRadius:0.05,fill:{color:fill},line:{color:line,width:1.1},shadow:sh()})
    s.addText(txt,{x:x+0.1,y,w:w-0.2,h,fontFace:JP,fontSize:fs,color:tc,align:'center',valign:'middle',margin:2})
  }
  // top: 通常スキーム
  s.addText('① 通常スキーム',{x:ML, y:1.8, w:6, h:0.35, fontFace:JP, fontSize:13, bold:true, color:GRAY, margin:0})
  const ty=2.25, bw=2.15, bh=0.85
  const chain=[['KC／金融機関／\n法人投資家',GRAYXL,GRAYLT,INK],['SPC',GRAYXL,GRAYLT,INK],['八光エルアール',GRAYXL,GRAYLT,INK],['建設・運営',GRAYXL,GRAYLT,INK],['賃料・寮費収入',GRAYXL,GRAYLT,INK]]
  let x=ML
  chain.forEach((c,i)=>{
    box(x,ty,bw,bh,c[1],c[2],c[0],c[3],10.5)
    if(i<chain.length-1) s.addShape(pres.shapes.LINE,{x:x+bw+0.02, y:ty+bh/2, w:0.34, h:0, line:{color:GRAY,width:1.5,endArrowType:'triangle'}})
    x+=bw+0.38
  })
  s.addText('投資家層は金融機関・法人・機関投資家に偏りやすい。',{x:ML, y:ty+bh+0.05, w:CW, h:0.35, fontFace:JP, fontSize:10, color:GRAY, margin:0})
  // bottom: STOを乗せた場合
  s.addText('② STOを組み合わせた場合',{x:ML, y:4.1, w:8, h:0.35, fontFace:JP, fontSize:13, bold:true, color:RED, margin:0})
  const by=4.55
  box(ML, by, 3.1, bh, GRAYXL, GRAYLT, 'KC通常スキーム', INK, 11)
  s.addText('＋',{x:ML+3.15, y:by, w:0.5, h:bh, fontFace:JP, fontSize:18, bold:true, color:RED, align:'center', valign:'middle', margin:0})
  box(ML+3.7, by, 3.2, bh, PEACHLT, CORAL, 'STOファンド／\nデジタル証券', INK, 10.5)
  s.addShape(pres.shapes.LINE,{x:ML+6.95, y:by+bh/2, w:0.34, h:0, line:{color:CORAL,width:1.5,endArrowType:'triangle'}})
  box(ML+7.35, by, 2.4, bh, WHITE, CORAL, '国内外富裕層・\n保護者・地域投資家', INK, 9.5)
  s.addShape(pres.shapes.LINE,{x:ML+9.8, y:by+bh/2, w:0.34, h:0, line:{color:CORAL,width:1.5,endArrowType:'triangle'}})
  box(ML+10.2, by, 1.73, bh, RED, RED, '教育支援性を\n持つ投資商品', WHITE, 9.5)
  s.addText('投資単位の小口化と投資家層の拡大、社会的意義の付与が可能。',{x:ML, y:by+bh+0.1, w:CW, h:0.35, fontFace:JP, fontSize:10.5, color:INK, bold:true, margin:0})
  footer(s,7)
}

// ══════════ STO市場と先行事例（第3章 追加ページ）══════════
{
  const s=newContent('STO市場と先行事例','国内のST（デジタル証券）市場は拡大局面。学生レジデンスを対象とした不動産STは既に存在するため「日本初」は用いず「国内先進事例」と位置付ける。')
  s.addText('市場の拡大（出典付き参考値）',{x:ML, y:1.85, w:6, h:0.32, fontFace:JP, fontSize:12, bold:true, color:INK, margin:0})
  const stats=[
    ['国内ST 発行累計','約2,628','億円 ／ 68件（Progmat・2025年8月）',RED],
    ['Progmat 発行額シェア','約62','％（国内最大の組成基盤）',CORAL],
    ['公募ST市場 FY2025','約2倍','約1,684→約3,333億円（BOOSTRY総括）',INK],
  ]
  let y=2.2
  stats.forEach(k=>{
    s.addShape(pres.shapes.RECTANGLE,{x:ML, y, w:5.7, h:1.0, fill:{color:WHITE}, line:{color:GRAYLT,width:1}, shadow:sh()})
    s.addText(k[0],{x:ML+0.2, y:y+0.12, w:5.3, h:0.3, fontFace:JP, fontSize:10.5, color:GRAY, margin:0})
    s.addText([{text:k[1],options:{fontSize:24,bold:true,color:k[3]}},{text:' '+k[2],options:{fontSize:10,color:GRAY}}],
      {x:ML+0.2, y:y+0.42, w:5.3, h:0.5, fontFace:JP, valign:'middle', margin:0})
    y+=1.12
  })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:6.95, y:1.85, w:CW-6.25, h:4.55, rectRadius:0.06, fill:{color:GRAYXL}, line:{color:GRAYLT,width:1}})
  s.addText('先行事例と本件の位置付け',{x:7.2, y:1.98, w:5.5, h:0.32, fontFace:JP, fontSize:12, bold:true, color:RED, margin:0})
  s.addText([
    {text:'国内初の公募不動産ST：ケネディクス渋谷神南（2021年）', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:7}},
    {text:'アセット多様化：ホテル・旅館・物流・住宅／福祉貢献型など', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:7}},
    {text:'学生レジデンスST：2024年1月に既発（約35億円／AM=DREAM・三菱UFJ信託・大和証券）→「日本初」は主張不可', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:7}},
    {text:'本件の位置付け：国際ボーディングスクール学生寮は事例の限られる先進的アセットタイプ', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:7}},
    {text:'流動性：セカンダリ（ODX「START」・ASTOMO）は稼働も出来高は限定的 → 出口は保守的に想定', options:{bullet:{indent:14}}},
  ],{x:7.2, y:2.35, w:CW-6.75, h:3.9, fontFace:JP, fontSize:10.5, color:INK, valign:'top', lineSpacingMultiple:1.05, margin:0})
  s.addText('※ 数値は出典（Progmat／BOOSTRY／各社開示）に基づく参考値。最終稟議版で一次レポートを再確認。',
    {x:ML, y:5.95, w:5.7, h:0.5, fontFace:JP, fontSize:8.5, color:GRAY, valign:'top', lineSpacingMultiple:1.03, margin:0})
  footer(s,9)
}

// ══════════ 07 KC参画の意義とメリット（divider 04 → content）══════════
divider(4)
{
  const s=newContent('KC参画の意義とメリット','本件は「20億円規模の投資案件」としてだけでなく、KCの新規事業開発・ブランド戦略・金融DXの実証案件として意義を持つ。')
  const merits=[
    ['PR・ブランド','教育×不動産×STOの新規性を対外発信（金融・不動産・教育メディア等）'],
    ['事業開発','STO組成ノウハウ（信託・SPC・金商法・KYC/AML・販売）を獲得し他アセットへ展開'],
    ['投資家開拓','海外富裕層・保護者・神戸富裕層・卒業生など新たな投資家層に接続'],
    ['協業関係構築','デジタル証券・Progmat等STO事業者との実務ネットワークを獲得'],
    ['ESG／インパクト','教育支援・地域貢献・次世代人材育成として説明可能な投資'],
    ['将来展開','ホテル・物流・ヘルスケア・地域開発・DC等への横展開の実証機会'],
  ]
  const cw=(CW-0.4)/2, chh=1.35
  merits.forEach((m,i)=>{
    const x=ML+(i%2)*(cw+0.4), y=1.8+Math.floor(i/2)*(chh+0.2)
    s.addShape(pres.shapes.RECTANGLE,{x, y, w:cw, h:chh, fill:{color:i%2?PEACHLT:WHITE}, line:{color:GRAYLT,width:1}, shadow:sh()})
    s.addText(m[0],{x:x+0.25, y:y+0.15, w:cw-0.5, h:0.4, fontFace:JP, fontSize:13.5, bold:true, color:RED, valign:'middle', margin:0})
    s.addText(m[1],{x:x+0.25, y:y+0.58, w:cw-0.5, h:0.68, fontFace:JP, fontSize:10.5, color:INK, valign:'top', lineSpacingMultiple:1.03, margin:0})
  })
  footer(s,8)
}

// ══════════ 08 事業性・収益の論点（divider 05 → content）══════════
divider(5)
{
  const s=newContent('事業性・収益の論点','初期情報では原資に不足懸念があり、収益設計が本件の最重要論点。STO事業者は固定賃のみでは厳しく、CPI・固定資産税連動の変動賃料付与を推奨している。')
  // left: the gap
  s.addText('原資の論点（初期仮説）',{x:ML, y:1.8, w:6, h:0.35, fontFace:JP, fontSize:12, bold:true, color:INK, margin:0})
  const gaps=[
    ['必要分配原資','20億円 × 7％','年 1.4億円', RED],
    ['学生寮収入（初期情報）','年間','700万円', INK],
  ]
  let gy=2.2
  gaps.forEach(g=>{
    s.addShape(pres.shapes.RECTANGLE,{x:ML, y:gy, w:5.7, h:1.0, fill:{color:WHITE}, line:{color:GRAYLT,width:1}, shadow:sh()})
    s.addText(g[0],{x:ML+0.2, y:gy+0.12, w:5.3, h:0.3, fontFace:JP, fontSize:10.5, color:GRAY, margin:0})
    s.addText([{text:g[1]+'　',options:{fontSize:12,color:GRAY}},{text:g[2],options:{fontSize:22,bold:true,color:g[3]}}],
      {x:ML+0.2, y:gy+0.42, w:5.3, h:0.5, fontFace:JP, valign:'middle', margin:0})
    gy+=1.12
  })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ML, y:gy, w:5.7, h:0.85, rectRadius:0.05, fill:{color:PEACHLT}, line:{color:CORAL,width:1}})
  s.addText('寮収入のみでは原資が大幅に不足する可能性が高い。学校全体CF・固定賃料設計の確認が必須。',
    {x:ML+0.2, y:gy, w:5.3, h:0.85, fontFace:JP, fontSize:11, bold:true, color:RED, valign:'middle', margin:0})
  // right: must-confirm + vendor view
  s.addText('確認すべき事項',{x:7.0, y:1.8, w:6, h:0.35, fontFace:JP, fontSize:12, bold:true, color:INK, margin:0})
  s.addText([
    {text:'7％利回りは誰に対するものか（KC／STO投資家／両方）', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:5}},
    {text:'原資は学生寮収入のみか、学校全体収入を含められるか', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:5}},
    {text:'八光エルアールによる固定賃料・保証の有無', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:5}},
    {text:'CPI連動・固定資産税連動等の変動賃料設計は可能か', options:{bullet:{indent:14}}},
  ],{x:7.0, y:2.2, w:CW-6.3, h:1.9, fontFace:JP, fontSize:11, color:INK, valign:'top', margin:0})
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:7.0, y:4.15, w:CW-6.3, h:1.75, rectRadius:0.06, fill:{color:GRAYXL}, line:{color:GRAYLT,width:1}})
  s.addText('STO事業者（デジタル証券）ヒアリング要旨',{x:7.2, y:4.28, w:5.5, h:0.35, fontFace:JP, fontSize:11, bold:true, color:RED, margin:0})
  s.addText([
    {text:'物件20億円程度が組成のミニマム水準。', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:4}},
    {text:'学生寮＋任意追加施設の一本化は可能。ただし固定賃のみは厳しく、CPI／固都税連動の変動を付けたい。', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:4}},
    {text:'手数料（4％想定）は案件に応じ調整可。', options:{bullet:{indent:14}}},
  ],{x:7.2, y:4.62, w:CW-6.7, h:1.2, fontFace:JP, fontSize:10, color:INK, valign:'top', lineSpacingMultiple:1.02, margin:0})
  footer(s,9)
}

// ══════════ 09 参画パターンと推奨スタンス（divider 06 → content）══════════
divider(6)
{
  const s=newContent('KCの参画パターンと推奨スタンス','関与形態はリスク・リターンに応じて4案。現時点ではリスクの低いアレンジャー型から着手し、論点精査後に投資・貸付判断を行うのが安全。')
  const rows=[
    [hcell('パターン'), hcell('内容'), hcell('メリット／論点'), hcell('初期採否',MAROON)],
    ['A：アレンジャー型','資金を大きく張らず、STO事業者・八光LR・投資家を繋ぐ',{text:'低リスクでPR・知見を獲得',options:{}}, {text:'◎ 推奨',options:{bold:true,color:RED,fill:{color:PEACHLT}}}],
    ['B：ブリッジ型','KCが先行資金を入れ、後続のSTO販売で一部回収','推進力は高いが販売未達時の出口確認が必要','△ 次段階'],
    ['C：貸付型','KCが貸付人として関与','収益設計しやすいが担保・補助金事前承認が論点','△ 次段階'],
    ['D：出資型','KCがSPC等に出資','アップサイドを取れるが議決権・みなし大企業規定が論点','△ 次段階'],
  ]
  kctable(s,rows,{x:ML, y:1.85, w:CW, colW:[2.5,4.2,4.0,1.23], rowH:[0.45,0.72,0.72,0.72,0.72], fontSize:10.5, align:'left'})
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ML, y:5.55, w:CW, h:0.95, rectRadius:0.05, fill:{color:PEACHLT}, line:{color:CORAL,width:1}})
  s.addText('初期スタンスの推奨',{x:ML+0.25, y:5.65, w:5, h:0.3, fontFace:JP, fontSize:11, bold:true, color:RED, margin:0})
  s.addText('「アレンジャー型＋STO事業者ヒアリング主導」から開始。投資・貸付判断は、CF・担保・補助金・STO販売可否が明確になった後に次段階で行う。',
    {x:ML+0.25, y:5.95, w:CW-0.5, h:0.5, fontFace:JP, fontSize:11, color:INK, valign:'top', margin:0})
  footer(s,10)
}

// ══════════ 10 リスクと対応方針（divider 07 → content）══════════
divider(7)
{
  const s=newContent('リスクと対応方針','主要リスクは特定済みで、いずれも初期段階（アレンジャー参画）では顕在化しにくく、事前確認・専門家相談により管理可能。')
  const rows=[
    [hcell('リスク'), hcell('内容'), hcell('対応方針',MAROON)],
    ['補助金','議決権・担保設定・資金流次第で補助金返還リスク','法務・補助金事務局へ確認（一部確認済・後述）'],
    ['CF（収益）','寮収入（年700万円）のみでは7％の原資が不足の可能性','学校全体CF・固定／変動賃料設計を確認'],
    ['販売','STO投資家が想定通り集まらない可能性','投資家ターゲットを事前ヒアリング'],
    ['法務','金商法・海外販売規制・KYC/AML対応','STO事業者・弁護士へ確認'],
    ['担保','補助対象財産への抵当権設定は事前承認が必要','事前承認手続き・代替担保を検討'],
    ['PR','「日本初」表現の誤認（学生用不動産STOの先行事例あり）','「国内先進事例」等の表現に統一'],
    ['実行','STO組成に時間・コストを要する','早期にSTO事業者へ打診し見積取得'],
  ]
  kctable(s,rows,{x:ML, y:1.8, w:CW, colW:[1.9,5.6,4.43], rowH:0.6, fontSize:10.5, align:'left'})
  footer(s,11)
}

// ══════════ 11 補助金制約と確認済事項（divider 08 → content）══════════
divider(8)
{
  const s=newContent('補助金制約と確認済事項','対象は「大規模成長投資補助金」（経産省）。八光LR・補助金事務局への確認により、資金の流れと担保の実務条件は概ね整理済み。')
  // left: 制約
  s.addText('補助金上の主要制約',{x:ML, y:1.8, w:6, h:0.35, fontFace:JP, fontSize:12, bold:true, color:INK, margin:0})
  s.addText([
    {text:'対象：中堅・中小企業の賃上げに向けた省力化等の大規模成長投資補助金', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:5}},
    {text:'八光エルアールが議決権50％超を維持する必要（みなし大企業規定）', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:5}},
    {text:'補助対象は校舎ABCD棟・寄宿舎EF棟の建物のみ', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:5}},
    {text:'処分制限期間は減価償却期間に連動', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:5}},
    {text:'担保権設定は事前承認が必要（事後承認は不可）', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:5}},
    {text:'補助事業期間中（〜令和9年12月末）もみなし大企業規定が適用', options:{bullet:{indent:14}}},
  ],{x:ML, y:2.2, w:5.85, h:3.3, fontFace:JP, fontSize:10.5, color:INK, valign:'top', lineSpacingMultiple:1.05, margin:0})
  // right: 確認済（de-risk）
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:6.9, y:1.8, w:CW-6.2, h:4.05, rectRadius:0.06, fill:{color:PEACHLT}, line:{color:CORAL,width:1}, shadow:sh()})
  s.addText('確認済み（八光LR・事務局）',{x:7.15, y:1.95, w:5.5, h:0.35, fontFace:JP, fontSize:12, bold:true, color:RED, margin:0})
  s.addText([
    {text:'資金の流れ：最終的に八光LRから建築会社へ支払われれば補助金上問題なし。', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:7}},
    {text:'担保：補助事業遂行に必要な資金調達に限り、事前承認を得れば抵当権設定は可能（担保権実行時に補助金納付が条件）。', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:7}},
    {text:'手続：担保権設定契約の1〜2ヶ月前に承認申請（参考様式32）を提出。', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:7}},
    {text:'議決権：八光LRが50％超を保有すれば、第三者資本参入があってもみなし大企業規定に直接抵触しない。', options:{breakLine:true, bullet:{indent:14}, paraSpaceAfter:7}},
    {text:'STO設計：補助対象外資産に限定した組成、借地権の裏付け資産化はいずれも可能。', options:{bullet:{indent:14}}},
  ],{x:7.15, y:2.35, w:CW-6.7, h:3.8, fontFace:JP, fontSize:10, color:INK, valign:'top', lineSpacingMultiple:1.03, margin:0})
  footer(s,12)
}

// ══════════ 12 スケジュールと決裁（divider 09 → content）══════════
divider(9)
{
  const s=newContent('想定スケジュールと決裁のお願い','本稟議のご承認後、STO事業者ヒアリングと八光LRへの追加確認を並行し、7月下旬に関与方針を判断する第2版を作成する。')
  const steps=[
    ['7/7週','STO事業者ヒアリング','デジタル証券・Progmat・BOOSTRY等へ問い合わせ・初回ヒアリング'],
    ['7/10目途','初期スキーム案','A〜D案（アレンジャー／ブリッジ／貸付・出資）の初期スキーム案を作成'],
    ['7/14週','八光LR追加確認','施工費・収入内訳・土地権利・担保設定可否・Foundation状況を確認'],
    ['7月下旬','第2版・方針判断','ヒアリング結果を反映した第2版を作成し、KCの関与方針を判断'],
    ['次段階','投資判断の付議','CF・担保・補助金・販売可否の明確化後、投資・貸付を別途付議'],
  ]
  let y=1.8
  steps.forEach((st,i)=>{
    s.addText(st[0],{x:ML, y, w:1.6, h:0.78, fontFace:SERIF, fontSize:13, bold:true, color:RED, valign:'middle', align:'center', margin:0})
    s.addShape(pres.shapes.RECTANGLE,{x:ML+1.75, y, w:CW-1.75, h:0.78, fill:{color:i===4?PEACHLT:(i%2?GRAYXL:WHITE)}, line:{color:GRAYLT,width:0.75}})
    s.addText(st[1],{x:ML+2.0, y, w:2.9, h:0.78, fontFace:JP, fontSize:12.5, bold:true, color:INK, valign:'middle', margin:0})
    s.addText(st[2],{x:ML+5.0, y, w:CW-5.9, h:0.78, fontFace:JP, fontSize:10.5, color:INK, valign:'middle', margin:0})
    y+=0.88
  })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:ML, y:y+0.02, w:CW, h:0.72, rectRadius:0.05, fill:{color:RED}})
  s.addText('ご決裁のお願い：本件を新規事業案件として推進し、アレンジャー参画とヒアリング・専門家相談の実施をご承認いただきたい。',
    {x:ML+0.25, y:y+0.02, w:CW-0.5, h:0.72, fontFace:JP, fontSize:12, bold:true, color:WHITE, valign:'middle', margin:0})
  footer(s,13)
}

// ══════════ 13 Appendix ══════════
{
  const s=newContent('Appendix ― 表現上の注意・免責','対外発信時の表現、および本資料の位置付けに関する注記。')
  s.addText('「日本初」表現についての注意',{x:ML, y:1.7, w:8, h:0.35, fontFace:JP, fontSize:12, bold:true, color:RED, margin:0})
  s.addText('国内ST市場では住宅・物流・ホテル・温泉等に加え、学生レジデンスを対象とした不動産STも2024年1月に既発（約35億円／AM=DREAM・三菱UFJ信託・大和証券）。「学生寮STOが日本初」との断定は避け、「国内先進事例」と位置付ける。',
    {x:ML, y:2.05, w:CW, h:0.6, fontFace:JP, fontSize:11, color:INK, valign:'top', lineSpacingMultiple:1.05, margin:0})
  s.addText('推奨表現',{x:ML, y:2.75, w:6, h:0.3, fontFace:JP, fontSize:11, bold:true, color:INK, margin:0})
  s.addText([
    {text:'国内でも先進的な教育施設STO', options:{breakLine:true, bullet:{indent:14}}},
    {text:'国際ボーディングスクール学生寮を対象とした希少なSTO案件', options:{breakLine:true, bullet:{indent:14}}},
    {text:'教育×不動産×STOの新たな取り組み／Foundation構想と連動した教育インフラ投資モデル', options:{bullet:{indent:14}}},
  ],{x:ML, y:3.1, w:CW, h:1.1, fontFace:JP, fontSize:10.5, color:INK, valign:'top', lineSpacingMultiple:1.1, margin:0})
  s.addText('販売面の留意',{x:ML, y:4.3, w:8, h:0.3, fontFace:JP, fontSize:11, bold:true, color:INK, margin:0})
  s.addText('不動産STは金商法上「電子記録移転有価証券表示権利等」（第一項有価証券）に該当し、第一種金融商品取引業者を通じ一般投資家へ公募可能（発行開示・勧誘規制の対象）。ただし特定の保護者・富裕層への個別勧誘は私募規制・スキーム設計の検討を要する。可否は初回ヒアリング・法務で確認する。',
    {x:ML, y:4.62, w:CW, h:0.75, fontFace:JP, fontSize:10.5, color:INK, valign:'top', lineSpacingMultiple:1.05, margin:0})
  s.addShape(pres.shapes.LINE,{x:ML, y:5.5, w:CW, h:0, line:{color:GRAYLT, width:0.75}})
  s.addText('免責：本資料は社内稟議・検討用の初期資料であり、投資実行の決裁や投資勧誘を目的とするものではない。案件規模・利回り・収益等の数値は初期情報に基づく仮置きであり、STO事業者・八光エルアールへの確認により変更される。',
    {x:ML, y:5.65, w:CW, h:0.8, fontFace:JP, fontSize:9, italic:true, color:GRAY, valign:'top', lineSpacingMultiple:1.1, margin:0})
  footer(s,14)
}

await pres.writeFile({fileName:'NLCS神戸STO_KC参画稟議.pptx'})
console.log('written')

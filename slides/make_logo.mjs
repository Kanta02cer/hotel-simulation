import sharp from 'sharp'
// Official KC mark geometry (from logo.svg), scaled+translated into the lockup canvas
const scale=2.12, mx=4, my=6
const markG = `<g transform="translate(${mx},${my}) scale(${scale})">
<path d="M12.527 0L0 7.5l12.527 7.503V0z" fill="#E50012"/>
<path d="M12.527 15.003L0 22.506 12.527 30V15.003z" fill="#EE835C"/>
<path d="M12.527 15.003L0 7.5v15.006l12.527-7.503z" fill="#F4AF8F"/>
<path d="M12.528 15.003L25.058 7.5 12.529 0v15.003z" fill="#EE835C"/>
<path d="M12.528 30l12.53-7.494-12.53-7.503V30z" fill="#E50012"/></g>`
// two-line serif small-caps wordmark: big initial + smaller caps
const FONT='Liberation Serif, FreeSerif, Times New Roman, serif'
const ink='#111111'
const tx = mx + 25.058*scale + 20
function line(y, big, rest, ls){
  return `<text x="${tx}" y="${y}" font-family="${FONT}" fill="${ink}" letter-spacing="${ls}">`
    +`<tspan font-size="34">${big}</tspan><tspan font-size="25">${rest}</tspan></text>`
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="80">`
  + markG
  + line(38, 'K', 'ASUMIGASEKI', 1.5)
  + line(72, 'C', 'APITAL', 12.5)
  + `</svg>`
await sharp(Buffer.from(svg)).png().toFile('/tmp/kc_logo_full.png')
// trim transparent border -> tight crop, then pad slightly
const trimmed = await sharp('/tmp/kc_logo_full.png').trim().toBuffer()
const m = await sharp(trimmed).metadata()
await sharp(trimmed).extend({top:6,bottom:6,left:6,right:6,background:{r:0,g:0,b:0,alpha:0}})
  .png().toFile('/tmp/kc_logo.png')
const f = await sharp('/tmp/kc_logo.png').metadata()
console.log('trimmed', m.width+'x'+m.height, '-> final', f.width+'x'+f.height, 'aspect', (f.width/f.height).toFixed(3))

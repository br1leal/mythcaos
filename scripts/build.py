import base64,json,os
root=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')  # raiz do projeto
f=lambda p: os.path.join(root,p)
b64=lambda n: base64.b64encode(open(f('assets/fonts/'+n),'rb').read()).decode()
css=open(f('src/styles.html')).read().replace('__TERRA__',b64('Terra Craft Sans.otf')).replace('__DX__',b64('DxBurst-Smooth.otf'))
def LOGOIMG(sz,pr=''):
    u=lambda w:f'assets/logo/logo-__L__-{w}.webp'
    return f'<img class="mclogo" data-l="{u(480)} 480w, {u(1000)} 1000w, {u(1400)} 1400w" sizes="{sz}" width="1400" height="579" alt="MythCaos – O Despertar das Lendas" decoding="async"{pr}>'
LOGOJS='<script>window.MC_LOGO=function(){var L=["saci","iara","medusa","mula","papainoel","valquiria"],k=window.MC_L||(window.MC_L=L[Math.random()*L.length|0]);var A={saci:"#e0362a",iara:"#3f8cff",medusa:"#9cb03c",mula:"#ff7a1a",papainoel:"#e6edf5",valquiria:"#f2c230"},R=document.documentElement.style;R.setProperty("--accent",A[k]);R.setProperty("--btn-ink",k==="papainoel"?"#0d1a1c":"#140c08");document.querySelectorAll("img.mclogo[data-l]").forEach(function(i){i.srcset=i.getAttribute("data-l").replace(/__L__/g,k);i.removeAttribute("data-l")})};MC_LOGO()</script>'
LOGO=LOGOIMG('(max-width:700px) 92vw, 900px')
body=open(f('src/body.html'),encoding='utf-8').read().replace('<span id="hlogot">__LOGO__','<span id="hlogot">'+LOGOIMG('(max-width:520px) 120px, 160px')+LOGOJS).replace('<p class="ld-logo">__LOGO__','<p class="ld-logo">'+LOGOIMG('(max-width:700px) 92vw, 900px',' fetchpriority="high"')+LOGOJS).replace('__LOGO__',LOGO)
js=open(f('src/main.js')).read().replace('__MANI__',json.dumps(json.load(open(f('assets/imp/manifest.json'))),ensure_ascii=False)).replace('__LOGO__',LOGO.replace('`','')).replace('__CUTS__',json.dumps(sorted(x[:-5] for x in os.listdir(f('assets/cut')) if not x.startswith('11-g-valkyria'))))
mod=open(f('src/scene3d.js')).read()
store=open(f('src/store.js')).read()
s=css+'\n'+body+'\n<script>\n'+store+'\n</script>\n<script>\n'+js+'\n</script>\n<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"}}</script>\n<script type="module">\n'+mod+'\n</script>\n'
head='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>'
i=s.index(body)  # tudo antes do body (CSS, <title>, links) vai no <head>
ana=open(f('src/analytics.html')).read() if os.path.exists(f('src/analytics.html')) else ''
s=head+ana+s[:i]+'</head><body>'+s[i:]+'</body></html>\n'
open(f('index.html'),'w').write(s); print(len(s))

import base64,json,os
root=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')  # raiz do projeto
f=lambda p: os.path.join(root,p)
b64=lambda n: base64.b64encode(open(f('assets/fonts/'+n),'rb').read()).decode()
css=open(f('src/styles.html')).read().replace('__TERRA__',b64('Terra Craft Sans.otf')).replace('__DX__',b64('DxBurst-Smooth.otf')).replace('__RIBEL__',b64('Ribel-Noise.ttf'))
LOGO='MYTH<b>CAOS</b>'
body=open(f('src/body.html')).read().replace('__LOGO__',LOGO)
js=open(f('src/main.js')).read().replace('__MANI__',json.dumps(json.load(open(f('assets/imp/manifest.json'))),ensure_ascii=False)).replace('__LOGO__',LOGO.replace('`','')).replace('__CUTS__',json.dumps(sorted(x[:-5] for x in os.listdir(f('assets/cut')))))
mod=open(f('src/scene3d.js')).read()
s=css+'\n'+body+'\n<script>\n'+js+'\n</script>\n<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"}}</script>\n<script type="module">\n'+mod+'\n</script>\n'
open(f('index.html'),'w').write(s); print(len(s))

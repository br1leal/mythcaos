# MythCaos — site de lançamento

Jogo de tabuleiro brasileiro, criado e desenvolvido por Bruno Leal. Site estático (HTML + CSS + JS + Three.js), em pleno desenvolvimento.

## Estrutura

```
index.html          página final (GERADA — não editar à mão)
src/
  body.html         estrutura / textos das seções
  styles.html       CSS (fontes embutidas na build)
  main.js           lógica: seções, cartas, desafio, lista de espera
  scene3d.js        Three.js: peões, base, tabuleiro 3D
  store.js          Supabase (leads, ranking) — difere do artifact
  analytics.html    Vercel Analytics + Microsoft Clarity (só no site)
scripts/build.py    junta src/ + assets/fonts em index.html
assets/             imagens, vídeos, peões .glb64.txt, fontes
vercel.json         cache dos assets
```

## Fluxo

1. Edite os arquivos em `src/`
2. `python3 scripts/build.py` (gera o `index.html`)
3. `git add . && git commit && git push` — a Vercel publica sozinha

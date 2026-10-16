# Performance Audit: MythCaos — rodada 4c (celular travando)

**Perspective**: Performance Engineer · **Date**: 2026-10-16 · **Alvo**: index.html (v8_*), celular 390x844, CPU 4x mais lenta

## Verdict: APPROVE WITH CHANGES (correções já aplicadas)

## Critical Issues (corrigidos)
| # | Problema | Arquivo | Impacto | Correção |
|---|----------|---------|---------|----------|
| 1 | Vídeo da Medusa (8,4 MB) baixado inteiro durante o loader, e o loader esperava por ele | v8_main.js lvLoad / ldTick | loader ~15 s no celular lento | vídeo re-encodado (2,1 MB celular / 2,9 MB desktop, keyframe a cada 0,5 s p/ rolagem) e só baixa a ~2 telas da seção; loader não espera vídeo |
| 2 | Vídeos do Portal e do Limbo: as duas versões (desktop + celular) baixavam no carregamento | v8_body.html | +5 MB no celular | `preload=none` + a fonte certa só quando a seção chega perto |
| 3 | `getComputedStyle(body)` a cada quadro no fundo animado | v8_main.js ambDraw | recálculo de estilo forçado em todo quadro | cor lida só quando o tema muda |
| 4 | Vidro do topo com filtro SVG + giroscópio | css / main.js | custo contínuo de GPU; cartas tremendo | removidos |

## Recommendations
| # | Item | Por quê |
|---|------|---------|
| 1 | `tabuleiro2.jpg` (828 KB, baixado 2x) → `tabuleiro2.webp` 1600px (301 KB) | aplicado |
| 2 | Troca de tema chama `getComputedStyle` (3D) de forma síncrona | adiado para o próximo quadro |

## Resource Budget
| Recurso | Antes | Depois |
|---------|-------|--------|
| Bytes até rolar o site todo (celular) | 34,7 MB | 16,4 MB |
| Loader some (sem limitação de CPU / CPU 4x) | ~15 s (4x) | 6,4 s / 7,7 s (inclui a pausa de 1,8 s pedida) |
| Leituras de estilo forçadas por quadro | 1 | 0 |

## Hot Path
O laço `frame()` atualiza cada seção só quando ela está na tela. O que mais pesa é a renderização 3D dos peões (não mensurável com GPU de software). O tempo de JS por quadro ficou pequeno.

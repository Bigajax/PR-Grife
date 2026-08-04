# Logos oficiais das marcas

Coloque aqui os arquivos **oficiais** de logo de cada marca. Ordem de preferência:

1. **SVG** — é o formato certo para logo: um arquivo serve em qualquer tamanho, da faixa
   rotativa (44px de altura) ao card da vitrine, sem borrar.
2. **WebP com fundo transparente**, quando só existir bitmap. Exporte em **lossless**: logo é
   arte chapada de borda dura, e WebP com perda suja o contorno. Todo o resto de
   `public/images/` está em WebP com perda (q82), que é o certo para foto — logo, não.

**Não use PNG nem JPG aqui.** O resto da pasta `public/images/` já migrou inteira para WebP;
a única exceção do projeto é `public/images/hero.jpg`, que serve de og:image.

Depois de salvar o arquivo, abra `data/brands.ts` e descomente/ajuste o caminho da marca
correspondente. O site troca o placeholder pelo logo oficial automaticamente.

## De onde tirar os arquivos oficiais

Os logos são marcas registradas — use apenas fontes autorizadas:

- Kit de imprensa / "brand assets" no site oficial de cada marca.
- Portal do lojista / representante comercial (a PR Grife, como revendedora, tem acesso).
- Materiais oficiais enviados pela própria marca.

Evite baixar de bancos de imagem aleatórios: costumam vir com versão errada, baixa qualidade
ou sem direito de uso.

# Gerador de QR Code Pix — Netlify

Site estático para gerar QR Code Pix e código Pix Copia e Cola a partir de uma chave informada pelo usuário. O valor é opcional.

## Publicação
- Build command: deixe vazio.
- Publish directory: `public`.
- Functions directory: pode ficar vazio (este projeto não usa funções).

Se os arquivos estiverem dentro de uma pasta no GitHub, configure essa pasta como Base directory. Se estiverem na raiz, deixe Base directory vazio.

O QR Code é gerado no navegador. A biblioteca QRCode.js é carregada por CDN, portanto é necessária conexão com a internet para abrir o site e gerar o QR Code.

**Importante:** nome e cidade do recebedor fazem parte do formato Pix EMV. Ajuste esses campos para os dados corretos da chave. O gerador não cria cobrança dinâmica nem confirma pagamentos; confira o recebimento no banco.

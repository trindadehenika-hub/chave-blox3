# Chave Blox — versão compatível com Netlify

Loja com tema laranja, catálogo por categorias, seleção de um único produto por pedido, quantidade ampliada apenas para Belly/Fragmentos/Level, nome do comprador, usuário completo do Discord e QR Code PIX com valor preenchido e nome do produto incluído na referência TXID do PIX (a exibição como descrição depende do banco). A geração do PIX foi adaptada para Netlify Functions.

## Publicar no Netlify
1. Extraia o ZIP e envie a pasta `chave-blox` para um repositório GitHub.
2. No Netlify, escolha **Add new site → Import an existing project** e conecte o repositório.
3. As configurações de build são lidas de `netlify.toml`: diretório publicado `public` e funções em `netlify/functions`. Não precisa de comando de build.
4. Em **Site configuration → Environment variables**, opcionalmente defina `PIX_KEY`, `PIX_MERCHANT_NAME` e `PIX_CITY`. A chave padrão está configurada como telefone +5534991216006.
5. Faça deploy e teste um pedido de baixo valor antes de divulgar.

## Testar localmente
Requer Node.js 18 ou superior. Na pasta do projeto, execute `npm install`, depois `npm start` e abra `http://localhost:3000`. Para testar as funções Netlify localmente: `npm install` e `npm run dev:netlify`.

## Importante sobre PIX
O QR Code é um payload PIX com valor preenchido, não uma cobrança registrada no banco. O site não verifica se o pagamento caiu nem confirma pedidos automaticamente. Confira no aplicativo bancário o nome do recebedor e o valor antes de pagar/divulgar. O nome e a chave precisam corresponder ao cadastro aceito pelo banco.

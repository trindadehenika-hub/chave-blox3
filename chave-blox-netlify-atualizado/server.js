const express = require('express');
const QRCode = require('qrcode');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
// Chave informada pelo dono da loja. Telefone em formato internacional E.164.
const PIX_KEY = process.env.PIX_KEY || '+5534991216006';
const PIX_MERCHANT_NAME = (process.env.PIX_MERCHANT_NAME || 'CHAVE BLOX').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().slice(0, 25);
const PIX_CITY = (process.env.PIX_CITY || 'UBERLANDIA').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().slice(0, 15);

const PRODUCTS = [
  {
    "id": "dragon",
    "category": "Frutas",
    "name": "DRAGON",
    "description": "Fruta Blox Fruits",
    "price": 134.99
  },
  {
    "id": "magnet",
    "category": "Frutas",
    "name": "MAGNET",
    "description": "Fruta Blox Fruits",
    "price": 34.99
  },
  {
    "id": "kitsune",
    "category": "Frutas",
    "name": "KITSUNE",
    "description": "Fruta Blox Fruits",
    "price": 27.99
  },
  {
    "id": "control",
    "category": "Frutas",
    "name": "CONTROL",
    "description": "Fruta Blox Fruits",
    "price": 10.99
  },
  {
    "id": "leopard",
    "category": "Frutas",
    "name": "LEOPARD",
    "description": "Fruta Blox Fruits",
    "price": 9.99
  },
  {
    "id": "yeti",
    "category": "Frutas",
    "name": "YETI",
    "description": "Fruta Blox Fruits",
    "price": 9.49
  },
  {
    "id": "rumble",
    "category": "Frutas",
    "name": "RUMBLE",
    "description": "Fruta Blox Fruits",
    "price": 6.55
  },
  {
    "id": "dough",
    "category": "Frutas",
    "name": "DOUGH",
    "description": "Fruta Blox Fruits",
    "price": 6.5
  },
  {
    "id": "trex",
    "category": "Frutas",
    "name": "T-REX",
    "description": "Fruta Blox Fruits",
    "price": 5.6
  },
  {
    "id": "gas",
    "category": "Frutas",
    "name": "GÁS",
    "description": "Fruta Blox Fruits",
    "price": 5.6
  },
  {
    "id": "buddha",
    "category": "Frutas",
    "name": "BUDDHA",
    "description": "Fruta Blox Fruits",
    "price": 3.85
  },
  {
    "id": "portal",
    "category": "Frutas",
    "name": "PORTAL",
    "description": "Fruta Blox Fruits",
    "price": 3.85
  },
  {
    "id": "ember-dragon",
    "category": "Skins",
    "name": "Ember Dragon",
    "description": "Skin de Blox Fruits",
    "price": 244.99
  },
  {
    "id": "magnet-arcsteel",
    "category": "Skins",
    "name": "Magnet Arcsteel",
    "description": "Skin de Blox Fruits",
    "price": 129.99
  },
  {
    "id": "runic-yeti",
    "category": "Skins",
    "name": "Runic Yeti",
    "description": "Skin de Blox Fruits",
    "price": 104.99
  },
  {
    "id": "rumble-vermelha",
    "category": "Skins",
    "name": "Rumble Vermelha",
    "description": "Skin de Blox Fruits",
    "price": 114.99
  },
  {
    "id": "divine-portal",
    "category": "Skins",
    "name": "Divine Portal",
    "description": "Skin de Blox Fruits",
    "price": 119.9
  },
  {
    "id": "wolf-tiger",
    "category": "Skins",
    "name": "Wolf Tiger",
    "description": "Skin de Blox Fruits",
    "price": 65.99
  },
  {
    "id": "fiend-yeti",
    "category": "Skins",
    "name": "Fiend Yeti",
    "description": "Skin de Blox Fruits",
    "price": 65.99
  },
  {
    "id": "gravidade-amarela",
    "category": "Skins",
    "name": "Gravidade Amarela",
    "description": "Skin de Blox Fruits",
    "price": 35.99
  },
  {
    "id": "rumble-amarela",
    "category": "Skins",
    "name": "Rumble Amarela",
    "description": "Skin de Blox Fruits",
    "price": 21.99
  },
  {
    "id": "race-v3",
    "category": "Upgrades",
    "name": "Qualquer Raça V3",
    "description": "Upgrade de raça",
    "price": 7.5
  },
  {
    "id": "raid-1",
    "category": "Upgrades",
    "name": "1 Raid",
    "description": "Despertar fruta · preço por raid",
    "price": 2.0
  },
  {
    "id": "awakening-full",
    "category": "Upgrades",
    "name": "Despertar completo",
    "description": "Despertar completo de fruta",
    "price": 9.5
  },
  {
    "id": "level-100",
    "category": "Upgrades",
    "name": "100 Lvl",
    "description": "Upgrade de level",
    "price": 3.0
  },
  {
    "id": "level-500",
    "category": "Upgrades",
    "name": "500 Lvl",
    "description": "Upgrade de level",
    "price": 11.5
  },
  {
    "id": "fragments-1k",
    "category": "Upgrades",
    "name": "1K Fragmentos",
    "description": "Preço por 1K fragmentos",
    "price": 0.95
  },
  {
    "id": "fragments-50k",
    "category": "Upgrades",
    "name": "50K Fragmentos",
    "description": "Pacote de fragmentos",
    "price": 40.0
  },
  {
    "id": "belly-1m",
    "category": "Upgrades",
    "name": "1M Belly",
    "description": "Dinheiro do jogo",
    "price": 1.5
  },
  {
    "id": "belly-10m",
    "category": "Upgrades",
    "name": "10M Belly",
    "description": "Dinheiro do jogo",
    "price": 10.0
  },
  {
    "id": "belly-50m",
    "category": "Upgrades",
    "name": "50M Belly",
    "description": "Dinheiro do jogo",
    "price": 45.0
  },
  {
    "id": "mastery-0-300",
    "category": "Upgrades",
    "name": "Maestria 0–300",
    "description": "Qualquer item · faixa 0–300",
    "price": 4.0
  },
  {
    "id": "mastery-300-500",
    "category": "Upgrades",
    "name": "Maestria 300–500",
    "description": "Qualquer item · faixa 300–500",
    "price": 8.5
  },
  {
    "id": "mastery-500-600",
    "category": "Upgrades",
    "name": "Maestria 500–600 (MAX)",
    "description": "Qualquer item · faixa 500–600",
    "price": 9.9
  },
  {
    "id": "mastery-1-600",
    "category": "Upgrades",
    "name": "Maestria do 1 ao 600",
    "description": "Qualquer item · do nível 1 ao 600",
    "price": 15.0
  },
  {
    "id": "dark-blade",
    "category": "Gamepasses",
    "name": "Dark Blade",
    "description": "Gamepass · entrega por presente, pode levar até 3 dias",
    "price": 59.9
  },
  {
    "id": "2x-mastery",
    "category": "Gamepasses",
    "name": "2x Maestria",
    "description": "Gamepass · entrega por presente, pode levar até 3 dias",
    "price": 24.99
  },
  {
    "id": "2x-money",
    "category": "Gamepasses",
    "name": "2x Money",
    "description": "Gamepass · entrega por presente, pode levar até 3 dias",
    "price": 24.99
  },
  {
    "id": "plus-1-slot",
    "category": "Gamepasses",
    "name": "+1 Slot",
    "description": "Gamepass · entrega por presente, pode levar até 3 dias",
    "price": 21.99
  },
  {
    "id": "fast-boats",
    "category": "Gamepasses",
    "name": "Barcos Rápidos",
    "description": "Gamepass · entrega por presente, pode levar até 3 dias",
    "price": 19.9
  },
  {
    "id": "2x-drop",
    "category": "Gamepasses",
    "name": "2x Drop",
    "description": "Gamepass · entrega por presente, pode levar até 3 dias",
    "price": 19.9
  },
  {
    "id": "fruit-notifier",
    "category": "Gamepasses",
    "name": "Notificador de Fruta",
    "description": "Gamepass · entrega por presente, pode levar até 3 dias",
    "price": 134.9
  },
  {
    "id": "refound-status",
    "category": "Gamepasses",
    "name": "Refound Status",
    "description": "Gamepass · entrega por presente, pode levar até 3 dias",
    "price": 4.35
  },
  {
    "id": "perm-flame",
    "category": "Frutas permanentes",
    "name": "Flame permanente",
    "description": "Fruta permanente",
    "price": 25.08
  },
  {
    "id": "perm-ice",
    "category": "Frutas permanentes",
    "name": "Ice permanente",
    "description": "Fruta permanente",
    "price": 34.2
  },
  {
    "id": "perm-sand",
    "category": "Frutas permanentes",
    "name": "Sand permanente",
    "description": "Fruta permanente",
    "price": 38.76
  },
  {
    "id": "perm-dark",
    "category": "Frutas permanentes",
    "name": "Dark permanente",
    "description": "Fruta permanente",
    "price": 43.32
  },
  {
    "id": "perm-light",
    "category": "Frutas permanentes",
    "name": "Light permanente",
    "description": "Fruta permanente",
    "price": 48.15
  },
  {
    "id": "perm-magma",
    "category": "Frutas permanentes",
    "name": "Magma permanente",
    "description": "Fruta permanente",
    "price": 59.28
  },
  {
    "id": "perm-buddha",
    "category": "Frutas permanentes",
    "name": "Buddha permanente",
    "description": "Fruta permanente",
    "price": 75.24
  },
  {
    "id": "perm-portal",
    "category": "Frutas permanentes",
    "name": "Portal permanente",
    "description": "Fruta permanente",
    "price": 91.2
  },
  {
    "id": "perm-lightning",
    "category": "Frutas permanentes",
    "name": "Lightning permanente",
    "description": "Fruta permanente",
    "price": 95.76
  },
  {
    "id": "perm-gravity",
    "category": "Frutas permanentes",
    "name": "Gravity permanente",
    "description": "Fruta permanente",
    "price": 104.88
  },
  {
    "id": "perm-trex",
    "category": "Frutas permanentes",
    "name": "T-Rex permanente",
    "description": "Fruta permanente",
    "price": 107.16
  },
  {
    "id": "perm-dough",
    "category": "Frutas permanentes",
    "name": "Dough permanente",
    "description": "Fruta permanente",
    "price": 109.44
  },
  {
    "id": "perm-venom",
    "category": "Frutas permanentes",
    "name": "Venom permanente",
    "description": "Fruta permanente",
    "price": 111.72
  },
  {
    "id": "perm-gas",
    "category": "Frutas permanentes",
    "name": "Gas permanente",
    "description": "Fruta permanente",
    "price": 114.0
  },
  {
    "id": "perm-tiger",
    "category": "Frutas permanentes",
    "name": "Tiger permanente",
    "description": "Fruta permanente",
    "price": 136.8
  },
  {
    "id": "perm-yeti",
    "category": "Frutas permanentes",
    "name": "Yeti permanente",
    "description": "Fruta permanente",
    "price": 136.8
  },
  {
    "id": "perm-kitsune",
    "category": "Frutas permanentes",
    "name": "Kitsune permanente",
    "description": "Fruta permanente",
    "price": 182.4
  },
  {
    "id": "perm-control",
    "category": "Frutas permanentes",
    "name": "Control permanente",
    "description": "Fruta permanente",
    "price": 182.4
  },
  {
    "id": "perm-dragon",
    "category": "Frutas permanentes",
    "name": "Dragon permanente",
    "description": "Fruta permanente",
    "price": 228.0
  },
  {
    "id": "robux-100",
    "category": "Robux",
    "name": "100 Robux",
    "description": "Robux líquidos após taxa do Roblox",
    "price": 5.99
  },
  {
    "id": "robux-200",
    "category": "Robux",
    "name": "200 Robux",
    "description": "Robux líquidos após taxa do Roblox",
    "price": 11.98
  },
  {
    "id": "robux-300",
    "category": "Robux",
    "name": "300 Robux",
    "description": "Robux líquidos após taxa do Roblox",
    "price": 17.97
  },
  {
    "id": "robux-400",
    "category": "Robux",
    "name": "400 Robux",
    "description": "Robux líquidos após taxa do Roblox",
    "price": 23.96
  },
  {
    "id": "robux-500",
    "category": "Robux",
    "name": "500 Robux",
    "description": "Robux líquidos após taxa do Roblox",
    "price": 29.95
  },
  {
    "id": "robux-600",
    "category": "Robux",
    "name": "600 Robux",
    "description": "Robux líquidos após taxa do Roblox",
    "price": 35.94
  },
  {
    "id": "robux-700",
    "category": "Robux",
    "name": "700 Robux",
    "description": "Robux líquidos após taxa do Roblox",
    "price": 41.93
  },
  {
    "id": "robux-800",
    "category": "Robux",
    "name": "800 Robux",
    "description": "Robux líquidos após taxa do Roblox",
    "price": 47.92
  },
  {
    "id": "robux-900",
    "category": "Robux",
    "name": "900 Robux",
    "description": "Robux líquidos após taxa do Roblox",
    "price": 53.91
  },
  {
    "id": "robux-1000",
    "category": "Robux",
    "name": "1.000 Robux",
    "description": "Robux líquidos após taxa do Roblox",
    "price": 59.9
  },
  {
    "id": "account-godhuman",
    "category": "Contas",
    "name": "Conta God-Human",
    "description": "Level +2800 · God Human incluído · garantia de 5 dias contra banimento conforme termos da loja",
    "price": 2.65
  },
  {
    "id": "account-mythic",
    "category": "Contas",
    "name": "Conta Mítica Garantida",
    "description": "Level +2800 · God Human incluído · fruta mítica no inventário · garantia de 5 dias conforme termos da loja",
    "price": 5.95
  }
];

function tlv(id, value) {
  const v = String(value);
  return String(id).padStart(2, '0') + String(Buffer.byteLength(v, 'utf8')).padStart(2, '0') + v;
}
function crc16ccitt(text) {
  let crc = 0xFFFF;
  for (const byte of Buffer.from(text, 'utf8')) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
function buildPixPayload(amount, txid) {
  // Chave telefônica brasileira precisa estar em formato internacional no payload PIX.
  const key = PIX_KEY.replace(/\s+/g, '');
  const gui = tlv('00', 'br.gov.bcb.pix');
  const merchantAccount = tlv('26', gui + tlv('01', key));
  const additionalData = tlv('62', tlv('05', txid));
  let payload = tlv('00', '01') + tlv('01', '11') + merchantAccount + tlv('52', '0000') +
    tlv('53', '986') + tlv('54', Number(amount).toFixed(2)) + tlv('58', 'BR') +
    tlv('59', PIX_MERCHANT_NAME) + tlv('60', PIX_CITY) + additionalData + '6304';
  return payload + crc16ccitt(payload);
}
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '30kb' }));
app.get('/api/products', (req, res) => res.json(PRODUCTS));
app.post('/api/create-pix', async (req, res) => {
  try {
    const { items, buyerName, discordUser } = req.body || {};
    const name = String(buyerName || '').trim().slice(0, 80);
    const discord = String(discordUser || '').trim().slice(0, 100);
    if (name.length < 2 || discord.length < 2) return res.status(400).json({ error: 'Informe seu nome e usuário completo do Discord.' });
    if (!Array.isArray(items) || items.length !== 1) return res.status(400).json({ error: 'Selecione somente um tipo de produto por pedido.' });
    const cart = [];
    for (const item of items) {
      const product = PRODUCTS.find(p => p.id === item.id);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return res.status(400).json({ error: 'Produto ou quantidade inválidos.' });
      const quantityProducts = new Set(['level-100','level-500','fragments-1k','fragments-50k','belly-1m','belly-10m','belly-50m']);
      if (quantity > 1 && !quantityProducts.has(product.id)) return res.status(400).json({ error: 'A quantidade só pode ser maior que 1 para upgrades de Belly, Fragmentos e Level.' });
      const existing = cart.find(p => p.id === product.id);
      if (existing) existing.quantity += quantity;
      else cart.push({ ...product, quantity });
    }
    const totalCents = cart.reduce((sum, p) => sum + Math.round(p.price * 100) * p.quantity, 0);
    if (totalCents < 1 || totalCents > 999999999) return res.status(400).json({ error: 'Valor do pedido inválido.' });
    const amount = totalCents / 100;
    const orderId = crypto.randomUUID();
    const selectedProduct = cart[0];
    const productLabel = selectedProduct.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 16) || 'PRODUTO';
    const txid = (productLabel + orderId.replace(/-/g, '').slice(0, 25 - productLabel.length)).slice(0, 25);
    const pixCode = buildPixPayload(amount, txid);
    const qrCodeDataUrl = await QRCode.toDataURL(pixCode, { width: 320, margin: 2, errorCorrectionLevel: 'M' });
    res.json({ orderId, productReference: selectedProduct.name, amount, buyerName: name, discordUser: discord, items: cart.map(({id,name,quantity,price,category}) => ({id,name,quantity,price,category})), pixCode, qrCodeDataUrl, automaticConfirmation: false });
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    res.status(500).json({ error: 'Não foi possível gerar o QR Code PIX.' });
  }
});
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`Chave Blox disponível em http://localhost:${PORT}`));

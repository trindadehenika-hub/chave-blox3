const { PRODUCTS, QRCode, crypto, buildPixPayload } = require('./_shared');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Método não permitido.' }) };
  try {
    const body = JSON.parse(event.body || '{}');
    const { items, buyerName, discordUser } = body;
    const name = String(buyerName || '').trim().slice(0, 80);
    const discord = String(discordUser || '').trim().slice(0, 100);
    if (name.length < 2 || discord.length < 2) return reply(400, { error: 'Informe seu nome e usuário completo do Discord.' });
    if (!Array.isArray(items) || items.length !== 1) return reply(400, { error: 'Selecione somente um tipo de produto por pedido.' });
    const cart = [];
    for (const item of items) {
      const product = PRODUCTS.find(p => p.id === item.id);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return reply(400, { error: 'Produto ou quantidade inválidos.' });
      const quantityProducts = new Set(['level-100','level-500','fragments-1k','fragments-50k','belly-1m','belly-10m','belly-50m']);
      if (quantity > 1 && !quantityProducts.has(product.id)) return reply(400, { error: 'A quantidade só pode ser maior que 1 para upgrades de Belly, Fragmentos e Level.' });
      const existing = cart.find(p => p.id === product.id);
      if (existing) existing.quantity += quantity;
      else cart.push({ ...product, quantity });
    }
    const totalCents = cart.reduce((sum, p) => sum + Math.round(p.price * 100) * p.quantity, 0);
    if (totalCents < 1 || totalCents > 999999999) return reply(400, { error: 'Valor do pedido inválido.' });
    const amount = totalCents / 100;
    const orderId = crypto.randomUUID();
    const selectedProduct = cart[0];
    const productLabel = selectedProduct.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 16) || 'PRODUTO';
    const txid = (productLabel + orderId.replace(/-/g, '').slice(0, 25 - productLabel.length)).slice(0, 25);
    const pixCode = buildPixPayload(amount, txid);
    const qrCodeDataUrl = await QRCode.toDataURL(pixCode, { width: 320, margin: 2, errorCorrectionLevel: 'M' });
    return reply(200, { orderId, productReference: selectedProduct.name, amount, buyerName: name, discordUser: discord, items: cart.map(({id,name,quantity,price,category}) => ({id,name,quantity,price,category})), pixCode, qrCodeDataUrl, automaticConfirmation: false });
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    return reply(500, { error: 'Não foi possível gerar o QR Code PIX.' });
  }
};
function reply(statusCode, data) { return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(data) }; }

const form = document.getElementById('pix-form');
const result = document.getElementById('result');
const qrBox = document.getElementById('qrcode');
const payloadField = document.getElementById('payload');
const amountText = document.getElementById('shown-amount');
const copyStatus = document.getElementById('copy-status');

function cleanText(value, max) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
    .replace(/[^A-Z0-9 $%*+\-./:]/g, '').trim().slice(0, max);
}
function field(id, value) { return String(id).padStart(2,'0') + String(value.length).padStart(2,'0') + value; }
function crc16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
function makePix(key, amount, name, city) {
  const merchant = field(0, 'BR.GOV.BCB.PIX') + field(1, key);
  let payload = field(0, '01') + field(1, '12') + field(26, merchant) +
    field(52, '0000') + field(53, '986');
  if (amount !== null) payload += field(54, amount.toFixed(2));
  payload += field(58, 'BR') + field(59, name) + field(60, city) +
    field(62, field(5, '***')) + '6304';
  return payload + crc16(payload);
}
function parseAmount(raw) {
  if (!raw.trim()) return null;
  const value = Number(raw.replace(',', '.'));
  if (!Number.isFinite(value) || value <= 0 || value > 99999999.99) throw new Error('Informe um valor válido maior que zero.');
  return value;
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    if (typeof QRCode === 'undefined') throw new Error('Não foi possível carregar o gerador de QR Code. Verifique sua conexão com a internet.');
    const key = document.getElementById('pix-key').value.trim();
    const amount = parseAmount(document.getElementById('amount').value);
    const name = cleanText(document.getElementById('receiver').value, 25);
    const city = cleanText(document.getElementById('city').value, 15);
    if (!key) throw new Error('Digite sua chave Pix.');
    if (!name || !city) throw new Error('Preencha o nome e a cidade do recebedor.');
    const payload = makePix(key, amount, name, city);
    qrBox.innerHTML = '';
    new QRCode(qrBox, {text: payload, width: 240, height: 240, correctLevel: QRCode.CorrectLevel.M});
    payloadField.value = payload;
    amountText.textContent = amount === null ? 'Sem valor definido' : `Valor: ${amount.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`;
    copyStatus.textContent = '';
    result.hidden = false;
    result.scrollIntoView({behavior:'smooth', block:'start'});
  } catch (error) {
    alert(error.message || 'Não foi possível gerar o Pix.');
  }
});
document.getElementById('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(payloadField.value);
    copyStatus.textContent = 'Código Pix copiado!';
  } catch {
    payloadField.select();
    document.execCommand('copy');
    copyStatus.textContent = 'Código Pix copiado!';
  }
});

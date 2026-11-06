const form = document.getElementById('pix-form');
const result = document.getElementById('result');
const qrBox = document.getElementById('qrcode');
const payloadField = document.getElementById('payload');
const amountText = document.getElementById('shown-amount');
const copyStatus = document.getElementById('copy-status');
const keyType = document.getElementById('key-type');
const keyInput = document.getElementById('pix-key');
const keyHelp = document.getElementById('key-help');

const keyHints = {
  cpf: ['Digite o CPF (somente números)', 'Informe os 11 números do CPF.'],
  cnpj: ['Digite o CNPJ (somente números)', 'Informe os 14 números do CNPJ.'],
  phone: ['Ex.: +55 11 91234-5678', 'Use o código do país +55, DDD e número.'],
  email: ['Ex.: nome@email.com', 'Informe um endereço de e-mail válido.'],
  random: ['Cole sua chave aleatória', 'Informe a chave aleatória completa (geralmente UUID).']
};
keyType.addEventListener('change', () => {
  keyInput.value = '';
  keyInput.placeholder = keyHints[keyType.value][0];
  keyHelp.textContent = keyHints[keyType.value][1];
});

function normalizeKey(type, raw) {
  const value = raw.trim();
  if (type === 'cpf' || type === 'cnpj') {
    const digits = value.replace(/\D/g, '');
    const expected = type === 'cpf' ? 11 : 14;
    if (digits.length !== expected) throw new Error(`O ${type.toUpperCase()} deve ter ${expected} números.`);
    return digits;
  }
  if (type === 'phone') {
    let phone = value.replace(/[\s().-]/g, '');
    if (phone.startsWith('00')) phone = '+' + phone.slice(2);
    if (!phone.startsWith('+')) phone = '+55' + phone.replace(/^0+/, '');
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error('Telefone inválido. Use código do país +55, DDD e número.');
    return phone;
  }
  if (type === 'email') {
    const email = value.toLowerCase();
    if (email.length > 77 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Digite um e-mail válido.');
    return email;
  }
  if (type === 'random') {
    const uuid = value.toLowerCase();
    if (!/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/.test(uuid)) throw new Error('A chave aleatória deve ser um UUID válido.');
    return uuid;
  }
  throw new Error('Selecione o tipo da chave Pix.');
}

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
    const key = normalizeKey(keyType.value, keyInput.value);
    const amount = parseAmount(document.getElementById('amount').value);
    const name = cleanText(document.getElementById('receiver').value, 25);
    const city = cleanText(document.getElementById('city').value, 15);
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

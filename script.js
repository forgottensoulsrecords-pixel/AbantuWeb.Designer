const WHATSAPP_NUMBER = '27677574436';
const money = new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 });
const formatRand = (value) => `R${money.format(value)}`;
const addonInputs = Array.from(document.querySelectorAll('.addon-check'));
const addonTotalDisplay = document.querySelector('#addon-total');
const dialog = document.querySelector('#invoice-dialog');
let selectedPlan = null;

function selectedAddons() {
  return addonInputs.filter((input) => input.checked).map((input) => ({
    name: input.dataset.name,
    price: Number(input.dataset.price)
  }));
}

function updateAddonTotal() {
  const total = selectedAddons().reduce((sum, addon) => sum + addon.price, 0);
  addonTotalDisplay.textContent = formatRand(total);
}

function updateInvoice() {
  if (!selectedPlan) return;
  const addons = selectedAddons();
  const addonSum = addons.reduce((sum, addon) => sum + addon.price, 0);
  const total = selectedPlan.price + addonSum;
  document.querySelector('#invoice-plan-name').textContent = selectedPlan.name;
  document.querySelector('#invoice-plan-price').textContent = formatRand(selectedPlan.price);
  document.querySelector('#invoice-addons').innerHTML = addons.length
    ? addons.map((addon) => `<div><span>${escapeHtml(addon.name)}</span><strong>${addon.price ? formatRand(addon.price) : 'FREE'}</strong></div>`).join('')
    : '<div><span>No add-ons selected</span><strong>—</strong></div>';
  document.querySelector('#invoice-total').textContent = formatRand(total);
  const name = document.querySelector('#customer-name').value.trim();
  const lines = [
    'Hi AbantuWeb SA! I would like to request an invoice for my website.',
    '',
    `Website package: ${selectedPlan.name} — ${formatRand(selectedPlan.price)}`,
    ...addons.map((addon) => `Add-on: ${addon.name} — ${addon.price ? formatRand(addon.price) : 'FREE'}`),
    `Estimated total: ${formatRand(total)}`,
    `50% deposit to start: ${formatRand(Math.ceil(total / 2))}`,
    'Remaining 50% due when the website is complete.',
    ...(name ? ['', `My name: ${name}`] : []),
    '',
    'Please confirm the invoice and next steps. Thank you!'
  ];
  document.querySelector('#invoice-send').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

document.querySelectorAll('.plan-card').forEach((card) => {
  card.querySelector('.plan-button').addEventListener('click', () => {
    selectedPlan = { name: card.dataset.plan, price: Number(card.dataset.price) };
    updateInvoice();
    dialog.showModal();
  });
});

addonInputs.forEach((input) => input.addEventListener('change', () => {
  updateAddonTotal();
  if (dialog.open) updateInvoice();
}));
document.querySelector('#customer-name').addEventListener('input', updateInvoice);
document.querySelector('#dialog-back').addEventListener('click', () => dialog.close());
document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelector('.menu-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const nav = document.querySelector('.main-nav');
  const isOpen = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!isOpen));
  button.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('open', !isOpen);
});
document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  document.querySelector('.main-nav').classList.remove('open');
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
}));

const WHATSAPP_NUMBER = '27677574436';
const formatter = new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 });
const money = (amount) => `R${formatter.format(amount)}`;
const addonInputs = [...document.querySelectorAll('.addon-check')];
const dialog = document.querySelector('#invoice-dialog');
let chosenPlan = null;

function getSelectedAddons() {
  return addonInputs.filter((input) => input.checked).map((input) => ({
    name: input.dataset.name,
    price: Number(input.dataset.price)
  }));
}

function refreshAddonTotal() {
  const total = getSelectedAddons().reduce((sum, addon) => sum + addon.price, 0);
  document.querySelector('#addon-total').textContent = money(total);
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function updateInvoice() {
  if (!chosenPlan) return;
  const addons = getSelectedAddons();
  const extrasTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
  const total = chosenPlan.price + extrasTotal;
  const deposit = Math.ceil(total / 2);

  document.querySelector('#invoice-plan-name').textContent = chosenPlan.name;
  document.querySelector('#invoice-plan-price').textContent = money(chosenPlan.price);
  document.querySelector('#invoice-addons').innerHTML = addons.length
    ? addons.map((addon) => `<div class="invoice-extra"><span>${escapeHtml(addon.name)}</span><strong>${addon.price ? money(addon.price) : 'FREE'}</strong></div>`).join('')
    : '<div class="invoice-extra"><span>No add-ons selected</span><strong>—</strong></div>';
  document.querySelector('#invoice-total').textContent = money(total);
  document.querySelector('#invoice-deposit').textContent = money(deposit);

  const customerName = document.querySelector('#customer-name').value.trim();
  const message = [
    'Hi AbantuWeb SA! Please prepare an invoice for my website order.',
    '',
    `Website package: ${chosenPlan.name} — ${money(chosenPlan.price)}`,
    ...addons.map((addon) => `Add-on: ${addon.name} — ${addon.price ? money(addon.price) : 'FREE'}`),
    `Estimated total: ${money(total)}`,
    `50% deposit to start: ${money(deposit)}`,
    'Remaining 50% due when the website is complete.',
    ...(customerName ? ['', `My name: ${customerName}`] : []),
    '',
    'Please confirm the invoice and next steps. Thank you!'
  ].join('\n');
  document.querySelector('#invoice-send').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll('.plan').forEach((card) => {
  card.querySelector('.choose-plan').addEventListener('click', () => {
    chosenPlan = { name: card.dataset.plan, price: Number(card.dataset.price) };
    updateInvoice();
    dialog.showModal();
  });
});

addonInputs.forEach((input) => input.addEventListener('change', () => {
  refreshAddonTotal();
  if (dialog.open) updateInvoice();
}));
document.querySelector('#customer-name').addEventListener('input', updateInvoice);
document.querySelector('#dialog-back').addEventListener('click', () => dialog.close());
document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

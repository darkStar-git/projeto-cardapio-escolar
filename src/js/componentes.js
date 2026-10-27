/* ==========================================================
   componentes.js – pedaços de HTML reutilizáveis
   (substitui o components.jsx do protótipo em React)
   ========================================================== */

const ICONES = {
  user:   '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lock:   '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  cart:   '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M3 4h2l2.5 11h11l2-7H7"/>',
  plus:   '<path d="M12 5v14M5 12h14"/>',
  minus:  '<path d="M5 12h14"/>',
  edit:   '<path d="m14 5 5 5L8 21H3v-5Z"/><path d="m12 7 5 5"/>',
  trash:  '<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/>',
  box:    '<path d="m3 7 9-4 9 4-9 4Z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',
  orders: '<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/>',
  tag:    '<path d="M3 12V4h8l10 10-8 8Z"/><circle cx="7.5" cy="8.5" r="1"/>',
  arrow:  '<path d="m9 18 6-6-6-6"/>',
  check:  '<path d="m5 12 4 4L19 6"/>',
  logout: '<path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10"/>'
};

function icone(nome, tamanho = 20) {
  return `<svg aria-hidden="true" class="icon" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONES[nome]}</svg>`;
}

// TODO: trocar por <img src="..."> com a logo real da cantina
function logo(compacta = false) {
  return `<div class="logo ${compacta ? 'compact' : ''}">
    <span class="logo-small">Cantina</span><strong>Ramos</strong>
    <span class="logo-tag">A pausa perfeita é aqui!</span>
  </div>`;
}

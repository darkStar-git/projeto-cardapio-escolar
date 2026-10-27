/* ==========================================================
   render.js – navegação e desenho da tela
   ========================================================== */

// Cada arquivo telas-*.js adiciona suas telas aqui (TELAS.menu, TELAS.prods...)
const TELAS = {};



/* ==========================================================
   0. ESTILOS POR TELA
   Mantém base.css sempre ativo e habilita apenas os módulos
   necessários para a tela atual.
   ========================================================== */
const CSS_POR_TELA = {
  login:  ['css-login'],
  menu:   ['css-cliente'],
  cart:   ['css-cliente', 'css-carrinho'],
  done:   ['css-cliente'],
  prods:  ['css-admin'],
  cats:   ['css-admin'],
  orders: ['css-admin', 'css-admin-pedidos'],
  order:  ['css-admin', 'css-admin-pedidos']
};

function atualizarEstilosDaTela() {
  const ativos = new Set(['css-base', ...(CSS_POR_TELA[estado.telaAtual] || [])]);

  if (estado.modalAberto) ativos.add('css-modal');

  document.querySelectorAll('link[data-css-tela]').forEach(link => {
    link.disabled = !ativos.has(link.id);
  });
}

/* ==========================================================
   1. NAVEGAÇÃO
   ========================================================== */
function irParaTela(tela, idPedido) {
  // Proteção das áreas (a proteção real deve estar no backend)
  if (TELAS_ADMIN.includes(tela) && !estado.adminLogado) {
    tela = 'login';
    estado.modoLogin = 'admin';
  } else if (TELAS_CLIENTE.includes(tela) && !estado.cliente.registro) {
    tela = 'login';
    estado.modoLogin = 'cliente';
  }

  estado.telaAtual = tela;
  if (idPedido !== undefined) estado.idPedidoAberto = idPedido;
  window.scrollTo(0, 0);
  desenharTela();

  if (tela === 'orders') carregarPedidos();
}


/* ==========================================================
   2. DESENHO
   ========================================================== */
function desenharTela() {
  atualizarEstilosDaTela();
  const tela = estado.telaAtual;
  let html;

  if (tela === 'login') {
    html = TELAS.login();                         // não depende dos dados da API
  } else if (estado.erroApi) {
    html = `<main class="estado-api"><div class="empty">${icone('box', 40)}
      <h2>Não foi possível carregar</h2><p>${escaparHtml(estado.erroApi)}</p>
      <button class="primary" onclick="carregarDados()">Tentar novamente</button></div></main>`;
  } else if (estado.carregando) {
    html = `<main class="estado-api"><div class="empty"><h2>Carregando...</h2></div></main>`;
  } else {
    html = TELAS[tela]();
  }

  porId('app').innerHTML = html;
  desenharModal();
}

// modalProduto, modalCategoria e modalExclusao ficam em telas-admin.js
function desenharModal() {
  atualizarEstilosDaTela();
  const modais = { produto: modalProduto, categoria: modalCategoria, exclusao: modalExclusao };
  const modal = modais[estado.modalAberto];
  porId('modal').innerHTML = modal ? modal() : '';
}

// Toast em um elemento próprio: não apaga o que a pessoa digitou nos formulários
let temporizadorToast;
function mostrarMensagem(texto) {
  porId('toast').innerHTML = `<div class="toast">${escaparHtml(texto)}</div>`;
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => { porId('toast').innerHTML = ''; }, 2500);
}

// Redesenha mantendo o foco e o cursor em um campo de busca
function redesenharMantendoFoco(idCampo, texto) {
  desenharTela();
  const campo = porId(idCampo);
  if (campo) {
    campo.focus();
    campo.setSelectionRange(texto.length, texto.length);
  }
}


/* ==========================================================
   3. CARREGAMENTO DE DADOS
   ========================================================== */
async function carregarDados() {
  estado.carregando = true;
  estado.erroApi = '';
  if (estado.telaAtual !== 'login') desenharTela();

  try {
    [estado.categorias, estado.produtos] = await Promise.all([
      apiBuscarCategorias(),
      apiBuscarProdutos()
    ]);
  } catch (erro) {
    estado.erroApi = erro.message;
  }

  estado.carregando = false;
  if (estado.telaAtual !== 'login') desenharTela();
}

// Depois de uma alteração do admin
async function recarregarCardapio() {
  [estado.categorias, estado.produtos] = await Promise.all([
    apiBuscarCategorias(),
    apiBuscarProdutos()
  ]);
  desenharTela();
}

// Pedidos (somente admin) – RF17
async function carregarPedidos() {
  await executar(async () => {
    estado.pedidos = await apiBuscarPedidos();
    desenharTela();
  });
}

/* ==========================================================
   acoes-cliente.js – login, cardápio, carrinho e pedido
   ========================================================== */


/* ==========================================================
   1. LOGIN / IDENTIFICAÇÃO (RF15)
   ========================================================== */
function alternarModoLogin() {
  estado.modoLogin = estado.modoLogin === 'cliente' ? 'admin' : 'cliente';
  desenharTela();
}

function entrarCliente(evento) {
  evento.preventDefault();
  const registro = porId('campoRegistroCliente').value.trim();
  const nome = porId('campoNomeCliente').value.trim();
  if (!registro || !nome) { mostrarMensagem('Informe registro e nome'); return; }

  estado.cliente = { nome, registro };
  irParaTela('menu');
}

function sairCliente() {
  estado.cliente = { nome: '', registro: '' };
  estado.carrinho = {};
  estado.textoBusca = '';
  estado.categoriaSelecionada = null;
  estado.modoLogin = 'cliente';
  irParaTela('login');
}


/* ==========================================================
   2. CARDÁPIO (RF04, RF05)
   ========================================================== */
function atualizarBusca(texto) {
  estado.textoBusca = texto;
  redesenharMantendoFoco('campoBusca', texto);
}

function selecionarCategoria(idCategoria) {   // null = todas
  estado.categoriaSelecionada = idCategoria;
  desenharTela();
}


/* ==========================================================
   3. CARRINHO (RF11, RF12)
   ========================================================== */
function adicionarAoCarrinho(idProduto) {
  estado.carrinho[idProduto] = (estado.carrinho[idProduto] || 0) + 1;
  desenharTela();
  mostrarMensagem('Adicionado ao pedido');
}

function alterarQuantidade(idProduto, variacao) {
  estado.carrinho[idProduto] = (estado.carrinho[idProduto] || 0) + variacao;
  if (estado.carrinho[idProduto] < 1) delete estado.carrinho[idProduto];
  desenharTela();
}

function removerDoCarrinho(idProduto) {
  delete estado.carrinho[idProduto];
  desenharTela();
}


/* ==========================================================
   4. FINALIZAR PEDIDO (RF14, RF16, RF20)
   ========================================================== */
async function finalizarPedido() {
  if (estado.enviando || !contarItensCarrinho()) return;

  estado.enviando = true;
  desenharTela();

  let idPedido;
  const deuCerto = await executar(async () => {
    idPedido = await apiRegistrarPedido(estado.cliente.nome, estado.cliente.registro, estado.carrinho);
  });

  estado.enviando = false;
  if (deuCerto) {
    estado.carrinho = {};            // limpa o carrinho após o pedido (RF20)
    irParaTela('done', idPedido);
  } else {
    desenharTela();
  }
}

/* ==========================================================
   acoes-admin.js – login do admin, produtos e categorias
   ========================================================== */


/* ==========================================================
   1. LOGIN DO ADMIN (RF09)
   ========================================================== */
async function entrarAdmin(evento) {
  evento.preventDefault();
  const registro = porId('campoRegistroAdmin').value.trim();
  const senha = porId('campoSenhaAdmin').value;
  const elementoErro = porId('erroLogin');

  try {
    await apiLogin(registro, senha);
    estado.adminLogado = true;
    irParaTela('prods');
    carregarPedidos();                        // para o contador do menu
  } catch (erro) {
    elementoErro.textContent = erro.message;
    elementoErro.style.display = 'block';
  }
}

function sairAdmin() {
  estado.adminLogado = false;
  estado.pedidos = [];
  estado.buscaAdmin = '';
  estado.modoLogin = 'cliente';
  irParaTela('login');
}


/* ==========================================================
   2. MODAIS
   ========================================================== */
function fecharModal() {
  estado.modalAberto = null;
  estado.idProdutoEmEdicao = null;
  estado.idCategoriaEmEdicao = null;
  estado.itemParaExcluir = null;
  desenharModal();
}

function pedirExclusao(tipo, id) {
  estado.itemParaExcluir = { tipo, id };
  estado.modalAberto = 'exclusao';
  desenharModal();
}

// RF03 (produto) e RF08 (categoria)
async function confirmarExclusao() {
  const { tipo, id } = estado.itemParaExcluir;
  fecharModal();

  await executar(async () => {
    if (tipo === 'produto') await apiRemoverProduto(id);
    else await apiRemoverCategoria(id);
    await recarregarCardapio();
  });
}


/* ==========================================================
   3. PRODUTOS (RF01, RF02, RF06)
   ========================================================== */
function atualizarBuscaAdmin(texto) {
  estado.buscaAdmin = texto;
  redesenharMantendoFoco('campoBuscaAdmin', texto);
}

function novoProduto() {
  estado.idProdutoEmEdicao = null;
  estado.modalAberto = 'produto';
  desenharModal();
}

function editarProduto(idProduto) {
  estado.idProdutoEmEdicao = idProduto;
  estado.modalAberto = 'produto';
  desenharModal();
}

async function salvarProduto(evento) {
  evento.preventDefault();
  const nome = porId('campoNomeProduto').value.trim();
  const descricao = porId('campoDescricaoProduto').value.trim();
  const preco = parseFloat(porId('campoPrecoProduto').value);
  const idCategoria = Number(porId('campoCategoriaProduto').value);

  if (!nome || !descricao || !(preco > 0) || preco > 999.99 || !idCategoria) {
    mostrarMensagem('Preencha os campos (preço de 0,01 até 999,99)');
    return;
  }

  const produtoAtual = buscarProduto(estado.idProdutoEmEdicao);
  const dadosProduto = {
    nome, descricao, preco, idCategoria,
    idDisponibilidade: produtoAtual ? produtoAtual.idDisponibilidade : ID_DISPONIVEL
  };

  const deuCerto = await executar(async () => {
    if (produtoAtual) await apiEditarProduto({ id: produtoAtual.id, ...dadosProduto });
    else await apiAdicionarProduto(dadosProduto);
    await recarregarCardapio();
  });

  if (deuCerto) {
    fecharModal();
    mostrarMensagem('Produto salvo');
  }
}

// Chave de disponibilidade da tabela (RF06)
async function alternarDisponibilidade(idProduto) {
  const produto = buscarProduto(idProduto);
  const novaDisponibilidade = produto.disponivel ? ID_INDISPONIVEL : ID_DISPONIVEL;

  const deuCerto = await executar(async () => {
    await apiEditarProduto({ ...produto, idDisponibilidade: novaDisponibilidade });
    await recarregarCardapio();
  });
  if (!deuCerto) desenharTela();              // volta a chave para a posição real
}


/* ==========================================================
   4. CATEGORIAS (RF08)
   ========================================================== */
function novaCategoria() {
  estado.idCategoriaEmEdicao = null;
  estado.modalAberto = 'categoria';
  desenharModal();
}

function editarCategoria(idCategoria) {
  estado.idCategoriaEmEdicao = idCategoria;
  estado.modalAberto = 'categoria';
  desenharModal();
}

async function salvarCategoria(evento) {
  evento.preventDefault();
  const nome = porId('campoNomeCategoria').value.trim();
  if (!nome) return;

  const idEmEdicao = estado.idCategoriaEmEdicao;
  const deuCerto = await executar(async () => {
    if (idEmEdicao) await apiEditarCategoria(idEmEdicao, nome);
    else await apiAdicionarCategoria(nome);
    await recarregarCardapio();
  });

  if (deuCerto) {
    fecharModal();
    mostrarMensagem('Categoria salva');
  }
}

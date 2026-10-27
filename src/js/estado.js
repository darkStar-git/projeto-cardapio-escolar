/* ==========================================================
   estado.js – estado global e funções auxiliares
   ========================================================== */


/* ==========================================================
   1. ESTADO
   ========================================================== */
const estado = {
  telaAtual: 'login',            // login | menu | cart | done | prods | cats | orders | order
  modoLogin: 'cliente',          // 'cliente' ou 'admin' (tela de login)
  cliente: { nome: '', registro: '' },
  adminLogado: false,

  categoriaSelecionada: null,    // id da categoria ativa no cardápio (null = todas)
  textoBusca: '',                // busca do cliente
  buscaAdmin: '',                // busca da tabela de produtos (admin)
  carrinho: {},                  // { idProduto: quantidade }

  idProdutoEmEdicao: null,       // null = novo produto
  idCategoriaEmEdicao: null,     // null = nova categoria
  idPedidoAberto: null,
  modalAberto: null,             // null | 'produto' | 'categoria' | 'exclusao'
  itemParaExcluir: null,         // { tipo: 'produto' | 'categoria', id }

  mensagemToast: '',
  carregando: true,
  erroApi: '',
  enviando: false,               // evita clique duplo ao confirmar pedido

  // Dados vindos da API
  categorias: [],                // [{ id, nome }]
  produtos: [],                  // [{ id, nome, descricao, preco, idCategoria, idDisponibilidade, disponivel }]
  pedidos: []                    // [{ id, data, cliente, registro, itens: [{ idProduto, quantidade, precoUnitario }] }]
};

const TELAS_ADMIN = ['prods', 'cats', 'orders', 'order'];
const TELAS_CLIENTE = ['menu', 'cart', 'done'];


/* ==========================================================
   2. FUNÇÕES AUXILIARES
   ========================================================== */
const formatarMoeda = valor =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Evita que textos vindos do banco quebrem o HTML (XSS)
const escaparHtml = texto => String(texto ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const porId = id => document.getElementById(id);

const buscarProduto = idProduto => estado.produtos.find(p => p.id == idProduto);

const nomeDoProduto = idProduto => {
  const produto = buscarProduto(idProduto);
  return produto ? produto.nome : 'Produto removido';
};

const nomeDaCategoria = idCategoria => {
  const categoria = estado.categorias.find(c => c.id == idCategoria);
  return categoria ? categoria.nome : '—';
};

// Itens do carrinho já com os dados do produto: [{ ...produto, quantidade }]
const itensDoCarrinho = () => Object.entries(estado.carrinho)
  .filter(([idProduto]) => buscarProduto(idProduto))
  .map(([idProduto, quantidade]) => ({ ...buscarProduto(idProduto), quantidade }));

const contarItensCarrinho = () =>
  itensDoCarrinho().reduce((soma, item) => soma + item.quantidade, 0);

const totalCarrinho = () =>
  itensDoCarrinho().reduce((soma, item) => soma + item.preco * item.quantidade, 0);

// Total de um pedido já registrado (usa o preço da época da compra)
const totalPedido = pedido =>
  pedido.itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);

// Executa uma ação da API e mostra o erro em um toast, se houver
async function executar(acao) {
  try {
    await acao();
    return true;
  } catch (erro) {
    mostrarMensagem(erro.message);
    return false;
  }
}

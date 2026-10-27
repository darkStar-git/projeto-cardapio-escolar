/* ==========================================================
   CANTINA RAMOS – script.js
   Índice:
   1. Estado e dados de exemplo
   2. Funções auxiliares
   3. Navegação e feedback
   4. Ações do cliente (carrinho e pedido)
   5. Ações do administrador
   6. Renderização (cabeçalho, modal, toast)
   7 e 8. Telas do cliente e do administrador
   9. Inicialização

   OBS: os dados abaixo são fictícios. Na versão final, troque-os
   por chamadas à API em conexao_externa (fetch).
   ========================================================== */


/* ==========================================================
   1. ESTADO E DADOS DE EXEMPLO
   ========================================================== */
const estado = {
  telaAtual: 'home',               // tela exibida no momento
  categoriaSelecionada: 'Todos',   // aba de categoria ativa no cardápio
  textoBusca: '',                  // texto digitado na busca
  carrinho: {},                    // { idProduto: quantidade }
  idProdutoEmEdicao: null,         // produto aberto no formulário (null = novo)
  idPedidoAberto: null,            // pedido exibido na tela de detalhe
  adminLogado: false,
  itemParaExcluir: null,           // { tipo: 'produto' | 'categoria', id } aguardando confirmação
  mensagemToast: '',               // mensagem temporária na parte de baixo da tela

  // Categorias (tbCategoria)
  categorias: ['Lanches', 'Salgados', 'Bebidas'],

  // Produtos (tbProduto) – disponivel: 1 = disponível, 0 = indisponível
  produtos: [
    { id: 1, nome: 'X-Burger',          descricao: 'Pão, hambúrguer, queijo e salada',  preco: 12,   categoria: 'Lanches',  disponivel: 1 },
    { id: 2, nome: 'Misto Quente',      descricao: 'Pão de forma, presunto e queijo',   preco: 7.5,  categoria: 'Lanches',  disponivel: 1 },
    { id: 3, nome: 'Coxinha',           descricao: 'Frango com catupiry, 90g',          preco: 6,    categoria: 'Salgados', disponivel: 1 },
    { id: 4, nome: 'Pastel de Queijo',  descricao: 'Massa crocante, recheio de queijo', preco: 6.5,  categoria: 'Salgados', disponivel: 0 },
    { id: 5, nome: 'Suco de Laranja',   descricao: 'Natural, 300ml',                    preco: 5,    categoria: 'Bebidas',  disponivel: 1 },
    { id: 6, nome: 'Refrigerante Lata', descricao: '350ml, vários sabores',             preco: 5.5,  categoria: 'Bebidas',  disponivel: 1 }
  ],

  // Pedidos (tbPedido + tbPedidoProduto) – itens: [[idProduto, quantidade], ...]
  pedidos: [
    { id: 101, data: '14/10 09:12', cliente: 'Ana Souza',  registro: '2024031', itens: [[1, 2], [5, 2]] },
    { id: 102, data: '14/10 09:40', cliente: 'Lucas Lima', registro: '2024110', itens: [[3, 1]] }
  ]
};

// Telas que pertencem à área do administrador
const TELAS_ADMIN = ['panel', 'prods', 'form', 'cats', 'orders', 'order'];


/* ==========================================================
   2. FUNÇÕES AUXILIARES
========================================================== */

// chamada de API Fetch
const url = 'http://localhost:3000/api';

async function chamarApi(rota, metodo = 'GET', corpo) {
  const opcoes = { method: metodo, headers: { 'Content-Type': 'application/json' } };
  if (corpo) opcoes.body = JSON.stringify(corpo);

  const resposta = await fetch(url + rota, opcoes);
  const dados = await resposta.json();

  // O backend responde 200 mesmo com erro, então checamos o conteúdo:
  if (typeof dados === 'string') throw new Error(dados);        // GET com erro devolve texto
  if (dados.sucesso === false) throw new Error(dados.erro);     // POST/PUT/DELETE com erro
  return dados;
}

// Formata número como moeda: 12 -> "R$ 12,00"
const formatarMoeda = valor => 'R$ ' + Number(valor).toFixed(2).replace('.', ',');

// Busca um produto pelo id
const buscarProduto = idProduto => estado.produtos.find(produto => produto.id == idProduto);

// Atalho para document.getElementById
const porId = id => document.getElementById(id);

// Quantidade total de itens no carrinho
const contarItensCarrinho = () =>
  Object.values(estado.carrinho).reduce((soma, quantidade) => soma + quantidade, 0);

// Valor total do carrinho
const totalCarrinho = () =>
  Object.entries(estado.carrinho).reduce(
    (soma, [idProduto, quantidade]) => soma + buscarProduto(idProduto).preco * quantidade, 0);

// Valor total de um pedido já registrado
const totalPedido = pedido =>
  pedido.itens.reduce(
    (soma, [idProduto, quantidade]) => soma + buscarProduto(idProduto).preco * quantidade, 0);


/* ==========================================================
   3. NAVEGAÇÃO E FEEDBACK
   ========================================================== */

// Troca de tela (idPedido é opcional, usado na tela de detalhe)
function irParaTela(tela, idPedido) {
  estado.telaAtual = tela;
  if (idPedido !== undefined) estado.idPedidoAberto = idPedido;
  window.scrollTo(0, 0);
  desenharTela();
}

// Exibe mensagem temporária (toast)
function mostrarMensagem(texto) {
  estado.mensagemToast = texto;
  desenharTela();
  setTimeout(() => {
    estado.mensagemToast = '';
    desenharTela();
  }, 1800);
}

// Atualiza a busca mantendo o foco no campo (RF05)
function atualizarBusca(texto) {
  estado.textoBusca = texto;
  estado.telaAtual = 'home';
  desenharTela();
  const campoBusca = porId('campoBusca');
  campoBusca.focus();
  campoBusca.setSelectionRange(texto.length, texto.length);
}

// Limpa busca e filtro de categoria
function limparBusca() {
  estado.textoBusca = '';
  estado.categoriaSelecionada = 'Todos';
  desenharTela();
}

// Seleciona uma aba de categoria no cardápio
function selecionarCategoria(nomeCategoria) {
  estado.categoriaSelecionada = nomeCategoria;
  desenharTela();
}


/* ==========================================================
   4. AÇÕES DO CLIENTE (carrinho e pedido)
   ========================================================== */

// Adiciona produto ao carrinho
function adicionarAoCarrinho(idProduto) {
  estado.carrinho[idProduto] = (estado.carrinho[idProduto] || 0) + 1;
  mostrarMensagem('Adicionado ao carrinho');
}

// Aumenta (+1) ou diminui (-1) a quantidade (RF11)
function alterarQuantidade(idProduto, variacao) {
  estado.carrinho[idProduto] += variacao;
  if (estado.carrinho[idProduto] < 1) delete estado.carrinho[idProduto];
  desenharTela();
}

// Remove produto do carrinho (RF12)
function removerDoCarrinho(idProduto) {
  delete estado.carrinho[idProduto];
  desenharTela();
}

// Finaliza o pedido (RF14, RF15, RF16, RF20)
function finalizarPedido() {
  const nomeCliente = porId('campoNome').value.trim();
  const registroCliente = porId('campoRegistro').value.trim();

  if (!nomeCliente || !registroCliente) {
    mostrarMensagem('Informe nome e registro');
    return;
  }

  const novoId = Math.max(...estado.pedidos.map(pedido => pedido.id)) + 1;

  estado.pedidos.push({
    id: novoId,
    data: 'agora',
    cliente: nomeCliente,
    registro: registroCliente,
    itens: Object.entries(estado.carrinho).map(([idProduto, quantidade]) => [+idProduto, quantidade])
  });

  estado.carrinho = {};            // limpa o carrinho após o pedido
  irParaTela('done', novoId);
}


/* ==========================================================
   5. AÇÕES DO ADMINISTRADOR
   ========================================================== */

// Login (RF09) – protótipo: aceita qualquer valor preenchido
function fazerLogin() {
  const registro = porId('campoRegistroLogin').value;
  const senha = porId('campoSenhaLogin').value;

  if (!registro || !senha) {
    porId('erroLogin').style.display = 'block';
    return;
  }

  estado.adminLogado = true;
  irParaTela('panel');
}

// Sai da área do administrador
function sair() {
  estado.adminLogado = false;
  irParaTela('home');
}

// Abre o formulário vazio (novo produto)
function novoProduto() {
  estado.idProdutoEmEdicao = null;
  irParaTela('form');
}

// Abre o formulário preenchido (editar produto)
function editarProduto(idProduto) {
  estado.idProdutoEmEdicao = idProduto;
  irParaTela('form');
}

// Salva produto novo ou editado (RF01, RF02)
function salvarProduto() {
  const nome = porId('campoNomeProduto').value.trim();
  const descricao = porId('campoDescricao').value.trim();
  const preco = parseFloat(porId('campoPreco').value);

  if (!nome || !descricao || !(preco > 0) || preco > 999.99) {
    mostrarMensagem('Preencha os campos (preço até 999,99)');
    return;
  }

  const dadosProduto = {
    nome,
    descricao,
    preco,
    categoria: porId('campoCategoria').value,
    disponivel: +porId('campoDisponibilidade').value
  };

  if (estado.idProdutoEmEdicao) {
    Object.assign(buscarProduto(estado.idProdutoEmEdicao), dadosProduto);
  } else {
    estado.produtos.push({ id: Date.now(), ...dadosProduto });
  }

  estado.idProdutoEmEdicao = null;
  irParaTela('prods');
  mostrarMensagem('Produto salvo');
}

// Alterna disponível/indisponível (RF06)
function alternarDisponibilidade(idProduto) {
  const produto = buscarProduto(idProduto);
  produto.disponivel = produto.disponivel ? 0 : 1;
  desenharTela();
}

// Abre o modal de confirmação de exclusão (tipo: 'produto' ou 'categoria')
function pedirExclusao(tipo, id) {
  estado.itemParaExcluir = { tipo, id };
  desenharTela();
}

// Fecha o modal sem excluir
function cancelarExclusao() {
  estado.itemParaExcluir = null;
  desenharTela();
}

// Confirma exclusão de produto ou categoria (RF03, RF08)
function confirmarExclusao() {
  const { tipo, id } = estado.itemParaExcluir;

  if (tipo === 'produto') {
    estado.produtos = estado.produtos.filter(produto => produto.id != id);
  } else {
    estado.categorias = estado.categorias.filter(nomeCategoria => nomeCategoria != id);
  }

  estado.itemParaExcluir = null;
  desenharTela();
}

// Adiciona categoria (RF08)
function adicionarCategoria() {
  const nomeNovaCategoria = porId('campoNovaCategoria').value.trim();

  if (nomeNovaCategoria && !estado.categorias.includes(nomeNovaCategoria)) {
    estado.categorias.push(nomeNovaCategoria);
    desenharTela();
  }
}

// Edita nome da categoria (RF08)
// No projeto final, trocar prompt() por um modal.
function editarCategoria(nomeAtual) {
  const novoNome = prompt('Novo nome da categoria', nomeAtual);

  if (novoNome) {
    estado.produtos.forEach(produto => {
      if (produto.categoria == nomeAtual) produto.categoria = novoNome;
    });
    estado.categorias[estado.categorias.indexOf(nomeAtual)] = novoNome;
    desenharTela();
  }
}


/* ==========================================================
   6. RENDERIZAÇÃO (cabeçalho, modal, toast)
   ========================================================== */
function desenharTela() {
  const telaAtual = estado.telaAtual;
  const naAreaAdmin = TELAS_ADMIN.includes(telaAtual) || telaAtual === 'login';

  // Destino do clique na logo
  const destinoLogo = naAreaAdmin ? (estado.adminLogado ? 'panel' : 'login') : 'home';

  // Menu do cabeçalho
  let menu;
  if (naAreaAdmin && estado.adminLogado) {
    menu = `
      <button class="${telaAtual == 'prods' || telaAtual == 'form' ? 'on' : ''}" onclick="irParaTela('prods')">Produtos</button>
      <button class="${telaAtual == 'cats' ? 'on' : ''}" onclick="irParaTela('cats')">Categorias</button>
      <button class="${telaAtual == 'orders' || telaAtual == 'order' ? 'on' : ''}" onclick="irParaTela('orders')">Pedidos</button>
      <button onclick="sair()">Sair</button>`;
  } else if (naAreaAdmin) {
    menu = `<button onclick="irParaTela('home')">Ver cardápio</button>`;
  } else {
    menu = `
      <button onclick="irParaTela('login')">Admin</button>
      <button class="${telaAtual == 'cart' ? 'on' : ''}" onclick="irParaTela('cart')">🛒 Carrinho (${contarItensCarrinho()})</button>`;
  }

  porId('cabecalho').innerHTML = `
    <div class="brand" onclick="irParaTela('${destinoLogo}')">Cantina Ramos<small>A pausa perfeita é aqui!</small></div>
    <nav>${menu}</nav>`;

  // Conteúdo da tela atual
  porId('conteudo').innerHTML =
    TELAS[telaAtual]() + `<div class="note">Protótipo de baixa fidelidade · Cantina Ramos</div>`;

  // Modal de confirmação + toast
  const modalExclusao = estado.itemParaExcluir ? `
    <div class="modal"><div class="box">
      <h3>Excluir?</h3>
      <p>Essa ação não pode ser desfeita.</p>
      <div class="row">
        <button class="sec" onclick="cancelarExclusao()">Cancelar</button>
        <button class="dng" onclick="confirmarExclusao()">Excluir</button>
      </div>
    </div></div>` : '';

  const toast = estado.mensagemToast ? `<div class="toast">${estado.mensagemToast}</div>` : '';

  porId('sobreposicao').innerHTML = modalExclusao + toast;
}


/* ==========================================================
   7 e 8. TELAS
   Cada função devolve o HTML de uma tela.
   ========================================================== */
const TELAS = {

  /* ---------- 7. TELAS DO CLIENTE ---------- */

  // Tela 1 e 2 – Cardápio e resultado da busca (RF04, RF05, RF07)
  home() {
    const busca = estado.textoBusca.toLowerCase();

    const produtosFiltrados = estado.produtos.filter(produto =>
      (estado.categoriaSelecionada == 'Todos' || produto.categoria == estado.categoriaSelecionada) &&
      (!busca || produto.nome.toLowerCase().includes(busca) || produto.categoria.toLowerCase().includes(busca))
    );

    const abasCategorias = ['Todos', ...estado.categorias]
      .map(nomeCategoria => `
        <button class="${estado.categoriaSelecionada == nomeCategoria ? 'on' : ''}"
                onclick="selecionarCategoria('${nomeCategoria}')">${nomeCategoria}</button>`)
      .join('');

    const cardsProdutos = produtosFiltrados.map(produto => `
      <div class="card ${produto.disponivel ? '' : 'off'}">
        <div class="row">
          <span class="tag">${produto.categoria}</span>
          ${produto.disponivel ? '' : '<span class="tag">Indisponível</span>'}
        </div>
        <h3>${produto.nome}</h3>
        <p>${produto.descricao}</p>
        <div class="row">
          <span class="price">${formatarMoeda(produto.preco)}</span>
          <button ${produto.disponivel
            ? `onclick="adicionarAoCarrinho(${produto.id})"`
            : 'disabled style="opacity:.4"'}>Adicionar</button>
        </div>
      </div>`).join('');

    const mensagemVazia = `
      <div class="empty">😕 Nenhum produto encontrado${estado.textoBusca ? ` para “${estado.textoBusca}”` : ''}.<br><br>
        <button class="sec" onclick="limparBusca()">Limpar busca</button>
      </div>`;

    return `
      <h1>Cardápio</h1>
      <div class="bar">
        <input id="campoBusca" placeholder="🔎 Buscar por nome ou categoria"
               value="${estado.textoBusca}" oninput="atualizarBusca(this.value)">
      </div>
      <div class="tabs">${abasCategorias}</div>
      ${produtosFiltrados.length ? `<div class="grid">${cardsProdutos}</div>` : mensagemVazia}`;
  },

  // Tela 3 – Carrinho (RF11, RF12, RF13)
  cart() {
    const itensCarrinho = Object.entries(estado.carrinho);

    if (!itensCarrinho.length) {
      return `<h1>Seu carrinho</h1>
        <div class="empty">🛒 Seu carrinho está vazio.<br><br>
          <button onclick="irParaTela('home')">Ver cardápio</button>
        </div>`;
    }

    return `
      <h1>Seu carrinho</h1>
      <div class="box">
        ${itensCarrinho.map(([idProduto, quantidade]) => `
          <div class="item">
            <div>
              <b>${buscarProduto(idProduto).nome}</b><br>
              <span class="hint">${formatarMoeda(buscarProduto(idProduto).preco)} cada</span>
            </div>
            <div class="qty">
              <button class="sec" onclick="alterarQuantidade(${idProduto},-1)">−</button>
              <b>${quantidade}</b>
              <button class="sec" onclick="alterarQuantidade(${idProduto},1)">+</button>
            </div>
            <b>${formatarMoeda(buscarProduto(idProduto).preco * quantidade)}</b>
            <button class="sec" onclick="removerDoCarrinho(${idProduto})">Remover</button>
          </div>`).join('')}
        <div class="total">Total: ${formatarMoeda(totalCarrinho())}</div>
      </div>
      <div class="row">
        <button class="sec" onclick="irParaTela('home')">← Continuar comprando</button>
        <button onclick="irParaTela('checkout')">Revisar pedido →</button>
      </div>`;
  },

  // Tela 4 – Identificação e revisão (RF14, RF15)
  checkout() {
    return `
      <h1>Finalizar pedido</h1>
      <div class="box">
        <b>Resumo</b>
        ${Object.entries(estado.carrinho).map(([idProduto, quantidade]) => `
          <div class="row hint" style="font-size:14px;padding-top:6px">
            <span>${quantidade}× ${buscarProduto(idProduto).nome}</span>
            <span>${formatarMoeda(buscarProduto(idProduto).preco * quantidade)}</span>
          </div>`).join('')}
        <div class="total">Total: ${formatarMoeda(totalCarrinho())}</div>
      </div>
      <div class="box">
        <label>Nome</label>
        <input id="campoNome" maxlength="30" placeholder="Seu nome">
        <label>Registro (RM / matrícula)</label>
        <input id="campoRegistro" maxlength="10" placeholder="Até 10 caracteres">
      </div>
      <div class="row">
        <button class="sec" onclick="irParaTela('cart')">← Voltar</button>
        <button onclick="finalizarPedido()">Finalizar pedido</button>
      </div>`;
  },

  // Tela 5 – Pedido confirmado (RF16, RF20)
  done() {
    return `
      <div class="center box" style="text-align:center">
        <div style="font-size:48px">✅</div>
        <h1>Pedido confirmado!</h1>
        <div class="check"></div>
        <p>Pedido nº <b>${estado.idPedidoAberto}</b> registrado.<br>Retire na Cantina Ramos.</p>
        <button onclick="irParaTela('home')">Fazer novo pedido</button>
      </div>`;
  },


  /* ---------- 8. TELAS DO ADMINISTRADOR ---------- */

  // Tela 6 – Login (RF09)
  login() {
    return `
      <div class="center box">
        <h1>Área do admin</h1>
        <label>Registro</label>
        <input id="campoRegistroLogin" maxlength="10">
        <label>Senha</label>
        <input id="campoSenhaLogin" type="password">
        <p id="erroLogin" style="display:none;color:var(--r);font-weight:800">Registro ou senha inválidos.</p>
        <br>
        <button style="width:100%" onclick="fazerLogin()">Entrar</button>
        <p class="hint">Protótipo: qualquer valor preenchido entra.</p>
      </div>`;
  },

  // Tela 7 – Painel inicial
  panel() {
    return `
      <h1>Painel</h1>
      <div class="hub">
        <div class="card" onclick="irParaTela('prods')">🍔<br>Produtos</div>
        <div class="card" onclick="irParaTela('cats')">🏷️<br>Categorias</div>
        <div class="card" onclick="irParaTela('orders')">📋<br>Pedidos<br>
          <span class="hint">${estado.pedidos.length} registrados</span>
        </div>
      </div>`;
  },

  // Tela 8 – Lista de produtos (RF02, RF03, RF06)
  prods() {
    const linhasTabela = estado.produtos.map(produto => `
      <tr>
        <td>${produto.nome}</td>
        <td>${produto.categoria}</td>
        <td>${formatarMoeda(produto.preco)}</td>
        <td>
          <button class="sec" onclick="alternarDisponibilidade(${produto.id})">
            ${produto.disponivel
              ? '<span class="tag ok">Disponível</span>'
              : '<span class="tag">Indisponível</span>'}
          </button>
        </td>
        <td>
          <button class="sec" onclick="editarProduto(${produto.id})">Editar</button>
          <button class="dng" onclick="pedirExclusao('produto',${produto.id})">Excluir</button>
        </td>
      </tr>`).join('');

    return `
      <div class="row">
        <h1>Produtos</h1>
        <button onclick="novoProduto()">+ Novo produto</button>
      </div>
      <div class="box scroll">
        <table>
          <tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Status</th><th></th></tr>
          ${linhasTabela}
        </table>
      </div>`;
  },

  // Tela 9 – Formulário de produto (RF01, RF02)
  form() {
    const emEdicao = estado.idProdutoEmEdicao !== null;
    const produto = emEdicao
      ? buscarProduto(estado.idProdutoEmEdicao)
      : { nome: '', descricao: '', preco: '', categoria: estado.categorias[0], disponivel: 1 };

    return `
      <h1>${emEdicao ? 'Editar' : 'Novo'} produto</h1>
      <div class="box">
        <label>Nome</label>
        <input id="campoNomeProduto" maxlength="40" value="${produto.nome}">
        <label>Descrição</label>
        <textarea id="campoDescricao" maxlength="120" rows="2">${produto.descricao}</textarea>
        <span class="hint">Máx. 120 caracteres</span>
        <label>Preço (R$)</label>
        <input id="campoPreco" type="number" step="0.01" max="999.99" value="${produto.preco}">
        <label>Categoria</label>
        <select id="campoCategoria">
          ${estado.categorias.map(nomeCategoria =>
            `<option ${nomeCategoria == produto.categoria ? 'selected' : ''}>${nomeCategoria}</option>`).join('')}
        </select>
        <label>Disponibilidade</label>
        <select id="campoDisponibilidade">
          <option value="1" ${produto.disponivel ? 'selected' : ''}>Disponível</option>
          <option value="0" ${produto.disponivel ? '' : 'selected'}>Indisponível</option>
        </select>
      </div>
      <div class="row">
        <button class="sec" onclick="irParaTela('prods')">Cancelar</button>
        <button onclick="salvarProduto()">Salvar</button>
      </div>`;
  },

  // Tela 10 – Categorias (RF08)
  cats() {
    return `
      <h1>Categorias</h1>
      <div class="bar">
        <input id="campoNovaCategoria" maxlength="20" placeholder="Nova categoria">
        <button onclick="adicionarCategoria()">Adicionar</button>
      </div>
      <div class="box">
        ${estado.categorias.map(nomeCategoria => `
          <div class="item">
            <b>${nomeCategoria}</b>
            <span>
              <button class="sec" onclick="editarCategoria('${nomeCategoria}')">Editar</button>
              <button class="dng" onclick="pedirExclusao('categoria','${nomeCategoria}')">Excluir</button>
            </span>
          </div>`).join('')}
      </div>`;
  },

  // Tela 11 – Lista de pedidos (RF17)
  orders() {
    const linhasTabela = [...estado.pedidos].reverse().map(pedido => `
      <tr>
        <td>${pedido.id}</td>
        <td>${pedido.data}</td>
        <td>${pedido.cliente}</td>
        <td>${formatarMoeda(totalPedido(pedido))}</td>
        <td><button class="sec" onclick="irParaTela('order',${pedido.id})">Ver</button></td>
      </tr>`).join('');

    return `
      <h1>Pedidos</h1>
      <div class="box scroll">
        <table>
          <tr><th>Nº</th><th>Data</th><th>Cliente</th><th>Total</th><th></th></tr>
          ${linhasTabela}
        </table>
      </div>`;
  },

  // Tela 12 – Detalhe do pedido, somente leitura (RF17, RF18)
  order() {
    const pedido = estado.pedidos.find(item => item.id == estado.idPedidoAberto);

    return `
      <h1>Pedido nº ${pedido.id}</h1>
      <div class="box">
        <p><b>${pedido.cliente}</b> · registro ${pedido.registro} · ${pedido.data}</p>
        ${pedido.itens.map(([idProduto, quantidade]) => `
          <div class="item">
            <span>${quantidade}× ${buscarProduto(idProduto).nome}</span>
            <span>${formatarMoeda(buscarProduto(idProduto).preco)} cada</span>
            <b>${formatarMoeda(buscarProduto(idProduto).preco * quantidade)}</b>
          </div>`).join('')}
        <div class="total">Total: ${formatarMoeda(totalPedido(pedido))}</div>
        <span class="tag">Somente visualização</span>
      </div>
      <button class="sec" onclick="irParaTela('orders')">← Voltar</button>`;
  }
};


/* ==========================================================
   9. INICIALIZAÇÃO
   ========================================================== */
desenharTela();

/* ==========================================================
   telas-cliente.js – HTML das telas do cliente
   Cada função devolve o HTML de uma tela (substitui o App.jsx).
   ========================================================== */

// Cabeçalho comum às telas do cliente
function layoutCliente(conteudo) {
  const tela = estado.telaAtual;
  const quantidade = contarItensCarrinho();
  const inicial = (estado.cliente.nome || 'C').charAt(0).toUpperCase();

  return `
    <main class="customer-shell">
      <header class="customer-header">
        ${logo(true)}
        <nav>
          <button class="${tela === 'menu' ? 'active' : ''}" onclick="irParaTela('menu')">Cardápio</button>
          <button class="cart-button" onclick="irParaTela('cart')">
            ${icone('cart')} Meu pedido ${quantidade > 0 ? `<b>${quantidade}</b>` : ''}
          </button>
          <button class="avatar" title="Sair" onclick="sairCliente()">${escaparHtml(inicial)}</button>
        </nav>
      </header>
      ${conteudo}
    </main>`;
}

Object.assign(TELAS, {

  /* ---------- Login do cliente e do admin (RF09, RF15) ---------- */
  login() {
    const ehCliente = estado.modoLogin === 'cliente';

    const camposCliente = `
      <label>Registro do cliente
        <div class="field">${icone('user')}
          <input id="campoRegistroCliente" required maxlength="10" placeholder="Ex.: 2024001"
                 value="${escaparHtml(estado.cliente.registro)}"></div>
      </label>
      <label>Nome completo
        <div class="field">${icone('user')}
          <input id="campoNomeCliente" required maxlength="30" placeholder="Como podemos te chamar?"
                 value="${escaparHtml(estado.cliente.nome)}"></div>
      </label>`;

    const camposAdmin = `
      <label>Registro administrativo
        <div class="field">${icone('user')}
          <input id="campoRegistroAdmin" required maxlength="10" placeholder="Digite seu registro"></div>
      </label>
      <label>Senha
        <div class="field">${icone('lock')}
          <input id="campoSenhaAdmin" required type="password" placeholder="Digite sua senha"></div>
      </label>
      <p id="erroLogin" class="erro" style="display:none"></p>`;

    return `
      <main class="login-page">
        <section class="brand-panel">
          <div class="checker"></div>
          ${logo()}
          <p>Seu lanche favorito,<br><strong>agora a um toque.</strong></p>
          <div class="plate"><div class="burger"><i></i><b></b><em></em><b></b><i></i></div></div>
        </section>
        <section class="login-panel">
          <form class="login-card" onsubmit="${ehCliente ? 'entrarCliente(event)' : 'entrarAdmin(event)'}">
            <div class="mobile-logo">${logo(true)}</div>
            <span class="eyebrow">${ehCliente ? 'BEM-VINDO' : 'ACESSO RESTRITO'}</span>
            <h1>${ehCliente ? 'Faça seu pedido' : 'Área administrativa'}</h1>
            <p>${ehCliente ? 'Identifique-se para acessar o cardápio.' : 'Entre com suas credenciais para gerenciar a cantina.'}</p>
            ${ehCliente ? camposCliente : camposAdmin}
            <button class="primary" type="submit">Entrar ${icone('arrow')}</button>
            <button class="mode-switch" type="button" onclick="alternarModoLogin()">
              ${icone(ehCliente ? 'lock' : 'user')} ${ehCliente ? 'Login administrativo' : 'Voltar para login de cliente'}
            </button>
          </form>
        </section>
      </main>`;
  },

  /* ---------- Cardápio (RF04, RF05, RF07) ---------- */
  menu() {
    const busca = estado.textoBusca.toLowerCase();
    const produtosVisiveis = estado.produtos.filter(produto =>
      produto.disponivel &&
      (estado.categoriaSelecionada === null || produto.idCategoria == estado.categoriaSelecionada) &&
      `${produto.nome} ${nomeDaCategoria(produto.idCategoria)}`.toLowerCase().includes(busca)
    );

    const abas = [{ id: null, nome: 'Todos' }, ...estado.categorias].map(categoria => `
      <button class="${estado.categoriaSelecionada === categoria.id ? 'active' : ''}"
              onclick="selecionarCategoria(${categoria.id})">${escaparHtml(categoria.nome)}</button>`).join('');

    const cards = produtosVisiveis.map((produto, indice) => {
      const categoria = escaparHtml(nomeDaCategoria(produto.idCategoria));
      return `
        <article class="product-card">
          <div class="food-art food-${indice % 4}"><span>${categoria}</span></div>
          <div class="product-info">
            <small>${categoria}</small>
            <h2>${escaparHtml(produto.nome)}</h2>
            <p>${escaparHtml(produto.descricao)}</p>
            <div>
              <strong>${formatarMoeda(produto.preco)}</strong>
              <button onclick="adicionarAoCarrinho(${produto.id})" aria-label="Adicionar ${escaparHtml(produto.nome)}">${icone('plus')}</button>
            </div>
          </div>
        </article>`;
    }).join('');

    const vazio = `<div class="empty">${icone('search', 40)}<h2>Nenhum produto encontrado</h2><p>Tente outra busca ou categoria.</p></div>`;

    return layoutCliente(`
      <section class="menu-content">
        <div class="welcome">
          <div>
            <span class="eyebrow">OLÁ, ${escaparHtml(estado.cliente.nome.toUpperCase())}</span>
            <h1>O que vai pedir hoje?</h1>
            <p>Escolha seus favoritos. A gente prepara com carinho.</p>
          </div>
          <div class="search">${icone('search')}
            <input id="campoBusca" placeholder="Buscar no cardápio..." value="${escaparHtml(estado.textoBusca)}"
                   oninput="atualizarBusca(this.value)">
          </div>
        </div>
        <div class="category-tabs">${abas}</div>
        ${produtosVisiveis.length ? `<div class="menu-grid">${cards}</div>` : vazio}
      </section>`);
  },

  /* ---------- Carrinho (RF11, RF12, RF13, RF14) ---------- */
  cart() {
    const itens = itensDoCarrinho();

    const lista = itens.length ? itens.map(item => `
      <article>
        <div class="cart-thumb"></div>
        <div>
          <h2>${escaparHtml(item.nome)}</h2>
          <p>${escaparHtml(item.descricao)}</p>
          <button class="remove" onclick="removerDoCarrinho(${item.id})">Remover</button>
        </div>
        <div class="qty">
          <button onclick="alterarQuantidade(${item.id}, -1)">${icone('minus')}</button>
          <b>${item.quantidade}</b>
          <button onclick="alterarQuantidade(${item.id}, 1)">${icone('plus')}</button>
        </div>
        <strong>${formatarMoeda(item.preco * item.quantidade)}</strong>
      </article>`).join('')
      : `<div class="empty">${icone('cart', 40)}<h2>Seu carrinho está vazio</h2><p>Adicione itens deliciosos do nosso cardápio.</p></div>`;

    return layoutCliente(`
      <section class="cart-page">
        <button class="back" onclick="irParaTela('menu')">← Voltar ao cardápio</button>
        <span class="eyebrow">SEU PEDIDO</span>
        <h1>Revise antes de confirmar</h1>
        <div class="cart-layout">
          <div class="cart-list">${lista}</div>
          <aside class="summary">
            <h2>Resumo do pedido</h2>
            <div><span>Subtotal</span><b>${formatarMoeda(totalCarrinho())}</b></div>
            <hr>
            <div class="grand-total"><span>Total</span><strong>${formatarMoeda(totalCarrinho())}</strong></div>
            <button class="primary" ${itens.length && !estado.enviando ? '' : 'disabled'} onclick="finalizarPedido()">
              ${estado.enviando ? 'Enviando...' : `Confirmar pedido ${icone('check')}`}
            </button>
            <small>Ao confirmar, seu pedido será enviado para a cantina.</small>
          </aside>
        </div>
      </section>`);
  },

  /* ---------- Pedido confirmado (RF16, RF20) ---------- */
  done() {
    return layoutCliente(`
      <section class="cart-page">
        <div class="empty">${icone('check', 40)}
          <h2>Pedido confirmado!</h2>
          <p>Pedido nº <b>${escaparHtml(estado.idPedidoAberto)}</b> registrado. Já estamos preparando.</p>
          <button class="primary" onclick="irParaTela('menu')">Fazer novo pedido</button>
        </div>
      </section>`);
  }
});

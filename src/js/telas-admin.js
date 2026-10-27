/* ==========================================================
   telas-admin.js – HTML das telas e modais do administrador
   ========================================================== */

// Menu lateral + cabeçalho comuns às telas do admin
function layoutAdmin(aba, titulo, descricao, botaoAcao, conteudo) {
  const botaoMenu = (id, rotulo, nomeIcone, extra = '') => `
    <button class="${aba === id ? 'active' : ''}" onclick="irParaTela('${id}')">${icone(nomeIcone)} ${rotulo} ${extra}</button>`;

  return `
    <main class="admin-shell">
      <aside class="sidebar">
        ${logo(true)}
        <nav>
          ${botaoMenu('prods', 'Produtos', 'box')}
          ${botaoMenu('cats', 'Categorias', 'tag')}
          ${botaoMenu('orders', 'Pedidos', 'orders', estado.pedidos.length ? `<span>${estado.pedidos.length}</span>` : '')}
        </nav>
        <button class="logout" onclick="sairAdmin()">${icone('logout')} Sair</button>
      </aside>
      <section class="admin-content">
        <header class="admin-header">
          <div><span class="eyebrow">PAINEL ADMINISTRATIVO</span><h1>${titulo}</h1><p>${descricao}</p></div>
          ${botaoAcao}
        </header>
        ${conteudo}
      </section>
    </main>`;
}

Object.assign(TELAS, {

  /* ---------- Produtos (RF01, RF02, RF03, RF06) ---------- */
  prods() {
    const busca = estado.buscaAdmin.toLowerCase();
    const lista = estado.produtos.filter(produto => produto.nome.toLowerCase().includes(busca));
    const disponiveis = estado.produtos.filter(produto => produto.disponivel).length;

    const linhas = lista.map(produto => `
      <div class="tr">
        <div><strong>${escaparHtml(produto.nome)}</strong><small>${escaparHtml(produto.descricao)}</small></div>
        <span class="category-pill">${escaparHtml(nomeDaCategoria(produto.idCategoria))}</span>
        <b>${formatarMoeda(produto.preco)}</b>
        <label class="availability">
          <input type="checkbox" ${produto.disponivel ? 'checked' : ''} onchange="alternarDisponibilidade(${produto.id})">
          <i></i><span>${produto.disponivel ? 'Disponível' : 'Indisponível'}</span>
        </label>
        <div class="actions">
          <button aria-label="Editar" onclick="editarProduto(${produto.id})">${icone('edit', 17)}</button>
          <button aria-label="Excluir" onclick="pedirExclusao('produto', ${produto.id})">${icone('trash', 17)}</button>
        </div>
      </div>`).join('');

    return layoutAdmin('prods', 'Gerenciar produtos', 'Atualize o cardápio e a disponibilidade dos itens.',
      `<button class="primary" onclick="novoProduto()">${icone('plus')} Novo produto</button>`, `
      <div class="stats">
        <article>${icone('box')}<div><strong>${estado.produtos.length}</strong><span>Produtos cadastrados</span></div></article>
        <article><span class="status-dot green"></span><div><strong>${disponiveis}</strong><span>Disponíveis agora</span></div></article>
        <article><span class="status-dot red"></span><div><strong>${estado.produtos.length - disponiveis}</strong><span>Indisponíveis</span></div></article>
      </div>
      <div class="table-card">
        <div class="table-tools">
          <div class="search">${icone('search')}
            <input id="campoBuscaAdmin" placeholder="Buscar produto..." value="${escaparHtml(estado.buscaAdmin)}"
                   oninput="atualizarBuscaAdmin(this.value)">
          </div>
          <span>${lista.length} itens</span>
        </div>
        <div class="product-table">
          <div class="tr table-head"><span>PRODUTO</span><span>CATEGORIA</span><span>PREÇO</span><span>DISPONIBILIDADE</span><span>AÇÕES</span></div>
          ${linhas}
        </div>
      </div>`);
  },

  /* ---------- Categorias (RF08) ---------- */
  cats() {
    const linhas = estado.categorias.map(categoria => {
      const quantidade = estado.produtos.filter(produto => produto.idCategoria == categoria.id).length;
      return `
        <div class="cat-row">
          <div><strong>${escaparHtml(categoria.nome)}</strong><small>${quantidade} produto(s)</small></div>
          <div class="actions">
            <button aria-label="Editar" onclick="editarCategoria(${categoria.id})">${icone('edit', 17)}</button>
            <button aria-label="Excluir" onclick="pedirExclusao('categoria', ${categoria.id})">${icone('trash', 17)}</button>
          </div>
        </div>`;
    }).join('');

    return layoutAdmin('cats', 'Categorias', 'Organize os produtos do cardápio.',
      `<button class="primary" onclick="novaCategoria()">${icone('plus')} Nova categoria</button>`,
      `<div class="table-card">${linhas || '<div class="empty">Nenhuma categoria cadastrada.</div>'}</div>`);
  },

  /* ---------- Lista de pedidos (RF17) ---------- */
  orders() {
    const lista = [...estado.pedidos].sort((a, b) => b.id - a.id);

    const cards = lista.map(pedido => `
      <article>
        <div class="order-id"><span>#${pedido.id}</span><small>${escaparHtml(pedido.data)}</small></div>
        <div>
          <strong>${escaparHtml(pedido.cliente)}</strong>
          <p>${escaparHtml(pedido.itens.map(item => `${item.quantidade}x ${nomeDoProduto(item.idProduto)}`).join(', '))}</p>
        </div>
        <b>${formatarMoeda(totalPedido(pedido))}</b>
        <button class="ver" onclick="irParaTela('order', ${pedido.id})">Ver</button>
      </article>`).join('');

    return layoutAdmin('orders', 'Pedidos recebidos', 'Acompanhe os pedidos feitos pelos clientes.', '',
      `<div class="orders">${cards || '<div class="empty">Nenhum pedido registrado ainda.</div>'}</div>`);
  },

  /* ---------- Detalhe do pedido, somente leitura (RF17, RF18) ---------- */
  order() {
    const pedido = estado.pedidos.find(item => item.id == estado.idPedidoAberto);
    if (!pedido) return layoutAdmin('orders', 'Pedido não encontrado', '', '',
      `<button class="back" onclick="irParaTela('orders')">← Voltar</button>`);

    const linhas = pedido.itens.map(item => `
      <div class="detalhe-item">
        <strong>${escaparHtml(nomeDoProduto(item.idProduto))}</strong>
        <span>${item.quantidade}x</span>
        <span>${formatarMoeda(item.precoUnitario)}</span>
        <b>${formatarMoeda(item.precoUnitario * item.quantidade)}</b>
      </div>`).join('');

    return layoutAdmin('orders', `Pedido #${pedido.id}`,
      `${escaparHtml(pedido.cliente)} · registro ${escaparHtml(pedido.registro)} · ${escaparHtml(pedido.data)}`,
      '<span class="selo">Somente visualização</span>', `
      <button class="back" onclick="irParaTela('orders')">← Voltar aos pedidos</button>
      <div class="table-card">
        ${linhas}
        <div class="detalhe-total"><span>Total</span><span>${formatarMoeda(totalPedido(pedido))}</span></div>
      </div>`);
  }
});


/* ==========================================================
   MODAIS (usados pelo desenharModal, em render.js)
   ========================================================== */

// Cadastro e edição de produto (RF01, RF02)
function modalProduto() {
  const produto = buscarProduto(estado.idProdutoEmEdicao);
  const emEdicao = Boolean(produto);
  const idCategoriaAtual = produto ? produto.idCategoria : (estado.categorias[0] || {}).id;

  const opcoes = estado.categorias.map(categoria =>
    `<option value="${categoria.id}" ${categoria.id == idCategoriaAtual ? 'selected' : ''}>${escaparHtml(categoria.nome)}</option>`).join('');

  return `
    <div class="modal-backdrop">
      <form class="modal" onsubmit="salvarProduto(event)">
        <div><span class="eyebrow">${emEdicao ? 'EDITAR ITEM' : 'NOVO ITEM'}</span>
          <h2>${emEdicao ? 'Atualizar produto' : 'Adicionar produto'}</h2></div>
        <label>Nome<input id="campoNomeProduto" required maxlength="40" value="${escaparHtml(produto ? produto.nome : '')}"></label>
        <label>Descrição<input id="campoDescricaoProduto" required maxlength="120" value="${escaparHtml(produto ? produto.descricao : '')}"></label>
        <div class="form-row">
          <label>Preço (R$)<input id="campoPrecoProduto" type="number" step="0.01" min="0.01" max="999.99" required value="${produto ? produto.preco : ''}"></label>
          <label>Categoria<select id="campoCategoriaProduto" required>${opcoes}</select></label>
        </div>
        <div class="modal-actions">
          <button type="button" onclick="fecharModal()">Cancelar</button>
          <button class="primary" type="submit">Salvar produto</button>
        </div>
      </form>
    </div>`;
}

// Cadastro e edição de categoria (RF08)
function modalCategoria() {
  const nomeAtual = estado.idCategoriaEmEdicao
    ? estado.categorias.find(c => c.id == estado.idCategoriaEmEdicao).nome : '';

  return `
    <div class="modal-backdrop">
      <form class="modal" onsubmit="salvarCategoria(event)">
        <div><span class="eyebrow">${nomeAtual ? 'EDITAR CATEGORIA' : 'NOVA CATEGORIA'}</span>
          <h2>${nomeAtual ? 'Renomear categoria' : 'Adicionar categoria'}</h2></div>
        <label>Nome<input id="campoNomeCategoria" required maxlength="20" value="${escaparHtml(nomeAtual)}"></label>
        <div class="modal-actions">
          <button type="button" onclick="fecharModal()">Cancelar</button>
          <button class="primary" type="submit">Salvar</button>
        </div>
      </form>
    </div>`;
}

// Confirmação de exclusão (RF03, RF08)
function modalExclusao() {
  const { tipo, id } = estado.itemParaExcluir;
  const nome = tipo === 'produto' ? nomeDoProduto(id) : nomeDaCategoria(id);

  return `
    <div class="modal-backdrop">
      <div class="modal">
        <h2>Excluir ${tipo}?</h2>
        <p>“${escaparHtml(nome)}” será removido. Essa ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button type="button" onclick="fecharModal()">Cancelar</button>
          <button class="primary danger" onclick="confirmarExclusao()">Excluir</button>
        </div>
      </div>
    </div>`;
}

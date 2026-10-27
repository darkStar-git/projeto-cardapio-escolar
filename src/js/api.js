/* ==========================================================
   CANTINA RAMOS – api.js
   Comunicação com o backend (conexao_externa/index.js).
   Este arquivo deve ser carregado ANTES do script.js.

   Índice:
   1. Configuração
   2. Função base (chamarApi)
   3. Categorias
   4. Produtos
   5. Pedidos
   6. Login do administrador
   ========================================================== */


/* ==========================================================
   1. CONFIGURAÇÃO
   ========================================================== */
const API_URL = 'http://localhost:3000/api';

// Ids da tabela tbDisponibilidade (conforme DML_Cantina.sql)
const ID_DISPONIVEL = 1;
const ID_INDISPONIVEL = 2;


/* ==========================================================
   2. FUNÇÃO BASE
   O backend devolve erros de formas diferentes:
   - GET/PUT/DELETE: uma string com a mensagem de erro
   - POST: { sucesso: false, erro: '...' }
   Esta função padroniza tudo: ou devolve os dados, ou lança Error.
   ========================================================== */
async function chamarApi(rota, metodo = 'GET', corpo = null) {
    const opcoes = { method: metodo, headers: { 'Content-Type': 'application/json' } };
    if (corpo) opcoes.body = JSON.stringify(corpo);

    let dados;
    try {
        const resposta = await fetch(`${API_URL}/${rota}`, opcoes);
        dados = await resposta.json();
    } catch (erro) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }

    if (typeof dados === 'string') {
        if (/foreign key/i.test(dados)) throw new Error('Não é possível excluir: o item está em uso.');
        throw new Error(dados);
    }
    if (dados && dados.sucesso === false) throw new Error(dados.erro || 'Erro desconhecido.');

    return dados;
}


/* ==========================================================
   3. CATEGORIAS
   Modelo no front: { id, nome }
   ========================================================== */
async function apiBuscarCategorias() {
    const linhas = await chamarApi('categorias');
    return linhas.map(linha => ({ id: linha.idCategoria, nome: linha.nomeCategoria }));
}

function apiAdicionarCategoria(nome) {
    return chamarApi('adicionarCategoria', 'POST', { nomeCategoria: nome });
}

function apiEditarCategoria(id, nome) {
    return chamarApi('editarCategoria', 'PUT', { idCategoria: id, nomeCategoria: nome });
}

function apiRemoverCategoria(id) {
    return chamarApi('removerCategoria', 'DELETE', { idCategoria: id });
}


/* ==========================================================
   4. PRODUTOS
   Modelo no front:
   { id, nome, descricao, preco, idCategoria, idDisponibilidade, disponivel }
   ========================================================== */
async function apiBuscarProdutos() {
    const linhas = await chamarApi('produtos');
    return linhas.map(linha => ({
        id: linha.idProduto,
        nome: linha.nomeProduto,
        descricao: linha.descricaoProduto,
        preco: Number(linha.precoProduto),          // o MySQL devolve DECIMAL como texto
        idCategoria: linha.idCategoria,
        idDisponibilidade: linha.idDisponibilidade,
        disponivel: linha.idDisponibilidade === ID_DISPONIVEL
    }));
}

function apiAdicionarProduto(produto) {
    return chamarApi('adicionarProduto', 'POST', {
        nomeProduto: produto.nome,
        descricaoProduto: produto.descricao,
        precoProduto: produto.preco,
        idCategoria: produto.idCategoria,
        idDisponibilidade: produto.idDisponibilidade
    });
}

// ATENÇÃO: a rota PUT /api/editarProduto do backend precisa repassar
// idCategoria e idDisponibilidade (veja ajustes necessários no backend).
function apiEditarProduto(produto) {
    return chamarApi('editarProduto', 'PUT', {
        idProduto: produto.id,
        nomeProduto: produto.nome,
        descricaoProduto: produto.descricao,
        precoProduto: produto.preco,
        idCategoria: produto.idCategoria,
        idDisponibilidade: produto.idDisponibilidade
    });
}

function apiRemoverProduto(id) {
    return chamarApi('removerProduto', 'DELETE', { idProduto: id });
}


/* ==========================================================
   5. PEDIDOS
   Modelo no front:
   { id, data, cliente, registro, itens: [{ idProduto, quantidade, precoUnitario }] }
   ========================================================== */

// Junta tbPedido + tbCliente + tbPedidoProduto (RF17)
async function apiBuscarPedidos() {
    const [pedidos, clientes, pedidosProdutos] = await Promise.all([
        chamarApi('pedidos'),
        chamarApi('clientes'),
        chamarApi('pedidoProdutos')
    ]);

    return pedidos.map(pedido => {
        const cliente = clientes.find(c => c.idCliente === pedido.idCliente) || {};
        return {
            id: pedido.idPedido,
            data: new Date(pedido.dataElaboracao).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            }),
            cliente: cliente.nomeCliente || '—',
            registro: cliente.registroCliente || '—',
            itens: pedidosProdutos
                .filter(item => item.idPedido === pedido.idPedido)
                .map(item => ({
                    idProduto: item.idProduto,
                    quantidade: item.Quantidade,           // atenção: "Quantidade" com Q maiúsculo no banco
                    precoUnitario: Number(item.precoUnitario)
                }))
        };
    });
}

/* Registra um pedido completo (RF15, RF16).
   O backend não devolve os ids criados, então o fluxo é:
   1. procura o cliente pelo registro; se não existir, cadastra
   2. cria o pedido e descobre o id dele (último pedido do cliente)
   3. adiciona cada produto do carrinho ao pedido
   Devolve o id do pedido criado. */
async function apiRegistrarPedido(nomeCliente, registroCliente, carrinho) {
    const buscarCliente = async () => {
        const clientes = await chamarApi('clientes');
        return clientes.find(c => c.registroCliente === registroCliente);
    };

    let cliente = await buscarCliente();
    if (!cliente) {
        await chamarApi('adicionarCliente', 'POST', { nomeCliente, registroCliente });
        cliente = await buscarCliente();
    }

    await chamarApi('adicionarPedido', 'POST', { idCliente: cliente.idCliente });
    const pedidos = await chamarApi('pedidos');
    const idPedido = Math.max(
        ...pedidos.filter(p => p.idCliente === cliente.idCliente).map(p => p.idPedido)
    );

    for (const [idProduto, quantidade] of Object.entries(carrinho)) {
        await chamarApi('adicionarPedidoProduto', 'POST', {
            idPedido,
            idProduto: Number(idProduto),
            quantidade
        });
    }

    return idPedido;
}


/* ==========================================================
   6. LOGIN DO ADMINISTRADOR (RF09)
   ATENÇÃO: o backend ainda não tem a rota POST /api/login
   (veja ajustes necessários no backend).
   ========================================================== */
function apiLogin(registro, senha) {
    return chamarApi('login', 'POST', { registroAdm: registro, senhaAdm: senha });
}
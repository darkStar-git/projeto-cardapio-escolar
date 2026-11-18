import express from 'express'
import cors from 'cors'

// GETS
import { buscarCategorias } from './DAO/Categorias/buscarCategoria.js'
import { buscarClientes } from './DAO/Cliente/buscarCliente.js'
import { buscarDisponibilidades } from './DAO/Disponibilidade/buscarDisponibilidade.js'
import { buscarPedidos } from './DAO/Pedido/buscarPedido.js'
import { buscarPedidosProdutos } from './DAO/pedidoProduto/buscarPedidoProduto.js'
import { buscarProdutos } from './DAO/Produto/buscarProduto.js'
import { buscarAdmins } from './DAO/Admin/buscarAdmin.js'

// POSTS
import { adicionarCategoria } from './DAO/Categorias/adicionarCategoria.js'
import { adicionarCliente } from './DAO/Cliente/adicionarCliente.js'
import { adicionarDisponibilidade } from './DAO/Disponibilidade/adicionarDisponibilidade.js'
import { adicionarPedido } from './DAO/Pedido/adicionarPedido.js'
import { adicionarPedidoProduto } from './DAO/pedidoProduto/adicionarPedidoProduto.js'
import { adicionarProduto } from './DAO/Produto/adicionarProduto.js'
import { adicionarAdmin } from './DAO/Admin/adicionarAdmin.js'

// UPDATES
import { editarCategoria } from './DAO/Categorias/editarCategoria.js'
import { editarCliente } from './DAO/Cliente/editarCliente.js'
import { editarDisponibilidade } from './DAO/Disponibilidade/editarDisponibilidade.js'
import { editarPedido } from './DAO/Pedido/editarPedido.js'
import { editarPedidoProduto } from './DAO/pedidoProduto/editarPedidoProduto.js'
import { editarProduto } from './DAO/Produto/editarProduto.js'
import { editarDisponibilidadeProduto } from './DAO/Produto/editarDisponibilidadeProduto.js'
import { editarEstoque } from './DAO/Produto/editarEstoque.js'
import { editarAdmin } from './DAO/Admin/editarAdmin.js'

// DELETES
import { removerCategoria } from './DAO/Categorias/removerCategoria.js'
import { removerCliente } from './DAO/Cliente/removerCliente.js'
import { removerDisponibilidade } from './DAO/Disponibilidade/removerDisponibilidade.js'
import { removerPedido } from './DAO/Pedido/removerPedido.js'
import { removerPedidoProduto } from './DAO/pedidoProduto/removerPedidoProduto.js'
import { removerProduto } from './DAO/Produto/removerProduto.js'
import { removerAdmin } from './DAO/Admin/removerAdmin.js'

// LOGIN
import { loginAdmin } from './DAO/Login/login.js'
import { existeAdmin, criarPrimeiroAdmin } from './DAO/Login/primeiroAdmin.js'

const app = express()

// Middleware para o Express ler o corpo (body) das requisições em JSON
app.use(cors())
app.use(express.json())

// Rota Base
app.get('/', (req, res) => {
    res.json({ mensagem: 'Congratulations! API is running!' })
})

// GETS
app.get('/api/categorias', async (req, res) => {
    let categorias = await buscarCategorias();
    res.json(categorias);
})

app.get('/api/clientes', async (req, res) => {
    let clientes = await buscarClientes();
    res.json(clientes);
})

app.get('/api/produtos', async (req, res) => {
    let produtos = await buscarProdutos();
    res.json(produtos);
})

app.get('/api/disponibilidades', async (req, res) => {
    let disponibilidades = await buscarDisponibilidades();
    res.json(disponibilidades);
})

app.get('/api/pedidos', async (req, res) => {
    let pedido = await buscarPedidos();
    res.json(pedido);
})

app.get('/api/pedidoProdutos', async (req, res) => {
    let pedidoProdutos = await buscarPedidosProdutos();
    res.json(pedidoProdutos);
})

app.get('/api/admin', async (req, res) => {
    let admins = await buscarAdmins();
    res.json(admins);
})

// POSTS
app.post('/api/adicionarCategoria', async (req, res) => {
    let results = await adicionarCategoria(req.body);
    res.json(results);
})

app.post('/api/adicionarCliente', async (req, res) => {
    let results = await adicionarCliente(req.body);
    res.json(results);
})

app.post('/api/adicionarDisponibilidade', async (req, res) => {
    let { nomeDisponibilidade } = req.body;
    let infos = [nomeDisponibilidade]
    let results = await adicionarDisponibilidade(infos)
    res.json(results);
})

app.post('/api/adicionarPedido', async (req, res) => {

    let results = await adicionarPedido(req.body);
    res.json(results);
})

app.post('/api/adicionarPedidoProduto', async (req, res) => {

    let results = await adicionarPedidoProduto(req.body);
    res.json(results);
})

app.post('/api/adicionarProduto', async (req, res) => {
    // Precisa mandar: nomeProduto, descricaoProduto, precoProduto, idCategoria, idDisponibilidade
    let results = await adicionarProduto(req.body);
    res.json(results);
})

app.post('/api/adicionarAdmin', async (req, res) => {
    let results = await adicionarAdmin(req.body);
    res.json(results);
})
// PRIMEIRO ACESSO (sign in inicial)
// Só funciona enquanto NÃO existe nenhum administrador. Depois disso responde 409.
app.get('/api/primeiroAcesso', async (req, res) => {
    try {
        res.json({ sucesso: true, precisaCriarAdmin: !(await existeAdmin()) })
    } catch (err) {
        console.error('Erro ao verificar primeiro acesso:', err.message)
        res.status(500).json({ sucesso: false, erro: 'Erro interno ao verificar o sistema.' })
    }
})

// Recebe { nomeAdm, registroAdm, senhaAdm }, cria o primeiro admin e devolve { sucesso: true, admin }
app.post('/api/primeiroAcesso', async (req, res) => {
    const { nomeAdm, registroAdm, senhaAdm } = req.body ?? {}

    const nome = String(nomeAdm ?? '').trim()
    const registro = String(registroAdm ?? '').trim()
    const senha = String(senhaAdm ?? '')

    // limites das colunas de tbAdmin: nomeAdm VARCHAR(30), registroAdm VARCHAR(10)
    if (!nome || nome.length > 30) {
        return res.status(400).json({ sucesso: false, erro: 'Informe o nome (até 30 caracteres).' })
    }
    if (!registro || registro.length > 10) {
        return res.status(400).json({ sucesso: false, erro: 'Informe o registro (até 10 caracteres).' })
    }
    if (senha.length < 6 || senha.length > 72) {
        return res.status(400).json({ sucesso: false, erro: 'A senha deve ter de 6 a 72 caracteres.' })
    }

    const resultado = await criarPrimeiroAdmin(nome, registro, senha)

    if (!resultado.sucesso) {
        const jaExiste = /já existe/i.test(resultado.erro)
        return res.status(jaExiste ? 409 : 500).json(resultado)
    }
    res.status(201).json(resultado)
})

// LOGIN (admin)
// Recebe { registroAdm, senhaAdm } e devolve { sucesso: true, admin: { idAdmin, nomeAdm, registroAdm } }.
// tbCliente não possui senha, então o cliente não faz login: ele só se identifica ao fazer o pedido.
app.post('/api/login', async (req, res) => {
    const { registroAdm, senhaAdm } = req.body ?? {}

    const registro = String(registroAdm ?? '').trim()
    const senha = String(senhaAdm ?? '')

    // registroAdm é VARCHAR(10) no banco
    if (!registro || registro.length > 10 || !senha) {
        return res.status(400).json({ sucesso: false, erro: 'Informe o registro (até 10 caracteres) e a senha.' })
    }

    try {
        const admin = await loginAdmin(registro, senha)

        if (!admin) {
            // Mensagem genérica: não revela se o registro existe
            return res.status(401).json({ sucesso: false, erro: 'Registro ou senha inválidos.' })
        }

        res.json({ sucesso: true, admin })
    } catch (err) {
        console.error('Erro no login:', err.message)
        res.status(500).json({ sucesso: false, erro: 'Erro interno ao realizar login.' })
    }
})

// PUTS
app.put('/api/editarCategoria', async (req, res) => {
    let { idCategoria, nomeCategoria, } = req.body;
    res.json(await editarCategoria(idCategoria, nomeCategoria));
})

app.put('/api/editarCliente', async (req, res) => {
    let { idCliente, nomeCliente, registroCliente } = req.body;
    res.json(await editarCliente(idCliente, nomeCliente, registroCliente));
})

app.put('/api/editarDisponibilidade', async (req, res) => {
    let { idDisponibilidade, nomeDisponibilidade } = req.body;
    res.json(await editarDisponibilidade(idDisponibilidade, nomeDisponibilidade));
})

app.put('/api/editarPedido', async (req, res) => {
    let { idPedido, dataElaboracao, idCliente } = req.body;
    res.json(await editarPedido(idPedido, dataElaboracao, idCliente));
})

app.put('/api/editarPedidoProduto', async (req, res) => {
    let { idPedido, idProduto, quantidade, precoUnitario } = req.body;
    res.json(await editarPedidoProduto(idPedido, idProduto, quantidade, precoUnitario));
})

app.put('/api/editarProduto', async (req, res) => {
    let { idProduto, nomeProduto, descricaoProduto, precoProduto, idCategoria, idDisponibilidade } = req.body;

    // Sem esses dois campos o UPDATE gravaria NULL na categoria e na disponibilidade
    if (idCategoria == null || idDisponibilidade == null) {
        return res.status(400).json({ sucesso: false, erro: 'Informe idCategoria e idDisponibilidade.' });
    }
    res.json(await editarProduto(idProduto, nomeProduto, descricaoProduto, precoProduto, idCategoria, idDisponibilidade));
})

// Chave de disponibilidade da tela admin: altera só a disponibilidade
app.put('/api/editarDisponibilidadeProduto', async (req, res) => {
    let { idProduto, idDisponibilidade } = req.body ?? {};

    if (!Number.isInteger(Number(idProduto)) || !Number.isInteger(Number(idDisponibilidade))) {
        return res.status(400).json({ sucesso: false, erro: 'Informe idProduto e idDisponibilidade.' });
    }
    res.json(await editarDisponibilidadeProduto(Number(idProduto), Number(idDisponibilidade)));
})

// Estoque do produto (valor absoluto: 0 a 99999)
app.put('/api/editarEstoque', async (req, res) => {
    let { idProduto, estoqueProduto } = req.body ?? {};
    const estoque = Number(estoqueProduto);

    if (!Number.isInteger(Number(idProduto))) {
        return res.status(400).json({ sucesso: false, erro: 'Informe o idProduto.' });
    }
    if (estoqueProduto === '' || estoqueProduto == null || !Number.isInteger(estoque) || estoque < 0 || estoque > 99999) {
        return res.status(400).json({ sucesso: false, erro: 'O estoque deve ser um número inteiro de 0 a 99999.' });
    }
    res.json(await editarEstoque(Number(idProduto), estoque));
})

app.put('/api/editarAdmin', async (req, res) => {
    let { idAdmin, nomeAdmin, registroAdm, senhaAdm } = req.body;
    res.json(await editarAdmin(idAdmin, nomeAdmin, registroAdm, senhaAdm));
})

// DELETES
app.delete('/api/removerCategoria', async (req, res) => {
    let { idCategoria } = req.body;
    res.json(await removerCategoria(idCategoria));
})

app.delete('/api/removerDisponibilidade', async (req, res) => {
    let { idDisponibilidade } = req.body;
    res.json(await removerDisponibilidade(idDisponibilidade));
})

app.delete('/api/removerCliente', async (req, res) => {
    let { idCliente } = req.body;
    res.json(await removerCliente(idCliente));
})

app.delete('/api/removerPedido', async (req, res) => {
    let { idPedido } = req.body;
    res.json(await removerPedido(idPedido));
})

app.delete('/api/removerProduto', async (req, res) => {
    let { idProduto } = req.body;
    res.json(await removerProduto(idProduto));
})

app.delete('/api/removerPedidoProduto', async (req, res) => {
    let { idPedidoProduto } = req.body;
    res.json(await removerPedidoProduto(idPedidoProduto));
})

app.delete('/api/removerAdmin', async (req, res) => {
    let { idAdmin } = req.body;
    res.json(await removerAdmin(idAdmin));
})

// Inicialização do Servidor
app.listen(3000, () => {
    console.log('🚀 Server is running on http://localhost:3000')
})

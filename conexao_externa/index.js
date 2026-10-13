import express from 'express'

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
import { editarAdmin } from './DAO/Admin/editarAdmin.js'

// DELETES
import { removerCategoria } from './DAO/Categorias/removerCategoria.js'
import { removerCliente } from './DAO/Cliente/removerCliente.js'
import { removerDisponibilidade } from './DAO/Disponibilidade/removerDisponibilidade.js'
import { removerPedido } from './DAO/Pedido/removerPedido.js'
import { removerPedidoProduto } from './DAO/pedidoProduto/removerPedidoProduto.js'
import { removerProduto } from './DAO/Produto/removerProduto.js'
import { removerAdmin } from './DAO/Admin/removerAdmin.js'

const app = express()

// Middleware para o Express ler o corpo (body) das requisições em JSON
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
    let { nomeCategoria, descricaoCategoria } = req.body;
    let infos = [nomeCategoria]
    let results = await adicionarCategoria(infos)
    res.json(results);
})

app.post('/api/adicionarCliente', async (req, res) => {
    let { nomeCliente, registroCliente } = req.body;
    let infos = [nomeCliente, registroCliente]
    let results = await adicionarCliente(infos)
    res.json(results);
})

app.post('/api/adicionarDisponibilidade', async (req, res) => {
    let { nomeDisponibilidade } = req.body;
    let infos = [nomeDisponibilidade]
    let results = await adicionarDisponibilidade(infos)
    res.json(results);
})

app.post('/api/adicionarPedido', async (req, res) => {
    let { dataElaboracao, idCliente } = req.body; // Corrigido para idCliente
    let infos = [dataElaboracao, idCliente]
    let results = await adicionarPedido(infos)
    res.json(results);
}) 

app.post('/api/adicionarPedidoProduto', async (req, res) => {
    let { idPedido, idProduto, quantidade, precoUnitario } = req.body;
    let infos = [idPedido, idProduto, quantidade, precoUnitario]
    let results = await adicionarPedidoProduto(infos)
    res.json(results);
})

app.post('/api/adicionarProduto', async (req, res) => {
    let { nomeProduto, descricaoProduto, precoProduto } = req.body;
    let infos = [nomeProduto, descricaoProduto, precoProduto]
    let results = await adicionarProduto(infos)
    res.json(results);
})

app.post('/api/adicionarAdmin', async (req, res) => {
    let { nomeAdmin, registroAdm, senhaAdm } = req.body;
    let infos = [nomeAdmin, registroAdm, senhaAdm]
    let results = await adicionarAdmin(infos)
    res.json(results);
})

// PUTS
app.put('/api/editarCategoria', async (req, res) => {
    let { idCategoria, nomeCategoria,} = req.body;
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
    let { idProduto, nomeProduto, descricaoProduto, precoProduto } = req.body;
    res.json(await editarProduto(idProduto, nomeProduto, descricaoProduto, precoProduto));
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
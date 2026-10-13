import { conexao } from '../conexao.js'

export async function editarPedidoProduto( idPedido, idProduto, quantidade, precoUnitario) {

    const sql = `UPDATE tbPedidoProduto SET idPedido = ?, idProduto = ?, quantidade = ?, precoUnitario = ? WHERE idPedidoProduto = ?`
    const conn = await conexao()
  
    try {
        const [results] = await conn.query(sql, [idPedido, idProduto, quantidade, precoUnitario]);

        await conn.end()
        return results
    } catch (err) {
        await conn.end()
        return err.message
    }
} 


import { conexao } from '../conexao.js'

export async function editarProduto(idProduto, nomeProduto, descricaoProduto, precoProduto, idCategoria, idDisponibilidade) {

    const sql = `UPDATE tbProduto SET nomeProduto = ?, descricaoProduto = ?, precoProduto = ?, idCategoria = ?, idDisponibilidade = ? WHERE idProduto = ?`
    const conn = await conexao()

    try {
        const [results] = await conn.query(sql, [nomeProduto, descricaoProduto, precoProduto, idCategoria, idDisponibilidade, idProduto]);

        await conn.end()
        return results
    } catch (err) {
        await conn.end()
        return err.message
    }
}

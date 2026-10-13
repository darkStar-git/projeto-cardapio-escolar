import { conexao } from '../conexao.js'

export async function editarPedido(idPedido, dataElaboracao, idCliente) {

    const sql = `UPDATE tbPedido SET dataElaboracao = ?, idCliente = ? WHERE idPedido = ?`
    const conn = await conexao()

    try {
        const [results] = await conn.query(sql, [idCliente,  dataElaboracao, idPedido]);

        await conn.end()
        return results
    } catch (err) {
        await conn.end()
        return err.message
    }
}


import { conexao } from '../conexao.js'

export async function editarCliente(idCliente, nomeCliente, registroCliente) {

    const sql = `UPDATE tbCliente SET nomeCliente = ?, registroCliente = ? WHERE idCliente = ?`
    const conn = await conexao()

    try {
        const [results] = await conn.query(sql, [nomeCliente, registroCliente, idCliente]);

        await conn.end()
        return results
    } catch (err) {
        await conn.end()
        return err.message
    }
}


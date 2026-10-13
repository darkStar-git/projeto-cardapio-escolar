import { conexao } from '../conexao.js'

export async function editarAdmin(idAdmin, nomeAdmin, registroAdm, senhaAdm) {

    const sql = `UPDATE tbAdmin SET nomeAdmin = ?, registroAdm = ?, senhaAdm = ? WHERE idAdmin = ?`
    const conn = await conexao()

    try {
        const [results] = await conn.query(sql, [nomeAdmin, registroAdm, senhaAdm, idAdmin]);

        await conn.end()
        return results
    } catch (err) {
        await conn.end()
        return err.message
    }
}


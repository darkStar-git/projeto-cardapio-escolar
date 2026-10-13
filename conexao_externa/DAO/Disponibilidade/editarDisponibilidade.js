import { conexao } from '../conexao.js'

export async function editarDisponibilidade(idDisponibilidade, nomeDisponibilidade) {

    const sql = `UPDATE tbDisponibilidade SET nomeDisponibilidade = ? WHERE idDisponibilidade = ?`
    const conn = await conexao()

    try {
        const [results] = await conn.query(sql, [nomeDisponibilidade, idDisponibilidade]);

        await conn.end()
        return results
    } catch (err) {
        await conn.end()
        return err.message
    }
}

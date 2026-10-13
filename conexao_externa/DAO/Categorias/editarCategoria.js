import { conexao } from '../conexao.js'

export async function editarCategoria(idCategoria, nomeCategoria) {

    const sql = `UPDATE tbCategoria SET nomeCategoria = ? WHERE idCategoria = ?`
    const conn = await conexao()

    try {
        const [results] = await conn.query(sql, [ nomeCategoria, idCategoria]);

        await conn.end()
        return results
    } catch (err) {
        await conn.end()
        return err.message
    }
}


import { conexao } from '../conexao.js'

export async function adicionarCategoria(infos) {
  const sql = `CALL sp_categoriaNova(?)`
  const conn = await conexao()

  try {
    const [results] = await conn.query(sql, [infos.nomeCategoria]);
    await conn.end()
    return { sucesso: true, dados: results }
  } catch (err) {
    await conn.end()
    return { sucesso: false, erro: err.sqlMessage || err.message }
  }
}
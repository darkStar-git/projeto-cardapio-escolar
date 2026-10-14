import { conexao } from '../conexao.js'

export async function adicionarAdmin(infos) {
  const sql = `CALL sp_admNovo(?, ?, ?)`
  const conn = await conexao()

  try {
    const [results] = await conn.query(sql, [infos.nomeAdmin, infos.registroAdm, infos.senhaAdm]);
    await conn.end()
    return { sucesso: true, dados: results }
  } catch (err) {
    await conn.end()
    return { sucesso: false, erro: err.sqlMessage || err.message }
  }
}
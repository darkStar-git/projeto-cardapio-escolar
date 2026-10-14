import { conexao } from '../conexao.js'

export async function adicionarCliente(infos) {
  const sql = `CALL sp_clienteNovo(?, ?)`
  const conn = await conexao()

  try {
    const [results] = await conn.query(sql, [infos.nomeCliente, infos.registroCliente]);
    await conn.end()
    return { sucesso: true, dados: results }
  } catch (err) {
    await conn.end()
    return { sucesso: false, erro: err.sqlMessage || err.message }
  }
}
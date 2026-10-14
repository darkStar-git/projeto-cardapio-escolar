import { conexao } from '../conexao.js'

export async function adicionarPedido(infos) {
  const sql = `CALL sp_PedidoNovo(?)`
  const conn = await conexao()

  try {
    const [results] = await conn.query(sql, [infos.idCliente]);
    await conn.end()
    return { sucesso: true, dados: results }
  } catch (err) {
    await conn.end()
    return { sucesso: false, erro: err.sqlMessage || err.message }
  }
}
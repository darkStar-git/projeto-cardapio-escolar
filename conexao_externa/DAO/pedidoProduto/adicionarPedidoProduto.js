import { conexao } from '../conexao.js'

export async function adicionarPedidoProduto(infos) {
  const sql = `CALL sp_PedidoAdicionarProduto(?, ?, ?)`
  const conn = await conexao()

  try {
    const [results] = await conn.query(sql, [infos.idPedido, infos.idProduto, infos.quantidade]);
    await conn.end()
    return { sucesso: true, dados: results }
  } catch (err) {
    await conn.end()
    return { sucesso: false, erro: err.sqlMessage || err.message }
  }
}
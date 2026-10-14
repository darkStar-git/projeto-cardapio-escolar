import { conexao } from '../conexao.js'

async function adicionarProduto(infos) {
  const sql = `CALL sp_ProdutoNovo(?, ?, ?, ?, ?)`
  const conn = await conexao()

  try {
    const [results] = await conn.query(sql, [
      infos.nomeProduto,
      infos.descricaoProduto,
      infos.precoProduto,
      infos.idCategoria,
      infos.idDisponibilidade
    ]);
    await conn.end()
    return { sucesso: true, dados: results }
  } catch (err) {
    await conn.end()
    return { sucesso: false, erro: err.sqlMessage || err.message }
  }
}

export { adicionarProduto }
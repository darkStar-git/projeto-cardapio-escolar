import { conexao } from '../conexao.js'

// Define o estoque do produto (valor absoluto, não incremento).
export async function editarEstoque(idProduto, estoqueProduto) {
  const sql = `UPDATE tbProduto SET estoqueProduto = ? WHERE idProduto = ?`
  const conn = await conexao()

  try {
    const [results] = await conn.query(sql, [estoqueProduto, idProduto])
    if (results.affectedRows === 0) {
      return { sucesso: false, erro: 'Produto não encontrado.' }
    }
    return { sucesso: true, dados: results }
  } catch (err) {
    return { sucesso: false, erro: err.sqlMessage || err.message }
  } finally {
    await conn.end()
  }
}

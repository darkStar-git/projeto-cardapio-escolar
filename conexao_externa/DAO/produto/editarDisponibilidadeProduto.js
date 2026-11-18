import { conexao } from '../conexao.js'

// Altera SOMENTE a disponibilidade do produto (chave da tela admin).
// Não mexe em nome, preço, categoria nem estoque.
export async function editarDisponibilidadeProduto(idProduto, idDisponibilidade) {
  const sql = `UPDATE tbProduto SET idDisponibilidade = ? WHERE idProduto = ?`
  const conn = await conexao()

  try {
    const [results] = await conn.query(sql, [idDisponibilidade, idProduto])
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

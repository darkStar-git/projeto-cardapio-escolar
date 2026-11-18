import { conexao } from '../conexao.js'
import { gerarHashSenha } from './senha.js'

// true se já existe pelo menos um administrador cadastrado
export async function existeAdmin() {
  const conn = await conexao()
  try {
    const [rows] = await conn.query('SELECT 1 FROM tbAdmin LIMIT 1')
    return rows.length > 0
  } finally {
    await conn.end()
  }
}

// Cria o PRIMEIRO administrador. A procedure sp_admPrimeiro só insere se tbAdmin estiver
// vazia e usa uma trava (GET_LOCK), então requisições simultâneas não criam dois admins.
export async function criarPrimeiroAdmin(nomeAdm, registroAdm, senhaAdm) {
  const conn = await conexao()
  try {
    const senhaHash = await gerarHashSenha(senhaAdm)
    await conn.query('CALL sp_admPrimeiro(?, ?, ?)', [nomeAdm, registroAdm, senhaHash])

    const [rows] = await conn.query(
      'SELECT idAdmin, nomeAdm, registroAdm FROM tbAdmin WHERE registroAdm = ?', [registroAdm])
    return { sucesso: true, admin: rows[0] }
  } catch (err) {
    return { sucesso: false, erro: err.sqlMessage || err.message }
  } finally {
    await conn.end()
  }
}

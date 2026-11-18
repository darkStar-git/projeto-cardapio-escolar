import { conexao } from '../conexao.js'
import { senhaConfere } from './senha.js'

// tbAdmin possui registroAdm (UNIQUE) + senhaAdm, então o login usa os dois.
// Retorna os dados públicos do admin (nunca a senha), ou null se não conferir.
// Erros de banco são lançados para a rota tratar como 500.
export async function loginAdmin(registroAdm, senhaAdm) {
  const sql = `SELECT idAdmin, nomeAdm, registroAdm, senhaAdm
               FROM tbAdmin WHERE registroAdm = ?`
  const conn = await conexao()

  try {
    const [rows] = await conn.query(sql, [registroAdm])
    const admin = rows[0]

    if (!admin || !(await senhaConfere(senhaAdm, admin.senhaAdm))) return null

    return { idAdmin: admin.idAdmin, nomeAdm: admin.nomeAdm, registroAdm: admin.registroAdm }
  } finally {
    await conn.end()
  }
}

import {conexao} from '../conexao.js'

export async function removerDisponibilidade(idDisponibilidade){

const sql = `DELETE FROM tbDisponibilidade WHERE idDisponibilidade = ?`
const conn = await conexao()

try {
const [results] = await conn.query(sql,[idDisponibilidade]);

await conn.end()
return results
} catch (err) {
await conn.end()
return err.message
}
}


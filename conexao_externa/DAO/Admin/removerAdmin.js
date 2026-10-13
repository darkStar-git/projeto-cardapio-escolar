import {conexao} from '../conexao.js'

export async function removerAdmin(codigo){

const sql = `DELETE FROM tbAdmin WHERE idAdmin = ?`
const conn = await conexao()

try {
const [results] = await conn.query(sql,[codigo]);

await conn.end()
return results
} catch (err) {
await conn.end()
return err.message
}
}


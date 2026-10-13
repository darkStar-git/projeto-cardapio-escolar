import {conexao} from '../conexao.js'

export async function removerCategoria(codigo){

const sql = `DELETE FROM tbCategoria WHERE idCategoria = ?`
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


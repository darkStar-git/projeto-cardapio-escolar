import {conexao} from '../conexao.js'

export async function removerCliente(idCliente){

const sql = `DELETE FROM tbCliente WHERE idCliente = ?`
const conn = await conexao()

try {
const [results] = await conn.query(sql,[idCliente]);

await conn.end()
return results
} catch (err) {
await conn.end()
return err.message
}
}


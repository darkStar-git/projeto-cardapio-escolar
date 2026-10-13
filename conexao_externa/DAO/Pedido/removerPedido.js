import {conexao} from '../conexao.js'

 export async function removerPedido(idPedido){

const sql = `DELETE FROM tbPedido WHERE idPedido = ?`
const conn = await conexao()

try {
const [results] = await conn.query(sql,[idPedido]);

await conn.end()
return results
} catch (err) {
await conn.end()
return err.message
}
}


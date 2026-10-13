import {conexao} from '../conexao.js'

async function removerProduto(idProduto){
    
const sql = `DELETE FROM tbProduto WHERE idProduto = ?`
const conn = await conexao()

try {
const [results] = await conn.query(sql,[idProduto]);

await conn.end()
return results
} catch (err) {
await conn.end()
return err.message
}
}

export {removerProduto}
import {conexao} from '../conexao.js'

export async function adicionarPedido(infos){
    const data = [infos]
    const sql = `INSERT INTO tbPedido (dataElaboracao, idCliente) VALUES ?`
    const conn = await conexao()
    
    try {
        // Executar a consulta
        const [results] = await conn.query(sql,[data]);

        await conn.end()
        return results
      } catch (err) {
        return err.message
      }
}


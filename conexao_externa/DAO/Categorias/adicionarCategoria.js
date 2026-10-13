import {conexao} from '../conexao.js'

export async function adicionarCategoria(infos){
    const data = [infos]
    const sql = `INSERT INTO tbCategoria (nomeCategoria) VALUES ?`
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


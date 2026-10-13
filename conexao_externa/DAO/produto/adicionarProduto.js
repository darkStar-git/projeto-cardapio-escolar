import {conexao} from '../conexao.js'

async function adicionarProduto(infos){
    const data = [infos]
    const sql = `INSERT INTO tbProduto (nomeProduto, descricaoProduto, precoProduto, idCategoria, idDisponibilidade) VALUES ?`
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

export {adicionarProduto}
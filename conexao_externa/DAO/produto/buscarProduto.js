import {conexao} from '../conexao.js'

export async function buscarProdutos(){
    console.log('DAO de PRODUTO')
      const sql = `SELECT * FROM tbProduto`
      
      const conn = await conexao()
      try {
          // Executar a consulta
          const [rows, fields] = await conn.query(sql);
          await conn.end()
          return rows
        } catch (err) {
          return err.message
        }
  }
  
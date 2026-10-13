import {conexao} from '../conexao.js'

export async function buscarCategorias(){
    console.log('DAO de CATEGORIA')
      const sql = `SELECT * FROM tbCategoria`
      
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
  
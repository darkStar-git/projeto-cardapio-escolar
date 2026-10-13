import {conexao} from '../conexao.js'

export async function buscarDisponibilidades(){
    console.log('DAO de DISPONIBILIDADE')
      const sql = `SELECT * FROM tbDisponibilidade`
      
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
  
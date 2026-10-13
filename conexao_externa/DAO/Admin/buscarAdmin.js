import {conexao} from '../conexao.js'

export async function buscarAdmins(){
    console.log('DAO de ADMIN')
      const sql = `SELECT * FROM tbAdmin`
      
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
  
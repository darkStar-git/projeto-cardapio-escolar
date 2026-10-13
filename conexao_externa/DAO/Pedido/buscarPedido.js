import {conexao} from '../conexao.js'

export async function buscarPedidos(){
    console.log('DAO de PEDIDO')
      const sql = `SELECT * FROM tbPedido`
      
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
  
import {conexao} from '../conexao.js'

export async function buscarPedidosProdutos(){
    console.log('DAO de PEDIDO PRODUTO')
      const sql = `SELECT * FROM tbPedidoProduto`
      
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
  
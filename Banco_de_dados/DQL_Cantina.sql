USE db_Cantina;

#Ver produtos que vendem
CREATE OR REPLACE VIEW vw_Catalogo AS
	SELECT * FROM tbProduto;
    
#Ver produtos em prdem Crescente
CREATE OR REPLACE VIEW vw_CatalogoMenorMaior AS
	SELECT * FROM tbProduto 
    ORDER BY precoProduto ASC;

#Ver Produtos em ordem decrescente
CREATE OR REPLACE VIEW vw_CatalogoMaiorMenor AS
	SELECT * FROM tbProduto
    ORDER BY precoProduto DESC;
    
#Ver histórico de pedidos
CREATE OR REPLACE VIEW vw_PedidosFeitos AS
	SELECT tbPedido.idPedido AS 'Número do pedido', tbPedido.dataElaboracao AS 'Data do pedido', tbCliente.nomeCliente AS 'Nome do cliente' 
    FROM tbPedido
    LEFT JOIN tbCliente
    ON tbPedido.idCliente = tbCliente.idCliente;
    

SELECT * FROM vw_Catalogo;
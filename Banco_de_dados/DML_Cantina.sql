USE db_Cantina;

-- Limpa e insere dados iniciais
INSERT INTO tbDisponibilidade (nomeDisponibilidade) VALUES 
('Disponivel'),
('Indisponivel');

INSERT INTO tbCategoria (nomeCategoria) VALUES 
('Lanches'),
('Salgados'),
('Bebidas');

DELIMITER $$

-- 1. Categoria Nova
DROP PROCEDURE IF EXISTS sp_categoriaNova$$
CREATE PROCEDURE sp_categoriaNova(
    IN spNomeCategoria VARCHAR(20)
)
BEGIN
    IF EXISTS (
        SELECT 1 FROM tbCategoria WHERE nomeCategoria = spNomeCategoria
    ) THEN 
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Categoria já cadastrada, insira outra.';
    ELSE 
        INSERT INTO tbCategoria (nomeCategoria) VALUES (spNomeCategoria);
    END IF;
END$$

-- 2. Inserindo adm novo
DROP PROCEDURE IF EXISTS sp_admNovo$$
CREATE PROCEDURE sp_admNovo(
    IN spNomeAdm VARCHAR(30),
    IN spRegistroAdm VARCHAR(10),
    IN spSenhaAdm VARCHAR(255)
) 
BEGIN
    IF EXISTS (
        SELECT 1 FROM tbAdmin WHERE registroAdm = spRegistroAdm
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Registro já cadastrado, insira outro.';
    ELSE
        INSERT INTO tbAdmin (nomeAdm, registroAdm, senhaAdm) VALUES 
        (spNomeAdm, spRegistroAdm, spSenhaAdm);
    END IF;
END$$

-- 3. Inserindo novo cliente
DROP PROCEDURE IF EXISTS sp_clienteNovo$$
CREATE PROCEDURE sp_clienteNovo(
    IN spNomeCliente VARCHAR(30),
    IN spRegistroCliente VARCHAR(10)
)
BEGIN
    IF EXISTS (
        SELECT 1 FROM tbCliente WHERE registroCliente = spRegistroCliente
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Registro já cadastrado, insira outro.';
    ELSE
        INSERT INTO tbCliente (nomeCliente, registroCliente) VALUES 
        (spNomeCliente, spRegistroCliente);
    END IF;
END$$

-- 4. Inserindo produto
DROP PROCEDURE IF EXISTS sp_ProdutoNovo$$
CREATE PROCEDURE sp_ProdutoNovo(
    IN spNomeProduto        VARCHAR(40),
    IN spDescricaoProduto   VARCHAR(120),
    IN spPrecoProduto       DECIMAL(5, 2),
    IN spIdCategoria        INT,
    IN spIdDisponibilidade INT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM tbCategoria WHERE idCategoria = spIdCategoria
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Categoria não encontrada.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM tbDisponibilidade WHERE idDisponibilidade = spIdDisponibilidade
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Disponibilidade não encontrada.';
    END IF;

    INSERT INTO tbProduto (nomeProduto, descricaoProduto, precoProduto, idCategoria, idDisponibilidade) VALUES 
    (spNomeProduto, spDescricaoProduto, spPrecoProduto, spIdCategoria, spIdDisponibilidade);
END$$


-- SALGADOS (categoria 2)
CALL sp_ProdutoNovo('Bauruzinho', 'Salgado assado de massa fofinha recheado com presunto, queijo muçarela, tomate e orégano.', 7.00, 2, 1);
CALL sp_ProdutoNovo('Bolinho de Carne', 'Bolinho frito recheado com carne.', 8.00, 2, 1);
CALL sp_ProdutoNovo('Coxinha de Frango', 'Coxinha frita recheada com frango.', 8.00, 2, 1);
CALL sp_ProdutoNovo('Croissant', 'Croissant folhado.', 8.00, 2, 1);
CALL sp_ProdutoNovo('Empada', 'Empada de massa amanteigada com recheio.', 8.00, 2, 1);
CALL sp_ProdutoNovo('Enroladinho', 'Massa assada enrolada com recheio.', 7.00, 2, 1);
CALL sp_ProdutoNovo('Esfiha', 'Esfiha assada com recheio.', 7.00, 2, 1);
CALL sp_ProdutoNovo('Fogazza', 'Fogazza assada com recheio.', 7.00, 2, 1);
CALL sp_ProdutoNovo('Folhado', 'Salgado folhado com recheio.', 8.00, 2, 1);
CALL sp_ProdutoNovo('Hamburgão', 'Pão assado recheado com hambúrguer.', 7.00, 2, 1);
CALL sp_ProdutoNovo('Mini Pizza', 'Mini pizza assada.', 8.00, 2, 1);
CALL sp_ProdutoNovo('Pão de Batata', 'Pão de batata recheado.', 8.00, 2, 1);
CALL sp_ProdutoNovo('Pão de Queijo', 'Pão de queijo assado.', 5.00, 2, 1);
CALL sp_ProdutoNovo('Quibe', 'Quibe frito.', 8.00, 2, 1);
CALL sp_ProdutoNovo('Risole', 'Risole frito com recheio.', 8.00, 2, 1);
CALL sp_ProdutoNovo('Torta (fatia)', 'Fatia de torta salgada.', 8.00, 2, 1);

-- LANCHES (categoria 1)
CALL sp_ProdutoNovo('Americano', 'Lanche americano.', 9.50, 1, 1);
CALL sp_ProdutoNovo('Bauru', 'Lanche bauru.', 8.50, 1, 1);
CALL sp_ProdutoNovo('Hot Dog', 'Pão com salsicha e molhos.', 7.00, 1, 1);
CALL sp_ProdutoNovo('Misto Frio', 'Pão com presunto e queijo.', 8.00, 1, 1);
CALL sp_ProdutoNovo('Misto Quente', 'Pão com presunto e queijo, prensado na chapa.', 8.00, 1, 1);
CALL sp_ProdutoNovo('Queijo Quente', 'Pão com queijo, prensado na chapa.', 8.00, 1, 1);
CALL sp_ProdutoNovo('X Bacon', 'Lanche com hambúrguer, queijo e bacon.', 9.50, 1, 1);
CALL sp_ProdutoNovo('X Burguer', 'Lanche com hambúrguer e queijo.', 8.00, 1, 1);   -- conferir preço
CALL sp_ProdutoNovo('X Calabresa', 'Lanche com hambúrguer, queijo e calabresa.', 9.50, 1, 1);
CALL sp_ProdutoNovo('X Egg', 'Lanche com hambúrguer, queijo e ovo.', 9.50, 1, 1);
CALL sp_ProdutoNovo('X Salada', 'Lanche com hambúrguer, queijo e salada.', 8.50, 1, 1);
CALL sp_ProdutoNovo('X Tudo', 'Lanche completo com todos os ingredientes.', 13.50, 1, 1);

-- BEBIDAS (categoria 3)
CALL sp_ProdutoNovo('Água de Coco', 'Água de coco.', 5.00, 3, 1);
CALL sp_ProdutoNovo('Água sem Gás', 'Água mineral sem gás.', 3.50, 3, 1);
CALL sp_ProdutoNovo('Água com Gás', 'Água mineral com gás.', 4.00, 3, 1);
CALL sp_ProdutoNovo('H2O', 'H2O.', 8.50, 3, 1);                                      -- conferir preço
CALL sp_ProdutoNovo('Refri Lata 350ml', 'Refrigerante em lata de 350ml.', 7.00, 3, 1);
CALL sp_ProdutoNovo('Suco de Caixinha', 'Suco em caixinha.', 4.00, 3, 1);
CALL sp_ProdutoNovo('Todinho', 'Achocolatado Todinho.', 5.00, 3, 1);
CALL sp_ProdutoNovo('Suco Lata', 'Suco em lata.', 7.00, 3, 1);
CALL sp_ProdutoNovo('Chá Gelado 450ml', 'Chá gelado de 450ml.', 7.00, 3, 1);
CALL sp_ProdutoNovo('Suco Garrafa 450ml', 'Suco em garrafa de 450ml.', 7.00, 3, 1);
CALL sp_ProdutoNovo('Suco Copo 300ml', 'Suco natural no copo de 300ml.', 4.00, 3, 1);
CALL sp_ProdutoNovo('Suco Copo 400ml', 'Suco natural no copo de 400ml.', 5.00, 3, 1);
CALL sp_ProdutoNovo('Suco Copo 500ml', 'Suco natural no copo de 500ml.', 6.00, 3, 1);
CALL sp_ProdutoNovo('Café 180ml', 'Café de 180ml.', 3.00, 3, 1);
CALL sp_ProdutoNovo('Chocolate Quente', 'Chocolate quente.', 4.00, 3, 1);
CALL sp_ProdutoNovo('Pingado 180ml', 'Café com leite de 180ml.', 4.00, 3, 1);

-- 5. Criando pedido novo
DROP PROCEDURE IF EXISTS sp_PedidoNovo$$
CREATE PROCEDURE sp_PedidoNovo(
    IN spIdCliente INT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM tbCliente WHERE idCliente = spIdCliente
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cliente não encontrado.';
    END IF;
    
    INSERT INTO tbPedido(dataElaboracao, idCliente) VALUES
    (NOW(), spIdCliente);
END$$

-- 6. Criando o pedido e com produtos visiveis
DROP PROCEDURE IF EXISTS sp_PedidoAdicionarProduto$$
CREATE PROCEDURE sp_PedidoAdicionarProduto(
    IN spIdPedido INT,
    IN spIdProduto INT,
    IN spQuantidade INT
)
BEGIN
    DECLARE decPreco DECIMAL(5,2);
    DECLARE decDisponibilidade INT;

    IF NOT EXISTS (SELECT 1 FROM tbPedido WHERE idPedido = spIdPedido) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Pedido não encontrado.';
    END IF;

    SELECT precoProduto, idDisponibilidade INTO decPreco, decDisponibilidade
    FROM tbProduto WHERE idProduto = spIdProduto;

    IF decPreco IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Produto não encontrado.';
    END IF;

    IF decDisponibilidade <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Produto indisponível.';
    END IF;

    INSERT INTO tbPedidoProduto (idPedido, idProduto, Quantidade, precoUnitario)
    VALUES (spIdPedido, spIdProduto, spQuantidade, decPreco)
    ON DUPLICATE KEY UPDATE Quantidade = Quantidade + spQuantidade;
END$$

DELIMITER ;
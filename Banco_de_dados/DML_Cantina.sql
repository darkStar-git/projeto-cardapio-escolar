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
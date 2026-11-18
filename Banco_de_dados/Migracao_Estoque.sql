USE db_Cantina;

-- ==========================================================
-- MIGRAÇÃO: estoque de produtos + correção da disponibilidade
-- Rode UMA vez no banco já existente (não recria o banco).
-- Bancos novos já nascem certos com DDL_Cantina.sql + DML_Cantina.sql.
-- ==========================================================

-- 1. Coluna de estoque
ALTER TABLE tbProduto
    ADD COLUMN estoqueProduto INT NOT NULL DEFAULT 0 AFTER precoProduto,
    ADD CONSTRAINT chk_estoqueProduto CHECK (estoqueProduto >= 0);

-- Estoque inicial dos produtos que já existem (AJUSTE os valores se quiser).
-- Sem isso todos apareceriam como "Esgotado".
UPDATE tbProduto SET estoqueProduto = 20;

-- 2. Reparo do bug antigo do botão de disponibilidade:
-- a rota PUT /api/editarProduto descartava idCategoria e idDisponibilidade,
-- então o primeiro clique gravava NULL nos dois campos.
-- Produtos com disponibilidade NULL já apareciam como "Indisponível"; mantemos assim.
UPDATE tbProduto SET idDisponibilidade = 2 WHERE idDisponibilidade IS NULL;

-- Produtos que perderam a categoria (não dá para recuperar sozinho).
-- Abra cada um na tela admin (lápis), escolha a categoria e salve:
SELECT idProduto, nomeProduto FROM tbProduto WHERE idCategoria IS NULL;

-- 3. Procedures atualizadas
DELIMITER $$

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

DROP PROCEDURE IF EXISTS sp_ProdutoNovo$$
CREATE PROCEDURE sp_ProdutoNovo(
    IN spNomeProduto        VARCHAR(40),
    IN spDescricaoProduto   VARCHAR(120),
    IN spPrecoProduto       DECIMAL(5, 2),
    IN spIdCategoria        INT,
    IN spIdDisponibilidade INT,
    IN spEstoque            INT
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

    IF spEstoque IS NULL OR spEstoque < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Estoque inválido.';
    END IF;

    INSERT INTO tbProduto (nomeProduto, descricaoProduto, precoProduto, estoqueProduto, idCategoria, idDisponibilidade) VALUES 
    (spNomeProduto, spDescricaoProduto, spPrecoProduto, spEstoque, spIdCategoria, spIdDisponibilidade);
END$$

DROP PROCEDURE IF EXISTS sp_PedidoAdicionarProduto$$
CREATE PROCEDURE sp_PedidoAdicionarProduto(
    IN spIdPedido INT,
    IN spIdProduto INT,
    IN spQuantidade INT
)
BEGIN
    DECLARE decPreco DECIMAL(5,2);
    DECLARE decDisponibilidade INT;

    IF spQuantidade IS NULL OR spQuantidade <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Quantidade inválida.';
    END IF;

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

    IF decDisponibilidade IS NULL OR decDisponibilidade <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Produto indisponível.';
    END IF;

    -- Baixa de estoque: o UPDATE só acontece se houver saldo suficiente,
    -- então dois pedidos simultâneos nunca deixam o estoque negativo.
    UPDATE tbProduto
    SET estoqueProduto = estoqueProduto - spQuantidade
    WHERE idProduto = spIdProduto AND estoqueProduto >= spQuantidade;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Estoque insuficiente.';
    END IF;

    INSERT INTO tbPedidoProduto (idPedido, idProduto, Quantidade, precoUnitario)
    VALUES (spIdPedido, spIdProduto, spQuantidade, decPreco)
    ON DUPLICATE KEY UPDATE Quantidade = Quantidade + spQuantidade;
END$$

DELIMITER ;

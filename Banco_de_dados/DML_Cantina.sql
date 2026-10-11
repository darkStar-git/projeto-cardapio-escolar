USE db_Cantina;

DELIMITER $$

#Inserindo adm novo
CREATE PROCEDURE sp_admNovo(
	spNomeAdm VARCHAR(30),
    spRegistroAdm VARCHAR(10),
    spSenhaAdm VARCHAR(255)
) 
BEGIN
    IF EXISTS (
		SELECT 1 FROM tbAdmin WHERE registroAdm = spRegistroAdm
        ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Registro já cadastrado, insira outro.';
    ELSE
	INSERT INTO tbAdmin (nomeAdm, registroAdm, senhaAdm) VALUES (
	spNomeAdm, spRegistroAdm, spSenhaAdm);
    END IF;
END $$



#Inserindo novo cliente
CREATE PROCEDURE sp_clienteNovo(
	spNomeCliente VARCHAR(30),
    spRegistroCliente VARCHAR(10)
)
BEGIN
	IF EXISTS (
		SELECT 1 FROM tbCliente WHERE registroCliente = spRegistroCliente
		) THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Registro já cadastrado, insira outro.';
	ELSE
    INSERT INTO tbCliente (nomeCliente, registroCliente) VALUES (
    spNomeCliente, spRegistroCliente);
    END IF;
END $$



#Inserindo produto
CREATE PROCEDURE sp_ProdutoNovo(
    spNomeProduto       VARCHAR(40),
    spDescricaoProduto  VARCHAR(120),
    spPrecoProduto      DECIMAL(5, 2),
    spIdCategoria       INT,
    spIdDisponibilidade INT
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

    INSERT INTO tbProduto (nomeProduto, descricaoProduto, precoProduto, idCategoria, idDisponibilidade) VALUES (
    spNomeProduto, spDescricaoProduto, spPrecoProduto, spIdCategoria, spIdDisponibilidade);
END$$
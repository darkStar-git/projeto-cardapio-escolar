USE db_Cantina;

-- ==========================================================
-- MIGRAÇÃO: primeiro acesso (cadastro do primeiro administrador)
-- Rode no banco já existente. Só cria a procedure; não altera dados.
-- Bancos novos já recebem isso pelo DML_Cantina.sql.
-- ==========================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_admPrimeiro$$
CREATE PROCEDURE sp_admPrimeiro(
    IN spNomeAdm VARCHAR(30),
    IN spRegistroAdm VARCHAR(10),
    IN spSenhaAdm VARCHAR(255)
)
BEGIN
    DECLARE lockObtido INT DEFAULT 0;

    -- Se algo falhar (inclusive os SIGNAL abaixo), solta a trava e repassa o erro
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        DO RELEASE_LOCK('cantina_primeiro_admin');
        RESIGNAL;
    END;

    SELECT GET_LOCK('cantina_primeiro_admin', 5) INTO lockObtido;
    IF lockObtido <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sistema ocupado, tente novamente.';
    END IF;

    IF EXISTS (SELECT 1 FROM tbAdmin) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Já existe um administrador cadastrado.';
    END IF;

    INSERT INTO tbAdmin (nomeAdm, registroAdm, senhaAdm) VALUES
    (spNomeAdm, spRegistroAdm, spSenhaAdm);

    DO RELEASE_LOCK('cantina_primeiro_admin');
END$$

DELIMITER ;

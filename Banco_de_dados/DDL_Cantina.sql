DROP DATABASE IF EXISTS db_Cantina;
CREATE DATABASE db_Cantina;

USE db_Cantina;

DROP TABLE IF EXISTS tbPedidoProduto;
DROP TABLE IF EXISTS tbProduto;
DROP TABLE IF EXISTS tbDisponibilidade;
DROP TABLE IF EXISTS tbCategoria;
DROP TABLE IF EXISTS tbPedido;
DROP TABLE IF EXISTS tbCliente;
DROP TABLE IF EXISTS tbAdmin;

#Admin
CREATE TABLE tbAdmin (
    idAdmin INT PRIMARY KEY AUTO_INCREMENT,
    nomeAdm VARCHAR(30),
    registroAdm VARCHAR(10) UNIQUE,
    senhaAdm VARCHAR(255)
);

#Cliente
CREATE TABLE tbCliente (
    idCliente INT PRIMARY KEY AUTO_INCREMENT,
    nomeCliente VARCHAR(30),
    registroCliente VARCHAR(10) UNIQUE
);

#Pedido
CREATE TABLE tbPedido (
    idPedido INT PRIMARY KEY AUTO_INCREMENT,
    dataElaboracao DATETIME,
    idCliente INT,
    
    CONSTRAINT fk_pedidoCliente
    FOREIGN KEY (idCliente) REFERENCES tbCliente(idCliente)
);

#Categoria
CREATE TABLE tbCategoria (
    idCategoria INT PRIMARY KEY AUTO_INCREMENT,
    nomeCategoria VARCHAR(20),
    descricaoCategoria VARCHAR(100)
);

#Disponibilidade
CREATE TABLE tbDisponibilidade (
    idDisponibilidade INT PRIMARY KEY AUTO_INCREMENT,
    nomeDisponibilidade VARCHAR(13)
);

 #Produtos
 CREATE TABLE tbProduto (
    idProduto INT PRIMARY KEY AUTO_INCREMENT,
    nomeProduto VARCHAR(40) NOT NULL,
    descricaoProduto VARCHAR(120) NOT NULL,
    precoProduto DECIMAL(5, 2) NOT NULL CHECK (precoProduto > 0),
    idCategoria INT,
    idDisponibilidade INT,
    
    CONSTRAINT fk_produtoCategoria
    FOREIGN KEY (idCategoria) REFERENCES tbCategoria(idCategoria),
    
    CONSTRAINT fk_produtoDispo
    FOREIGN KEY (idDisponibilidade) REFERENCES tbDisponibilidade(idDisponibilidade)
);

#Tabela assiciativa
CREATE TABLE tbPedidoProduto (
    idPedido INT,
    idProduto INT,
    Quantidade INT NOT NULL CHECK (Quantidade > 0),
    precoUnitario DECIMAL(5, 2) NOT NULL CHECK (precoUnitario > 0),
    
    CONSTRAINT pk_pedido_produto
    PRIMARY KEY (idPedido, idProduto),
    
    CONSTRAINT fk_pedProd_Pedido
    FOREIGN KEY (idPedido) REFERENCES tbPedido(idPedido) ON DELETE CASCADE,
    
    CONSTRAINT fk_pedProd_Produto
    FOREIGN KEY (idProduto) REFERENCES tbProduto(idProduto)
);

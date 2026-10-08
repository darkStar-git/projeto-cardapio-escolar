DROP DATABASE IF EXISTS db_Cantina;
CREATE DATABASE db_Cantina;

USE db_Cantina;

DROP TABLE IF EXISTS tbPedidoBebida;
DROP TABLE IF EXISTS tbPedidoSalgado;
DROP TABLE IF EXISTS tbPedidoLanche;
DROP TABLE IF EXISTS tbLanche;
DROP TABLE IF EXISTS tbSalgado;
DROP TABLE IF EXISTS tbBebida;
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
    dataElaboracao DATE,
    idCliente INT,
    
    CONSTRAINT idCliente
    FOREIGN KEY (idCliente) REFERENCES tbCliente(idCliente)
);

#Categoria
CREATE TABLE tbCategoria (
    idCategoria INT PRIMARY KEY AUTO_INCREMENT,
    tipoCategoria VARCHAR(20)
);

#Disponibilidade
CREATE TABLE tbDisponibilidade (
    idDisponibilidade INT PRIMARY KEY AUTO_INCREMENT,
    nomeDisponibilidade VARCHAR(13)
);

#Bebida
CREATE TABLE tbBebida (
    idBebida INT PRIMARY KEY AUTO_INCREMENT,
    nomeBebida VARCHAR(30) NOT NULL,
    precoBebida DECIMAL(5, 2) NOT NULL CHECK (precoBebida > 0), #para não deixar eu salvar a bebida sem preço
    idCategoria INT,
    idDisponibilidade INT,
    
    CONSTRAINT idCategoriaBebida
    FOREIGN KEY (idCategoria) REFERENCES tbCategoria(idCategoria),
    
    CONSTRAINT idDisponibilidadeBebida
    FOREIGN KEY (idDisponibilidade) REFERENCES tbDisponibilidade(idDisponibilidade) ON UPDATE CASCADE
);
 
 #Salgado
 CREATE TABLE tbSalgado (
    idSalgado INT PRIMARY KEY AUTO_INCREMENT,
    nomeSalgado VARCHAR(30) NOT NULL,
    precoSalgado DECIMAL(5, 2) NOT NULL CHECK (precoBebida > 0),
    idCategoria INT,
    idDisponibilidade INT,
    
    CONSTRAINT idCategoriaSalgado
    FOREIGN KEY (idCategoria) REFERENCES tbCategoria(idCategoria),
    
    CONSTRAINT idDisponibilidadeSalgado
    FOREIGN KEY (idDisponibilidade) REFERENCES tbDisponibilidade(idDisponibilidade) ON UPDATE CASCADE
);

#Lanche
CREATE TABLE tbLanche (
    idLanche INT PRIMARY KEY AUTO_INCREMENT,
    nomeLanche VARCHAR (40) NOT NULL,
    precoLanche DECIMAL(5, 2) NOT NULL CHECK (precoBebida > 0),
    idCategoria INT,
    idDisponibilidade INT,
    
	CONSTRAINT idCategoriaLanche
    FOREIGN KEY (idCategoria) REFERENCES tbCategoria(idCategoria),
    
    CONSTRAINT idDisponibilidadeLanche
    FOREIGN KEY (idDisponibilidade) REFERENCES tbDisponibilidade(idDisponibilidade) ON UPDATE CASCADE
);


#Tabelas associativas

#Pedido e Lanche
CREATE TABLE tbPedidoLanche (
    idPedido INT,
    idLanche INT,
    Quantidade INT NOT NULL CHECK (quantidade > 0),
    PRIMARY KEY (idLanche, idPedido),
    
    CONSTRAINT idPedidoPL
    FOREIGN KEY (idPedido) REFERENCES tbPedido(idPedido) ON DELETE CASCADE,
    
    CONSTRAINT idLanchePL
    FOREIGN KEY (idLanche) REFERENCES tbLanche(idLanche) ON DELETE RESTRICT
);

#Pedido e Salgado
CREATE TABLE tbPedidoSalgado (
    idPedido INT,
    idSalgado INT,
    Quantidade INT NOT NULL CHECK (quantidade > 0),
    PRIMARY KEY (idSalgado, idPedido),
    
    CONSTRAINT idPedidoPS
    FOREIGN KEY (idPedido) REFERENCES tbPedido(idPedido) ON DELETE CASCADE,
    
    CONSTRAINT idSalgadoPS
    FOREIGN KEY (idSalgado) REFERENCES tbSalgado(idSalgado) ON DELETE RESTRICT
);

#Pedido e Bebida
CREATE TABLE tbPedidoBebida (
    idPedido INT,
    idBebida INT,
    Quantidade INT NOT NULL CHECK (quantidade > 0),
    PRIMARY KEY (idBebida, idPedido),
    
    CONSTRAINT idPedidoPB
    FOREIGN KEY (idPedido) REFERENCES tbPedido(idPedido) ON DELETE CASCADE,
    
    CONSTRAINT idBebidaPB
    FOREIGN KEY (idBebida) REFERENCES tbBebida(idBebida) ON DELETE RESTRICT
);

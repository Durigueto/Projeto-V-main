-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           8.0.39 - MySQL Community Server - GPL
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para loop_bd
CREATE DATABASE IF NOT EXISTS `loop_bd` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `loop_bd`;

-- Copiando estrutura para tabela loop_bd.formulario
CREATE TABLE IF NOT EXISTS `formulario` (
  `IdForm` int NOT NULL AUTO_INCREMENT,
  `Titulo` varchar(200) NOT NULL,
  `DataHora` datetime NOT NULL,
  `IdUser` int NOT NULL,
  PRIMARY KEY (`IdForm`),
  KEY `Fk_User` (`IdUser`),
  CONSTRAINT `Fk_User` FOREIGN KEY (`IdUser`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela loop_bd.pergunta
CREATE TABLE IF NOT EXISTS `pergunta` (
  `idPergunta` int NOT NULL AUTO_INCREMENT,
  `Pergunta` varchar(45) NOT NULL,
  `IdForm` int NOT NULL,
  `Status` varchar(45) NOT NULL,
  PRIMARY KEY (`idPergunta`) USING BTREE,
  KEY `FK_Form` (`IdForm`) USING BTREE,
  CONSTRAINT `FK_Form` FOREIGN KEY (`IdForm`) REFERENCES `formulario` (`IdForm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela loop_bd.resposta
CREATE TABLE IF NOT EXISTS `resposta` (
  `idResposta` int NOT NULL AUTO_INCREMENT,
  `Pergunta` int NOT NULL,
  `Status` varchar(45) DEFAULT NULL,
  `Avaliação` varchar(45) DEFAULT NULL,
  `Resposta` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`idResposta`),
  UNIQUE KEY `Pergunta_UNIQUE` (`Pergunta`),
  CONSTRAINT `Resp_Quest` FOREIGN KEY (`Pergunta`) REFERENCES `pergunta` (`idPergunta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela loop_bd.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(120) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Senha` varchar(45) NOT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`idUsuario`) USING BTREE,
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Exportação de dados foi desmarcado.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

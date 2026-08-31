-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: elunico_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `abonos`
--

DROP TABLE IF EXISTS `abonos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `abonos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Id_cliente` bigint(20) NOT NULL,
  `Total_deuda` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `abonos_id_cliente_index` (`Id_cliente`),
  CONSTRAINT `abonos_id_cliente_foreign` FOREIGN KEY (`Id_cliente`) REFERENCES `clientes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `abonos`
--

LOCK TABLES `abonos` WRITE;
/*!40000 ALTER TABLE `abonos` DISABLE KEYS */;
INSERT INTO `abonos` VALUES (1,5,200.00),(2,6,100.00),(3,7,750.00),(4,8,0.00),(5,9,0.00),(6,1,-600.00),(7,2,500.00),(8,10,0.00),(9,11,0.00),(10,12,0.00),(11,13,1000.00),(12,14,0.00);
/*!40000 ALTER TABLE `abonos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `arqueo_desglose_billetes`
--

DROP TABLE IF EXISTS `arqueo_desglose_billetes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `arqueo_desglose_billetes` (
  `id_desglose` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_sesion` bigint(20) NOT NULL,
  `moneda` varchar(5) NOT NULL,
  `denominacion` int(11) NOT NULL,
  `cantidad` int(11) DEFAULT 0,
  `subtotal_cordobas` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_desglose`),
  KEY `id_sesion` (`id_sesion`),
  CONSTRAINT `arqueo_desglose_billetes_ibfk_1` FOREIGN KEY (`id_sesion`) REFERENCES `sesiones_caja` (`id_sesion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arqueo_desglose_billetes`
--

LOCK TABLES `arqueo_desglose_billetes` WRITE;
/*!40000 ALTER TABLE `arqueo_desglose_billetes` DISABLE KEYS */;
/*!40000 ALTER TABLE `arqueo_desglose_billetes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Nombre_categoria` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Aceites'),(2,'Cable de freno'),(3,'Neumáticos'),(4,'Llantas'),(5,'Baterías'),(6,'Amortiguadores'),(7,'Carpa'),(8,'Sprays'),(9,'Rines'),(10,'Patas de bicicleta');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clientes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) NOT NULL,
  `Apellido` varchar(255) NOT NULL,
  `Telefono` varchar(255) NOT NULL,
  `Direccion` varchar(255) NOT NULL,
  `Saldo_Deuda` decimal(8,2) NOT NULL,
  `NCliente` int(11) NOT NULL,
  `NCedula` varchar(14) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `NCedula_Unique` (`NCedula`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Juan','Centeno','22334455','Del puente 3c al este y 1/2c al norte',2400.00,1,NULL),(2,'Alberto','Lopo','11223344','',500.00,2,NULL),(5,'Pepe','El Ingeniero','33557777','',200.00,5,NULL),(6,'Paco','El Gato','55443322','',100.00,11,NULL),(7,'Horell','Altamirano','22446677','',750.00,12,NULL),(8,'Andrés','Silva','55667788','',0.00,10,NULL),(9,'Pedro','Torrente','33221166','',0.00,15,NULL),(10,'Cliente','General','','',0.00,999,NULL),(11,'Juan','Centeno Castellón','83384873','Del puente 3c al este y 1/2c al norte',0.00,16,NULL),(12,'Juan','Centeno Castellón','22114455','Del puente 3c al este y 1/2c al norte',0.00,17,NULL),(13,'Juan Antonio','Centeno Castellón','22445566','Del puente 3c al este y 1/2c al norte',1000.00,18,'4412507401003A'),(14,'Juan','Centeno Castellón','','Del puente 3c al este y 1/2c al norte',0.00,21,'');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `compras` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Id_proveedor` bigint(20) NOT NULL,
  `Fecha` datetime NOT NULL,
  `NFactura` varchar(255) NOT NULL,
  `Total` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `compras_id_proveedor_foreign` (`Id_proveedor`),
  CONSTRAINT `compras_id_proveedor_foreign` FOREIGN KEY (`Id_proveedor`) REFERENCES `proveedores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
INSERT INTO `compras` VALUES (2,1,'2026-08-02 08:33:54','aalliioo',135.00),(4,1,'2026-08-02 08:43:54','aalliioo',5200.00),(5,2,'2026-08-02 14:19:25','1122334455',1650.00),(6,1,'2026-08-02 16:35:53','223344',515.00),(7,1,'2026-08-22 20:02:10','1234567890',400.00),(8,1,'2026-08-22 20:10:33','5555',4700.00),(9,1,'2026-08-22 20:12:51','5555',4000.00),(10,3,'2026-08-22 20:14:25','5656',5000.00),(11,1,'2026-08-24 08:31:05','454567',2750.00),(12,1,'2026-08-29 14:51:35','223344556677',13200.00);
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_abono`
--

DROP TABLE IF EXISTS `detalle_abono`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_abono` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Id_abono` bigint(20) NOT NULL,
  `Fecha` datetime NOT NULL,
  `Monto` decimal(8,2) NOT NULL,
  `Notas` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_abono_id_abono_foreign` (`Id_abono`),
  CONSTRAINT `detalle_abono_id_abono_foreign` FOREIGN KEY (`Id_abono`) REFERENCES `abonos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_abono`
--

LOCK TABLES `detalle_abono` WRITE;
/*!40000 ALTER TABLE `detalle_abono` DISABLE KEYS */;
INSERT INTO `detalle_abono` VALUES (3,1,'0000-00-00 00:00:00',500.00,NULL),(4,1,'2026-07-31 15:37:50',999999.99,NULL),(5,1,'2026-07-31 15:38:14',999999.99,NULL),(6,1,'2026-07-31 15:38:43',100.00,NULL),(7,1,'2026-07-31 15:45:20',500.00,NULL),(8,1,'2026-07-31 15:46:01',300.00,NULL),(9,2,'2026-08-02 14:52:40',100.00,NULL),(10,3,'2026-08-11 14:27:40',250.00,'Mucho money'),(11,3,'2026-08-11 14:56:25',200.00,''),(12,5,'2026-08-11 18:43:48',150.00,'Abono Agosto'),(17,5,'2026-08-22 19:21:47',50.00,''),(18,6,'2026-08-29 14:55:59',300.00,''),(19,6,'2026-08-29 14:56:35',300.00,'');
/*!40000 ALTER TABLE `detalle_abono` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_detalle_abono` AFTER INSERT ON `detalle_abono` FOR EACH ROW BEGIN

    UPDATE abonos
    SET Total_deuda = Total_deuda - NEW.Monto
    WHERE id = NEW.Id_abono;

    UPDATE clientes
    SET Saldo_Deuda = Saldo_Deuda - NEW.Monto
    WHERE id = (
        SELECT Id_cliente
        FROM abonos
        WHERE id = NEW.Id_abono
    );

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_detalle_abono_sesion_caja` AFTER INSERT ON `detalle_abono` FOR EACH ROW BEGIN

    UPDATE sesiones_caja
    SET total_ingresos_sistema =
        total_ingresos_sistema + NEW.Monto
    WHERE estado = 'Abierta'
    LIMIT 1;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `detalle_compra`
--

DROP TABLE IF EXISTS `detalle_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_compra` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Id_compra` bigint(20) NOT NULL,
  `Id_producto` bigint(20) NOT NULL,
  `Cantidad` bigint(20) NOT NULL,
  `Precio_compra` decimal(8,2) NOT NULL,
  `Subtotal` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_compra_id_compra_foreign` (`Id_compra`),
  KEY `detalle_compra_id_producto_foreign` (`Id_producto`),
  CONSTRAINT `detalle_compra_id_compra_foreign` FOREIGN KEY (`Id_compra`) REFERENCES `compras` (`id`),
  CONSTRAINT `detalle_compra_id_producto_foreign` FOREIGN KEY (`Id_producto`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compra`
--

LOCK TABLES `detalle_compra` WRITE;
/*!40000 ALTER TABLE `detalle_compra` DISABLE KEYS */;
INSERT INTO `detalle_compra` VALUES (1,2,1,1,10.00,10.00),(2,2,2,1,25.00,25.00),(3,2,4,1,100.00,100.00),(5,4,1,10,120.00,1200.00),(6,4,2,10,150.00,1500.00),(7,4,3,10,150.00,1500.00),(8,4,4,10,50.00,500.00),(9,4,5,10,50.00,500.00),(10,5,1,11,150.00,1650.00),(11,6,1,5,100.00,500.00),(12,6,2,1,15.00,15.00),(13,7,2,1,400.00,400.00),(14,8,2,10,350.00,3500.00),(15,8,3,1,1200.00,1200.00),(16,9,2,10,300.00,3000.00),(17,9,3,10,100.00,1000.00),(18,10,2,10,100.00,1000.00),(19,10,3,10,400.00,4000.00),(20,11,3,10,150.00,1500.00),(21,11,4,5,250.00,1250.00),(22,12,1,11,1200.00,13200.00);
/*!40000 ALTER TABLE `detalle_compra` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_detalle_compra` AFTER INSERT ON `detalle_compra` FOR EACH ROW BEGIN
    UPDATE productos
    SET Stock = Stock + NEW.Cantidad
    WHERE id = NEW.Id_producto;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `detalle_devolucion`
--

DROP TABLE IF EXISTS `detalle_devolucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_devolucion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_devolucion` bigint(20) NOT NULL,
  `Id_detalle_venta` bigint(20) NOT NULL,
  `Id_producto` bigint(20) NOT NULL,
  `Cantidad` decimal(10,2) NOT NULL,
  `Precio_Venta` decimal(10,2) NOT NULL,
  `Subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Id_devolucion` (`Id_devolucion`),
  KEY `Id_detalle_venta` (`Id_detalle_venta`),
  KEY `Id_producto` (`Id_producto`),
  CONSTRAINT `detalle_devolucion_ibfk_1` FOREIGN KEY (`Id_devolucion`) REFERENCES `devoluciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_devolucion_ibfk_2` FOREIGN KEY (`Id_detalle_venta`) REFERENCES `detalle_venta` (`id`),
  CONSTRAINT `detalle_devolucion_ibfk_3` FOREIGN KEY (`Id_producto`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_devolucion`
--

LOCK TABLES `detalle_devolucion` WRITE;
/*!40000 ALTER TABLE `detalle_devolucion` DISABLE KEYS */;
INSERT INTO `detalle_devolucion` VALUES (1,5,1,1,1.00,150.00,150.00),(2,5,2,2,1.00,350.00,350.00),(3,5,3,4,1.00,300.00,300.00),(4,6,4,1,1.00,150.00,150.00),(5,6,5,2,5.00,350.00,1750.00),(6,6,6,3,8.00,1200.00,9600.00),(7,6,7,4,26.00,300.00,7800.00),(8,6,8,5,22.00,230.00,5060.00),(9,7,4,1,27.00,150.00,4050.00),(10,7,5,2,5.00,350.00,1750.00),(11,7,6,3,8.00,1200.00,9600.00),(12,7,7,4,26.00,300.00,7800.00),(13,7,8,5,22.00,230.00,5060.00),(14,8,10,1,1.00,150.00,150.00),(15,8,11,2,1.00,350.00,350.00),(16,9,12,1,1.00,150.00,150.00),(17,10,28,4,10.00,300.00,3000.00),(18,11,29,4,10.00,300.00,3000.00),(19,12,21,2,1.00,350.00,350.00);
/*!40000 ALTER TABLE `detalle_devolucion` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_detalle_devolucion` AFTER INSERT ON `detalle_devolucion` FOR EACH ROW BEGIN
    IF NEW.Id_producto IS NOT NULL THEN
        UPDATE productos
        SET Stock = Stock + NEW.Cantidad
        WHERE id = NEW.Id_producto;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_devoluciones_sesiones` AFTER INSERT ON `detalle_devolucion` FOR EACH ROW BEGIN
    DECLARE v_tipo_pago VARCHAR(20);

    SELECT v.Tipo_Pago INTO v_tipo_pago
    FROM detalle_venta dv
    JOIN ventas v ON v.id = dv.Id_venta
    WHERE dv.id = NEW.Id_detalle_venta
    LIMIT 1;

    IF v_tipo_pago = 'Contado' THEN
        UPDATE sesiones_caja
        SET total_ingresos_sistema = total_ingresos_sistema - NEW.Subtotal
        WHERE estado = 'Abierta'
        LIMIT 1;

    ELSEIF v_tipo_pago = 'Transferencia' THEN
        UPDATE sesiones_caja
        SET total_tarjeta_transferencia = total_tarjeta_transferencia - NEW.Subtotal
        WHERE estado = 'Abierta'
        LIMIT 1;
    END IF;

    -- Si Tipo_Pago = 'Credito', no se toca sesiones_caja
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `detalle_otras_salidas_inventario`
--

DROP TABLE IF EXISTS `detalle_otras_salidas_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_otras_salidas_inventario` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Id_salida` bigint(20) NOT NULL,
  `Id_producto` bigint(20) NOT NULL,
  `Cantidad` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Id_salida` (`Id_salida`),
  KEY `Id_producto` (`Id_producto`),
  CONSTRAINT `detalle_otras_salidas_inventario_ibfk_1` FOREIGN KEY (`Id_salida`) REFERENCES `otras_salidas_inventario` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_otras_salidas_inventario_ibfk_2` FOREIGN KEY (`Id_producto`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_otras_salidas_inventario`
--

LOCK TABLES `detalle_otras_salidas_inventario` WRITE;
/*!40000 ALTER TABLE `detalle_otras_salidas_inventario` DISABLE KEYS */;
INSERT INTO `detalle_otras_salidas_inventario` VALUES (1,1,1,29.00),(2,2,1,1.00);
/*!40000 ALTER TABLE `detalle_otras_salidas_inventario` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_detalle_salidas_inventario` AFTER INSERT ON `detalle_otras_salidas_inventario` FOR EACH ROW BEGIN
    IF NEW.Id_producto IS NOT NULL THEN
        UPDATE productos
        SET Stock = Stock - NEW.Cantidad
        WHERE id = NEW.Id_producto;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_venta` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Id_venta` bigint(20) NOT NULL,
  `Id_producto` bigint(20) DEFAULT NULL,
  `Cantidad` bigint(20) NOT NULL,
  `Precio_Venta` decimal(8,2) NOT NULL,
  `Descuento` decimal(10,0) NOT NULL DEFAULT 0,
  `Subtotal` decimal(8,2) NOT NULL,
  `Id_servicio` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_venta_id_venta_foreign` (`Id_venta`),
  KEY `detalle_venta_id_producto_foreign` (`Id_producto`),
  KEY `fk_detalle_venta_servicio` (`Id_servicio`),
  CONSTRAINT `detalle_venta_id_venta_foreign` FOREIGN KEY (`Id_venta`) REFERENCES `ventas` (`id`),
  CONSTRAINT `fk_detalle_venta_producto` FOREIGN KEY (`Id_producto`) REFERENCES `productos` (`id`),
  CONSTRAINT `fk_detalle_venta_servicio` FOREIGN KEY (`Id_servicio`) REFERENCES `servicios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
INSERT INTO `detalle_venta` VALUES (1,2,1,1,150.00,0,150.00,NULL),(2,2,2,1,350.00,0,350.00,NULL),(3,2,4,1,300.00,0,300.00,NULL),(4,4,1,28,150.00,0,4200.00,NULL),(5,4,2,10,350.00,0,3500.00,NULL),(6,4,3,16,1200.00,0,19200.00,NULL),(7,4,4,52,300.00,0,15600.00,NULL),(8,4,5,44,230.00,0,10120.00,NULL),(9,6,1,4,150.00,0,600.00,NULL),(10,7,1,1,150.00,0,150.00,NULL),(11,7,2,1,350.00,0,350.00,NULL),(12,8,1,1,150.00,0,150.00,NULL),(13,8,2,1,350.00,0,350.00,NULL),(14,10,1,10,150.00,0,1500.00,NULL),(15,10,2,1,350.00,100,250.00,NULL),(16,10,3,2,1200.00,100,2300.00,NULL),(17,11,1,1,150.00,0,150.00,NULL),(18,12,1,3,150.00,0,450.00,NULL),(19,13,3,1,1200.00,0,1200.00,NULL),(20,14,3,1,1200.00,0,1200.00,NULL),(21,15,2,1,350.00,0,350.00,NULL),(22,16,2,1,350.00,0,350.00,NULL),(23,17,NULL,3,600.00,0,1800.00,6),(24,18,2,35,300.00,0,10500.00,NULL),(25,19,3,5,500.00,0,2500.00,NULL),(26,20,3,34,200.00,500,6300.00,NULL),(27,20,4,3,300.00,100,800.00,NULL),(28,21,4,10,300.00,0,3000.00,NULL),(29,22,4,10,300.00,0,3000.00,NULL),(30,23,4,10,300.00,0,3000.00,NULL),(31,24,4,10,300.00,0,3000.00,NULL),(32,25,4,10,300.00,0,3000.00,NULL),(33,26,4,1,300.00,0,300.00,NULL),(34,27,4,1,300.00,0,300.00,NULL),(35,28,1,1,1500.00,0,1500.00,NULL),(36,29,1,1,1500.00,0,1500.00,NULL),(37,30,1,1,1500.00,0,1500.00,NULL),(38,31,1,1,1500.00,0,1500.00,NULL),(39,32,1,1,1500.00,0,1500.00,NULL),(40,33,1,1,1500.00,0,1500.00,NULL),(41,34,1,1,1500.00,0,1500.00,NULL),(42,35,1,1,1500.00,0,1500.00,NULL),(43,36,1,1,1500.00,0,1500.00,NULL),(44,37,1,1,1500.00,0,1500.00,NULL),(45,38,4,1,300.00,100,200.00,NULL),(46,39,2,1,300.00,0,300.00,NULL),(47,40,4,1,300.00,0,300.00,NULL),(48,41,5,1,230.00,0,230.00,NULL),(49,42,5,1,230.00,0,230.00,NULL),(50,43,5,1,230.00,0,230.00,NULL),(51,44,4,1,300.00,0,300.00,NULL);
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_detalle_venta` AFTER INSERT ON `detalle_venta` FOR EACH ROW BEGIN

    IF NEW.Id_producto IS NOT NULL THEN

        UPDATE productos
        SET Stock = Stock - NEW.Cantidad
        WHERE id = NEW.Id_producto;

    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `devoluciones`
--

DROP TABLE IF EXISTS `devoluciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `devoluciones` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Id_venta` bigint(20) NOT NULL,
  `Id_usuario` bigint(20) NOT NULL,
  `Fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `Motivo` varchar(255) NOT NULL,
  `Observacion` text DEFAULT NULL,
  `Estado` enum('Pendiente','Completada','Anulada') NOT NULL DEFAULT 'Completada',
  PRIMARY KEY (`id`),
  KEY `fk_devolucion_venta` (`Id_venta`),
  KEY `fk_devolucion_usuario` (`Id_usuario`),
  CONSTRAINT `fk_devolucion_usuario` FOREIGN KEY (`Id_usuario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_devolucion_venta` FOREIGN KEY (`Id_venta`) REFERENCES `ventas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devoluciones`
--

LOCK TABLES `devoluciones` WRITE;
/*!40000 ALTER TABLE `devoluciones` DISABLE KEYS */;
INSERT INTO `devoluciones` VALUES (5,2,1,'2026-08-22 16:39:30','Producto defectuoso','Nada sirve gente','Completada'),(6,4,1,'2026-08-22 16:40:59','Producto defectuoso','Nadota nadota','Completada'),(7,4,1,'2026-08-22 16:44:47','Cliente ya no lo requiere',NULL,'Completada'),(8,7,1,'2026-08-22 17:17:27','Otro',NULL,'Completada'),(9,8,1,'2026-08-22 17:19:34','Producto defectuoso',NULL,'Completada'),(10,21,1,'2026-08-24 10:20:55','Producto defectuoso',NULL,'Completada'),(11,22,1,'2026-08-24 10:22:30','Error en la venta',NULL,'Completada'),(12,15,1,'2026-08-29 14:49:30','Producto defectuoso',NULL,'Completada');
/*!40000 ALTER TABLE `devoluciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `egresos_caja`
--

DROP TABLE IF EXISTS `egresos_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `egresos_caja` (
  `id_egreso` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_sesion` bigint(20) NOT NULL,
  `tipo_egreso` varchar(50) NOT NULL,
  `metodo_pago` varchar(30) NOT NULL,
  `concepto` varchar(255) NOT NULL,
  `monto_cordobas` decimal(10,2) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_egreso`),
  KEY `id_sesion` (`id_sesion`),
  CONSTRAINT `egresos_caja_ibfk_1` FOREIGN KEY (`id_sesion`) REFERENCES `sesiones_caja` (`id_sesion`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `egresos_caja`
--

LOCK TABLES `egresos_caja` WRITE;
/*!40000 ALTER TABLE `egresos_caja` DISABLE KEYS */;
INSERT INTO `egresos_caja` VALUES (1,6,'Servicios','Efectivo','Me compre 10 cocas',650.00,'Mucha Coca','2026-08-24 16:24:45');
/*!40000 ALTER TABLE `egresos_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimiento`
--

DROP TABLE IF EXISTS `mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mantenimiento` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Accion` varchar(255) NOT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `tamano_bytes` bigint(20) DEFAULT NULL,
  `estado` enum('Exitoso','Fallido') DEFAULT NULL,
  `mensaje_error` text DEFAULT NULL,
  `Fecha` datetime NOT NULL,
  `Id_usuario` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mantenimiento_id_usuario_foreign` (`Id_usuario`),
  CONSTRAINT `mantenimiento_id_usuario_foreign` FOREIGN KEY (`Id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento`
--

LOCK TABLES `mantenimiento` WRITE;
/*!40000 ALTER TABLE `mantenimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas`
--

DROP TABLE IF EXISTS `marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marcas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Nombre_marca` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas`
--

LOCK TABLES `marcas` WRITE;
/*!40000 ALTER TABLE `marcas` DISABLE KEYS */;
INSERT INTO `marcas` VALUES (1,'Repsol'),(2,'Kenda'),(3,'Super Run'),(4,'Yebram'),(5,'Vini'),(6,'Golden Boy'),(7,'Spray Master'),(8,'Ttao Yamb'),(9,'AutoParts'),(10,'B&G'),(11,'Tools Master'),(12,'Thunder'),(14,'Dunlop'),(15,'Castrol'),(16,'Rhino'),(17,'LlantasFire'),(18,'LiquiMoly'),(19,'Motul'),(20,'Sin Marca'),(21,'AAA');
/*!40000 ALTER TABLE `marcas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otras_salidas_inventario`
--

DROP TABLE IF EXISTS `otras_salidas_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `otras_salidas_inventario` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Id_usuario` bigint(20) NOT NULL,
  `Fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `Tipo_Salida` varchar(100) NOT NULL,
  `Observacion` text DEFAULT NULL,
  `Estado` enum('Completada','Anulada') NOT NULL DEFAULT 'Completada',
  PRIMARY KEY (`id`),
  KEY `fk_salida_usuario` (`Id_usuario`),
  CONSTRAINT `fk_salida_usuario` FOREIGN KEY (`Id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otras_salidas_inventario`
--

LOCK TABLES `otras_salidas_inventario` WRITE;
/*!40000 ALTER TABLE `otras_salidas_inventario` DISABLE KEYS */;
INSERT INTO `otras_salidas_inventario` VALUES (1,1,'2026-08-22 17:46:39','Producto dañado','Muchas cosas por decir, hiper decepcionante','Completada'),(2,1,'2026-08-29 15:24:36','Producto dañado',NULL,'Completada');
/*!40000 ALTER TABLE `otras_salidas_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) NOT NULL,
  `Id_marca` bigint(20) NOT NULL,
  `Id_categoria` bigint(20) NOT NULL,
  `Precio_venta` decimal(8,2) NOT NULL,
  `Stock` bigint(20) NOT NULL,
  `Stock_min` int(11) NOT NULL,
  `Fecha_vencimiento` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `productos_id_marca_foreign` (`Id_marca`),
  KEY `productos_id_categoria_foreign` (`Id_categoria`),
  CONSTRAINT `productos_id_categoria_foreign` FOREIGN KEY (`Id_categoria`) REFERENCES `categorias` (`id`),
  CONSTRAINT `productos_id_marca_foreign` FOREIGN KEY (`Id_marca`) REFERENCES `marcas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Aceite Akron 1l',9,1,1500.00,0,5,NULL),(2,'Castrol 10l',15,1,300.00,0,3,NULL),(3,'Llanta 3.00-18 SP',6,4,200.00,0,5,NULL),(4,'Neumático N18',6,3,300.00,0,5,NULL),(5,'Aceite Total 1l',1,1,230.00,25,5,NULL),(6,'Repsol 1 Litro',1,1,100.00,10,5,NULL),(7,'Llantas Golden Boy',8,4,120.00,0,5,NULL),(12,'Llanta 4.10-18',3,4,1650.00,10,5,'2026-08-13'),(13,'Llanta 4.60-17',6,4,1900.00,10,5,'2027-01-30'),(14,'llanta 3.00-21 ps',6,4,1350.00,20,8,'2026-12-30'),(15,'Carpa Negra Borsa',10,7,150.00,0,5,NULL),(16,'Kit de Frenos',20,10,305.00,10,5,NULL),(17,'Kit de Frenos HJ',20,8,330.00,0,5,NULL);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `proveedores` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Nombre_Empresa` varchar(255) NOT NULL,
  `Nombre_Contacto` varchar(255) NOT NULL,
  `Telefono` varchar(255) NOT NULL,
  `Direccion` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,'El Arbolito','Gimenez','11223344','Frente al Parque Central'),(2,'Aceites Master','Andrés Alberto','11223311',''),(3,'Fili Llantas','Josue','84268873','De la cruz roja 6c. oeste'),(4,'Moto Plaza','Fernando ','45678970','De la cruz roja 6c. oeste'),(5,'Llantas Montoya','Abel','22331122','');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Nombre_rol` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servicios` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `Nombre_servicio` text NOT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `Precio` decimal(10,0) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios`
--

LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
INSERT INTO `servicios` VALUES (1,'Engrasar bicicleta','',200),(2,'Cambio de aceite','',200),(3,'Forrar asiento','',300),(4,'Cambio de batería','',100),(5,'Encarpar mototaxi','',500),(6,'Armar bicicleta','',6000),(7,'Cambio de asiento de bicicleta','',100);
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones_caja`
--

DROP TABLE IF EXISTS `sesiones_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sesiones_caja` (
  `id_sesion` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint(20) NOT NULL,
  `fecha_apertura` datetime NOT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `monto_apertura_cordobas` decimal(10,2) DEFAULT 0.00,
  `tasa_cambio` decimal(6,4) NOT NULL,
  `total_ingresos_sistema` decimal(10,2) DEFAULT 0.00,
  `total_egresos_sistema` decimal(10,2) DEFAULT 0.00,
  `total_neto_sistema` decimal(10,2) DEFAULT 0.00,
  `total_efectivo_contado` decimal(10,2) DEFAULT 0.00,
  `total_tarjeta_transferencia` decimal(10,2) DEFAULT 0.00,
  `diferencia` decimal(10,2) DEFAULT 0.00,
  `observaciones` text DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'Abierta',
  PRIMARY KEY (`id_sesion`),
  KEY `sesiones_caja_id_usuario_foreign` (`id_usuario`),
  CONSTRAINT `sesiones_caja_id_usuario_foreign` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_caja`
--

LOCK TABLES `sesiones_caja` WRITE;
/*!40000 ALTER TABLE `sesiones_caja` DISABLE KEYS */;
INSERT INTO `sesiones_caja` VALUES (1,1,'2026-08-22 16:14:29','2026-08-22 20:45:42',15020.00,36.6200,1600.00,0.00,0.00,16970.00,1600.00,0.00,'Nada faltante','Cerrada'),(2,1,'2026-08-22 20:48:11','2026-08-22 20:52:56',1000.00,36.6200,0.00,0.00,0.00,1000.00,0.00,0.00,'','Cerrada'),(3,1,'2026-08-22 20:59:03','2026-08-22 20:59:18',5000.00,36.6200,0.00,0.00,0.00,5000.00,0.00,0.00,'','Cerrada'),(4,1,'2026-08-23 22:59:17','2026-08-24 08:27:56',15000.00,36.6200,14800.00,0.00,0.00,15000.00,0.00,-14800.00,'','Cerrada'),(5,1,'2026-08-24 08:31:42','2026-08-24 09:56:58',10000.00,36.6200,7100.00,0.00,0.00,17100.00,0.00,0.00,'','Cerrada'),(6,1,'2026-08-24 10:19:43',NULL,10000.00,36.6200,20990.00,0.00,0.00,0.00,-350.00,0.00,'','Abierta');
/*!40000 ALTER TABLE `sesiones_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Nombre_Usuario` varchar(255) NOT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `Correo` varchar(255) NOT NULL,
  `Id_rol` bigint(20) NOT NULL,
  `Activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Correo` (`Correo`),
  UNIQUE KEY `Nombre_Usuario` (`Nombre_Usuario`),
  KEY `usuario_id_rol_foreign` (`Id_rol`),
  CONSTRAINT `usuarios_id_rol_foreign` FOREIGN KEY (`Id_rol`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Juan','12345678','juan132y@gmail.com',1,1),(3,'Yonjar','$2b$10$X1Axq4BdZj7FknE/CbUJWur614HGzjElASe0IY0em2fVqbr7FMNu2','horellaltamirano@gmail.com',1,1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ventas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Id_cliente` bigint(20) NOT NULL,
  `Id_usuario` bigint(20) NOT NULL,
  `Fecha` datetime NOT NULL,
  `Tipo_Pago` varchar(255) NOT NULL,
  `Total` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ventas_id_cliente_foreign` (`Id_cliente`),
  KEY `ventas_id_usuario_foreign` (`Id_usuario`),
  CONSTRAINT `ventas_id_cliente_foreign` FOREIGN KEY (`Id_cliente`) REFERENCES `clientes` (`id`),
  CONSTRAINT `ventas_id_usuario_foreign` FOREIGN KEY (`Id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (2,5,1,'2026-08-01 19:42:05','Contado',800.00),(4,1,1,'2026-08-02 10:19:17','Contado',52620.00),(6,1,1,'2026-08-02 13:38:34','Credito',600.00),(7,1,1,'2026-08-02 16:06:29','Contado',500.00),(8,1,1,'2026-08-02 16:08:04','Contado',500.00),(10,2,1,'2026-08-05 21:21:56','Contado',4050.00),(11,1,1,'2026-08-11 14:13:33','Contado',150.00),(12,1,1,'2026-08-22 16:15:06','Contado',450.00),(13,1,1,'2026-08-22 19:15:34','Contado',1200.00),(14,1,1,'2026-08-22 19:29:04','Transferencia',1200.00),(15,1,1,'2026-08-22 19:48:26','Transferencia',350.00),(16,1,1,'2026-08-22 19:49:05','Contado',350.00),(17,1,1,'2026-08-23 23:03:39','Contado',1800.00),(18,1,1,'2026-08-23 23:05:01','Contado',10500.00),(19,10,1,'2026-08-23 23:08:54','Contado',2500.00),(20,10,1,'2026-08-24 08:35:41','Contado',7100.00),(21,10,1,'2026-08-24 10:20:00','Contado',3000.00),(22,10,1,'2026-08-24 10:22:05','Transferencia',3000.00),(23,1,1,'2026-08-29 13:33:13','Credito',3000.00),(24,5,1,'2026-08-29 13:34:28','Credito',3000.00),(25,10,1,'2026-08-29 14:40:48','Contado',3000.00),(26,10,1,'2026-08-29 14:41:46','Contado',300.00),(27,10,1,'2026-08-29 14:42:01','Contado',300.00),(28,10,1,'2026-08-29 16:24:47','Contado',1500.00),(29,10,1,'2026-08-29 16:28:25','Contado',1500.00),(30,10,1,'2026-08-29 16:29:24','Contado',1500.00),(31,10,1,'2026-08-29 16:30:10','Contado',1500.00),(32,10,1,'2026-08-29 16:30:11','Contado',1500.00),(33,10,1,'2026-08-29 16:33:07','Contado',1500.00),(34,10,1,'2026-08-29 16:33:09','Contado',1500.00),(35,10,1,'2026-08-29 16:33:53','Contado',1500.00),(36,10,1,'2026-08-29 16:34:44','Contado',1500.00),(37,10,1,'2026-08-29 16:39:06','Contado',1500.00),(38,10,1,'2026-08-29 16:39:29','Contado',200.00),(39,10,1,'2026-08-29 16:40:58','Contado',300.00),(40,10,1,'2026-08-29 16:41:19','Contado',300.00),(41,10,1,'2026-08-29 16:41:58','Contado',230.00),(42,10,1,'2026-08-29 16:42:23','Contado',230.00),(43,10,1,'2026-08-29 16:43:27','Contado',230.00),(44,10,1,'2026-08-29 16:44:08','Contado',300.00);
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_ventas_sesiones` AFTER INSERT ON `ventas` FOR EACH ROW BEGIN

    UPDATE sesiones_caja
    SET
        total_ingresos_sistema =
            total_ingresos_sistema +
            CASE
                WHEN NEW.Tipo_Pago = 'Contado'
                THEN NEW.Total
                ELSE 0
            END,

        total_tarjeta_transferencia =
            total_tarjeta_transferencia +
            CASE
                WHEN NEW.Tipo_Pago = 'Transferencia'
                THEN NEW.Total
                ELSE 0
            END

    WHERE estado = 'Abierta'
    LIMIT 1;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-30 16:49:25

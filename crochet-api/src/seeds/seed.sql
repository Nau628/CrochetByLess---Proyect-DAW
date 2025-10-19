-- ==========================================================
-- Crochet By Less - Seed de base de datos (idempotente)
-- Ejecuta en MySQL / phpMyAdmin
-- ==========================================================

CREATE DATABASE IF NOT EXISTS crochetbyless
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE crochetbyless;

-- =======================
-- Tablas
-- =======================

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email),
  INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB;

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre_categoria VARCHAR(80) NOT NULL,
  UNIQUE KEY uq_nombre_categoria (nombre_categoria)
) ENGINE=InnoDB;

-- Productos
CREATE TABLE IF NOT EXISTS productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT NULL,
  nombre_producto VARCHAR(160) NOT NULL,
  descripcion TEXT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  color VARCHAR(60) NULL,
  imagen_url VARCHAR(255) NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prod_cat
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Imágenes de producto (galería)
CREATE TABLE IF NOT EXISTS producto_imagenes (
  id_imagen INT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  orden INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_img_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_img_producto (id_producto),
  INDEX idx_img_orden (orden)
) ENGINE=InnoDB;

-- Pedidos personalizados
CREATE TABLE IF NOT EXISTS pedidos_personalizados (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT NULL,
  nombre_cliente VARCHAR(120) NOT NULL,
  telefono_cliente VARCHAR(20) NOT NULL,
  color_preferido VARCHAR(60) NULL,
  talla VARCHAR(40) NULL,
  descripcion_detalle TEXT NULL,
  imagen_referencia VARCHAR(255) NULL,
  estado ENUM('pendiente','en_proceso','completado') NOT NULL DEFAULT 'pendiente',
  fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedido_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_pedido_estado (estado),
  INDEX idx_pedido_fecha (fecha_pedido)
) ENGINE=InnoDB;

-- =======================
-- Datos base
-- =======================

-- Categorías (INSERT IGNORE para idempotencia)
INSERT IGNORE INTO categorias (nombre_categoria) VALUES
  ('Personalizados'), ('Ramos de flores'), ('Amigurumis');

-- Productos (con subselects para NO depender de IDs fijos)
-- Personalizados (llaveros)
INSERT INTO productos (id_categoria, nombre_producto, descripcion, precio, stock, color, imagen_url)
SELECT c.id_categoria, 'Llavero Minions', 'Llavero personalizado con inicial', 4.50, 10, 'Menta', '/img/personalizados/personalizado1.jpg'
FROM categorias c WHERE c.nombre_categoria='Personalizados'
UNION ALL
SELECT c.id_categoria, 'Llavero snoopy', 'Hecho a crochet con amor', 4.50, 12, 'Rosa', '/img/personalizados/personalizado2.jpg'
FROM categorias c WHERE c.nombre_categoria='Personalizados'
UNION ALL
SELECT c.id_categoria, 'Llavero Snoopy chef', 'Flor pequeña a crochet', 4.50, 12, 'Lila', '/img/personalizados/personalizado3.jpg'
FROM categorias c WHERE c.nombre_categoria='Personalizados'
UNION ALL
SELECT c.id_categoria, 'Llavero Snoopy columpio', 'Estrella tierna a crochet', 4.50, 10, 'Amarillo', '/img/personalizados/personalizado4.jpg'
FROM categorias c WHERE c.nombre_categoria='Personalizados';

-- Ramos de flores
INSERT INTO productos (id_categoria, nombre_producto, descripcion, precio, stock, color, imagen_url)
SELECT c.id_categoria, 'Ramo Primavera', 'Ramo con tonos pastel', 15.00, 6, 'Multicolor', '/img/ramos/ramo1.jpg'
FROM categorias c WHERE c.nombre_categoria='Ramos de flores'
UNION ALL
SELECT c.id_categoria, 'Ramo Dulce', 'Ramo con rosas en crochet', 18.00, 5, 'Rosa', '/img/ramos/ramo2.jpg'
FROM categorias c WHERE c.nombre_categoria='Ramos de flores'
UNION ALL
SELECT c.id_categoria, 'Ramo Amor', 'Ramo con corazón', 20.00, 4, 'Rojo', '/img/ramos/ramo3.jpg'
FROM categorias c WHERE c.nombre_categoria='Ramos de flores'
UNION ALL
SELECT c.id_categoria, 'Ramo Cálido', 'Ramo tonos cálidos', 22.00, 3, 'Naranja', '/img/ramos/ramo4.jpg'
FROM categorias c WHERE c.nombre_categoria='Ramos de flores';

-- Amigurumis
INSERT INTO productos (id_categoria, nombre_producto, descripcion, precio, stock, color, imagen_url)
SELECT c.id_categoria, 'Amigurumi Pareja', 'Osito tierno', 12.50, 8, 'Beige', '/img/amigurumis/amigurumi1.jpg'
FROM categorias c WHERE c.nombre_categoria='Amigurumis'
UNION ALL
SELECT c.id_categoria, 'Amigurumi Novia', 'Conejito suave', 12.50, 7, 'Blanco', '/img/amigurumis/amigurumi2.jpg'
FROM categorias c WHERE c.nombre_categoria='Amigurumis'
UNION ALL
SELECT c.id_categoria, 'Amigurumi niña', 'Gatito dormilón', 12.50, 6, 'Gris', '/img/amigurumis/amigurumi3.jpg'
FROM categorias c WHERE c.nombre_categoria='Amigurumis'
UNION ALL
SELECT c.id_categoria, 'Amigurumi Spiderman', 'Perrito amigo', 12.50, 6, 'Café', '/img/amigurumis/amigurumi4.jpg'
FROM categorias c WHERE c.nombre_categoria='Amigurumis';

-- Evita duplicados si corres varias veces (basado en nombre)
DELETE p1 FROM productos p1
JOIN productos p2
  ON p1.nombre_producto = p2.nombre_producto
 AND p1.id_producto > p2.id_producto;

-- Galerías por nombre de producto (subselect a id_producto)
INSERT IGNORE INTO producto_imagenes (id_producto, url, orden)
SELECT p.id_producto, '/img/personalizados/personalizado1.jpg', 1
FROM productos p WHERE p.nombre_producto='Llavero Minions'
UNION ALL
SELECT p.id_producto, '/img/personalizados/personalizado2.jpg', 1
FROM productos p WHERE p.nombre_producto='Llavero snoopy'
UNION ALL
SELECT p.id_producto, '/img/personalizados/personalizado3.jpg', 1
FROM productos p WHERE p.nombre_producto='Llavero Snoopy chef'
UNION ALL
SELECT p.id_producto, '/img/personalizados/personalizado4.jpg', 1
FROM productos p WHERE p.nombre_producto='Llavero Snoopy columpio'
UNION ALL
SELECT p.id_producto, '/img/ramos/ramo1.jpg', 1
FROM productos p WHERE p.nombre_producto='Ramo Primavera'
UNION ALL
SELECT p.id_producto, '/img/ramos/ramo2.jpg', 1
FROM productos p WHERE p.nombre_producto='Ramo Dulce'
UNION ALL
SELECT p.id_producto, '/img/ramos/ramo3.jpg', 1
FROM productos p WHERE p.nombre_producto='Ramo Amor'
UNION ALL
SELECT p.id_producto, '/img/ramos/ramo4.jpg', 1
FROM productos p WHERE p.nombre_producto='Ramo Cálido'
UNION ALL
SELECT p.id_producto, '/img/amigurumis/amigurumi1.jpg', 1
FROM productos p WHERE p.nombre_producto='Amigurumi Pareja'
UNION ALL
SELECT p.id_producto, '/img/amigurumis/amigurumi2.jpg', 1
FROM productos p WHERE p.nombre_producto='Amigurumi Novia'
UNION ALL
SELECT p.id_producto, '/img/amigurumis/amigurumi3.jpg', 1
FROM productos p WHERE p.nombre_producto='Amigurumi niña'
UNION ALL
SELECT p.id_producto, '/img/amigurumis/amigurumi4.jpg', 1
FROM productos p WHERE p.nombre_producto='Amigurumi Spiderman';

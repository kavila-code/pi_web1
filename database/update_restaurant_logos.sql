-- Actualizar logos de restaurantes existentes

UPDATE restaurants SET logo_url = '/IMAGENES/RESTAURANTES/LA%20BELLA%20ITALIA.jpg' WHERE name = 'Pizza Palace';
UPDATE restaurants SET logo_url = '/IMAGENES/RESTAURANTES/burger-master.jpg' WHERE name = 'Burger House';
UPDATE restaurants SET logo_url = '/IMAGENES/RESTAURANTES/SAKURA%20SUSHI.jpg' WHERE name = 'Sushi Zen';
UPDATE restaurants SET logo_url = '/IMAGENES/RESTAURANTES/taco-fiesta.jpg' WHERE name = 'Tacos El Charro';
UPDATE restaurants SET logo_url = '/IMAGENES/RESTAURANTES/parrilla.jpg' WHERE name = 'La Parrilla';

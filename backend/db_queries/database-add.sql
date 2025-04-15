USE cs308;

INSERT INTO Categories (name, image_url, is_active) VALUES
('Rings', 'https://sainttracy.com/cdn/shop/products/JUNEDIAMONDENGAGEMENTRING_09fa3e82-c58a-47a4-992a-c53bceddf4d4_700x.jpg?v=1682327491', TRUE),
('Necklaces', 'https://www.hayrendis.com/wp-content/uploads/2023/12/tasli-kolye.jpg', TRUE),
('Bracelets', 'https://theartofpandora.com/wp-content/uploads/2020/08/pandora-old-two-tone-14k-gold-768x576.jpg', TRUE),
('Earrings', '', FALSE),
('Watches', '', TRUE);

INSERT INTO Products (name, category_id, price, cost_price, quantity_in_stock, description, model, serial_number, warranty_status, distributor_info, visibility, image_url) VALUES
-- Rings (category_id = 1)
('Gold Ring', 1, 120.00, 60.00, 10, 'A stunning gold ring with diamond setting.', 'GR-2023', 'GR12345', TRUE, 'Luxury Gems Distributor', TRUE, 'https://sainttracy.com/cdn/shop/products/JUNEDIAMONDENGAGEMENTRING_09fa3e82-c58a-47a4-992a-c53bceddf4d4_700x.jpg?v=1682327491'),
('Emerald Ring', 1, 145.00, 72.50, 5, 'A beautiful emerald ring.', 'ER-2023', 'ER12346', TRUE, 'Emerald Imports Inc.', TRUE, 'https://i.etsystatic.com/15408855/r/il/5248c7/3514140148/il_570xN.3514140148_o41t.jpg'),
('Diamond Ring', 1, 950.00, 600, 1, 'A beautiful diamond ring.', '---', '---', TRUE, 'Diamond A.S.', TRUE, 'https://w7.pngwing.com/pngs/924/741/png-transparent-diamond-wedding-ring-engagement-ring-brilliant-diamond-gemstone-ring-diamond-thumbnail.png'),
('Vintage Silver Ring', 1, 90.00, 45.00, 8, 'A vintage-style silver ring.', 'VSR-2023', 'VSR12347', TRUE, 'Vintage Treasures Ltd.', TRUE, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNycvq4Mro9XSEx0_dgZXIh-bxwBTyv0anxQ&s'),
('Secret Ring', 1, 1.00, 1, 1, 'This item is not visible.', 'ER-xxx2', 'ERxxxx2', FALSE, 'Not Produced Yet', FALSE, 'https://via.placeholder.com/300x400?text=Secret+Ring'),
-- Necklaces (category_id = 2)
('Silver Necklace', 2, 95.00, 47.50, 12, 'Elegant silver necklace.', 'SN-2023', 'SN12348', TRUE, 'Silver Crafts Co.', TRUE, 'https://via.placeholder.com/300x400?text=Silver+Necklace'),
('Pearl Choker', 2, 135.00, 67.50, 6, 'Classic pearl choker necklace.', 'PC-2023', 'PC12349', TRUE, 'Ocean Pearls Ltd.', TRUE, 'https://via.placeholder.com/300x400?text=Pearl+Choker'),
('Gold Pendant Necklace', 2, 160.00, 80.00, 7, 'Gold pendant necklace with delicate chain.', 'GPN-2023', 'GPN12350', TRUE, 'Golden Treasures Inc.', TRUE, 'https://via.placeholder.com/300x400?text=Gold+Pendant'),
-- Bracelets (category_id = 3)
('Diamond Bracelet', 3, 150.00, 75.00, 4, 'Diamond-studded bracelet.', 'DB-2023', 'DB12351', TRUE, 'Diamond Elite Distributors', TRUE, 'https://via.placeholder.com/300x400?text=Diamond+Bracelet'),
('Beaded Bracelet', 3, 75.00, 37.50, 10, 'Colorful beaded bracelet.', 'BB-2023', 'BB12352', TRUE, 'Artisan Beads Co.', TRUE, 'https://via.placeholder.com/300x400?text=Beaded+Bracelet'),
('Cuff Bracelet', 3, 110.00, 55.00, 9, 'Bold metallic cuff bracelet.', 'CB-2023', 'CB12353', TRUE, 'Metal Works Ltd.', TRUE, 'https://via.placeholder.com/300x400?text=Cuff+Bracelet');

SELECT * FROM users;
SELECT * FROM categories;
SELECT * FROM products;
SELECT * FROM orders;
SELECT * FROM order_items;
SELECT * FROM returns;
SELECT * FROM comments;
SELECT * FROM ratings;
SELECT * FROM wishlist;
SELECT * FROM shopping_cart;
SELECT * FROM cart_items;




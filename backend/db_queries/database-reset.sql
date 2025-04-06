USE cs308;

-- Disable foreign key checks temporarily to avoid constraint errors
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables
TRUNCATE TABLE UserSessions;
TRUNCATE TABLE Cart_Items;
TRUNCATE TABLE Shopping_Cart;
TRUNCATE TABLE Wishlist;
TRUNCATE TABLE Ratings;
TRUNCATE TABLE Comments;
TRUNCATE TABLE Returns;
TRUNCATE TABLE Order_Items;
TRUNCATE TABLE Orders;
TRUNCATE TABLE Products;
TRUNCATE TABLE Categories;
TRUNCATE TABLE Users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
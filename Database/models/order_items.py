from Database.db import db


class Order_Items(db.Model):
    __tablename__ = "Order_Items"

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Order_Id = db.Column(db.Integer, db.ForeignKey("Orders.Id"), nullable=False)
    Product_Id = db.Column(db.Integer, db.ForeignKey("Product.Id"), nullable=False)
    Quantity = db.Column(db.Integer, nullable=False)

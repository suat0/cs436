from Database.db import db
from sqlalchemy import DECIMAL
from datetime import datetime


class Product(db.Model):
    __tablename__ = "Product"

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Name = db.Column(db.String(255), nullable=False)
    Product_Category_Id = db.Column(db.Integer, db.ForeignKey("ProductCategory.Id"), nullable=False)
    Product_Manager_Id = db.Column(db.Integer, db.ForeignKey("Users.Id"))
    Sales_Manager_Id = db.Column(db.Integer, db.ForeignKey("Users.Id"))
    Base_Price = db.Column(DECIMAL(10, 2))
    Entry_Price = db.Column(DECIMAL(10, 2))
    Current_Price = db.Column(DECIMAL(10, 2))
    Quantity_In_Stocks = db.Column(db.Integer)
    Description = db.Column(db.Text)
    Model = db.Column(db.String(255))
    Serial_Number = db.Column(db.String(255))
    Warranty_Status = db.Column(db.String(100))
    Distributor_Info = db.Column(db.String(255))
    Date = db.Column(db.DateTime, default=datetime.utcnow)
    Product_Image = db.Column(db.String(255))

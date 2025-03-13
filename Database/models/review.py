from Database.db import db
from datetime import datetime


class Review(db.Model):
    __tablename__ = "Review"

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Product_Id = db.Column(db.Integer, db.ForeignKey("Product.Id"), nullable=False)
    User_Id = db.Column(db.Integer, db.ForeignKey("Users.Id"), nullable=False)
    Comment = db.Column(db.Text)
    Rating = db.Column(db.Integer)
    Date = db.Column(db.DateTime, default=datetime.utcnow)

from Database.db import db


class ProductCategory(db.Model):
    __tablename__ = "ProductCategory"

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Owner_Id = db.Column(db.Integer, db.ForeignKey("Users.Id"), nullable=False)
    Name = db.Column(db.String(255), nullable=False)

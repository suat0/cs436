from Database.db import db
from sqlalchemy import Enum
import enum


class RoleEnum(enum.Enum):
    CUSTOMER = "Customer"
    PRODUCT_MANAGER = "Product manager"
    SALES_MANAGER = "Sales manager"


class Users(db.Model):
    __tablename__ = "Users"

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255), nullable=False, unique=True)
    Password = db.Column(db.String(255), nullable=False)
    Address = db.Column(db.String(255))
    Role = db.Column(Enum(RoleEnum), nullable=False)

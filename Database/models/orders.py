from Database.db import db
from sqlalchemy import DECIMAL, Enum
import enum


class DeliveryStatusEnum(enum.Enum):
    COMPLETED = "completed"
    PENDING = "pending"


class Orders(db.Model):
    __tablename__ = "Orders"

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Customer_Id = db.Column(db.Integer, db.ForeignKey("Users.Id"), nullable=False)
    Total_Price = db.Column(DECIMAL(10, 2))
    Delivery_Address = db.Column(db.String(255))
    Delivery_Status = db.Column(Enum(DeliveryStatusEnum), default=DeliveryStatusEnum.PENDING)

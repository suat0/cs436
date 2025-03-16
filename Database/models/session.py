from Database.db import db


class Session(db.Model):
    __tablename__ = "Session"

    Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    User_Id = db.Column(db.Integer, db.ForeignKey("Users.Id"), nullable=False)
    Token = db.Column(db.String(255), nullable=False)

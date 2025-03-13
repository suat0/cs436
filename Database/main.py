import os
import pymysql
from Database.db import db
from flask import Flask

# Name is 308group
# Password is Group35
# Need to create a scheme named mydatabase


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://308group:Group35@localhost/mydatabase"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    return app


if __name__ == "__main__":
    try:
        connection = pymysql.connect(host="localhost", user="308group", password="Group35")
        cursor = connection.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS mydatabase")
        connection.commit()
        cursor.close()
        connection.close()
        print("Database 'mydatabase' ensured.")
    except Exception as e:
        print("Error creating database:", e)
        exit(1)


    app = create_app()
    with app.app_context():
        from Database.models import users, product, product_category, orders, order_items, review, session
        db.create_all()
        print("All tables created successfully.")

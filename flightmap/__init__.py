from flask import Flask
from flightmap.views import client


app = Flask(__name__)
app.register_blueprint(client)
app.config.from_object('flightmap.config')

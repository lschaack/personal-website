from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/minesweeper/')
def minesweeper():
    return render_template('minesweeper.html')
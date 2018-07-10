from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

########## Projects ##########
# clientside minesweeper game
@app.route('/minesweeper/')
def minesweeper():
    return render_template('minesweeper.html')

@app.route('/mockingbird/', methods=['GET', 'POST'])
def minesweeper():
    if request.method == 'POST':
        # do something
    else:
        return render_template('mockingbird.html')

########## Writing ##########
# technical writing sample
@app.route('/technical/')
def technical():
    return render_template('technical.html')

# rhetorical writing sample
@app.route('/rhetorical/')
def rhetorical():
    return render_template('rhetorical.html')

# descriptive writing sample
@app.route('/descriptive/')
def descriptive():
    return render_template('descriptive.html')
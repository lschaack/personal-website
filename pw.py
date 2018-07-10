from flask import url_for, render_template, Flask, request, redirect, flash
from werkzeug.utils import secure_filename
from grammar import grammar_processor, grammar_consts
import sys
import os

UPLOAD_FOLDER = '/grammar/processed'
ALLOWED_EXTENSIONS = set(['txt']) # in case I want to add more later

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process(filename):
    # get formatted text
    formatter = grammar_processor.Formatter(filename)
    formatted = formatter.get_formatted()
    # create the tree which will represent all sentence structures within text
    senTree = grammar_processor.SentenceTree()
    # create sentence tree and necessary dictionaries
    processor = grammar_processor.GrammarProcessor(formatted, senTree) 
    return processor

def generate(processed, repeat):
    generated = []
    for _ in range(repeat):
        sentence = processed.generate(processed.root).strip()
        for word in sentence.split():
            if word in grammar_consts.ME:
                sentence = sentence.replace(' ' + word + ' ', ' ' + word.title() + ' ')
        # join spaces on punctuation
        sentence = sentence.replace(' ,', ',')
        sentence = sentence.replace(' .', '.')
        # add to list of sentences
        generated.append(sentence[:1].title() + sentence[1:] + '.')
    return generated

@app.route('/')
def index():
    return render_template('index.html')

########## Projects ##########
# clientside minesweeper game
@app.route('/minesweeper/')
def minesweeper():
    return render_template('minesweeper.html')

# text mimicker
# this one needs to accept files to mimic, as well as arguments for generation
@app.route('/mockingbird/', methods=['GET', 'POST'])
def mockingbird():
    if request.method == 'POST':
        # TODO: add a selection of existing files
        print('\n\n\n{}\n\n\n'.format(request.form))
        ### grab file, first part directly from:
        ###    http://flask.pocoo.org/docs/1.0/patterns/fileuploads/
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser will also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            # ensure safe filename
            filename = secure_filename(file.filename)
            # temporarily save file
            fullpath = os.path.dirname(sys.argv[0])[:-3] + filename
            file.save(fullpath)
            # get object representing processed text
            processed = process(fullpath)
            sentences = generate(processed, int(request.form['repeat']))
            # get rid of the file so it doesn't clog up my system
            os.remove(fullpath)
            return render_template('mockingbird.html', sentences=sentences)
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
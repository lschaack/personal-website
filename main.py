from flask import url_for, render_template, Flask, request, redirect, flash
from werkzeug.utils import secure_filename
from grammar import grammar_processor, grammar_consts
from google.appengine.api import app_identity
from google.cloud import storage
import cloudstorage as gcs
import logging
import sys
import os

# get Google Cloud Storage bucket
DEFAULT_BUCKET = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())
ALLOWED_EXTENSIONS = set(['txt']) # in case I want to add more later

app = Flask(__name__)
app.config['CLOUD_STORAGE_BUCKET'] = DEFAULT_BUCKET
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 # 100kb

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_txt_file(file):
    ### grab file, first part largely from:
    ###    http://flask.pocoo.org/docs/1.0/patterns/fileuploads/

    # check if the post request has the file part
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    # if user does not select file, browser will also
    # submit an empty part without filename
    elif file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    elif not allowed_file(file.filename):
        return None
    
    # ensure safe filename
    filename = secure_filename(file.filename)
    logging.info("#" * 50)
    logging.info("getting client")
    storage_client = storage.Client()
    logging.info("got client, getting bucket")
    bucket = storage_client.get_bucket(DEFAULT_BUCKET)
    logging.info("got bucket")
    blob = bucket.blob(filename)
    logging.info("made blob, uploading file %s", filename)

    blob.upload_from_filename(filename)

    logging.info("Uploaded file %s as %s.", filename, public_url)

    return public_url

def process(lines):
    # get formatted text
    formatter = grammar_processor.Formatter(lines)
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

########## About ##########
@app.route('/')
def index():
    return render_template('index.html')

########## Projects ##########
# clientside minesweeper game
@app.route('/minesweeper/')
def minesweeper():
    return render_template('minesweeper.html')

# gliding flight simulator #
@app.route('/simpleflight/')
def simpleflight():
    return render_template('simpleflight.html')

# text mimicker
# this one needs to accept files to mimic, as well as arguments for generation
@app.route('/mockingbird/', methods=['GET', 'POST'])
def mockingbird():
    if request.method == 'POST':
        # TODO: add a selection of existing files
        public_url = upload_txt_file(request.files['file'])

        lines = [] # for scope

        with gcs.open(public_url, 'r') as file:
            logging.info("reading lines")
            lines = file.readlines()
        try:
            gcs.delete(public_url)
        except gcs.NotFoundError:
            pass

        # get object representing processed text
        processed = process(lines)
        sentences = generate(processed, int(request.form['repeat']))
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

########## Contact ##########
@app.route('/donottouch/')
def donottouch():
    return render_template('donottouch.html')

########## Resume ##########
@app.route('/resume/')
def resume():
    return render_template('resume.html')
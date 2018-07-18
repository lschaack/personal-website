from flask import url_for, render_template, Flask, request, redirect, flash
from werkzeug.utils import secure_filename
from grammar import grammar_processor, grammar_consts
from google.appengine.api import app_identity
# from google.cloud import storage
import cloudstorage as gcs
import logging
import codecs
import sys
import os
os.environ["PYTHONIOENCODING"] = "utf-8"

# # uncomment for debugging
# try:
#   import googleclouddebugger
#   googleclouddebugger.enable()
# except ImportError:
#   pass

# get Google Cloud Storage bucket
DEFAULT_BUCKET = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())
ALLOWED_EXTENSIONS = set(['txt']) # in case I want to add more later
MAX_CONTENT_LENGTH = 100 * 1024 # 100kb

app = Flask(__name__)
app.config['CLOUD_STORAGE_BUCKET'] = DEFAULT_BUCKET


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_txt_file(file):
    ### grab file, first part largely from:
    ###    http://flask.pocoo.org/docs/1.0/patterns/fileuploads/

    # if user does not select file, browser will also
    # submit an empty part without filename
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    elif not allowed_file(file.filename):
        return None

    filename = secure_filename(file.filename)
    fullpath = '/{}/{}'.format(DEFAULT_BUCKET, filename)

    contents = file.read()
    try:
        contents = contents.decode('utf-8', 'backslashreplace')
    except UnicodeEncodeError:
        contents = contents.decode('iso-8859-1', 'backslashreplace')

    write_retry_params = gcs.RetryParams(backoff_factor=1.1)
    logging.info("Writing to /{}/{}".format(DEFAULT_BUCKET, filename))
    gcs_file = gcs.open(
        fullpath,
        'w',
        content_type='text/plain, charset=utf-8;',
        retry_params=write_retry_params
    )
    gcs_file.write(contents.encode('utf-8', 'backslashreplace'))
    gcs_file.close()

    logging.info("Uploaded file %s.", filename)

    return fullpath

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
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)

        filename = upload_txt_file(request.files['file'])

        lines = [] # for scope

        logging.info("Reading file contents...")
        with gcs.open(filename, 'r') as file:
            lines = unicode(file.read(), 'utf-8').splitlines()
        try:
            logging.info("Deleting file from google cloud drive...")
            gcs.delete(filename)
        except gcs.NotFoundError:
            pass
        logging.info("File successfully read and removed.")

        logging.info("Processing files...")
        # get object representing processed text
        processed = process(lines)
        logging.info("File processed, generating...")
        sentences = generate(processed, int(request.form['repeat']))
        logging.info("Sentences successfully generated.")
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
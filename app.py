from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chinesePage')
def chinesePage():
    return render_template('chinesePage.html')

@app.route('/englishPage')
def englishPage():
    return render_template('englishPage.html')

@app.route('/draw')
def draw():
    return render_template('draw.html')

if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, render_template
from chinesePage import chinese_page

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# 注册诗词写作页面蓝图
app.register_blueprint(chinese_page, url_prefix='/')


@app.route('/englishPage')
def englishPage():
    return render_template('englishPage.html')

@app.route('/draw')
def draw():
    return render_template('draw.html')

if __name__ == '__main__':
    app.run(debug=True)
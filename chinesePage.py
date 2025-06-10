# chinese_page.py
from flask import Blueprint, render_template, jsonify, request
import json
import os
from werkzeug.utils import secure_filename

# 创建蓝图
chinese_page = Blueprint(
    "chinese_page", __name__, template_folder="templates", static_folder="static"
)

# 模拟数据存储
data_dir = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(data_dir, exist_ok=True)

# 配置上传文件夹
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 允许的文件扩展名
ALLOWED_EXTENSIONS = {"pdf"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# 文件上传路由
@chinese_page.route("/api/upload-pdf", methods=["POST"])
def upload_pdf():
    # 检查请求中是否包含文件
    if "pdfFile" not in request.files:
        return jsonify({"success": False, "message": "没有文件部分"}), 400

    file = request.files["pdfFile"]

    # 检查文件名
    if file.filename == "":
        return jsonify({"success": False, "message": "未选择文件"}), 400

    # 检查文件类型
    if not allowed_file(file.filename):
        return (
            jsonify({"success": False, "message": "不允许的文件类型，只允许PDF文件"}),
            400,
        )

    # 安全处理文件名
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    # 保存文件
    file.save(file_path)

    # 这里可以添加对PDF文件的处理逻辑
    # 例如提取文本、生成预览图等

    return jsonify(
        {
            "success": True,
            "message": "文件上传成功",
            "filename": filename,
            "file_path": file_path,
        }
    )


# 路由：返回中文学习页面
@chinese_page.route("/chinesePage")
def index():
    return render_template("chinesePage.html")


# 路由：获取智能评分数据
@chinese_page.route("/api/scoring")
def get_scoring_data():
    # 这里可以从数据库或文件中读取数据
    scoring_data = {
        "overall_score": 86,
        "ratings": [
            {"title": "整体结构", "score": "40/50", "progress": 80},
            {"title": "语言表达", "score": "32/40", "progress": 80},
            {"title": "意境呈现", "score": "14/20", "progress": 70},
        ],
    }
    return jsonify(scoring_data)


# 路由：获取读写共生数据
@chinese_page.route("/api/reading")
def get_reading_data():
    # 这里可以从数据库或文件中读取数据
    # 示例数据
    reading_data = [
        {
            "title": "《活着》",
            "author": "余华",
            "description": "一部充满人性光辉的生命史诗，学习如何用简洁文字表达深刻情感...",
            "rating": 9.4,
            "image": "/static/img/活着.png",
        },
        {
            "title": "《平凡的世界》",
            "author": "路遥",
            "description": "一部反映中国当代城乡社会生活的史诗作品，展现普通人的奋斗与成长...",
            "rating": 9.7,
            "image": "/static/img/平凡的世界.png",
        },
        {
            "title": "《红楼梦》",
            "author": "曹雪芹",
            "description": "中国古典文学巅峰之作，学习复杂人物描写和情节架构的绝佳范本...",
            "rating": 9.5,
            "image": "/static/img/红楼梦.png",
        },
        {
            "title": "《围城》",
            "author": "钱钟书",
            "description": "讽刺文学的经典之作，学习精妙比喻和幽默讽刺的表达技巧...",
            "rating": 8.9,
            "image": "/static/img/围城.png",
        },
    ]
    return jsonify(reading_data)


# 路由：提交作文评分
@chinese_page.route("/api/submit_essay", methods=["POST"])
def submit_essay():
    data = request.json
    essay_content = data.get("content", "")

    import random

    score = random.randint(60, 100)

    # 保存作文内容
    essay_id = f"essay_{random.randint(1000, 9999)}"
    essay_file = os.path.join(data_dir, f"{essay_id}.json")
    with open(essay_file, "w", encoding="utf-8") as f:
        json.dump(
            {
                "id": essay_id,
                "content": essay_content,
                "timestamp": data.get("timestamp"),
                "score": score,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

    return jsonify({"success": True, "essay_id": essay_id, "score": score})

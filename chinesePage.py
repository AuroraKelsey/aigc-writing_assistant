# chinese_page.py
from flask import Blueprint, render_template, jsonify, request
import json
import os
import datetime

# 创建蓝图
chinese_page = Blueprint(
    "chinese_page", __name__, template_folder="templates", static_folder="static"
)

# 模拟数据存储
data_dir = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(data_dir, exist_ok=True)

# chinese_page.py
# 在已有代码基础上添加以下路由

# 路由：接收诗词提交
@chinese_page.route("/api/submit-poem", methods=["POST"])
def submit_poem():
    try:
        # 获取前端提交的JSON数据
        data = request.get_json()
        
        # 获取诗词题目和内容
        title = data.get("title")
        content = data.get("content")
        
        # 验证数据是否存在
        if not title or not content:
            return jsonify({
                "success": False,
                "message": "诗词题目和内容不能为空"
            }), 400
        
        # 保存数据到文件（实际应用中应存储到数据库）
        poem_data = {
            "title": title,
            "content": content,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        file_path = os.path.join(data_dir, f"{title.replace(' ', '_')}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(poem_data, f, ensure_ascii=False, indent=2)
        
        # 返回成功响应
        return jsonify({
            "success": True,
            "message": "诗词提交成功",
            "data": {
                "title": title,
                "preview": content[:50] + "..." if len(content) > 50 else content
            }
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"服务器错误: {str(e)}"
        }), 500

# 路由：返回中文学习页面
@chinese_page.route("/chinesePage")
def index():
    return render_template("chinesePage.html")


# 路由：获取智能评分数据
@chinese_page.route("/api/scoring")
def get_scoring_data():
    # 这里可以从数据库或文件中读取数据
    scoring_data = {
        "overall_score": 84,
        "ratings": [
            {"title": "整体结构", "score": "38/50", "progress": 80},
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

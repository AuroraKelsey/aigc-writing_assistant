## 环境配置：
conda create -n <name> python=3.13
conda activate <name>
pip install -r requirements.txt

或者直接：
conda <name> create -f  myenv.yml
conda activate <name>

## 数据库配置：
python init_db.py

### 管理员登录：
用户名：123
密码：123

## 运行后端：
python app.py

## 访问前端：
http://127.0.0.1:5000/
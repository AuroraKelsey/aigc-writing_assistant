document.addEventListener('DOMContentLoaded', function () {
    // 1. 移动端菜单切换
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    menuToggle.addEventListener('click', function () {
        mobileMenu.classList.toggle('block');
    });

    // 2. 功能标签页切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const subpages = document.querySelectorAll('.subpage');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // 移除所有按钮的活动状态
            tabBtns.forEach(b => b.classList.remove('tab-active'));
            // 隐藏所有子页面
            subpages.forEach(page => page.classList.remove('block'));

            // 添加当前按钮的活动状态
            this.classList.add('tab-active');

            // 显示目标子页面
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('block');
        });
    });

    // 3. 诗词提交
    // 获取诗词输入元素
    const poemTitleInput = document.getElementById('poemTitle');
    const poemContentInput = document.getElementById('poemContent');
    const submitBtn = document.getElementById('submitPoem');
    const errorMessage = document.getElementById('errorMessage');

    // 提交诗词处理
    submitBtn.addEventListener('click', function () {
        const title = poemTitleInput.value.trim();
        const content = poemContentInput.value.trim();

        // 验证输入
        if (!title) {
            showError('请输入诗词题目');
            return;
        }

        if (!content) {
            showError('请输入诗词内容');
            return;
        }

        // 清除错误信息
        errorMessage.style.display = 'none';

        // 显示加载状态
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
        submitBtn.disabled = true;

        // 发送数据到服务器
        submitPoemToServer(title, content);
    });

    // 发送诗词到服务器
    function submitPoemToServer(title, content) {
        fetch('/api/submit-poem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 成功后更新UI
                    console.log(data);
                    // 假设提交成功，然后调用润色功能
                    polishPoem(title, content);
                    // 假设提交成功，然后调用评分功能
                    fetchScoring(title, content);
                    // 获取诗歌推荐
                    fetchRecommendations(content);

                    // 切换到润色标签页
                    document.querySelector('[data-target="editing"]').click();
                } else {
                    showError(data.message || '提交失败');
                }
            })
            .catch(error => {
                console.error('提交错误:', error);
                showError('网络请求失败');
            })
            .finally(() => {
                // 恢复按钮状态
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 提交诗词';
                submitBtn.disabled = false;
            });
    }
    // 获取润色相关元素
    const regeneratePolishBtn = document.getElementById('regeneratePolish');
    const polishStatus = document.getElementById('polishStatus');
    const polishedVersion1 = document.getElementById('polishedVersion1');
    const polishedVersion2 = document.getElementById('polishedVersion2');
    const version1Title = document.getElementById('version1Title');
    const version2Title = document.getElementById('version2Title');

    // 润色功能
    function polishPoem(title, content) {
        // 显示加载状态
        polishStatus.style.display = 'block';
        regeneratePolishBtn.disabled = true;

        // 清空之前的润色结果
        polishedVersion1.textContent = '';
        polishedVersion2.textContent = '';
        version1Title.textContent = title;
        version2Title.textContent = title;

        // 模拟API调用（实际开发中替换为真实API）
        // 这里假设API返回两个润色版本，实际根据后端接口调整
        fetch('/api/polish-poem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 显示润色结果
                    polishedVersion1.textContent = data.polishedContent1 || "润色版本一生成失败";
                    polishedVersion2.textContent = data.polishedContent2 || "润色版本二生成失败";
                } else {
                    polishedVersion1.textContent = "润色失败，请重试";
                    polishedVersion2.textContent = "润色失败，请重试";
                }
            })
            .catch(error => {
                console.error('润色错误:', error);
                polishedVersion1.textContent = "网络错误，请重试";
                polishedVersion2.textContent = "网络错误，请重试";
            })
            .finally(() => {
                // 隐藏加载状态
                polishStatus.style.display = 'none';
                regeneratePolishBtn.disabled = false;
            });
    }

    // 重新润色按钮
    regeneratePolishBtn.addEventListener('click', function () {
        const title = poemTitleInput.value.trim();
        const content = poemContentInput.value.trim();

        if (title && content) {
            polishPoem(title, content);
        } else {
            alert("请先输入诗词内容");
        }
    });
    // chinesePage.js
    // 获取智能评分数据
    function fetchScoring(title, content) {
        fetch('/api/scoring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        })
            .then(response => response.json())
            .then(data => {
                // 更新综合得分
                document.querySelector('.score-number').textContent = data.overall_score;

                // 清空评分容器
                const ratingList = document.querySelector('.rating-list');
                ratingList.innerHTML = '';

                // 创建紧凑的网格布局
                const ratingGrid = document.createElement('div');
                ratingGrid.className = 'rating-grid compact-grid';
                ratingList.appendChild(ratingGrid);

                // 创建所有评分项
                data.ratings.forEach((rating) => {
                    const ratingItem = document.createElement('div');
                    ratingItem.className = 'rating-item compact hover-effect';

                    ratingItem.innerHTML = `
                <div class="rating-title">
                    <i class="fas fa-star"></i>
                    <span>${rating.title}</span>
                    <span class="rating-score">${rating.score}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-value" style="width: ${rating.progress}%"></div>
                </div>
            `;

                    ratingGrid.appendChild(ratingItem);
                });
            })
            .catch(error => console.error('Error fetching scoring data:', error));
    }
    // 获取用户诗词内容并请求推荐
    function fetchRecommendations(content) {
        fetch('/api/recommend-poems', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
        })
            .then(response => response.json())
            .then(data => {
                // 获取读写共生模块容器
                const poemList = document.querySelector('.poem-list');
                poemList.innerHTML = '';

                // 处理推荐结果
                const poems = data.recommendedPoems || [];

                // 如果没有推荐结果或推荐失败，使用默认数据
                if (poems.length === 0) {
                    poems.push({
                        title: "《静夜思》",
                        poet: "李白",
                        content: "床前明月光，疑是地上霜。\n举头望明月，低头思故乡。",
                        summary: "一首表达思乡之情的经典五言绝句"
                    });
                }

                // 创建推荐诗歌项目
                poems.forEach(poem => {
                    const poemItem = document.createElement('div');
                    poemItem.className = 'poem-item hover-effect';

                    // 替换换行符为HTML换行标签
                    const formattedContent = poem.content.replace(/\n/g, '<br>');

                    poemItem.innerHTML = `
                <div class="poem-header">
                    <h4>${poem.title}</h4>
                    <span class="poet">${poem.poet}</span>
                </div>
                <div class="poem-content">
                    ${formattedContent}
                </div>
                <div class="poem-summary">
                    <p>${poem.summary}</p>
                </div>
            `;

                    poemList.appendChild(poemItem);
                });
            })
            .catch(error => {
                console.error('获取推荐失败:', error);
                // 错误处理
                const poemList = document.querySelector('.poem-list');
                poemList.innerHTML = '<p class="error">推荐加载失败，请稍后再试</p>';
            });
    }

});
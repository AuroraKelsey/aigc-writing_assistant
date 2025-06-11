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
    submitBtn.addEventListener('click', function() {
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

    
    // 4. 润色选项切换（如果后续需要）
    const editOptions = document.querySelectorAll('.edit-option');
    editOptions.forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();
            editOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 5. 筛选选项切换
    const filterOptions = document.querySelectorAll('.filter-options input[type="checkbox"]');
    filterOptions.forEach(option => {
        option.addEventListener('change', function () {
            // 这里可以添加筛选逻辑
            console.log('筛选选项改变:', this.nextElementSibling.nextElementSibling.textContent, this.checked);
        });
    });
});

// chinesePage.js

// 获取智能评分数据
fetch('/api/scoring')
    .then(response => response.json())
    .then(data => {
        // 更新综合得分
        const scoreNumber = document.querySelector('.score-number');
        scoreNumber.textContent = data.overall_score;

        // 更新各项评分
        const ratingItems = document.querySelectorAll('.rating-item');
        data.ratings.forEach((rating, index) => {
            const ratingTitle = ratingItems[index].querySelector('.rating-title span');
            const ratingScore = ratingItems[index].querySelector('.rating-score');
            const progressValue = ratingItems[index].querySelector('.progress-value');

            ratingTitle.textContent = rating.title;
            ratingScore.textContent = rating.score;
            progressValue.style.width = `${rating.progress}%`;
        });
    })
    .catch(error => console.error('Error fetching scoring data:', error));

// 获取读写共生数据
fetch('/api/reading')
    .then(response => response.json())
    .then(data => {
        const bookList = document.querySelector('.book-list');
        bookList.innerHTML = '';

        data.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-item', 'hover-effect');

            const bookInfo = document.createElement('div');
            bookInfo.classList.add('book-info');

            const bookTitle = document.createElement('h4');
            bookTitle.textContent = book.title;

            const bookImage = document.createElement('img');
            bookImage.src = book.image;

            const bookAuthor = document.createElement('p');
            bookAuthor.textContent = `${book.author} 著`;

            const bookDescription = document.createElement('p');
            bookDescription.textContent = book.description;

            const bookRatingDiv = document.createElement('div');
            bookRatingDiv.classList.add('book-rating');

            const starRatingDiv = document.createElement('div');
            const fullStars = Math.floor(book.rating);
            const halfStar = book.rating % 1 >= 0.5;
            for (let i = 0; i < fullStars; i++) {
                const star = document.createElement('i');
                star.classList.add('fas', 'fa-star');
                starRatingDiv.appendChild(star);
            }
            if (halfStar) {
                const halfStarIcon = document.createElement('i');
                halfStarIcon.classList.add('fas', 'fa-star-half-alt');
                starRatingDiv.appendChild(halfStarIcon);
            }
            const ratingText = document.createElement('span');
            ratingText.textContent = book.rating;

            bookRatingDiv.appendChild(starRatingDiv);
            bookRatingDiv.appendChild(ratingText);

            bookInfo.appendChild(bookTitle);
            bookInfo.appendChild(bookImage);
            bookInfo.appendChild(bookAuthor);
            bookInfo.appendChild(bookDescription);
            bookInfo.appendChild(bookRatingDiv);

            bookItem.appendChild(bookInfo);
            bookList.appendChild(bookItem);
        });
    })
    .catch(error => console.error('Error fetching reading data:', error));

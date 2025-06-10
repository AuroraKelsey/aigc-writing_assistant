// 添加上传文件到后端的函数
function uploadPdfToServer(file) {

    const formData = new FormData();
    formData.append('pdfFile', file);

    fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 可以在这里处理后端返回的结果
                console.log('服务器返回:', data);
            } else {
                console.log('服务器获取失败');
            }
        })
        .catch(error => {
            console.error('上传错误:', error);
        });
}

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

    // 3. PDF文件上传和预览功能
    const pdfContainer = document.getElementById('pdfContainer');
    const pdfPreview = document.getElementById('pdfPreview');
    const pdfContentContainer = document.querySelector('.pdf-content-container');
    const errorMessage = document.getElementById('errorMessage');
    const uploadPrompt = document.querySelector('.upload-prompt');

    // 支持拖放功能
    pdfContainer.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.style.backgroundColor = '#e3f2fd';
    });

    pdfContainer.addEventListener('dragleave', function () {
        this.style.backgroundColor = '';
    });

    pdfContainer.addEventListener('drop', function (e) {
        e.preventDefault();
        this.style.backgroundColor = '';
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    // 点击上传
    pdfContainer.addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.click();

        input.addEventListener('change', function () {
            if (this.files.length) {
                handleFileUpload(this.files[0]);
            }
        });
    });

    // 文件处理函数
    function handleFileUpload(file) {
        if (file && file.type === 'application/pdf') {
            errorMessage.style.display = 'none';

            // 显示加载状态
            pdfPreview.classList.add('block');
            document.querySelector('.pdf-loading').style.display = 'flex';
            pdfContentContainer.innerHTML = '';

            const reader = new FileReader();

            reader.onload = function (e) {
                const data = new Uint8Array(e.target.result);

                // 使用PDF.js加载PDF
                pdfjsLib.getDocument({ data }).promise.then(function (pdf) {
                    // 隐藏加载提示
                    document.querySelector('.pdf-loading').style.display = 'none';

                    // 隐藏上传提示
                    uploadPrompt.style.display = 'none';

                    // 加载第一页
                    pdf.getPage(1).then(function (page) {
                        // 设置缩放比例
                        const containerWidth = pdfContainer.clientWidth - 60; // 减去padding
                        const scale = containerWidth / page.getViewport({ scale: 1 }).width;
                        const viewport = page.getViewport({ scale });

                        // 创建画布
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        // 渲染PDF页面到canvas
                        page.render({
                            canvasContext: context,
                            viewport: viewport
                        }).promise.then(function () {
                            pdfContentContainer.appendChild(canvas);
                            // 渲染完成后上传文件到服务器
                            uploadPdfToServer(file);
                        });
                    });
                }).catch(function (error) {
                    showError('无法加载PDF文件，请确保文件格式正确');
                });
            };

            reader.onerror = function () {
                showError('文件读取失败，请重试');
            };

            reader.readAsArrayBuffer(file);
        } else {
            showError('请选择有效的PDF文件');
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        // 恢复上传提示
        document.querySelector('.pdf-loading').style.display = 'none';
        uploadPrompt.style.display = 'block';
        pdfPreview.classList.remove('block');
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

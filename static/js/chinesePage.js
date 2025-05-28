/* 润色系统模块选择 */
const sidebarBtns = document.querySelectorAll('.edit-mod a');
sidebarBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        sidebarBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

/* PDF文件上传 */
const pdfContainer = document.getElementById('pdfContainer');
const file = document.createElement('input');
file.type = 'file';
file.id = '作文文件';
file.accept = 'application/pdf';
file.hidden = true;

// 拖拽上传功能
pdfContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfContainer.classList.add('dragover');
});

pdfContainer.addEventListener('dragleave', () => {
    pdfContainer.classList.remove('dragover');
});

pdfContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    pdfContainer.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files[0]?.type === 'application/pdf') {
        handleFile(files[0]);
    }
});

// 点击上传
document.querySelector('.upload-label').addEventListener('click', () => {
    file.click();
});

// 文件选择处理
file.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

async function handleFile(file) {
    // 添加状态类
    pdfContainer.classList.add('has-file');
    const container = document.getElementById('pdfPreview');
    const loadingElement = document.querySelector('#pdfPreview .pdf-loading');

    try {
        // 显示加载状态
        loadingElement.style.display = 'flex'; // 显示加载提示

        // 渲染PDF
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        // 创建画布
        const viewport = page.getViewport({ scale: 1 });
        const containerWidth = container.clientWidth;
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        // 渲染
        await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
        }).promise;

        // 插入预览
        const preview = document.getElementById('pdfPreview');
        preview.innerHTML = '';
        preview.appendChild(canvas);

    } catch (error) {
        alert(`文件加载失败: ${error.message}`);
        pdfContainer.classList.remove('has-file');
    } finally {
        loadingElement.style.display = 'none'; // 确保隐藏
    }
}

/* 子页面切换 */
document.querySelectorAll('.fun-mod a').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();

        // 切换按钮状态
        document.querySelectorAll('.fun-mod a').forEach(b =>
            b.classList.remove('active'));
        this.classList.add('active');

        // 切换子页面
        const targetId = this.dataset.target;
        document.querySelectorAll('.subpage').forEach(page =>
            page.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
    });
});
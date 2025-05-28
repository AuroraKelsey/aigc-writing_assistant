// 侧边栏按钮激活
const sidebarBtns = document.querySelectorAll('.功能模块按钮 a');
sidebarBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        sidebarBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

const pdfContainer = document.getElementById('pdfContainer');
const 文件输入 = document.createElement('input');
文件输入.type = 'file';
文件输入.id = '作文文件';
文件输入.accept = 'application/pdf';
文件输入.hidden = true;

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
    文件输入.click();
});

// 文件选择处理
文件输入.addEventListener('change', async (e) => {
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

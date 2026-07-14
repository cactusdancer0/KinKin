document.addEventListener('touchmove', e => {
    if (e.cancelable) e.preventDefault();
}, { passive: false });
document.addEventListener('contextmenu', e => e.preventDefault());
const CATEGORIES = [
    {
        name: "💇 Pelos",
        size: 0.40,
        assets: [
            "assets/Pelo cafe claro.png",
            "assets/Pelo Cafe oscuro.png",
            "assets/Pelo Canche.png",
            "assets/Pelo morado.png",
            "assets/Pelo negro.png",
            "assets/Pelo rojo.png",
        ]
    },
    {
        name: "👕 Camisas",
        size: 0.70,
        assets: [
            "assets/Arrianza camisa.png",
            "assets/Camisa Amarilla.png",
            "assets/Camisa Morada.png",
            "assets/Camisa negra.png",
            "assets/Camisa roja.png",
            "assets/Camisa verde.png",
            "assets/Camisa aqua.png",
            "assets/Camisa celeste y rojo.png",

        ]
    },
    {
        name: "👙 Bikinis",
        size: 0.40,
        assets: [
            "assets/Biikini azul.png",
            "assets/Bikini Naranja.png",
            "assets/Bikini original.png",
            "assets/Bikini rosa.png",
        ]
    },
    {
        name: "👗 Vestidos",
        size: 0.40,
        assets: [
            "assets/Vestido aqua.png",
            "assets/Vestido negro.png",
            "assets/Vestido rosa.png",
            "assets/Vestido rojo.png"
        ]
    },
    {
        name: "👖 Pantalones",
        size: 0.40,
        assets: [
            "assets/Pantalon cafe.png",
            "assets/Pantalon celeste.png",
            "assets/Pantalon negro.png",
            "assets/Pantalon Rojo.png",

            "assets/Pantalon.png",
            "assets/Short flores.png",
            "assets/Short original.png",
            "assets/Short celeste y rojo.png",

        ]
    },
    {
        name: "👗 Faldas",
        size: 0.40,
        assets: [
            "assets/Falda azul.png",
            "assets/Falda naranja.png",
            "assets/Falda rosa.png",
            "assets/Falda roja.png",

            
        ]
    },
    {
        name: "🎩 Sombreros",
        size: 0.40,
        assets: [
            "assets/Sombrero aqua.png",
            "assets/Sombrero celeste y rojo.png",
            "assets/sombrero amarillo.png",
            "assets/Sombrero azul.png",
            "assets/Sombrero morado.png",
            "assets/Sombrero naranja.png",
            "assets/Sombrero original.png",
            "assets/Sombrero rojo.png",
            "assets/Sombrero rosa.png",
            "assets/Sombrero verde.png",
            "assets/Corona.png",

            
        ]
    },
    {
        name: "👟 Zapatos",
        size: 0.40,
        assets: [
            "assets/Zapatos amarilos.png",
            "assets/Zapatos cafes.png",
            "assets/Zapatos grises.png",
            "assets/Zapatos negros.png",
            "assets/Zapatos rosa.png",
            "assets/Zapatos azules.png",

            
        ]
    },
    {
        name: "✨ Accesorios",
        size: 0.40,
        assets: [
            "assets/Arrianza Lentes.png",
            "assets/lentes.png",
            "assets/Lentes negros.png",
            "assets/Moño negro.png",
            "assets/Moño rojo.png",
            "Pelota de futbol.png",
        ]
    }
];
let stage, layer;
let activeCategoryIndex = 0;
const transformer = new Konva.Transformer({
    rotateEnabled: true,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < 20 || newBox.height < 20) return oldBox;
        if (stage && (newBox.width > stage.width() || newBox.height > stage.height())) return oldBox;
        return newBox;
    },
    keepRatio: true,
    padding: 4,
});
let activeDragSrc = null;
let ghostEl = null;
function createGhost(src, x, y) {
    ghostEl = document.createElement('img');
    ghostEl.src = src;
    ghostEl.style.cssText = `
        position: fixed;
        width: 70px;
        height: 70px;
        object-fit: contain;
        pointer-events: none;
        opacity: 0.75;
        z-index: 9999;
        image-rendering: pixelated;
        transform: translate(-50%, -50%);
        left: ${x}px;
        top: ${y}px;
    `;
    document.body.appendChild(ghostEl);
}
function moveGhost(x, y) {
    if (!ghostEl) return;
    ghostEl.style.left = x + 'px';
    ghostEl.style.top = y + 'px';
}
function removeGhost() {
    if (ghostEl) { ghostEl.remove(); ghostEl = null; }
}
let touchStartTime = 0;
function onAssetTouchStart(e) {
    touchStartTime = Date.now();
    const asset = e.currentTarget;
    activeDragSrc = asset.dataset.src;
}
function onDocumentTouchMove(e) {
    if (!activeDragSrc) return;
    const touch = e.touches[0];
    if (!ghostEl && (Date.now() - touchStartTime > 150)) {
        createGhost(activeDragSrc, touch.clientX, touch.clientY);
    }
    if (ghostEl) {
        if (e.cancelable) e.preventDefault();
        moveGhost(touch.clientX, touch.clientY);
    }
}
function onDocumentTouchEnd(e) {
    if (!activeDragSrc) return;
    const touch = e.changedTouches[0];
    removeGhost();
    const stageRect = document.getElementById('stage-container').getBoundingClientRect();
    const x = touch.clientX - stageRect.left;
    const y = touch.clientY - stageRect.top;
    if (x >= 0 && y >= 0 && x <= stageRect.width && y <= stageRect.height) {
        const size = CATEGORIES[activeCategoryIndex].size;
        createItem(activeDragSrc, x, y, size);
    }
    activeDragSrc = null;
}
function onDocumentDragOver(e) { e.preventDefault(); }
function onDocumentDrop(e) {
    e.preventDefault();
    const src = e.dataTransfer.getData("src");
    if (!src) return;
    const rect = document.getElementById('stage-container').getBoundingClientRect();
    const size = CATEGORIES[activeCategoryIndex].size;
    createItem(src, e.clientX - rect.left, e.clientY - rect.top, size);
}
function loadMascot() {
    Konva.Image.fromURL('assets/mascot.png', (img) => {
        const scaleX = (stage.width() * 0.7) / img.width();
        const scaleY = (stage.height() * 0.85) / img.height();
        const scale = Math.min(scaleX, scaleY);
        img.scale({ x: scale, y: scale });
        img.position({
            x: stage.width() / 2 - (img.width() * scale) / 2,
            y: stage.height() / 2 - (img.height() * scale) / 2
        });
        img.listening(false);
        layer.add(img);
        img.moveToBottom();
        layer.draw();
    });
}
function createItem(src, x, y, sizeFactor) {
    Konva.Image.fromURL(src, (img) => {
        const maxDim = Math.min(stage.width(), stage.height()) * sizeFactor;
        const scale = maxDim / Math.max(img.width(), img.height());
        const scaledW = img.width() * scale;
        const scaledH = img.height() * scale;
        const clampedX = Math.min(Math.max(x - scaledW / 2, 0), stage.width() - scaledW);
        const clampedY = Math.min(Math.max(y - scaledH / 2, 0), stage.height() - scaledH);
        img.scale({ x: scale, y: scale });
        img.position({ x: clampedX, y: clampedY });
        img.draggable(true);
        img.on("mousedown touchstart", () => {
            transformer.nodes([img]);
            img.moveToTop();
            transformer.moveToTop();
            layer.draw();
            document.getElementById('deleteBtn').style.display = 'block';
        });
        img.on("dragend", () => {
            const pos = img.getAbsolutePosition();
            const outLeft  = pos.x + img.width()  * img.scaleX() < 0;
            const outRight = pos.x > stage.width();
            const outTop   = pos.y + img.height() * img.scaleY() < 0;
            const outBot   = pos.y > stage.height();
            if (outLeft || outRight || outTop || outBot) {
                img.destroy();
                transformer.nodes([]);
                layer.draw();
                document.getElementById('deleteBtn').style.display = 'none';
            }
        });
        layer.add(img);
        transformer.moveToTop();
        transformer.nodes([img]);
        layer.draw();
    });
}
function downloadCanvas() {
    transformer.nodes([]);
    layer.draw();
    const W = stage.width();
    const H = stage.height();
    const PR = 2;
    const offscreen = document.createElement('canvas');
    offscreen.width = W * PR;
    offscreen.height = H * PR;
    const ctx = offscreen.getContext('2d');
    ctx.scale(PR, PR);
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(5, 217, 232, 0.18)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x <= W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    const stageDataURL = stage.toDataURL({ pixelRatio: PR });
    const stageImg = new Image();
    stageImg.onload = () => {
        ctx.drawImage(stageImg, 0, 0, W, H);
        const logoImg = new Image();
        logoImg.onload = () => {
            const logoH = H * 0.1;
            const logoW = (logoImg.width / logoImg.height) * logoH;
            const margin = 16;
            ctx.globalAlpha = 0.9;
            ctx.drawImage(logoImg, W - logoW - margin, H - logoH - margin, logoW, logoH);
            ctx.globalAlpha = 1;
            const link = document.createElement('a');
            link.download = 'mi-kinkin.png';
            link.href = offscreen.toDataURL('image/png');
            link.click();
        };
        logoImg.src = 'assets/KinKinLogo1.png';
    };
    stageImg.src = stageDataURL;
}
function renderCategory(index) {
    activeCategoryIndex = index;
    const container = document.getElementById('assetsContainer');
    container.innerHTML = '';
    document.querySelectorAll('.cat-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    const cat = CATEGORIES[index];
    cat.assets.forEach(src => {
        const wrapper = document.createElement("div");
        wrapper.className = "asset";
        wrapper.dataset.src = src;
        wrapper.draggable = true;
        wrapper.innerHTML = `<div class="asset-box"><img src="${src}" draggable="false"></div>`;
        wrapper.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("src", src);
        });
        wrapper.addEventListener("touchstart", onAssetTouchStart, { passive: false });
        wrapper.addEventListener("click", () => {
            if (!stage) return;
            createItem(src, stage.width() / 2, stage.height() / 2, cat.size);
        });
        container.appendChild(wrapper);
    });
}
window.addEventListener('load', () => {
    const container = document.getElementById('stage-container');
    stage = new Konva.Stage({
        container: 'stage-container',
        width: container.offsetWidth,
        height: container.offsetHeight
    });
    layer = new Konva.Layer();
    stage.add(layer);
    layer.add(transformer);
    loadMascot();
    const deleteBtn = document.getElementById('deleteBtn');
    deleteBtn.addEventListener('click', () => {
        const selected = transformer.nodes();
        if (selected.length > 0) {
            selected.forEach(n => n.destroy());
            transformer.nodes([]);
            layer.draw();
            deleteBtn.style.display = 'none';
        }
    });
    stage.on("click tap", (e) => {
        if (e.target === stage) {
            transformer.nodes([]);
            layer.draw();
            deleteBtn.style.display = 'none';
        }
    });
    container.addEventListener("dragover", onDocumentDragOver);
    container.addEventListener("drop", onDocumentDrop);
    document.addEventListener("touchmove", onDocumentTouchMove, { passive: false });
    document.addEventListener("touchend", onDocumentTouchEnd);
    document.getElementById("resetBtn").onclick = () => {
        transformer.nodes([]);
        transformer.remove();
        layer.destroyChildren();
        layer.add(transformer);
        document.getElementById('deleteBtn').style.display = 'none';
        loadMascot();
    };
    document.getElementById("downloadBtn").onclick = downloadCanvas;
    window.addEventListener('resize', () => {
        stage.width(container.offsetWidth);
        stage.height(container.offsetHeight);
        layer.draw();
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const tabsContainer = document.getElementById('categoryTabs');
    CATEGORIES.forEach((cat, index) => {
        const tab = document.createElement('button');
        tab.className = 'cat-tab' + (index === 0 ? ' active' : '');
        tab.textContent = cat.name;
        tab.addEventListener('click', () => renderCategory(index));
        tab.addEventListener('touchend', (e) => {
            e.preventDefault();
            renderCategory(index);
        });
        tabsContainer.appendChild(tab);
    });
    renderCategory(0);
});
// ── Bloquear pull-to-refresh y gestos del navegador en Chrome mobile ──
document.addEventListener('touchmove', e => {
    if (e.cancelable) e.preventDefault();
}, { passive: false });

document.addEventListener('contextmenu', e => e.preventDefault());

// ── Estado global ──
let stage, layer;
const ASSETS = [
    "assets/cowboy_hat.png",
    "assets/lentes.png",
    "assets/jacket.png",
    "assets/cassette.png",
    "assets/sombrero1.png"
];

const transformer = new Konva.Transformer({
    rotateEnabled: true,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < 20 || newBox.height < 20) return oldBox;
        return newBox;
    }
});

// ── Drag desde sidebar: seguimiento táctil custom ──
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
        opacity: 0.7;
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

// ── Touch drag desde assets ──
function onAssetTouchStart(e) {
    const asset = e.currentTarget;
    activeDragSrc = asset.dataset.src;
    const touch = e.touches[0];
    createGhost(activeDragSrc, touch.clientX, touch.clientY);
}

function onDocumentTouchMove(e) {
    if (!activeDragSrc) return;
    const touch = e.touches[0];
    moveGhost(touch.clientX, touch.clientY);
}

function onDocumentTouchEnd(e) {
    if (!activeDragSrc) return;
    const touch = e.changedTouches[0];
    removeGhost();

    const stageRect = document.getElementById('stage-container').getBoundingClientRect();
    const x = touch.clientX - stageRect.left;
    const y = touch.clientY - stageRect.top;

    // Solo crear si soltamos dentro del canvas
    if (x >= 0 && y >= 0 && x <= stageRect.width && y <= stageRect.height) {
        createItem(activeDragSrc, x, y);
    }

    activeDragSrc = null;
}

// Drag nativo de escritorio (HTML5 drag-and-drop)
function onDocumentDragOver(e) { e.preventDefault(); }
function onDocumentDrop(e) {
    e.preventDefault();
    const src = e.dataTransfer.getData("src");
    if (!src) return;
    const rect = document.getElementById('stage-container').getBoundingClientRect();
    createItem(src, e.clientX - rect.left, e.clientY - rect.top);
}

// Click directo en mobile (fallback: tap = agregar al centro)
function onAssetTap(e) {
    // Solo para clicks reales (no touch-drag que terminó)
    if (e.pointerType === 'touch') return; // el touch lo maneja touchend
    const src = e.currentTarget.dataset.src;
    createItem(src, stage.width() / 2, stage.height() / 2);
}

// ── Cargar mascota base ──
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

// ── Crear ítem en canvas ──
function createItem(src, x, y) {
    Konva.Image.fromURL(src, (img) => {
        const maxDim = Math.min(stage.width(), stage.height()) * 0.25;
        const scale = maxDim / Math.max(img.width(), img.height());
        img.scale({ x: scale, y: scale });
        img.position({
            x: x - (img.width() * scale) / 2,
            y: y - (img.height() * scale) / 2
        });
        img.draggable(true);

        img.on("mousedown touchstart", () => {
            transformer.nodes([img]);
            img.moveToTop();
            transformer.moveToTop();
            layer.draw();
        });

        layer.add(img);
        transformer.moveToTop();
        transformer.nodes([img]);
        layer.draw();
    });
}

// ── Descargar imagen ──
function downloadCanvas() {
    // Ocultamos transformer temporalmente para la captura
    transformer.nodes([]);
    layer.draw();

    const dataURL = stage.toDataURL({ pixelRatio: 2 });

    const link = document.createElement('a');
    link.download = 'mi-kinkin.png';
    link.href = dataURL;
    link.click();
}

// ── Inicialización ──
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

    // Click fuera = deseleccionar
    stage.on("click tap", (e) => {
        if (e.target === stage) {
            transformer.nodes([]);
            layer.draw();
        }
    });

    // Drag desktop: drop en canvas
    container.addEventListener("dragover", onDocumentDragOver);
    container.addEventListener("drop", onDocumentDrop);

    // Touch global para el drag
    document.addEventListener("touchmove", onDocumentTouchMove, { passive: false });
    document.addEventListener("touchend", onDocumentTouchEnd);

    // Botones
    document.getElementById("resetBtn").onclick = () => {
        layer.destroyChildren();
        layer.add(transformer);
        loadMascot();
    };

    document.getElementById("downloadBtn").onclick = downloadCanvas;

    // Resize
    window.addEventListener('resize', () => {
        stage.width(container.offsetWidth);
        stage.height(container.offsetHeight);
        layer.draw();
    });
});

// ── Poblar sidebar ──
document.addEventListener("DOMContentLoaded", () => {
    const containerAssets = document.getElementById("assetsContainer");

    ASSETS.forEach(src => {
        const wrapper = document.createElement("div");
        wrapper.className = "asset";
        wrapper.dataset.src = src;
        wrapper.draggable = true;
        wrapper.innerHTML = `<div class="asset-box"><img src="${src}" draggable="false"></div>`;

        // Desktop drag
        wrapper.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("src", src);
        });

        // Touch drag custom
        wrapper.addEventListener("touchstart", onAssetTouchStart, { passive: false });

        // Click en desktop
        wrapper.addEventListener("click", (e) => {
            if (!stage) return;
            createItem(src, stage.width() / 2, stage.height() / 2);
        });

        containerAssets.appendChild(wrapper);
    });
});

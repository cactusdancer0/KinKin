let stage, layer;
const transformer = new Konva.Transformer({
    rotateEnabled: true,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < 20 || newBox.height < 20) return oldBox;
        return newBox;
    }
});

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

    container.addEventListener("dragover", (e) => e.preventDefault());
    container.addEventListener("drop", (e) => {
        e.preventDefault();
        const src = e.dataTransfer.getData("src");
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createItem(src, x, y);
    });

    stage.on("click tap", (e) => {
        if (e.target === stage) {
            transformer.nodes([]);
            layer.draw();
        }
    });
});

function loadMascot() {
    Konva.Image.fromURL('assets/mascot.png', (img) => {
        const scale = (stage.height() * 0.8) / img.height();
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

function createItem(src, x, y) {
    Konva.Image.fromURL(src, (img) => {
        img.scale({ x: 0.3, y: 0.3 });
        img.position({ x: x - 30, y: y - 30 });
        img.draggable(true);
        img.on("mousedown touchstart", () => {
            transformer.nodes([img]);
            img.moveToTop();
            layer.draw();
        });
        layer.add(img);
        layer.draw();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const ASSETS = ["assets/cowboy_hat.png", "assets/lentes.png", "assets/jacket.png", "assets/cassette.png", "assets/sombrero1.png"];
    const containerAssets = document.getElementById("assetsContainer");

    ASSETS.forEach(src => {
        const wrapper = document.createElement("div");
        wrapper.className = "asset";
        wrapper.dataset.src = src;
        wrapper.draggable = true;
        wrapper.innerHTML = `<div class="asset-box"><img src="${src}"></div>`;
        containerAssets.appendChild(wrapper);
    });

    document.addEventListener("dragstart", (e) => {
        const asset = e.target.closest(".asset");
        if (asset) e.dataTransfer.setData("src", asset.dataset.src);
    });

    document.getElementById("resetBtn").onclick = () => {
        layer.destroyChildren();
        layer.add(transformer);
        loadMascot();
    };
});
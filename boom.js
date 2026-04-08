(function() {
    const textInput = prompt("What do you want to slap?", "DISCO FEVER");
    if (!textInput) return;
    textInput = textInput.replace(/ /g, ' &nbsp; ');

    // 1. Inject Google Font & Styles
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Monoton&display=swap';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes disco-flow {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
        }
        #disco-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 9999999; pointer-events: none; display: flex;
            align-items: center; justify-content: center; background: transparent;
            text-align: center;

        }
        #disco-text {
            font-family: 'Monoton', cursive; display: inline-block;
            white-space: nowrap; text-transform: uppercase;
            text-align: center;
            background: linear-gradient(90deg, #ff00aa, #0055ff, #00aa44, #ffaa00, #ff0000, #ff00aa);
            background-size: 200% auto; -webkit-background-clip: text;
            -webkit-text-fill-color: transparent; animation: disco-flow 3s linear infinite;
            filter: drop-shadow(2px 2px 5px rgba(0,0,0,0.3));
            pointer-events: auto; cursor: move; user-select: none; touch-action: none;
        }
    `;
    document.head.appendChild(style);

    // 2. Create Elements
    const overlay = document.createElement('div');
    overlay.id = 'disco-overlay';
    const textSpan = document.createElement('span');
    textSpan.id = 'disco-text';
    textSpan.innerHTML = textInput;
    overlay.appendChild(textSpan);
    document.body.appendChild(overlay);

    // 3. Transformation Variables
    let rotation = 0;
    let scale = 1;
    let posX = 0;
    let posY = 0;
    let initialPinchDist = 0;
    let initialScale = 1;
    let initialRotateOffset = 0;

    // 4. Scaling to Initial 100% Width
    const fitToWidth = () => {
        document.fonts.ready.then(() => {
            textSpan.style.fontSize = "10px";
            const optimal = (window.innerWidth / textSpan.offsetWidth) * 10;
            textSpan.style.fontSize = Math.floor(optimal * 0.95) + "px";
        });
    };
    fitToWidth();
    window.onresize = fitToWidth;

    const updateTransform = () => {
        textSpan.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
    };

    // 5. Spacebar to Remove
    const handleKey = (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            overlay.remove();
            window.removeEventListener("keydown", handleKey);
        }
    };
    window.addEventListener("keydown", handleKey);

    // 6. Desktop Mouse Interactions (Drag & Scroll)
    textSpan.onwheel = (e) => {
        e.preventDefault();
        if (e.shiftKey) {
            rotation += e.deltaY * 0.1;
        } else {
            scale -= e.deltaY * 0.001;
        }
        updateTransform();
    };

    let isDragging = false;
    let startX, startY;
    textSpan.onpointerdown = (e) => {
        isDragging = true;
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        textSpan.setPointerCapture(e.pointerId);
    };
    textSpan.onpointermove = (e) => {
        if (!isDragging) return;
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        updateTransform();
    };
    textSpan.onpointerup = () => isDragging = false;

    // 7. Mobile Touch Gestures (Pinch & Rotate)
    textSpan.addEventListener("touchstart", (e) => {
        if (e.touches.length === 2) {
            const t1 = e.touches[0], t2 = e.touches[1];
            initialPinchDist = Math.hypot(t2.pageX - t1.pageX, t2.pageY - t1.pageY);
            initialScale = scale;
            initialRotateOffset = rotation - Math.atan2(t2.pageY - t1.pageY, t2.pageX - t1.pageX) * 180 / Math.PI;
        }
    }, { passive: false });

    textSpan.addEventListener("touchmove", (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const t1 = e.touches[0], t2 = e.touches[1];
            const currentDist = Math.hypot(t2.pageX - t1.pageX, t2.pageY - t1.pageY);
            scale = initialScale * (currentDist / initialPinchDist);
            rotation = Math.atan2(t2.pageY - t1.pageY, t2.pageX - t1.pageX) * 180 / Math.PI + initialRotateOffset;
            updateTransform();
        }
    }, { passive: false });

    textSpan.ondblclick = () => overlay.remove();
})();

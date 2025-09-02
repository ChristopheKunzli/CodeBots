import {Application} from "pixi.js";
import {GameEngine} from "../game_engine";

(async () => {
    const container = document.querySelector(".background-image");
    if (!(container instanceof HTMLElement)) {
        throw new Error("invalid container");
    }

    const app = new Application();

    await app.init({
        background: "#1099bb",
        resizeTo: container,
    });

    app.canvas.id = "background";

    container.appendChild(app.canvas);

    const engine = new GameEngine(app);
    await engine.initialize(true);

    engine.update(0);

    window.addEventListener("resize", () => {
        app.renderer.resize(container.clientWidth, container.clientHeight);
        engine.update(0);
    });
})();

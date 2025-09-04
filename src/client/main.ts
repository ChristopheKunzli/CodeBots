import { Application } from 'pixi.js';
import { initDevtools } from '@pixi/devtools';
import { GameEngine } from './game_engine';

(async () => {
    const app = new Application();

    await app.init({
        background: '#1099bb',
        resizeTo: window,
    });

    if (process.env.NODE_ENV === "development") {
        console.log("init pixijs dev tools");
        initDevtools({app});
    }

    const save = await fetch('/api/save').then(res => {
        return res.ok ? res.json() : null;
    }).catch(() => null);

    document.body.appendChild(app.canvas);
    const engine = new GameEngine(app, save);
    await engine.initialize(false, save);

    app.ticker.add((delta) => {
        engine.update(delta.deltaTime);
    });
})();

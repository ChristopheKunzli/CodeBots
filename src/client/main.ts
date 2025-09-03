import {Application} from 'pixi.js';
import {initDevtools} from '@pixi/devtools';
import {GameEngine} from './game_engine';

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

    document.body.appendChild(app.canvas);
    const engine = new GameEngine(app);
    await engine.initialize();

    app.ticker.add((delta) => {
        engine.update(delta.deltaTime);
    });
})();

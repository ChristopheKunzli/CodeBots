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

    const viteDisableSave = import.meta.env.VITE_DISABLE_SAVE;

    let save: any = null;
    if (viteDisableSave !== "true") {
        save = await fetch('/api/save').then(res => {
            return res.ok ? res.json() : null;
        }).catch(() => null);
    }

    const localSave = localStorage.getItem('save');

    if (localSave) {
        const parsed = JSON.parse(localSave);
        if (parsed && (!save || (new Date(save.timestamp).getTime() < parsed.timestamp))) {
            save = parsed;
        }
    }

    document.body.appendChild(app.canvas);
    const engine = new GameEngine(app, save.data);
    await engine.initialize(false, save.data);

    app.ticker.add((delta) => {
        engine.update(delta.deltaTime);
    });
})();

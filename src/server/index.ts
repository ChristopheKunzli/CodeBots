import dotenv from "dotenv";
import {Context, Hono, Next} from "hono";
import {serve} from "@hono/node-server";
import {serveStatic} from "@hono/node-server/serve-static";
import {clerkMiddleware, getAuth} from '@hono/clerk-auth';

dotenv.config({path: "src/server/.env"});

const app = new Hono();

export const requireAuth = async (c: Context, next: Next) => {
    if (process.env.DISABLE_SAVE === "true") {
        return next();
    }

    const auth = getAuth(c);

    if (!auth?.userId) {
        return c.redirect('/login');
    }

    return next();
};

if (process.env.DISABLE_SAVE !== "true") {
    app.use('*', clerkMiddleware());

    app.get("/api/save", requireAuth, (c) => {
        const {userId} = getAuth(c);

        return c.json({userId});
    });
}

app.get("/game*", requireAuth, serveStatic({ path: "./dist/client/game.html"}));

app.use("/*", serveStatic({root: "./dist/client"}));

app.get("/doc", serveStatic({ path: "./dist/client/doc.html"}));

app.get("/login", serveStatic({ path: "./dist/client/login.html"}));

serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 8080,
});

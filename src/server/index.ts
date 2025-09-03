import dotenv from "dotenv";
import {Context, Hono, Next} from "hono";
import {serve} from "@hono/node-server";
import {serveStatic} from "@hono/node-server/serve-static";
import {clerkMiddleware, getAuth} from '@hono/clerk-auth';

dotenv.config({path: "src/server/.env"});

const app = new Hono();

app.use('*', clerkMiddleware());

export const requireAuth = async (c: Context, next: Next) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
        return c.redirect('/login');
    }

    return next();
};

app.get("/game*", requireAuth, serveStatic({ path: "./dist/client/game.html"}));

app.use("/*", serveStatic({root: "./dist/client"}));

app.get("/doc", serveStatic({ path: "./dist/client/doc.html"}));

app.get("/login", serveStatic({ path: "./dist/client/login.html"}));

serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 8080,
});

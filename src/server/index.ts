import dotenv from "dotenv";
import {Context, Hono, Next} from "hono";
import {serve} from "@hono/node-server";
import {serveStatic} from "@hono/node-server/serve-static";
import {clerkMiddleware, getAuth} from '@hono/clerk-auth';
import {MongoClient} from "mongodb";

dotenv.config({path: "src/server/.env"});

const app = new Hono();

const connectDb = async () => {
    try {
        const client = new MongoClient(process.env.DB_CONNECTION_STRING, {
            useUnifiedTopology: true,
        });
        await client.connect();
        console.log("connected");
        const db = client.db("codebot");
        const collection = db.collection("save");

        await collection.createIndex({playerId: 1, timestamp: -1});

        return collection;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

const handleSave = async () => {
    const collection = await connectDb();

    app.use('*', clerkMiddleware());

    app.post("/api/save", requireAuth, async (c) => {
        const {data} = await c.req.json();
        if (!data) {
            return c.json({error: "data are required"}, 400);
        }

        const {userId} = getAuth(c);

        try {
            await collection.insertOne({userId, data, timestamp: new Date()});
            return c.json({status: "ok"});
        } catch (err) {
            console.error(err);
            return c.json({error: "failed to save data"}, 500);
        }
    });

    app.get("/api/save", requireAuth, async (c) => {
        const {userId} = getAuth(c);

        try {
            const [latest] = await collection
                .find({userId})
                .sort({timestamp: -1})
                .limit(1)
                .toArray();

            if (!latest) {
                return c.json({error: "no saves found"}, 404);
            }

            return c.json(latest.data);
        } catch (err) {
            console.error(err);
            return c.json({error: "failed to fetch data"}, 500);
        }
    });
};

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

const initialize = async () => {
    if (process.env.DISABLE_SAVE !== "true") {
        await handleSave();
    }

    app.get("/game*", requireAuth, serveStatic({path: "./dist/client/game.html"}));

    app.use("/*", serveStatic({root: "./dist/client"}));

    app.get("/doc", serveStatic({path: "./dist/client/doc.html"}));

    app.get("/login", serveStatic({path: "./dist/client/login.html"}));

    serve({
        fetch: app.fetch,
        port: Number(process.env.PORT) || 8080,
    });
};

initialize();

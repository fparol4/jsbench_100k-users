import { serve } from "@hono/node-server";
import { performance } from "node:perf_hooks";
import { Hono } from "hono";
const app = new Hono();
const log = console.log;
let InMemoryUsers = [];
app.get("/healthcheck", async (c) => {
    return c.json({
        healthcheck: true,
    });
});
app.post("/users", async (c) => {
    const start = performance.now();
    const body = await c.req.parseBody();
    const file = body.file;
    if (!file)
        return c.text("Cannot read");
    try {
        const fileArrBuff = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrBuff).toString();
        InMemoryUsers = JSON.parse(fileBuffer);
        return c.json({ read: true, performance: performance.now() - start });
    }
    catch {
        log("Cannot read file");
        return c.text("Cannot read file");
    }
});
app.get("/superusers", async (c) => {
    const start = performance.now();
    InMemoryUsers.filter((user) => user.score >= 900 && user.active == true);
    return c.json({
        users: true,
        performance: performance.now() - start,
    });
});
app.get("/top-countries", async (c) => {
    const start = performance.now();
    const superusers = InMemoryUsers.filter((user) => user.score >= 900 && user.active == true);
    const topCountries = {};
    for (let i = 0; i < superusers.length; ++i) {
        const country = superusers[i].country;
        topCountries[country] = topCountries[country] + 1 || 1;
        ++i;
    }
    return c.json({
        top_countries: topCountries,
        performance: performance.now() - start,
    });
});
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});

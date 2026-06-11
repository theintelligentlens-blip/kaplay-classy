// Serving files in Express.js for KAPLAY development

import { assets } from "@kaplayjs/crew";
import express from "express";
import fs from "fs/promises";
import path from "path";

export function serve() {
    const port = process.env.PORT || 4000;
    const app = express();

    app.set("view engine", "ejs");
    app.set("views", path.join(import.meta.dirname, "views"));
    app.use("/dist", express.static("dist"));
    app.use(express.static("examples"));

    // Expose crew urls
    for (const [name, asset] of Object.entries(assets)) {
        const outlined = asset.outlined;

        app.get(`/crew/${name}.png`, (req, res) => {
            const img = Buffer.from(
                asset.sprite.replace(/data:image\/png;base64,/, ""),
                "base64",
            );

            res.writeHead(200, {
                "Content-Type": "image/png",
                "Content-Length": img.length,
            });
            res.end(img);
        });

        if (!outlined) continue;

        app.get(`/crew/${name}-o.png`, (req, res) => {
            const img = Buffer.from(
                outlined.replace(/data:image\/png;base64,/, ""),
                "base64",
            );

            res.writeHead(200, {
                "Content-Type": "image/png",
                "Content-Length": img.length,
            });
            res.end(img);
        });
    }

    app.get("/", async (req, res) => {
        const examples = (await fs.readdir("examples"))
            .filter((p) => !p.startsWith(".") && p.endsWith(".js"))
            .map((d) => path.basename(d, ".js"));

        res.render("examplesList", { examples });
    });

    app.get("/:name", async (req, res) => {
        const examples = (await fs.readdir("examples"))
            .filter((p) => !p.startsWith(".") && p.endsWith(".js"))
            .map((d) => path.basename(d, ".js"));

        const name = req.params.name;
        const examplePath = `${name}.js`;

        if (!examples.includes(name)) {
            res.status(404);
            res.send(`example not found: ${name}`);
            return;
        }

        res.render("game", {
            name,
            path: examplePath,
            prev: examples[
                (examples.indexOf(name) - 1 + examples.length)
                % examples.length
            ],
            next: examples[(examples.indexOf(name) + 1) % examples.length],
            vscode: `vscode://file/${path.resolve("examples", examplePath)}`,
        });
    });

    return app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });
}

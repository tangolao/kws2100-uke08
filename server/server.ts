import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";
import { serveStatic } from "@hono/node-server/serve-static";

const postgres = new pg.Pool({
  user: "postgres",
});

const app = new Hono();
app.get("*", serveStatic({ root: "../dist" }));

app.get("/api/grunnskoler", async (c) => {
  const result = await postgres.query(`
        select 
            skolenavn, 
            antallelever, 
            st_transform( posisjon, 4326)::json 
            posisjon
        from grunnskoler_e39212a4d48d4cf284c6f63f254a3d42.grunnskole
      `);
  return c.json({
    type: "FeatureCollection",
    features: result.rows.map(({ skolenavn, antallelever, posisjon }) => ({
      type: "Feature",
      properties: {
        skolenavn,
        antallelever,
      },
      geometry: posisjon,
    })),
  });
});

serve(app);

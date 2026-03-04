import { createApp } from "./app.js";

const port = parseInt(process.env.PORT ?? "3000", 10);

const app = createApp();

app.listen(port, () => {
  console.log(`Atlas server listening on http://localhost:${port}`);
});

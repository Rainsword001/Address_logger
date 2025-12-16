import app from "./app.js";
import { connectDB } from "./database/db.js";
import { PORT } from "./config/env.js";

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`);
});

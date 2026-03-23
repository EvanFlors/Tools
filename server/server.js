import app from "./app.js";
import connectDB from "./src/config/db.js";
import createBootstrapAdmin from "./src/infrastructure/bootstrap/createAdmin.js";
import env from "./src/config/env.js";

const startServer = async () => {
  await connectDB();
  await createBootstrapAdmin();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

startServer();
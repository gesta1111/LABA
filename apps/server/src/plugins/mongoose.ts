import fp from "fastify-plugin";
import mongoose from "mongoose";

export default fp(async (fastify) => {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(fastify.config.mongoUri);
    fastify.log.info("MongoDB подключена");
  } catch (error) {
    fastify.log.error(error, "Не удалось подключиться к MongoDB");
    throw error;
  }

  fastify.addHook("onClose", async () => {
    await mongoose.disconnect();
  });
});

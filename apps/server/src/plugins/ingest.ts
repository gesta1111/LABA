import fp from "fastify-plugin";
import { IngestService } from "../services/ingest.js";

export default fp(async (fastify) => {
  fastify.decorate("ingest", new IngestService(fastify));
});

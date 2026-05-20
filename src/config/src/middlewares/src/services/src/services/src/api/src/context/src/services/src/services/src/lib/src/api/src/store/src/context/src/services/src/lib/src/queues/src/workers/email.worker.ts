import { Worker } from "bullmq";
import { redis } from "../lib/redis";

export const emailWorker = new Worker(
  "emails",
  async (job) => {
    const { to, subject, body } = job.data;
    // send email via provider
  },
  { connection: redis, concurrency: 5 }
);

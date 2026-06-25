import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./src/db/index";
import { reminders } from "./src/db/schema";
async function run() {
  try {
    const res = await db.query.reminders.findMany();
    console.log("SUCCESS, count:", res.length);
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}
run();

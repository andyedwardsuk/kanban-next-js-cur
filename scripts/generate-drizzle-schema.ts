#!/usr/bin/env tsx

import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Generating Drizzle schema...");

  try {
    // Run the drizzle-kit generate command
    const { execSync } = await import("child_process");
    execSync("npx drizzle-kit generate", { stdio: "inherit" });

    console.log("Schema generation completed successfully!");
  } catch (error) {
    console.error("Error generating schema:", error);
    process.exit(1);
  }
}

main();

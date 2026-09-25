import { execSync } from "node:child_process";

export default {
  date: new Date(),
  sha: execSync("git rev-parse --short HEAD").toString().trim(),
};

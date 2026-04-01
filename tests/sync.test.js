const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { syncCommand } = require("../src/commands/sync");

describe("envman sync command", () => {
  let tempDir;
  let originalCwd;

  beforeAll(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "envman-sync-"));
    process.chdir(tempDir);

    await fs.writeFile(
      path.join(tempDir, ".env"),
      "FOO=bar\nEXISTING=value\n"
    );

    await fs.writeFile(
      path.join(tempDir, ".env.example"),
      "FOO=default\nNEW_KEY=\nANOTHER=\n"
    );
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  test("should sync missing keys from .env.example", async () => {
    await syncCommand();

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toContain("FOO=bar");
    expect(content).toContain("NEW_KEY=");
    expect(content).toContain("ANOTHER=");
  });
});

const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { removeCommand } = require("../src/commands/remove");

describe("envman remove command", () => {
  let tempDir;
  let originalCwd;

  beforeAll(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "envman-remove-"));
    process.chdir(tempDir);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  test("removes existing key and preserves file structure", async () => {
    const original = "# db config\nDB_HOST=localhost\n\n# api\nAPI_KEY=abc\nDB_PORT=5432\n";

    await fs.writeFile(path.join(tempDir, ".env"), original);

    await removeCommand("API_KEY");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("# db config\nDB_HOST=localhost\n\n# api\nDB_PORT=5432\n");
  });

  test("fails when key does not exist and does not modify file", async () => {
    const original = "FOO=bar\nBAZ=qux\n";

    await fs.writeFile(path.join(tempDir, ".env"), original);

    await removeCommand("NONEXISTENT");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe(original);
  });
});

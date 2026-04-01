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

  test("removes existing key with Y", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "# comment\nFOO=bar\nREMOVE_ME=value\nKEEP=this\n"
    );

    global.__mockAnswer = "Y";

    await removeCommand("REMOVE_ME");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("# comment\nFOO=bar\nKEEP=this\n");
  });

  test("does not remove with N", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "FOO=bar\nKEEP=this\n"
    );

    global.__mockAnswer = "N";

    await removeCommand("FOO");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("FOO=bar\nKEEP=this\n");
  });

  test("key not found leaves file unchanged", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "FOO=bar\n"
    );

    await removeCommand("NONEXISTENT");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("FOO=bar\n");
  });

  test("no .env file handles gracefully", async () => {
    await fs.remove(path.join(tempDir, ".env"));

    await removeCommand("ANY_KEY");
  });

  test("removes first occurrence of duplicate key", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "FOO=first\nFOO=second\nKEEP=this\n"
    );

    global.__mockAnswer = "Y";

    await removeCommand("FOO");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("FOO=second\nKEEP=this\n");
  });

  test("empty key handled safely", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "FOO=bar\n"
    );

    await removeCommand("");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("FOO=bar\n");
  });

  test("preserves comments and blank lines after removal", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "# db config\nDB_HOST=localhost\n\n# api\nAPI_KEY=abc\nDB_PORT=5432\n"
    );

    global.__mockAnswer = "Y";

    await removeCommand("DB_HOST");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("# db config\n\n# api\nAPI_KEY=abc\nDB_PORT=5432\n");
  });
});

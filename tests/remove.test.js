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

    expect(content).not.toContain("REMOVE_ME");
    expect(content).toContain("# comment");
    expect(content).toContain("FOO=bar");
    expect(content).toContain("KEEP=this");
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

    expect(content).toContain("FOO=bar");
    expect(content).toContain("KEEP=this");
  });

  test("key not found", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "FOO=bar\n"
    );

    await removeCommand("NONEXISTENT");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("FOO=bar\n");
  });

  test("no .env file", async () => {
    await fs.remove(path.join(tempDir, ".env"));

    await removeCommand("ANY_KEY");
  });
});

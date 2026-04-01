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

    await fs.writeFile(
      path.join(tempDir, ".env"),
      "FOO=bar\nREMOVE_ME=value\nKEEP=this\n"
    );
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  test("should remove a key from .env", async () => {
    await removeCommand("REMOVE_ME");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).not.toContain("REMOVE_ME");
    expect(content).toContain("FOO=bar");
    expect(content).toContain("KEEP=this");
  });

  test("should exit with error for missing key", async () => {
    await expect(removeCommand("NONEXISTENT")).rejects.toThrow();
  });
});

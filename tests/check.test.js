const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { checkCommand } = require("../src/commands/check");

describe("envman check command", () => {
  let tempDir;
  let originalCwd;

  beforeAll(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "envman-check-"));
    process.chdir(tempDir);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  test("should pass when .env matches .env.example", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "FOO=bar\nHELLO=world\n"
    );

    await fs.writeFile(
      path.join(tempDir, ".env.example"),
      "FOO=default\nHELLO=default\n"
    );

    await expect(checkCommand()).resolves.toBeUndefined();
  });

  test("should fail when .env has missing keys", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "FOO=bar\n"
    );

    await fs.writeFile(
      path.join(tempDir, ".env.example"),
      "FOO=default\nMISSING=value\n"
    );

    await expect(checkCommand()).rejects.toThrow();
  });
});

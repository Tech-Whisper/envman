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

  test("passes when all checks are satisfied", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "DB_HOST=localhost\nDB_PORT=5432\n"
    );

    await fs.writeFile(
      path.join(tempDir, ".gitignore"),
      "node_modules/\n.env\n.DS_Store\n"
    );

    await fs.writeFile(
      path.join(tempDir, ".env.example"),
      "DB_HOST=localhost\nDB_PORT=5432\n"
    );

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await checkCommand();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("All checks passed")
    );

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("fails when .env is not in .gitignore", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "API_KEY=secret123\nDB_HOST=localhost\n"
    );

    await fs.writeFile(
      path.join(tempDir, ".gitignore"),
      "node_modules/\n.DS_Store\n"
    );

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await checkCommand();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(".env is not listed in .gitignore")
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Sensitive key detected: API_KEY")
    );

    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  test("detects case-insensitive sensitive keys", () => {
    const { isSensitiveKey } = require("../src/utils/parseEnv");

    expect(isSensitiveKey("api_key")).toBe(true);
    expect(isSensitiveKey("MY_SECRET")).toBe(true);
    expect(isSensitiveKey("auth_token")).toBe(true);
    expect(isSensitiveKey("DB_PASSWORD")).toBe(true);
    expect(isSensitiveKey("PRIVATE_KEY")).toBe(true);
    expect(isSensitiveKey("DB_HOST")).toBe(false);
    expect(isSensitiveKey("APP_PORT")).toBe(false);
  });

  test("handles missing .gitignore gracefully", async () => {
    await fs.remove(path.join(tempDir, ".gitignore"));

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await checkCommand();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(".gitignore not found")
    );

    errorSpy.mockRestore();
  });
});

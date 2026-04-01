const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { listCommand } = require("../src/commands/list");

describe("envman list command", () => {
  let tempDir;
  let originalCwd;

  beforeAll(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "envman-list-"));
    process.chdir(tempDir);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  test("lists variables with correct output", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "# comment\nFOO=bar\nHELLO=world\n\nTEST=value\n"
    );

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await listCommand();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("FOO")
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("bar")
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("3 variables found")
    );

    logSpy.mockRestore();
  });

  test("handles missing .env gracefully", async () => {
    await fs.remove(path.join(tempDir, ".env"));

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await listCommand();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("No .env found")
    );

    errorSpy.mockRestore();
  });

  test("ignores comments and blank lines", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "# only comment\n\n# another comment\n"
    );

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await listCommand();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("0 variables found")
    );

    logSpy.mockRestore();
  });

  test("masks sensitive keys by default", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "DB_HOST=localhost\nAPI_KEY=secret123\n"
    );

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await listCommand();

    const calls = logSpy.mock.calls.flat().join("\n");
    expect(calls).toContain("******");
    expect(calls).toContain("API_KEY");
    expect(calls).not.toContain("secret123");

    logSpy.mockRestore();
  });

  test("shows values with --show-values flag", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "API_KEY=secret123\n"
    );

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await listCommand({ showValues: true });

    const calls = logSpy.mock.calls.flat().join("\n");
    expect(calls).toContain("secret123");
    expect(calls).not.toContain("******");

    logSpy.mockRestore();
  });
});

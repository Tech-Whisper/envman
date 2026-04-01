const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { syncCommand } = require("../src/commands/sync");

describe("envman sync command", () => {
  let sourceDir;
  let targetDir;
  let originalCwd;

  beforeAll(async () => {
    originalCwd = process.cwd();
    const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "envman-sync-"));
    sourceDir = path.join(tmpRoot, "source");
    targetDir = path.join(tmpRoot, "target");
    await fs.mkdir(sourceDir);
    await fs.mkdir(targetDir);
    process.chdir(sourceDir);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await fs.remove(path.dirname(sourceDir));
  });

  test("basic sync adds missing keys to target", async () => {
    await fs.writeFile(
      path.join(sourceDir, ".env"),
      "A=source_a\nB=source_b\n"
    );

    await fs.writeFile(
      path.join(targetDir, ".env"),
      "A=target_a\n"
    );

    await syncCommand({ to: targetDir, overwrite: false });

    const targetPath = path.join(targetDir, ".env");
    const content = await fs.readFile(targetPath, "utf-8");

    expect(content).toBe("A=target_a\nB=source_b\n");
  });

  test("sync with --overwrite replaces existing keys", async () => {
    await fs.writeFile(
      path.join(sourceDir, ".env"),
      "A=new_value\n"
    );

    await fs.writeFile(
      path.join(targetDir, ".env"),
      "A=old_value\n"
    );

    await syncCommand({ to: targetDir, overwrite: true });

    const targetPath = path.join(targetDir, ".env");
    const content = await fs.readFile(targetPath, "utf-8");

    expect(content).toBe("A=new_value\n");
  });

  test("fails cleanly when source .env is missing", async () => {
    await fs.remove(path.join(sourceDir, ".env"));

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await syncCommand({ to: targetDir, overwrite: false });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("No .env found")
    );

    errorSpy.mockRestore();
  });

  test("fails cleanly with invalid target path", async () => {
    await fs.writeFile(
      path.join(sourceDir, ".env"),
      "A=value\n"
    );

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await syncCommand({ to: "/nonexistent/path/xyz", overwrite: false });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Target folder not found")
    );

    errorSpy.mockRestore();
  });
});

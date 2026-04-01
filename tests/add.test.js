const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { addCommand } = require("../src/commands/add");

describe("envman add command", () => {
  let tempDir;
  let originalCwd;

  beforeAll(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "envman-add-"));
    process.chdir(tempDir);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  test("should add a new variable to .env", async () => {
    await addCommand("NEW_KEY=new_value");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toContain("NEW_KEY=new_value");
  });

  test("should update existing variable", async () => {
    await addCommand("EXISTING=old");
    await addCommand("EXISTING=new");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    const lines = content.split("\n").filter(l => l.startsWith("EXISTING="));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe("EXISTING=new");
  });
});

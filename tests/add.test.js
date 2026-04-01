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

  test("adds new key", async () => {
    await addCommand("FOO=bar");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toContain("FOO=bar");
  });

  test("duplicate key with N does not overwrite", async () => {
    await fs.writeFile(path.join(tempDir, ".env"), "FOO=bar\n");

    global.__mockAnswer = "N";

    await addCommand("FOO=new_value");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toContain("FOO=bar");
    expect(content).not.toContain("FOO=new_value");
  });

  test("duplicate key with Y overwrites", async () => {
    await fs.writeFile(path.join(tempDir, ".env"), "FOO=bar\n");

    global.__mockAnswer = "Y";

    await addCommand("FOO=new_value");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toContain("FOO=new_value");
    expect(content).not.toContain("FOO=bar");
  });
});

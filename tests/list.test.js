const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { listCommand } = require("../src/commands/list");

describe("envman list command", () => {
  let tempDir;
  let originalCwd;

  beforeAll(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "envman-"));
    process.chdir(tempDir);

    const envContent = `
# comment
FOO=bar
HELLO=world

TEST=value
`;

    await fs.writeFile(path.join(tempDir, ".env"), envContent);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  test("should list variables without throwing", async () => {
    await expect(listCommand()).resolves.not.toThrow();
  });
});

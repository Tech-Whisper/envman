const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { addCommand, parseInput } = require("../src/commands/add");

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

  test("adds new key to empty .env", async () => {
    await addCommand("FOO=bar");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("FOO=bar\n");
  });

  test("adds new key to existing .env", async () => {
    await addCommand("HELLO=world");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("FOO=bar\nHELLO=world\n");
  });

  test("duplicate key with N does not overwrite", async () => {
    await fs.writeFile(path.join(tempDir, ".env"), "FOO=bar\nHELLO=world\n");

    global.__mockAnswer = "N";

    await addCommand("FOO=new_value");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("FOO=bar\nHELLO=world\n");
  });

  test("duplicate key with Y overwrites", async () => {
    global.__mockAnswer = "Y";

    await addCommand("FOO=updated");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("FOO=updated\nHELLO=world\n");
  });

  test("preserves comments and blank lines", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "# db config\nDB_HOST=localhost\n\n# api\nAPI_KEY=abc\n"
    );

    global.__mockAnswer = "Y";

    await addCommand("DB_HOST=newhost");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toBe("# db config\nDB_HOST=newhost\n\n# api\nAPI_KEY=abc\n");
  });

  test("allows empty value KEY=", async () => {
    await addCommand("EMPTY_VAL=");

    const envPath = path.join(tempDir, ".env");
    const content = await fs.readFile(envPath, "utf-8");

    expect(content).toContain("EMPTY_VAL=\n");
  });

  test("inline comment parsing", async () => {
    await fs.writeFile(
      path.join(tempDir, ".env"),
      "INLINE=value # comment\nQUOTED=\"value # comment\"\n"
    );

    const { parseEnv } = require("../src/commands/list");
    const content = await fs.readFile(path.join(tempDir, ".env"), "utf-8");
    const vars = parseEnv(content);

    const inlineVar = vars.find(v => v.key === "INLINE");
    const quotedVar = vars.find(v => v.key === "QUOTED");

    expect(inlineVar.value).toBe("value");
    expect(quotedVar.value).toBe("\"value # comment\"");
  });

  test("parseInput rejects invalid input", () => {
    expect(parseInput("")).toBeNull();
    expect(parseInput("NOEQUALS")).toBeNull();
    expect(parseInput("=value")).toBeNull();
  });

  test("parseInput handles KEY= with empty value", () => {
    const result = parseInput("KEY=");
    expect(result).toEqual({ key: "KEY", value: "" });
  });

  test("parseInput trims key but preserves value spaces", () => {
    const result = parseInput("  KEY  =  value  ");
    expect(result).toEqual({ key: "KEY", value: "  value  " });
  });
});

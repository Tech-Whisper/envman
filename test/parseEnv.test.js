const { parseEnv, parseEnvMap, normalizeContent } = require("../src/utils/parseEnv");

describe("parseEnv Utility", () => {
  it("should normalize line endings", () => {
    expect(normalizeContent("A=1\r\nB=2\rC=3")).toBe("A=1\nB=2\nC=3");
  });

  it("should parse .env content into array of objects", () => {
    const content = `
# Comment here
PORT=3000
DB_URL=postgres://user:pass@localhost/db
EMPTY=
    `;
    const parsed = parseEnv(content);
    expect(parsed.length).toBe(3);
    expect(parsed[0].key).toBe("PORT");
    expect(parsed[0].value).toBe("3000");
    expect(parsed[1].key).toBe("DB_URL");
    expect(parsed[1].value).toBe("postgres://user:pass@localhost/db");
    expect(parsed[2].key).toBe("EMPTY");
    expect(parsed[2].value).toBe("");
  });

  it("should strip inline comments unless quoted", () => {
    const content = `
KEY1=val1 # inline comment
KEY2="val2 # not a comment"
    `;
    const parsed = parseEnvMap(content);
    expect(parsed["KEY1"]).toBe("val1");
    expect(parsed["KEY2"]).toBe('"val2 # not a comment"');
  });

  it("should output key-value map", () => {
    const content = "A=1\nB=2\n#C=3";
    const map = parseEnvMap(content);
    expect(map).toEqual({ A: "1", B: "2" });
  });
});

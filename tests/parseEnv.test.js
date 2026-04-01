const { normalizeContent, parseEnv, parseEnvMap, normalizeTrailingNewline, isSensitiveKey, maskValue } = require("../src/utils/parseEnv");

describe("parseEnv utility", () => {
  test("normalizeContent converts CRLF to LF", () => {
    expect(normalizeContent("a\r\nb\r\n")).toBe("a\nb\n");
  });

  test("normalizeContent converts lone CR to LF", () => {
    expect(normalizeContent("a\rb\r")).toBe("a\nb\n");
  });

  test("normalizeTrailingNewline ensures exactly one newline", () => {
    expect(normalizeTrailingNewline("a\nb")).toBe("a\nb\n");
    expect(normalizeTrailingNewline("a\nb\n\n")).toBe("a\nb\n");
  });

  test("parseEnv handles export prefix", () => {
    const vars = parseEnv("export KEY=value\n");
    expect(vars).toHaveLength(1);
    expect(vars[0].key).toBe("export KEY");
  });

  test("parseEnv handles values with equals signs", () => {
    const vars = parseEnv("KEY=a=b=c\n");
    expect(vars[0].value).toBe("a=b=c");
  });

  test("isSensitiveKey detects patterns case-insensitively", () => {
    expect(isSensitiveKey("api_key")).toBe(true);
    expect(isSensitiveKey("DB_PASSWORD")).toBe(true);
    expect(isSensitiveKey("my_secret_key")).toBe(true);
    expect(isSensitiveKey("auth_token")).toBe(true);
    expect(isSensitiveKey("private_key")).toBe(true);
    expect(isSensitiveKey("DB_HOST")).toBe(false);
  });

  test("maskValue returns fixed mask string", () => {
    expect(maskValue("secret123")).toBe("******");
    expect(maskValue("")).toBe("******");
  });

  test("parseEnvMap returns correct key-value pairs", () => {
    const map = parseEnvMap("A=1\nB=2\n");
    expect(map).toEqual({ A: "1", B: "2" });
  });
});

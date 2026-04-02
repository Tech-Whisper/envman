const { validateKey, validateKeyValueInput, validatePassword } = require("../src/utils/validator");

describe("Validator", () => {
  describe("validateKey", () => {
    it("should pass valid keys", () => {
      expect(validateKey("API_KEY").valid).toBe(true);
      expect(validateKey("PORT").valid).toBe(true);
      expect(validateKey("_SECRET").valid).toBe(true);
      expect(validateKey("DB_HOST_1").valid).toBe(true);
    });

    it("should fail invalid keys", () => {
      expect(validateKey("123_KEY").valid).toBe(false);
      expect(validateKey("API-KEY").valid).toBe(false);
      expect(validateKey("API KEY").valid).toBe(false);
      expect(validateKey("").valid).toBe(false);
      expect(validateKey(" ").valid).toBe(false);
    });
  });

  describe("validateKeyValueInput", () => {
    it("should parse valid input", () => {
      const res = validateKeyValueInput("PORT=3000");
      expect(res.valid).toBe(true);
      expect(res.key).toBe("PORT");
      expect(res.value).toBe("3000");
    });

    it("should handle empty values", () => {
      const res = validateKeyValueInput("EMPTY=");
      expect(res.valid).toBe(true);
      expect(res.key).toBe("EMPTY");
      expect(res.value).toBe("");
    });

    it("should allow equals signs in value", () => {
      const res = validateKeyValueInput("URL=https://example.com/api?foo=bar");
      expect(res.valid).toBe(true);
      expect(res.key).toBe("URL");
      expect(res.value).toBe("https://example.com/api?foo=bar");
    });

    it("should fail invalid input format", () => {
      expect(validateKeyValueInput("NOPORT123").valid).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should categorize password strength", () => {
      expect(validatePassword("short").valid).toBe(false); // < 8 chars
      expect(validatePassword("onlyletters").strength).toBe("weak");
      expect(validatePassword("LettersAnd123").strength).toBe("strong");
      expect(validatePassword("Strong!Pa$$w0rd123").strength).toBe("strong");
    });
  });
});

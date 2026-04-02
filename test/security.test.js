const {
  isSensitiveKey,
  isSensitiveValue,
  encryptValue,
  decryptValue,
  generateEncryptionKey,
} = require("../src/core/security");

describe("Security Core", () => {
  describe("isSensitiveKey", () => {
    it("should detect sensitive keys", () => {
      expect(isSensitiveKey("API_KEY")).toBe(true);
      expect(isSensitiveKey("AWS_SECRET_ACCESS_KEY")).toBe(true);
      expect(isSensitiveKey("GITHUB_TOKEN")).toBe(true);
      expect(isSensitiveKey("DB_PASSWORD")).toBe(true);
      expect(isSensitiveKey("STRIPE_TEST_KEY")).toBe(true);
    });

    it("should allow non-sensitive keys", () => {
      expect(isSensitiveKey("NODE_ENV")).toBe(false);
      expect(isSensitiveKey("PORT")).toBe(false);
      expect(isSensitiveKey("APP_NAME")).toBe(false);
      expect(isSensitiveKey("HOST_URL")).toBe(false);
    });
  });

  describe("isSensitiveValue", () => {
    it("should detect JWT-like values", () => {
      const jwtLike =
        "eyJ0eXAiOiJKV1Qi.fakepayload.fakesignature";
      expect(isSensitiveValue(jwtLike)).toBe(true);
    });

    it("should detect AWS Access Key-like values", () => {
      const awsLike = "AKIA1234567890FAKE";
      expect(isSensitiveValue(awsLike)).toBe(true);
    });

    it("should detect Stripe-like keys", () => {
      const stripeSecret = "sk_test_FAKE1234567890";
      const stripePublic = "pk_test_FAKE1234567890";
      expect(isSensitiveValue(stripeSecret)).toBe(true);
      expect(isSensitiveValue(stripePublic)).toBe(true);
    });

    it("should detect GitHub token-like values", () => {
      const githubToken = "ghp_FAKE123456789012345678901234567890";
      expect(isSensitiveValue(githubToken)).toBe(true);
    });

    it("should ignore normal values", () => {
      expect(isSensitiveValue("development")).toBe(false);
      expect(isSensitiveValue("3000")).toBe(false);
      expect(isSensitiveValue("localhost")).toBe(false);
      expect(isSensitiveValue("https://example.com")).toBe(false);
    });
  });

  describe("Encryption & Decryption", () => {
    it("should encrypt and decrypt a string successfully", () => {
      const plaintext = "my_super_secret_password";
      const password = generateEncryptionKey();

      const encryptedInfo = encryptValue(plaintext, password);
      expect(typeof encryptedInfo).toBe("string");

      const parsed = JSON.parse(encryptedInfo);
      expect(parsed.algorithm).toBe("aes-256-cbc");
      expect(parsed.ciphertext).toBeDefined();
      expect(parsed.hmac).toBeDefined();

      const decrypted = decryptValue(encryptedInfo, password);
      expect(decrypted).toBe(plaintext);
    });

    it("should throw error when decrypting with wrong password", () => {
      const plaintext = "secret_data";
      const rightPassword = generateEncryptionKey();
      const wrongPassword = generateEncryptionKey();

      const encrypted = encryptValue(plaintext, rightPassword);

      expect(() => {
        decryptValue(encrypted, wrongPassword);
      }).toThrow();
    });
  });
});
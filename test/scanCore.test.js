const { scanLine, shouldScanFile } = require("../src/core/scanCore");

describe("Scan Core", () => {
  describe("shouldScanFile", () => {
    it("should identify scanable files by extension", () => {
      expect(shouldScanFile("index.js")).toBe(true);
      expect(shouldScanFile("app.ts")).toBe(true);
      expect(shouldScanFile("config.json")).toBe(true);
      expect(shouldScanFile(".env")).toBe(true);
      expect(shouldScanFile("server.py")).toBe(true);
    });

    it("should ignore non-scanable files", () => {
      expect(shouldScanFile("image.png")).toBe(false);
      expect(shouldScanFile("package-lock.json")).toBe(false);
      expect(shouldScanFile("yarn.lock")).toBe(false);
    });
  });

  describe("scanLine", () => {
    it("should detect AWS Access Keys in a line", () => {
      const line = 'const awsKey = "AKIAIOSFODNN7EXAMPLE";';
      const findings = scanLine(line, 1, "test.js");
      expect(findings.length).toBe(1);
      expect(findings[0].type).toBe("AWS Access Key ID");
      expect(findings[0].severity).toBe("critical");
    });

    it("should detect generic secrets in a line", () => {
      const line = 'const secret = "SuperSecretPassword123!";';
      const findings = scanLine(line, 1, "test.js");
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].severity).toBe("high");
    });
    
    it("should not falsely flag safe lines", () => {
      const line = 'const config = { port: 3000, host: "localhost" };';
      const findings = scanLine(line, 1, "test.js");
      expect(findings.length).toBe(0);
    });

    it("should skip comment lines", () => {
      const line = '// const awsKey = "AKIAIOSFODNN7EXAMPLE";';
      const findings = scanLine(line, 1, "test.js");
      expect(findings.length).toBe(0);
    });
  });
});

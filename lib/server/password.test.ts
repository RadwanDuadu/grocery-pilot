import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the correct password without storing plaintext", async () => {
    const encoded = await hashPassword("correct horse battery staple");
    expect(encoded).not.toContain("correct horse battery staple");
    await expect(verifyPassword("correct horse battery staple", encoded)).resolves.toBe(true);
  });

  it("rejects an incorrect password and malformed hashes", async () => {
    const encoded = await hashPassword("a secure password");
    await expect(verifyPassword("a different password", encoded)).resolves.toBe(false);
    await expect(verifyPassword("anything", "malformed")).resolves.toBe(false);
  });
});

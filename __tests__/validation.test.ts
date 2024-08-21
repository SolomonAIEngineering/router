import { expect, expectTypeOf, test, describe } from "vitest";
import { z } from "zod";
import * as validation from "../lib/validation";

describe("convertToCorrectTypes", () => {
  test('should convert "true" and "false" strings to boolean values', () => {
    const data = { isActive: "true", isVerified: "false" };
    const schema: GeneralSchema[] = [
      { isActive: "boolean" },
      { isVerified: "boolean" },
    ];

    const result = validation.convertToCorrectTypes(data, schema);
    console.log(result);

    expect(result.isActive).toBe(true);
    expect(result.isVerified).toBe(false);
  });

  test("should convert strings to numbers", () => {
    const data = { age: "30", score: "NaN", invalidNumber: "abc" };
    const schema: GeneralSchema[] = [
      { age: "number" },
      { score: "number" },
      { invalidNumber: "number" },
    ];

    const result = validation.convertToCorrectTypes(data, schema);

    expect(result.age).toBe(30);
    expect(result.score).toBe(undefined);
    expect(result.invalidNumber).toBe(undefined);
  });

  test("should not modify strings", () => {
    const data = { name: "John Doe", country: "USA" };
    const schema: GeneralSchema[] = [{ name: "string" }, { country: "string" }];

    const result = validation.convertToCorrectTypes(data, schema);

    expect(result.name).toBe("John Doe");
    expect(result.country).toBe("USA");
  });

  test("should handle mixed types in data", () => {
    const data = {
      name: "Jane Doe",
      isActive: "true",
      age: "28",
      invalidNumber: "not a number",
    };
    const schema: GeneralSchema[] = [
      { name: "string" },
      { isActive: "boolean" },
      { age: "number" },
      { invalidNumber: "number" },
    ];

    const result = validation.convertToCorrectTypes(data, schema);

    expect(result.name).toBe("Jane Doe");
    expect(result.isActive).toBe(true);
    expect(result.age).toBe(28);
    expect(result.invalidNumber).toBe(undefined);
  });

  test("should return empty object when schema is empty", () => {
    const data = { name: "Jane Doe", isActive: "true", age: "28" };
    const schema: GeneralSchema[] = [];

    const result = validation.convertToCorrectTypes(data, schema);

    expect(result).toEqual({});
  });

  test("should return an object with undefined values if keys are missing in data", () => {
    const data = { name: "Jane Doe" };
    const schema: GeneralSchema[] = [
      { name: "string" },
      { isActive: "boolean" },
      { age: "number" },
    ];

    const result = validation.convertToCorrectTypes(data, schema);

    expect(result.name).toBe("Jane Doe");
    expect(result.isActive).toBe(false);
    expect(result.age).toBe(undefined);
  });
});

describe("generateDynamicSchema", () => {
  test("should generate a dynamic schema for a single field", () => {
    const schema: GeneralSchema[] = [{ age: "number" }];

    const dynamicSchema = validation.generateDynamicSchema(schema);

    const expectedSchema = {
      age: validation.validations.number,
    };

    console.log(expectedSchema);

    expect(dynamicSchema).toEqual(expectedSchema);
  });

  test("should generate a dynamic schema for multiple fields", () => {
    const schema: GeneralSchema[] = [
      { name: "string" },
      { email: "email" },
      { age: "number" },
    ];

    const dynamicSchema = validation.generateDynamicSchema(schema);

    const expectedSchema = {
      name: validation.validations.string,
      email: validation.validations.email,
      age: validation.validations.number,
    };

    expect(dynamicSchema).toEqual(expectedSchema);
  });

  test("should handle an empty schema array", () => {
    // @ts-expect-error -> we normally won't pass in an empty schema, but just in case :)
    const schema = [];

    // @ts-expect-error -> we normally won't pass in an empty schema, but just in case :)
    const dynamicSchema = validation.generateDynamicSchema(schema);

    const expectedSchema = {};

    expect(dynamicSchema).toEqual(expectedSchema);
  });

  test("should ignore invalid validation types and not include them in the schema", () => {
    const schema: GeneralSchema[] = [
      { username: "string" },
      { invalidField: "unknown" as ValidationType },
    ];

    const dynamicSchema = validation.generateDynamicSchema(schema);

    const expectedSchema = {
      username: validation.validations.string,
    };

    expect(dynamicSchema).toEqual(expectedSchema);
    expect(dynamicSchema).not.toHaveProperty("invalidField");
  });

  test("should correctly map a variety of validation types", () => {
    const schema: GeneralSchema[] = [
      { isActive: "boolean" },
      { birthdate: "date" },
      { website: "url" },
      { postalCode: "zip_code" },
    ];

    const dynamicSchema = validation.generateDynamicSchema(schema);

    const expectedSchema = {
      isActive: validation.validations.boolean,
      birthdate: validation.validations.date,
      website: validation.validations.url,
      postalCode: validation.validations.zip_code,
    };

    expect(dynamicSchema).toEqual(expectedSchema);
  });
});

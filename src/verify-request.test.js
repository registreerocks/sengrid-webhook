const { createVerifyRequest } = require("./verify-request.js");
const { when } = require("jest-when");
const crypto = require("crypto");

describe("verify requests", () => {
  test("verify should succeed on valid signatures", () => {
    validTestData.forEach((t) => {
      const get = jest.fn();
      when(get)
        .calledWith("X-Twilio-Email-Event-Webhook-Signature")
        .mockReturnValue(t.signature);
      when(get)
        .calledWith("X-Twilio-Email-Event-Webhook-Timestamp")
        .mockReturnValue(t.timestamp);

      const req = {
        get,
      };
      const sut = createVerifyRequest(t.publicKey);
      const result = () => sut(req, {}, Buffer.from(t.payload), "utf-8");

      expect(result).not.toThrow();
    });
  });

  test("verify should fail on invalid signatures", () => {
    invalidTestData.forEach((t) => {
      const get = jest.fn();
      when(get)
        .calledWith("X-Twilio-Email-Event-Webhook-Signature")
        .mockReturnValue(t.signature);
      when(get)
        .calledWith("X-Twilio-Email-Event-Webhook-Timestamp")
        .mockReturnValue(t.timestamp);

      const req = {
        get,
      };

      const sut = createVerifyRequest(t.publicKey);
      const result = () => sut(req, {}, Buffer.from(t.payload), "utf-8");

      expect(result).toThrow();
    });
  });

  test("should succeed on any correctly signed payload", () => {
    const timestamp = Date.now().toString();
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "secp256k1",
    });

    const payload = crypto.randomBytes(256);
    const sign = crypto.createSign("sha256");
    sign.update(timestamp);
    sign.update(payload);
    sign.end();
    const publicKeyString = publicKey
      .export({
        format: "der",
        type: "spki",
      })
      .toString("base64");
    const signature = sign.sign(privateKey, "base64");
    const sut = createVerifyRequest(publicKeyString);

    const get = jest.fn();
    when(get)
      .calledWith("X-Twilio-Email-Event-Webhook-Signature")
      .mockReturnValue(signature);
    when(get)
      .calledWith("X-Twilio-Email-Event-Webhook-Timestamp")
      .mockReturnValue(timestamp);

    const req = {
      get,
    };
    const result = () => sut(req, {}, payload, "utf-8");
    expect(result).not.toThrow();
  });
});

const validTestData = [
  {
    payload:
      '{"category":"example_payload","event":"test_event","message_id":"message_id"}',
    timestamp: "1588788367",
    signature:
      "MEUCIQCtIHJeH93Y+qpYeWrySphQgpNGNr/U+UyUlBkU6n7RAwIgJTz2C+8a8xonZGi6BpSzoQsbVRamr2nlxFDWYNH2j/0=",
    publicKey:
      "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEDr2LjtURuePQzplybdC+u4CwrqDqBaWjcMMsTbhdbcwHBcepxo7yAQGhHPTnlvFYPAZFceEu/1FwCM/QmGUhA==",
  },
];

const invalidTestData = [
  {
    payload:
      '{"category":"example_payload","event":"test_event","message_id":"message_id"}',
    timestamp: "1388788367",
    signature:
      "MEUCIQCtIHJeH93Y+qpYeWrySphQgpNGNr/U+UyUlBkU6n7RAwIgJTz2C+8a8xonZGi6BpSzoQsbVRamr2nlxFDWYNH2j/0=",
    publicKey:
      "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEDr2LjtURuePQzplybdC+u4CwrqDqBaWjcMMsTbhdbcwHBcepxo7yAQGhHPTnlvFYPAZFceEu/1FwCM/QmGUhA==",
  },
];

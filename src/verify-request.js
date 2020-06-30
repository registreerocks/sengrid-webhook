const crypto = require("crypto");

exports.createVerifyRequest = (publicKey) => (req, res, buf, encoding) => {
  const signature = req.get("X-Twilio-Email-Event-Webhook-Signature");
  const timestamp = req.get("X-Twilio-Email-Event-Webhook-Timestamp");
  const payload = buf;

  if (!signature || !timestamp || !payload) {
    throw new Error("No signature, timestamp or payload found");
  }
  const isValid = verifyPayload(buf, signature, timestamp, publicKey);
  if (isValid) {
    console.log("valid");
  } else {
    throw new Error("Invalid signature for payload");
  }
};

const verifyPayload = (payload, signature, timestamp, publicKey) => {
  const publicKeyObj = crypto.createPublicKey({
    key: Buffer.from(publicKey, "base64"),
    format: "der",
    type: "spki",
  });
  let verify = crypto.createVerify("sha256");
  verify.update(timestamp);
  verify.update(payload);
  verify.end();
  return verify.verify(publicKeyObj, signature, "base64");
};

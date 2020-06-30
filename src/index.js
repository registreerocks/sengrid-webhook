const express = require("express");
require("dotenv").config();
const { processEvents } = require("./process-events.js");
const { createVerifyRequest } = require("./verify-request.js");
const port = 3030;

const app = express();
const verifyRequest = createVerifyRequest(process.env.SENDGRID_PUB);

app.use(
  express.json({
    verify: verifyRequest,
  })
);

app.use((error, req, res, next) => {
  console.log(error.message);
  if (error.type === "entity.verify.failed") {
    res.status(403).send({ message: error.message });
  } else {
    res.status(500).send({ message: error.message });
  }
});

app.post("/event", async (req, res) => {
  try {
    const events = req.body;
    const message = await processEvents(events);
    res.send(message);
    console.log(`successfully processed event`);
  } catch (err) {
    res.status("500");
    res.send("internal error");
    console.log(`Error processing event: ${err}`);
  }
});

app.listen(port, () =>
  console.log(`Listening on port for sendgrid events ${port}`)
);

const pgp = require("pg-promise")({
  capSQL: true,
});

const db = pgp({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGLOGIN,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

exports.processEvents = async (events) => {
  const rowsToInsert = events.map((e) => ({
    eventId: e.sg_event_id,
    messageId: e.sg_message_id,
    reason: e.reason,
    email: e.email,
    eventTimestamp: new Date(e.timestamp * 1000),
    eventType: e.event,
    smtpId: e["smtp-id"],
    useragent: e.useragent,
    ipAddress: e.ip,
    statusCode: e.status,
    url: e.url,
    categories: e.category,
    eventBody: e,
    batchId: e.batchId
  }));
  const query = pgp.helpers
    .insert(rowsToInsert, cs)
    .concat('ON CONFLICT ("eventId") DO NOTHING');
  await db.none(query);
  console.log(
    "saved events: ",
    rowsToInsert.map((e) => e.eventId)
  );
  return "Saved";
};

const cs = new pgp.helpers.ColumnSet(
  [
    "eventId",
    "messageId",
    "reason",
    "email",
    "eventTimestamp",
    "eventType",
    "smtpId",
    "useragent",
    "ipAddress",
    "statusCode",
    "url",
    "categories",
    "eventBody",
    "batchId",
  ],
  { table: "EmailEvents" }
);

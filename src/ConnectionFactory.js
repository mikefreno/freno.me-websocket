//@ts-check
const { connect } = require("@planetscale/database");

function ConnectionFactory() {
  const config = {
    url: process.env.DATABASE_URL,
  };

  const conn = connect(config);
  return conn;
}
module.exports = {
  ConnectionFactory,
};

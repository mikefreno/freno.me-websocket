//@ts-check
const { ConnectionFactory } = require("./ConnectionFactory");

/**
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
const disconnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (connectionId) {
    const conn = ConnectionFactory();
    const query = "DELETE FROM Connection WHERE id = ?";
    const results = await conn.execute(query, [connectionId]);
    console.log(results);
  }
};
module.exports = {
  disconnect,
};

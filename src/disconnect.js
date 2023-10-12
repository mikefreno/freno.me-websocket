//@ts-check
const { ConnectionFactory } = require("./helper_functions");
/**
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
async function disconnect(event) {
  const connectionId = event.requestContext.connectionId;
  if (connectionId) {
    const conn = ConnectionFactory();
    const query = "DELETE FROM Connection WHERE connection_id = ?";
    const results = await conn.execute(query, [connectionId]);
    console.log(results);
    return {
      statusCode: 200,
      body: `disconnect`,
    };
  }
}
module.exports = { disconnect };

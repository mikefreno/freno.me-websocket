//@ts-check
import { ConnectionFactory } from "./helper_functions.js";
/**
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
export async function disconnect(event) {
  const connectionId = event.requestContext.connectionId;
  if (connectionId) {
    const conn = ConnectionFactory();
    const query = "DELETE FROM Connection WHERE connection_id = ?";
    const results = await conn.execute(query, [connectionId]);
    console.log(results);
  }
}
export default disconnect;

//@ts-check
import { ConnectionFactory } from "./ConnectionFactory";
import * as AWS from "aws-sdk";
/**
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
export const connect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  if (connectionId) {
    const client = new AWS.ApiGatewayManagementApi({
      endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });
    const conn = ConnectionFactory();
    const query =
      "INSERT INTO Connection (user_id, connection_id) VALUES(?, ?)";
    const params = ["temp", connectionId];
    try {
      const results = await conn.execute(query, params);
      const output = {
        ConnectionId: connectionId,
        Data: JSON.stringify({ connectionId: connectionId, results: results }),
      };
      await client.postToConnection(output).promise();
      return { statusCode: 200, body: JSON.stringify({ results: "success" }) };
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ results: e }) };
    }
  }
};

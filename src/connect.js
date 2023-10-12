//@ts-check
const { ConnectionFactory } = require("./helper_functions");
//const AWS = require("aws-sdk");

/**
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
const connect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  //const client = new AWS.ApiGatewayManagementApi({
  //endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
  //});
  const conn = ConnectionFactory();
  const query = "INSERT INTO Connection (user_id, connection_id) VALUES(?, ?)";
  const params = ["temp", connectionId];
  try {
    await conn.execute(query, params);
    //const output = {
    //ConnectionId: connectionId,
    //Data: JSON.stringify({ connectionId: connectionId, results: results }),
    //};
    //await client.postToConnection(output).promise();
    return {
      statusCode: 200,
      body: `Connect Request Success`,
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: `Connect Request Failure`,
    };
  }
};

module.exports = { connect };

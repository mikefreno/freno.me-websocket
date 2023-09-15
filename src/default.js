//@ts-check
const { ConnectionFactory } = require("./ConnectionFactory");
const AWS = require("aws-sdk");

/**
 * @typedef {Object} Payload
 * @property {"comment"|"channelUpdate"} messageType
 * @property {"create" | "update" | "delete" | undefined} commentType
 * @property {string | undefined} commentBody
 * @property {"blog" | "project"} postType
 * @property {number | undefined} blog_id
 * @property {number | undefined} project_id
 * @property {number | undefined} parent_comment_id
 * @property {string} invoker_id
 * @property {number | undefined} comment_id
 * @property {"user" | "admin" | undefined} deletionAgent
 */
/**
 * @typedef {Object} Connection
 * @property {number} id - Auto-incremented ID
 * @property {string} user_id - User ID, max length 255 characters
 * @property {string} connection_id - Connection ID, max length 255 characters
 * @property {?number} blog_id - Blog ID (optional)
 * @property {?number} project_id - Project ID (optional)
 */
/**
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
export async function handler(event) {
  /** @type {Payload} */
  //@ts-ignore
  const payload = JSON.parse(event.body);
  const messageType = payload.messageType;
  let conn = ConnectionFactory();
  const client = new AWS.ApiGatewayManagementApi({
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
  });
  if (messageType === "comment") {
    const commentType = payload.commentType;
    const postType = payload.postType;
    const parent_comment_id = payload.parent_comment_id;
    const commentBody = payload.commentBody;
    if (postType === "blog") {
      const blog_id = payload.blog_id;
      //collect connections to above post
      const collectionQuery = "SELECT * FROM Blog WHERE id = ?";
      const collectionResult = await conn.execute(collectionQuery, [blog_id]);
      const connections = collectionResult.rows;
      if (commentType === "create") {
        //insert message to database
        const query = `INSERT INTO Comment (body, blog_id, parent_comment_id) VALUES (?, ?, ?)`;
        const params = [commentBody, blog_id, parent_comment_id];
        await conn.execute(query, params);
        //broadcast to users in channel
        await broadcaster(connections, client);
        return JSON.stringify({ status: 202 });
      } else if (commentType === "update") {
        const query = `UPDATE Comment SET body = ? WHERE id = ?`;
        await conn.execute(query, [commentBody, payload.comment_id]);
        //broadcast to users in channel
        await broadcaster(connections, client);
        return JSON.stringify({ status: 201 });
      } else if (commentType === "delete") {
        const query = `UPDATE Comment SET body = ? WHERE id = ?`;
        await conn.execute(query, [
          `[comment removed by ${payload.deletionAgent}]`,
          payload.comment_id,
        ]);
        //broadcast to users in channel
        await broadcaster(connections, client);
        return JSON.stringify({ status: 201 });
      }
    } else if (postType === "project") {
      const project_id = payload.project_id;
      //collect connections to above post
      const collectionQuery = "SELECT * FROM project WHERE id = ?";
      const collectionResult = await conn.execute(collectionQuery, [
        project_id,
      ]);
      const connections = collectionResult.rows;
      if (commentType === "create") {
        //insert message to database
        const query = `INSERT INTO Comment (body, project_id, parent_comment_id) VALUES (?, ?, ?)`;
        const params = [commentBody, project_id, parent_comment_id];
        await conn.execute(query, params);
        //broadcast to users in channel
        await broadcaster(connections, client);
        return JSON.stringify({ status: 202 });
      } else if (commentType === "update") {
        //update comment message
        const query = `UPDATE Comment SET body = ? WHERE id = ?`;
        await conn.execute(query, [commentBody, payload.comment_id]);
        //broadcast to users in channel
        await broadcaster(connections, client);
        return JSON.stringify({ status: 201 });
      } else if (commentType === "delete") {
        //'delete' comment message
        const query = `UPDATE Comment SET body = ? WHERE id = ?`;
        await conn.execute(query, [
          `[comment removed by ${payload.deletionAgent}]`,
          payload.comment_id,
        ]);
        //broadcast to users in channel
        await broadcaster(connections, client);
        return JSON.stringify({ status: 201 });
      }
    }
  } else if (messageType === "channelUpdate") {
    const connectionId = event.requestContext.connectionId;
    if (payload.postType === "blog") {
      const query =
        "UPDATE Connection SET blog_id = ? project_id = ? user_id = ? WHERE connection_id = ?";
      const params = [payload.blog_id, null, payload.invoker_id, connectionId];
      await conn.execute(query, params);
      return JSON.stringify({ status: 201 });
    } else if (payload.postType === "project") {
      const query =
        "UPDATE Connection SET blog_id = ? project_id = ? user_id = ? WHERE connection_id = ?";
      const params = [payload.project_id, payload.invoker_id, connectionId];
      await conn.execute(query, params);
      return JSON.stringify({ status: 201 });
    }
  }
}

/**
 * @param {import("aws-sdk").ApiGatewayManagementApi} client
 */
const broadcaster = async (connections, client) => {
  Promise.all(
    connections.map(async (connection) => {
      try {
        const output = {
          //@ts-ignore
          ConnectionId: connection.connection_id,
          Data: JSON.stringify("update"),
        };
        await client.postToConnection(output).promise();
      } catch (e) {
        if (e.statusCode === 410) {
          //connection not availible, delete db entry
          const deletionQuery = `DELETE FROM Connection WHERE id = ?`;
          //@ts-ignore
          const res = await conn.execute(deletionQuery, [connection.id]);
          console.log(res);
        } else console.log(e);
      }
    }),
  );
};

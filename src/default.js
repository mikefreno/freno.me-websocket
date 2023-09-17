//@ts-check
import { ConnectionFactory } from "./helper_functions";
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
async function handler(event) {
  /** @type {Payload} */
  if (event.body) {
    const payload = JSON.parse(event.body);
    let conn = ConnectionFactory();
    const connectionId = event.requestContext.connectionId;
    try {
      if (payload.postType === "blog") {
        const query =
          "UPDATE Connection SET blog_id = ?, project_id = ?, user_id = ? WHERE connection_id = ?";
        const params = [
          payload.blog_id,
          null,
          payload.invoker_id,
          connectionId,
        ];
        await conn.execute(query, params);
        return JSON.stringify({ status: 201 });
      } else if (payload.postType === "project") {
        const query =
          "UPDATE Connection SET blog_id = ?, project_id = ?, user_id = ? WHERE connection_id = ?";
        const params = [payload.project_id, payload.invoker_id, connectionId];
        await conn.execute(query, params);
        return JSON.stringify({ status: 201 });
      }
    } catch (e) {
      console.error(e.message);
      console.error(e.stack);
    }
  }
}
/**
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
//async function deleteComment(event) {
//if (event.body) {
//[>* @type {Payload} <]
//const payload = JSON.parse(event.body);
//let conn = ConnectionFactory();
//const client = new ApiGatewayManagementApi({
//endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
//});
//const query = `UPDATE Comment SET body = ? WHERE id = ?,`;
//await conn.execute(query, [
//`[comment removed by ${payload.deletionAgent}]`,
//payload.comment_id,
//]);
////broadcast to users in channel
//await Broadcaster(
//conn,
//payload.postType,
//payload.blog_id || payload.project_id,
//client,
//);
//return JSON.stringify({ status: 201 });
//}
//}
/**
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
//async function reactionHandler(event) {
//if (event.body) {
//[>* @type {Payload} <]
//const payload = JSON.parse(event.body);
//let conn = ConnectionFactory();
//const client = new ApiGatewayManagementApi({
//endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
//});
////
////ADD SQL LOGIC HERE
////
////broadcast to users in channel
//await Broadcaster(
//conn,
//payload.postType,
//payload.blog_id || payload.project_id,
//client,
//);
//return JSON.stringify({ status: 201 });
//}
//}

export default handler;

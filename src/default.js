//@ts-check
import { ConnectionFactory } from "./ConnectionFactory";
import * as AWS from "aws-sdk";
/**
 * @typedef {Object} Payload
 * @property {"comment"|"update"|"delete"} messageType
 * @property {?string} commentType
 * @property {string | null} commentBody
 * @property {"blog" | "project"} postType
 * @property {number | null} blog_id
 * @property {number | null} project_id
 * @property {number | null} parent_comment_id
 * @property {string} invoker_id
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
        const query = `INSERT INTO Comment (body, blog_id, parent_comment_id)`;
        const params = [commentBody, blog_id, parent_comment_id];
        const results = conn.execute(query, params);
        //broadcast to users in channel
        const broadcast = {
          comment: commentBody,
          user_id: payload.invoker_id,
          parent_comment_id: parent_comment_id,
        };
        Promise.all(
          connections.map(async (connection) => {
            try {
              const output = {
                //@ts-ignore
                ConnectionId: connection.connection_id,
                Data: JSON.stringify(broadcast),
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
      } else if (commentType === "update") {
      } else if (commentType === "delete") {
      }
    }else if (postType === "project"){
      const project_id = payload.project_id;
      //collect connections to above post
      const collectionQuery = "SELECT * FROM project WHERE id = ?";
      const collectionResult = await conn.execute(collectionQuery, [project_id]);
      const connections = collectionResult.rows;
      if (commentType === "create"){}
      else if(commentType === "update"){}
      else if (commentType === "delete")
    }
  }
}

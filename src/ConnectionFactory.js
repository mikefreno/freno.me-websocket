//@ts-check
import { connect } from "@planetscale/database";

export function ConnectionFactory() {
  const config = {
    url: process.env.DATABASE_URL,
  };

  const conn = connect(config);
  return conn;
}

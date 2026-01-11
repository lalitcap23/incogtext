import dbConnect from "../../lib/helping/dbconnection";

export async function GET() {
  await dbConnect();
  return Response.json({ status: "ok" });
}

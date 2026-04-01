import dbConnect from "../../lib/helping/dbconnection";

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  return Response.json({ status: "ok" });
}
 
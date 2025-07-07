
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  // WebSocket connection is disabled.
  res.status(404).json({ message: "Service not available" });
}

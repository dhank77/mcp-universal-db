import { db } from '../index.js';

export async function handleConnection(params: any) {
  switch (params.action) {
    case "connect":
      await db.connect();
      return { status: "connected" };
    case "disconnect":
      await db.disconnect();
      return { status: "disconnected" };
    case "status":
      return { connected: db.isConnected() };
    default:
      throw new Error(`Unknown action: ${params.action}`);
  }
}
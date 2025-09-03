import { db } from '../index.js';

export async function handleConnection(params: any) {
  console.error('DEBUG: handleConnection called with action:', params.action);
  console.error('DEBUG: db instance exists:', !!db);
  
  try {
    switch (params.action) {
      case "connect":
        console.error('DEBUG: Checking if already connected...');
        if (db.isConnected()) {
          return { status: "already connected" };
        }
        console.error('DEBUG: Calling db.connect()...');
        await db.connect();
        console.error('DEBUG: Connect completed, status:', db.isConnected());
        return { status: "connected" };
      case "disconnect":
        await db.disconnect();
        return { status: "disconnected" };
      case "status":
        const connected = db.isConnected();
        console.error('DEBUG: Status check, connected:', connected);
        return { connected };
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  } catch (error) {
    console.error('DEBUG: Error in handleConnection:', error);
    throw error;
  }
}
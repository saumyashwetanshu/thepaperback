import express from "express";

// SSE Client Registry
export const sseClients = new Set<express.Response>();

export function broadcastSSE(event: string, data: any) {
  const message = `event: ${event}ndata: ${JSON.stringify(data)}nn`;
  sseClients.forEach(client => client.write(message));
}

import { Server } from 'socket.io';

let _io: Server;

export function setIo(io: Server) {
  _io = io;
}

export function emitBidNew(auctionId: string, data: unknown) {
  _io?.to(`auction:${auctionId}`).emit('bid:new', data);
}

export function emitAuctionEnded(auctionId: string, data: unknown) {
  _io?.to(`auction:${auctionId}`).emit('auction:ended', data);
}

export function emitAuctionExtended(auctionId: string, data: unknown) {
  _io?.to(`auction:${auctionId}`).emit('auction:extended', data);
}

export function emitToUser(userId: string, event: string, data: unknown) {
  _io?.to(`user:${userId}`).emit(event, data);
}

export function emitToConversation(convId: string, data: unknown) {
  _io?.to(`conv:${convId}`).emit('message:new', data);
}

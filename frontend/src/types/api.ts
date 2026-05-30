export interface User {
  id: string;
  email?: string;
  username: string;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export type Condition = 'MINT' | 'NEAR_MINT' | 'EXCELLENT' | 'GOOD' | 'LIGHT_PLAYED' | 'PLAYED' | 'POOR';
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'CANCELLED';
export type AuctionStatus = 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface Listing {
  id: string;
  sellerId: string;
  seller: Pick<User, 'id' | 'username' | 'averageRating'>;
  scryfallId: string;
  cardName: string;
  setCode: string;
  setName: string;
  imageUri: string;
  lang: string;
  condition: Condition;
  isFoil: boolean;
  price: number;
  quantity: number;
  description?: string;
  status: ListingStatus;
  createdAt: string;
}

export interface Auction {
  id: string;
  sellerId: string;
  seller: Pick<User, 'id' | 'username' | 'averageRating' | 'reviewCount'>;
  scryfallId: string;
  cardName: string;
  setCode: string;
  setName: string;
  imageUri: string;
  lang: string;
  condition: Condition;
  isFoil: boolean;
  description?: string;
  startingPrice: number;
  reservePrice?: number;
  currentBid?: number;
  buyItNowPrice?: number;
  winnerId?: string;
  status: AuctionStatus;
  endsAt: string;
  extendMinutes: number;
  extensionCount: number;
  bids?: Bid[];
  _count?: { bids: number };
  createdAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidder: Pick<User, 'id' | 'username'>;
  amount: number;
  createdAt: string;
  auction?: Pick<Auction, 'id' | 'cardName' | 'imageUri' | 'currentBid' | 'endsAt' | 'status'>;
}

export interface Review {
  id: string;
  authorId: string;
  author: Pick<User, 'id' | 'username'>;
  targetId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
  image_uris?: { small: string; normal: string; large: string; art_crop: string };
  card_faces?: Array<{ name: string; image_uris?: { small: string; normal: string; large: string } }>;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity?: string[];
  rarity: string;
  prices?: { usd?: string; usd_foil?: string };
  released_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: Pick<User, 'id' | 'username'>;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user1: Pick<User, 'id' | 'username' | 'averageRating'>;
  user2Id: string;
  user2: Pick<User, 'id' | 'username' | 'averageRating'>;
  auctionId?: string;
  listingId?: string;
  lastMsgAt?: string;
  createdAt: string;
  messages?: Message[];
  unreadCount?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  readAt: string | null;
  createdAt: string;
}

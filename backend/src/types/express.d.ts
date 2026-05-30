declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        averageRating: number;
        reviewCount: number;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export {};

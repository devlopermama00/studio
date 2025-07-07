

export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "provider" | "admin";
  profilePhoto?: string;
  isVerified?: boolean;
};

export type Category = {
  id: string;
  name: string;
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Tour = {
  id: string;
  title: string;
  country: string;
  city: string;
  place: string;
  images: string[];
  durationInHours: number;
  currency: string;
  price: number;
  originalPrice?: number;
  tourType: 'public' | 'private';
  category: string;
  groupSize: number;
  overview: string;
  languages: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  importantInformation?: string;
  itinerary: { title: string; description: string }[];
  providerId: string;
  providerName: string;
  rating: number;
  reviews: Review[];
  approved: boolean;
};

export type Booking = {
  id: string;
  userId: string;
  tourId: string;
  tourTitle: string;
  tourImage: string;
  bookingDate: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "cancellation-requested";
};

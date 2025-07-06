
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
  location: string;
  category: string;
  price: number;
  duration: string; // e.g., "8 hours", "Full Day"
  description: string;
  itinerary: { title: string; description: string }[];
  images: string[];
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
  status: "pending" | "confirmed" | "cancelled" | "completed";
};

export type UserRole = "student" | "business" | "admin";

export type BusinessStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export type ProductCondition = "new" | "like_new" | "good" | "fair" | "used";

export type OrderStatus =
  | "placed"
  | "paid"
  | "shipped"
  | "completed"
  | "cancelled";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  business_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  status: BusinessStatus;
  rejection_reason: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  image_urls: string[];
  stock_quantity: number;
  condition: ProductCondition;
  /** Meetup/pickup area, required on new products (nullable for legacy rows). */
  location?: string | null;
  /** Ghanaian institution the listing is tied to (optional). */
  institution?: string | null;
  is_active: boolean;
  is_featured: boolean;
  rating_avg: number;
  rating_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  business?: Business;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  // Joined
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  notes: string | null;
  payment_method: string;
  shipping_address: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  items?: OrderItem[];
  buyer?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  business_id: string;
  seller_business_name: string;
  product_title: string;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined
  user?: Profile;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  // Joined
  product?: Product;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  business_id: string;
  order_id: string | null;
  product_id: string | null;
  subject: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  business?: Pick<Business, "id" | "business_name" | "slug" | "logo_url">;
  buyer?: Pick<Profile, "id" | "full_name" | "email">;
  messages?: Message[];
  /** Computed for the inbox list — most recent message in the thread. */
  last_message?: Message | null;
  /** Computed for the inbox list — messages from the other party not yet read. */
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export type ActivityType =
  | "user_registered"
  | "business_pending"
  | "business_approved"
  | "order_placed"
  | "order_completed"
  | "product_created"
  | "review_submitted";

export interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  created_at: string;
}

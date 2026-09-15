import { createClient } from "@/lib/supabase/server";
import type {
  Product,
  Category,
  Order,
  Review,
  Business,
  Profile,
  WishlistItem,
  Conversation,
  Message,
} from "@/lib/types";

const ITEMS_PER_PAGE = 8;

/**
 * Get products with filtering, sorting, and pagination.
 */
export async function getProducts({
  query,
  category,
  sort,
  page = 1,
  limit = ITEMS_PER_PAGE,
  featured = false,
}: {
  query?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
} = {}) {
  const supabase = await createClient();

  let qb = supabase
    .from("products")
    .select("*, category:categories(*), business:businesses(id, business_name, slug, phone)", { count: "exact" })
    .eq("is_active", true);

  if (featured) {
    qb = qb.eq("is_featured", true);
  }

  if (query) {
    qb = qb.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  if (category) {
    qb = qb.eq("categories.slug", category);
  }

  // Sorting
  switch (sort) {
    case "price-asc":
      qb = qb.order("price", { ascending: true });
      break;
    case "price-desc":
      qb = qb.order("price", { ascending: false });
      break;
    case "rating":
      qb = qb.order("rating_avg", { ascending: false });
      break;
    case "newest":
    default:
      qb = qb.order("created_at", { ascending: false });
      break;
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await qb.range(from, to);

  if (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0, totalPages: 0 };
  }

  return {
    products: (data as Product[]) || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get a single product by slug.
 */
export async function getProduct(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), business:businesses(id, business_name, slug, logo_url, phone)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as Product;
}

/**
 * Get categories with product counts.
 */
export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return (data as Category[]) || [];
}

/**
 * Get a user's cart items with product details.
 */
export async function getCart(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cart_items")
    .select("*, product:products(*, business:businesses(id, business_name))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cart:", error);
    return [];
  }

  return data || [];
}

/**
 * Get orders for a buyer.
 */
export async function getOrdersByBuyer(buyerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return (data as Order[]) || [];
}

/**
 * Get orders containing products from a specific business.
 */
export async function getOrdersByBusiness(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items!inner(*)")
    .eq("order_items.business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching business orders:", error);
    return [];
  }

  return (data as Order[]) || [];
}

/**
 * Get products for a specific business.
 */
export async function getProductsByBusiness(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching business products:", error);
    return [];
  }

  return (data as Product[]) || [];
}

/**
 * Get reviews for a product.
 */
export async function getProductReviews(productId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:profiles(full_name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return (data as Review[]) || [];
}

/**
 * Get admin dashboard stats.
 */
export async function getAdminStats() {
  const supabase = await createClient();

  const [usersCount, businessesCount, ordersCount, revenueResult] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total"),
    ]);

  const totalRevenue =
    revenueResult.data?.reduce((sum, order) => sum + (order.total || 0), 0) ||
    0;

  return {
    totalUsers: usersCount.count || 0,
    totalBusinesses: businessesCount.count || 0,
    totalOrders: ordersCount.count || 0,
    totalRevenue,
  };
}

/**
 * Get businesses pending approval.
 */
export async function getPendingBusinesses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending businesses:", error);
    return [];
  }

  return (data as Business[]) || [];
}

/**
 * Get a single order by id (buyer, seller, or admin).
 */
export async function getOrderById(orderId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*), buyer:profiles(id, email, full_name)")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }

  return data as Order;
}

/**
 * Get the business record owned by a user (businesses.id = profiles.id).
 */
export async function getBusinessByOwner(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching business by owner:", error);
    return null;
  }

  return data as Business;
}

/**
 * Get all businesses with their owner profile (admin).
 */
export async function getAllBusinesses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("*, owner:profiles(id, email, full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all businesses:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all user profiles (admin).
 */
export async function getAllUsers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all users:", error);
    return [];
  }

  return (data as Profile[]) || [];
}

/**
 * Get all orders with items and buyer (admin).
 */
export async function getAllOrders() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*), buyer:profiles(id, email, full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }

  return (data as Order[]) || [];
}

/**
 * Get all categories including inactive (admin).
 */
export async function getAllCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }

  return (data as Category[]) || [];
}

/**
 * Active product counts per category (for the shop sidebar).
 */
export async function getCategoryCounts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("category_id")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching category counts:", error);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.category_id] = (counts[row.category_id] || 0) + 1;
  }
  return counts;
}

/**
 * Get all products with category and business (admin).
 */
export async function getAdminProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(name), business:businesses(id, business_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin products:", error);
    return [];
  }

  return (data as Product[]) || [];
}

/**
 * Get a user's wishlist items with product details.
 */
export async function getWishlist(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*, product:products(*, business:businesses(id, business_name, phone))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }

  return (data as WishlistItem[]) || [];
}

/**
 * Get just the product ids in a user's wishlist (for heart states).
 */
export async function getWishlistIds(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching wishlist ids:", error);
    return [];
  }

  return (data || []).map((row) => row.product_id);
}

/**
 * Get a user's conversations (as buyer or business owner) with the last
 * message and unread count computed for the inbox list.
 */
export async function getConversationsForUser(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("*, business:businesses(id, business_name, slug, logo_url)")
    .or(`buyer_id.eq.${userId},business_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  const conversations = (data as Conversation[]) || [];
  if (conversations.length === 0) return [];

  // Buyer info lives in profiles. conversations.buyer_id FK points at
  // auth.users (not profiles), so it can't be embedded — fetch in one pass.
  const buyerIds = [...new Set(conversations.map((c) => c.buyer_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", buyerIds);

  if (!profilesError) {
    const byId = new Map((profiles as Profile[]).map((p) => [p.id, p]));
    for (const conversation of conversations) {
      conversation.buyer = byId.get(conversation.buyer_id);
    }
  }

  // One pass over messages to attach the last message + unread count.
  const ids = conversations.map((c) => c.id);
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .in("conversation_id", ids)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching conversation messages:", messagesError);
    return conversations;
  }

  const byConversation = new Map<string, Message[]>();
  for (const message of (messages as Message[]) || []) {
    const list = byConversation.get(message.conversation_id) || [];
    list.push(message);
    byConversation.set(message.conversation_id, list);
  }

  for (const conversation of conversations) {
    const thread = byConversation.get(conversation.id) || [];
    conversation.last_message = thread.length > 0 ? thread[thread.length - 1] : null;
    conversation.unread_count = thread.filter(
      (m) => m.sender_id !== userId && m.read_at === null
    ).length;
  }

  return conversations;
}

/**
 * Get a single conversation with all its messages. RLS guarantees the
 * caller is a participant; non-participants get null.
 */
export async function getConversationById(conversationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("*, business:businesses(id, business_name, slug, logo_url)")
    .eq("id", conversationId)
    .single();

  if (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }

  const conversation = data as Conversation;

  // Buyer info lives in profiles (no direct FK from conversations, so it
  // can't be embedded — fetch separately).
  const { data: buyer } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", conversation.buyer_id)
    .maybeSingle();

  conversation.buyer = buyer ?? undefined;

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching thread messages:", messagesError);
    conversation.messages = [];
  } else {
    conversation.messages = (messages as Message[]) || [];
  }

  return conversation;
}

/**
 * Count unread messages across a user's conversations (for the navbar badge).
 * RLS already scopes conversations to the caller, so the first query is just
 * the participant's conversation ids.
 */
export async function getUnreadMessageCount(userId: string) {
  const supabase = await createClient();

  const { data: convs, error: convsError } = await supabase
    .from("conversations")
    .select("id");

  if (convsError) {
    console.error("Error fetching conversations for unread count:", convsError);
    return 0;
  }

  const ids = (convs || []).map((c) => c.id);
  if (ids.length === 0) return 0;

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", ids)
    .is("read_at", null)
    .neq("sender_id", userId);

  if (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }

  return count || 0;
}

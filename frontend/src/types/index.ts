export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: {
    public_id: string;
    url: string;
  };
  phone?: string;
  phoneVerified?: boolean;
  phoneCountry?: string;
  addresses?: Address[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  brand?: string;
  countInStock: number;
  images: ProductImage[];
  videos?: ProductVideo[];
  featured: boolean;
  reviews: Review[];
  numReviews: number;
  rating: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Delivery and Service Information
  deliveryInfo?: {
    standardDelivery?: {
      available: boolean;
      days: string;
      cost: number;
    };
    cashOnDelivery?: {
      available: boolean;
    };
    freeDelivery?: {
      available: boolean;
      minOrder: number;
    };
  };
  // Return and Warranty Information
  returnPolicy?: {
    available: boolean;
    days: number;
    description: string;
  };
  warranty?: {
    available: boolean;
    duration?: string;
    description?: string;
    type: 'Manufacturer' | 'Seller' | 'Brand';
  };
  // Product Specifications
  specifications?: {
    name: string;
    value: string;
  }[];
  // What's in the box
  whatsInBox?: {
    item: string;
    quantity: number;
  }[];
  // Questions and Answers
  qnaQuestions?: {
    _id: string;
    user: string;
    userName: string;
    question: string;
    answer?: {
      text: string;
      answeredBy: string;
      answeredByName: string;
      answeredAt: string;
    };
    createdAt: string;
  }[];
}

export interface ProductImage {
  public_id: string;
  url: string;
}

export interface ProductVideo {
  public_id: string;
  url: string;
}

export interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  countInStock: number;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  shippingAddress: Address | null;
  paymentMethod: string;
}

export interface OrderState {
  orders: Order[];
  order: Order | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface FilterOptions {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  search?: string;
  onSale?: boolean;
  newArrivals?: boolean;
}

export interface CategoryStats {
  category: string;
  count: number;
  avgPrice: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  topProducts: Product[];
  categoryStats: CategoryStats[];
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

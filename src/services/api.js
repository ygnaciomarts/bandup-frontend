import { mockProducts, mockUser, mockAdminUser, mockOrders, mockToken } from './mockData'

// Use mock data when VITE_USE_MOCK is not explicitly set to false
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// Ya sin /api
const API_URL = import.meta.env.VITE_API_URL || ''

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  if (
    options.body != null &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams)
  ) {
    headers['Content-Type'] = 'application/json'
  }

  const config = {
    ...options,
    headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)

  let data = {}

  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    const err = new Error(data.error || 'Request failed')
    err.status = response.status
    err.data = data
    throw err
  }

  return data
}

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Normalize backend product structure
const normalizeProduct = (product) => ({
  id: product.id,
  sku: product.sku,
  barcode: product.barcode,

  // Main info
  title: product.title,
  artist: product.artist,
  type: product.type,

  // Prices
  price: Number(product.price?.final ?? 0),
  price_original: Number(product.price?.original ?? 0),
  price_final: Number(product.price?.final ?? 0),
  currency: product.price?.currency || 'MXN',

  // Inventory
  stock: product.stock || 0,
  reserved_stock: product.reserved_stock || 0,

  // Media
  cover_image: product.coverImage,

  // Extra
  description: product.description,
  rating: Number(product.rating || 0),
  review_count: product.review_count || 0,
  is_active: Boolean(product.is_active),
  isFeatured: Boolean(product.isFeatured),

  created_at: product.created_at,
  updated_at: product.updated_at,
})

// Mock API implementation
const mockApi = {
  // Auth
  login: async (credentials) => {
    await delay()

    const email = credentials.email || credentials.username

    if (
      (email === 'admin@bandup.com' || email === 'admin') &&
      credentials.password === 'admin123'
    ) {
      return { token: mockToken, user: mockAdminUser }
    }

    if (
      credentials.password === 'demo123' ||
      (email === 'demo@bandup.com' || email === 'demo')
    ) {
      return { token: mockToken, user: mockUser }
    }

    const loginErr = new Error(
      'Credenciales inválidas. Usa: demo/demo123 o admin/admin123'
    )

    loginErr.status = 401
    loginErr.error = loginErr.message

    throw loginErr
  },

  register: async (userData) => {
    await delay()

    const newUser = {
      ...mockUser,
      nombre: userData.nombre,
      email: userData.email,
    }

    return {
      token: mockToken,
      user: newUser,
    }
  },

  getMe: async () => {
    await delay(100)

    const token = localStorage.getItem('token')

    if (!token) {
      const authErr = new Error('No autenticado')

      authErr.status = 401
      authErr.error = authErr.message

      throw authErr
    }

    const mockEmail = localStorage.getItem('mockEmail')

    return mockEmail === 'admin@bandup.com'
      ? mockAdminUser
      : mockUser
  },

  // Products
  getProducts: async (params = {}) => {
    await delay()

    let filtered = [...mockProducts]

    if (params.type) {
      filtered = filtered.filter(p => p.type === params.type)
    }

    if (params.q) {
      const q = params.q.toLowerCase()

      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.artist.toLowerCase().includes(q)
      )
    }

    const limit = Number.parseInt(params.limit) || 12
    const page = Number.parseInt(params.page) || 1
    const offset = (page - 1) * limit

    return {
      products: filtered.slice(offset, offset + limit),
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit),
    }
  },

  getFeatured: async () => {
    await delay()

    return {
      products: mockProducts.filter(p => p.isFeatured),
    }
  },

  searchProducts: async (q) => {
    await delay()

    const query = q.toLowerCase()

    const filtered = mockProducts.filter(
      p =>
        p.title.toLowerCase().includes(query) ||
        p.artist.toLowerCase().includes(query)
    )

    return {
      products: filtered,
    }
  },

  getProduct: async (id) => {
    await delay()

    const product = mockProducts.find(
      p => p.id === Number.parseInt(id)
    )

    if (!product) {
      const prodErr = new Error('Producto no encontrado')

      prodErr.status = 404
      prodErr.error = prodErr.message

      throw prodErr
    }

    return product
  },

  rateProduct: async (id, rating) => {
    await delay(100)

    return {
      success: true,
      rating,
    }
  },

  // Cart
  addToCart: async (product_id, qty = 1) => {
    await delay(100)

    return {
      success: true,
    }
  },

  // Orders
  createOrder: async (items) => {
    await delay(500)

    const total = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    )

    return {
      success: true,
      order: {
        id: Date.now(),
        created_at: new Date().toISOString(),
        total,
        status: 'pending',
        items,
      },
    }
  },

  getOrders: async () => {
    await delay()

    return {
      orders: mockOrders,
    }
  },

  getOrder: async (id) => {
    await delay()

    const order = mockOrders.find(
      o => o.id === Number.parseInt(id)
    )

    if (!order) {
      const orderErr = new Error('Orden no encontrada')

      orderErr.status = 404
      orderErr.error = orderErr.message

      throw orderErr
    }

    return order
  },

  // User
  getProfile: async () => {
    await delay()

    return mockUser
  },

  resetPassword: async () => {
    await delay()

    return {
      success: true,
      message: 'Se envió un correo con instrucciones',
    }
  },
}

// Real API implementation
const realApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request('/auth/me'),

  getProducts: async (params = {}) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ''
      )
    )

    const query = new URLSearchParams(filteredParams).toString()

    const data = await request(
      `/products${query ? `?${query}` : ''}`
    )

    return {
      ...data,
      products: Array.isArray(data.products)
        ? data.products.map(normalizeProduct)
        : [],
    }
  },

  getFeatured: async () => {
    const data = await request('/products/featured')

    return {
      ...data,
      products: Array.isArray(data.products)
        ? data.products.map(normalizeProduct)
        : [],
    }
  },

  searchProducts: async (q) => {
    const data = await request(
      `/products/search?q=${encodeURIComponent(q)}`
    )

    return {
      ...data,
      products: Array.isArray(data.products)
        ? data.products.map(normalizeProduct)
        : [],
    }
  },

  getProduct: async (id) => {
    const product = await request(`/products/${id}`)

    return normalizeProduct(product)
  },

  rateProduct: (id, rating) =>
    request(`/products/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    }),

  addToCart: (product_id, qty = 1) =>
    request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id, qty }),
    }),

  createOrder: (items) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  getOrders: () => request('/orders'),

  getOrder: (id) => request(`/orders/${id}`),

  getProfile: () => request('/user/profile'),

  resetPassword: (email) =>
    request('/user/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
}

export const api = USE_MOCK ? mockApi : realApi
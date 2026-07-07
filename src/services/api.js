import { mockProducts, mockUser, mockAdminUser, mockOrders, mockToken } from './mockData'

// Use mock data only when VITE_USE_MOCK is explicitly set to true
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const API_URL = import.meta.env.VITE_API_URL || ''

// =============================================
// TOKEN UTILITIES
// =============================================
const TOKEN_KEY = 'bandup_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Decode JWT payload without library (base64url → JSON).
 * Returns null if invalid.
 */
function decodeTokenPayload(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replaceAll('-', '+').replaceAll('_', '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Returns true if the token is expired or will expire within bufferMs.
 */
export function isTokenExpired(bufferMs = 60000) {
  const token = getToken()
  if (!token) return true
  const payload = decodeTokenPayload(token)
  if (!payload?.exp) return false // If no exp, assume valid (server will reject)
  return (payload.exp * 1000) - Date.now() < bufferMs
}

// Listeners for forced logout (401 from any request)
const logoutListeners = new Set()
export function onForceLogout(fn) {
  logoutListeners.add(fn)
  return () => logoutListeners.delete(fn)
}
function triggerForceLogout() {
  removeToken()
  logoutListeners.forEach(fn => fn())
}

async function request(endpoint, options = {}) {
  const token = getToken()

  // Proactive token expiry check (skip for login/register endpoints)
  if (token && isTokenExpired(5000) && !endpoint.includes('/auth/')) {
    triggerForceLogout()
    const err = new Error('Sesión expirada')
    err.status = 401
    throw err
  }

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

  const controller = new AbortController()
  const timeoutMs = options.timeout || 15000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const config = {
    ...options,
    headers,
    signal: controller.signal,
  }

  const maxRetries = options.retries ?? (options.method && options.method !== 'GET' ? 0 : 2)
  let lastError = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, config)

      clearTimeout(timeoutId)

      let data = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (!response.ok) {
        if (response.status === 401 && token) {
          triggerForceLogout()
        }
        const err = new Error(data.error || `Error ${response.status}`)
        err.status = response.status
        err.data = data
        err.isNetworkError = false
        throw err
      }

      return data
    } catch (err) {
      clearTimeout(timeoutId)

      // Don't retry auth errors or client errors (4xx)
      if (err.status && err.status >= 400 && err.status < 500) {
        throw err
      }

      // Classify network/timeout errors
      if (err.name === 'AbortError') {
        lastError = new Error('La solicitud tardó demasiado. Verifica tu conexión.')
        lastError.status = 0
        lastError.isTimeout = true
        lastError.isNetworkError = true
      } else if (!err.status) {
        lastError = new Error('Error de conexión. Verifica tu internet.')
        lastError.status = 0
        lastError.isNetworkError = true
      } else {
        lastError = err
      }

      // Wait before retry with exponential backoff
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 5000)))
      }
    }
  }

  throw lastError
}

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Normalize backend product structure
const normalizeProduct = (product) => ({
  id: product.id,
  slug: product.slug || null,
  sku: product.sku,
  barcode: product.barcode,

  // Main info
  title: product.title,
  artist: product.artist,
  type: product.type,

  // Prices (support both nested price object and flat fields)
  price: Number(product.price?.final ?? product.price_final ?? 0),
  price_original: Number(product.price?.original ?? product.price_original ?? 0),
  price_final: Number(product.price?.final ?? product.price_final ?? 0),
  currency: product.price?.currency || 'MXN',

  // Inventory
  stock: product.stock || 0,
  reserved_stock: product.reserved_stock || 0,

  // Media
  cover_image: product.coverImage,
  gallery_first: product.gallery_first || null,

  // Variants
  variants: product.variants || [],

  // Extra
  description: product.description,
  tracklist: product.tracklist || null,
  rating: Number(product.rating || 0),
  review_count: product.reviewCount || product.review_count || 0,
  is_active: Boolean(product.isActive ?? product.is_active),
  isFeatured: Boolean(product.isFeatured),

  // Images
  images: product.images || [],

  created_at: product.created_at || product.createdAt,
  updated_at: product.updated_at || product.updatedAt,
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
      sessionStorage.setItem('mockEmail', 'admin@bandup.com')
      return { token: mockToken, user: mockAdminUser }
    }

    if (
      credentials.password === 'demo123' ||
      (email === 'demo@bandup.com' || email === 'demo')
    ) {
      sessionStorage.setItem('mockEmail', email)
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

    const token = getToken()

    if (!token) {
      const authErr = new Error('No autenticado')

      authErr.status = 401
      authErr.error = authErr.message

      throw authErr
    }

    const mockEmail = sessionStorage.getItem('mockEmail')

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

  getMe: () => request('/user/profile'),

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

  getRelatedProducts: async (slug, { limit = 10, viewed = '' } = {}) => {
    const params = new URLSearchParams({ limit })
    if (viewed) params.set('viewed', viewed)
    const data = await request(`/products/${slug}/related?${params}`)
    return {
      products: Array.isArray(data.products)
        ? data.products.map(normalizeProduct)
        : [],
    }
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

  updateProfile: (data) => request('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return request('/user/avatar', {
      method: 'POST',
      body: formData,
    })
  },

  resetPassword: (email) =>
    request('/user/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  changePassword: (currentPassword, newPassword) =>
    request('/user/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // ============ ADMIN ============
  adminGetProducts: (page = 1, search = '') => {
    const params = new URLSearchParams({ page, limit: 50 })
    if (search) params.set('search', search)
    return request(`/admin/products?${params}`)
  },

  adminGetProduct: (id) => request(`/admin/products/${id}`),

  adminCreateProduct: (formData) =>
    request('/admin/products', { method: 'POST', body: formData }),

  adminUpdateProduct: (id, formData) =>
    request(`/admin/products/${id}`, { method: 'PUT', body: formData }),

  adminDeleteProduct: (id) =>
    request(`/admin/products/${id}`, { method: 'DELETE' }),

  adminToggleFeatured: (id, featured) =>
    request(`/admin/products/${id}/featured`, {
      method: 'PATCH',
      body: JSON.stringify({ featured }),
    }),

  // Sections
  adminGetSections: () => request('/admin/sections'),

  adminCreateSection: (data) =>
    request('/admin/sections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adminUpdateSection: (id, data) =>
    request(`/admin/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  adminDeleteSection: (id) =>
    request(`/admin/sections/${id}`, { method: 'DELETE' }),

  adminReorderSections: (order) =>
    request('/admin/sections/reorder', {
      method: 'PUT',
      body: JSON.stringify({ order }),
    }),

  adminSetSectionProducts: (sectionId, productIds) =>
    request(`/admin/sections/${sectionId}/products`, {
      method: 'PUT',
      body: JSON.stringify({ productIds }),
    }),

  // Public sections
  getHomeSections: async () => {
    const data = await request('/products/sections')
    return {
      ...data,
      sections: (data.sections || []).map(section => ({
        ...section,
        products: section.products.map(normalizeProduct)
      }))
    }
  },

  // Public sliders
  getHomeSliders: async () => {
    const data = await request('/products/sliders')
    return data.sliders || []
  },

  // Admin sliders
  adminGetSliders: async () => {
    const data = await request('/admin/sliders')
    return data.sliders || []
  },
  adminCreateSlider: async (formData) => {
    return request('/admin/sliders', { method: 'POST', body: formData })
  },
  adminUpdateSlider: async (id, formData) => {
    return request(`/admin/sliders/${id}`, { method: 'PUT', body: formData })
  },
  adminDeleteSlider: async (id) => {
    return request(`/admin/sliders/${id}`, { method: 'DELETE' })
  },
  adminReorderSliders: async (order) => {
    return request('/admin/sliders/reorder', { method: 'PUT', body: JSON.stringify({ order }) })
  },

  // =============================================
  // REVIEWS
  // =============================================
  getReviews: async (productId) => {
    return request(`/reviews/${productId}`)
  },
  createReview: async (productId, data) => {
    return request(`/reviews/${productId}`, { method: 'POST', body: JSON.stringify(data) })
  },
  updateReview: async (reviewId, data) => {
    return request(`/reviews/${reviewId}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  // =============================================
  // WISHLIST
  // =============================================
  getWishlist: async () => {
    const data = await request('/wishlist')
    return (data.items || []).map(item => ({
      ...normalizeProduct(item),
      variant_id: item.variant_id || null,
      variant_type: item.variant_type || null,
      variant_label: item.variant_label || null,
    }))
  },
  addToWishlist: async (productId, variantId) => {
    return request(`/wishlist/${productId}`, { method: 'POST', body: JSON.stringify({ variant_id: variantId || null }) })
  },
  removeFromWishlist: async (productId, variantId) => {
    const qs = variantId ? `?variant_id=${variantId}` : ''
    return request(`/wishlist/${productId}${qs}`, { method: 'DELETE' })
  },
  checkWishlist: async (productId, variantId) => {
    const qs = variantId ? `?variant_id=${variantId}` : ''
    return request(`/wishlist/check/${productId}${qs}`)
  },

  // =============================================
  // COUPONS
  // =============================================
  validateCoupon: async (code, subtotal) => {
    return request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) })
  },
  applyCoupon: async (couponId) => {
    return request('/coupons/apply', { method: 'POST', body: JSON.stringify({ couponId }) })
  },

  // Admin coupons
  adminGetCoupons: async () => {
    const data = await request('/admin/coupons')
    return data.coupons || []
  },
  adminCreateCoupon: async (data) => {
    return request('/admin/coupons', { method: 'POST', body: JSON.stringify(data) })
  },
  adminUpdateCoupon: async (id, data) => {
    return request(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  adminDeleteCoupon: async (id) => {
    return request(`/admin/coupons/${id}`, { method: 'DELETE' })
  },

  // =============================================
  // COLLECTIONS
  // =============================================
  getCollections: async () => {
    const data = await request('/collections')
    return data.collections || []
  },
  getCollection: async (slug) => {
    const data = await request(`/collections/${slug}`)
    return {
      ...data,
      products: (data.products || []).map(normalizeProduct),
    }
  },

  // Admin collections
  adminGetCollections: async () => {
    const data = await request('/admin/collections')
    return data.collections || []
  },
  adminCreateCollection: async (formData) => {
    return request('/admin/collections', { method: 'POST', body: formData })
  },
  adminUpdateCollection: async (id, formData) => {
    return request(`/admin/collections/${id}`, { method: 'PUT', body: formData })
  },
  adminDeleteCollection: async (id) => {
    return request(`/admin/collections/${id}`, { method: 'DELETE' })
  },
  adminSetCollectionProducts: async (id, productIds) => {
    return request(`/admin/collections/${id}/products`, { method: 'PUT', body: JSON.stringify({ productIds }) })
  },

  // =============================================
  // PRODUCT IMAGES (admin)
  // =============================================
  adminGetProductImages: async (productId, variantId) => {
    const qs = variantId ? `?variant_id=${variantId}` : ''
    const data = await request(`/admin/products/${productId}/images${qs}`)
    return data.images || []
  },
  adminAddProductImage: async (productId, formData) => {
    return request(`/admin/products/${productId}/images`, { method: 'POST', body: formData })
  },
  adminDeleteProductImage: async (productId, imageId) => {
    return request(`/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' })
  },
  adminUploadVariantCover: async (productId, variantId, formData) => {
    return request(`/admin/products/${productId}/variants/${variantId}/cover`, { method: 'PUT', body: formData })
  },
  adminDeleteVariantCover: async (productId, variantId) => {
    return request(`/admin/products/${productId}/variants/${variantId}/cover`, { method: 'DELETE' })
  },

  // =============================================
  // ORDERS (user)
  // =============================================
  getMyOrders: async () => {
    return request('/orders/my')
  },
  getOrderDetail: async (id) => {
    return request(`/orders/${id}`)
  },

  // Admin orders
  adminUpdateOrderStatus: async (id, status, note) => {
    return request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, note }) })
  },
  adminGetOrderHistory: async (id) => {
    const data = await request(`/admin/orders/${id}/history`)
    return data.history || []
  },

  // =============================================
  // ANALYTICS
  // =============================================
  adminGetAnalytics: async () => {
    return request('/admin/analytics')
  },

  // =============================================
  // ADMIN USERS
  // =============================================
  adminGetUsers: async () => {
    const data = await request('/admin/users')
    return data.users || []
  },
  adminUpdateUserRole: async (id, su) => {
    return request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ su }) })
  },

  // =============================================
  // ANNOUNCEMENTS (ticker bar)
  // =============================================
  getAnnouncements: async () => {
    const data = await request('/products/announcements')
    return data.announcements || []
  },
  adminGetAnnouncements: async () => {
    const data = await request('/admin/announcements')
    return data.announcements || []
  },
  adminCreateAnnouncement: async (message, link_url) => {
    return request('/admin/announcements', { method: 'POST', body: JSON.stringify({ message, link_url }) })
  },
  adminUpdateAnnouncement: async (id, { message, link_url, is_active }) => {
    return request(`/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify({ message, link_url, is_active }) })
  },
  adminDeleteAnnouncement: async (id) => {
    return request(`/admin/announcements/${id}`, { method: 'DELETE' })
  },
  adminReorderAnnouncements: async (ids) => {
    return request('/admin/announcements-reorder', { method: 'PUT', body: JSON.stringify({ ids }) })
  },

  // =============================================
  // SITE SETTINGS
  // =============================================
  getSiteConfig: async () => {
    const data = await request('/products/site-config')
    return data.settings || {}
  },
  adminGetSettings: async () => {
    const data = await request('/admin/settings')
    return data.settings || {}
  },
  adminUpdateSettings: async (settings) => {
    return request('/admin/settings', { method: 'PUT', body: JSON.stringify({ settings }) })
  },

  // =============================================
  // SEARCH (autocomplete)
  // =============================================
  searchAutocomplete: async (q) => {
    const data = await request(`/products/search?q=${encodeURIComponent(q)}&limit=5`)
    return (data.products || []).map(normalizeProduct)
  },
}

export const api = USE_MOCK ? mockApi : realApi
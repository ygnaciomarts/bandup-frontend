import { mockProducts, mockUser, mockAdminUser, mockOrders, mockToken } from './mockData'

// Use mock data when VITE_USE_MOCK is not explicitly set to false
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const API_URL = import.meta.env.VITE_API_URL || '/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  if (options.body != null && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json'
  }

  const config = {
    ...options,
    headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)
  const data = await response.json()

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

// Mock API implementation
const mockApi = {
  // Auth
  login: async (credentials) => {
    await delay()
    const email = credentials.email || credentials.username
    if ((email === 'admin@bandup.com' || email === 'admin') && credentials.password === 'admin123') {
      return { token: mockToken, user: mockAdminUser }
    }
    if (credentials.password === 'demo123' || (email === 'demo@bandup.com' || email === 'demo')) {
      return { token: mockToken, user: mockUser }
    }
    const loginErr = new Error('Credenciales inválidas. Usa: demo/demo123 o admin/admin123')
    loginErr.status = 401
    loginErr.error = loginErr.message
    throw loginErr
  },
  register: async (userData) => {
    await delay()
    const newUser = { ...mockUser, nombre: userData.nombre, email: userData.email }
    return { token: mockToken, user: newUser }
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
    return mockEmail === 'admin@bandup.com' ? mockAdminUser : mockUser
  },

  // Products
  getProducts: async (params = {}) => {
    await delay()
    let filtered = [...mockProducts]
    if (params.tipo) filtered = filtered.filter(p => p.tipo === params.tipo)
    if (params.q) {
      const q = params.q.toLowerCase()
      filtered = filtered.filter(p => p.nombre.toLowerCase().includes(q) || p.artista.toLowerCase().includes(q))
    }
    const limit = Number.parseInt(params.limit) || 12
    const page = Number.parseInt(params.page) || 1
    const offset = (page - 1) * limit
    return { products: filtered.slice(offset, offset + limit), total: filtered.length, page, pages: Math.ceil(filtered.length / limit) }
  },
  getFeatured: async () => {
    await delay()
    return { products: mockProducts.filter(p => p.featured) }
  },
  searchProducts: async (q) => {
    await delay()
    const query = q.toLowerCase()
    const filtered = mockProducts.filter(p => p.nombre.toLowerCase().includes(query) || p.artista.toLowerCase().includes(query))
    return { products: filtered }
  },
  getProduct: async (id) => {
    await delay()
    const product = mockProducts.find(p => p.id === Number.parseInt(id))
    if (!product) {
      const prodErr = new Error('Producto no encontrado')
      prodErr.status = 404
      prodErr.error = prodErr.message
      throw prodErr
    }
    // Enrich with extra mock data for product detail page
    const mockTracklists = {
      LP: [
        'Intro', 'Midnight Run', 'Electric Veins', 'Hollow Ground',
        'Burn the Map', 'Neon Prophets', 'Glass Heart', 'Wolves',
        'Dead Signal', 'Last Exit', 'Aftermath (Outro)'
      ],
      CD: [
        'Static', 'Overdrive', 'Paper Crowns', 'Fading Out',
        'No Return', 'Echoes', 'Wildfire', 'Closure'
      ],
      Cassette: [
        'Side A - Drift', 'Side A - Rust & Gold', 'Side A - Phantom Ride',
        'Side B - Low Tide', 'Side B - Concrete Sky', 'Side B - Final Bow'
      ]
    }

    const normalizeTracklist = (tracklist) => {
      if (Array.isArray(tracklist)) return tracklist
      if (typeof tracklist === 'string') {
        return tracklist.split(/\r?\n/).map((t) => t.trim()).filter(Boolean)
      }
      return []
    }
    const normalizedTracklist = normalizeTracklist(product.tracklist)

    const mockReviews = [
      { id: 1, usuario: 'Carlos M.', rating: 5, comentario: 'Increíble calidad de sonido, el vines una obra de arte. Totalmente recomendado.', fecha: '2024-12-15' },
      { id: 2, usuario: 'Laura P.', rating: 4, comentario: 'Me encantó el empaque y la producción. Un par de tracks no me convencen pero en general muy bien.', fecha: '2024-11-28' },
      { id: 3, usuario: 'Diego R.', rating: 5, comentario: 'Lo mejor que he escuchado este año. Ya quiero más.', fecha: '2024-11-10' },
      { id: 4, usuario: 'Sofía V.', rating: 3, comentario: 'Está bien pero esperaba algo más experimental. Buen disco para el día a día.', fecha: '2024-10-05' },
    ]
    return {
      ...product,
      genero: product.genero || (product.tipo === 'LP' ? 'Rock Alternativo' : product.tipo === 'CD' ? 'Indie Pop' : 'Lo-fi'),
      descripcion: product.descripcion || `Edición ${product.tipo === 'LP' ? 'en LP de 180g con insert a color' : product.tipo === 'CD' ? 'estándar con booklet de 16 páginas' : 'limitada en cassette transparente'}. ${product.nombre} de ${product.artista} es un viaje sonoro que combina texturas modernas con la esencia del género. Producción impecable y masterización de primer nivel.`,
      tracklist: normalizedTracklist.length > 0 ? normalizedTracklist : mockTracklists[product.tipo] || mockTracklists.CD,
      rating: product.rating ?? 4.2,
      totalReviews: product.totalReviews ?? mockReviews.length,
      reviews: product.reviews || mockReviews,
    }
  },
  rateProduct: async (id, rating) => {
    await delay(100)
    return { success: true, rating }
  },

  // Cart
  addToCart: async (product_id, qty = 1) => {
    await delay(100)
    return { success: true }
  },

  // Orders
  createOrder: async (items) => {
    await delay(500)
    const total = items.reduce((sum, item) => sum + item.precio * item.qty, 0)
    return { success: true, order: { id: Date.now(), fecha: new Date().toISOString(), total, estado: 'pendiente', items } }
  },
  getOrders: async () => {
    await delay()
    return { orders: mockOrders }
  },
  getOrder: async (id) => {
    await delay()
    const order = mockOrders.find(o => o.id === Number.parseInt(id))
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
  resetPassword: async (email) => {
    await delay()
    return { success: true, message: 'Se envió un correo con instrucciones' }
  },

  // Admin
  adminGetProducts: async (page = 1) => {
    await delay()
    const perPage = 10
    const offset = (page - 1) * perPage
    return { products: mockProducts.slice(offset, offset + perPage), total: mockProducts.length, page, pages: Math.ceil(mockProducts.length / perPage) }
  },
  adminCreateProduct: async (data) => {
    await delay()
    const parsed = data instanceof FormData ? Object.fromEntries(data.entries()) : { ...data }
    let imagen = null
    if (data instanceof FormData && data.get('imagen') instanceof File) {
      imagen = URL.createObjectURL(data.get('imagen'))
    }
    delete parsed.imagen
    const newProduct = {
      id: Date.now(),
      nombre: parsed.nombre,
      artista: parsed.artista,
      tipo: parsed.tipo || 'LP',
      precio: Number(parsed.precio),
      precioOriginal: Number(parsed.precioOriginal || parsed.precio),
      precioDescuento: parsed.precioDescuento ? Number(parsed.precioDescuento) : null,
      existencias: Number(parsed.existencias) || 0,
      imagen: imagen || `https://placehold.co/300x300/333/fff?text=${encodeURIComponent(parsed.nombre)}`,
      coverUrl: imagen || `https://placehold.co/300x300/333/fff?text=${encodeURIComponent(parsed.nombre)}`,
      rating: 0,
    }
    mockProducts.unshift(newProduct)
    return { success: true, product: newProduct }
  },
  adminUpdateProduct: async (id, data) => {
    await delay()
    const idx = mockProducts.findIndex(p => p.id === Number.parseInt(id))
    if (idx === -1) {
      const updateErr = new Error('Producto no encontrado')
      updateErr.status = 404
      updateErr.error = updateErr.message
      throw updateErr
    }
    const parsed = data instanceof FormData ? Object.fromEntries(data.entries()) : { ...data }
    let imagen = null
    if (data instanceof FormData && data.get('imagen') instanceof File) {
      imagen = URL.createObjectURL(data.get('imagen'))
    }
    delete parsed.imagen
    mockProducts[idx] = {
      ...mockProducts[idx],
      nombre: parsed.nombre,
      artista: parsed.artista,
      tipo: parsed.tipo || mockProducts[idx].tipo,
      precio: Number(parsed.precio),
      precioOriginal: Number(parsed.precioOriginal || parsed.precio),
      precioDescuento: parsed.precioDescuento ? Number(parsed.precioDescuento) : null,
      existencias: Number(parsed.existencias) || 0,
      ...(imagen ? { imagen, coverUrl: imagen } : {}),
    }
    return { success: true, product: mockProducts[idx] }
  },
  adminDeleteProduct: async (id) => {
    await delay()
    const idx = mockProducts.findIndex(p => p.id === Number.parseInt(id))
    if (idx !== -1) { mockProducts.splice(idx, 1) }
    return { success: true }
  },
  adminGetOrders: async () => {
    await delay()
    return { orders: mockOrders.map(o => ({ ...o, usuario: 'Usuario Demo', email: 'demo@bandup.com' })) }
  },
}

// Real API implementation
const realApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => {
    const payload = { ...userData }
    const confirmValue = payload.confirm_password || payload.password_confirmation || payload.passwordConfirm || payload.confirmPassword
    if (confirmValue != null) {
      payload.confirm_password = confirmValue
      payload.password_confirmation = confirmValue
      payload.passwordConfirm = confirmValue
      payload.confirmPassword = confirmValue
    }
    if (payload.nombre && !payload.name) {
      payload.name = payload.nombre
    }
    if (payload.apellido && !payload.last_name) {
      payload.last_name = payload.apellido
    }
    return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
  },
  getMe: () => request('/auth/me'),
  getProducts: (params = {}) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    )
    const query = new URLSearchParams(filteredParams).toString()
    return request(`/products${query ? `?${query}` : ''}`)
  },
  getFeatured: () => request('/products/featured'),
  searchProducts: (q) => request(`/products/search?q=${encodeURIComponent(q)}`),
  getProduct: (id) => request(`/products/${id}`),
  rateProduct: (id, rating) => request(`/products/${id}/rate`, { method: 'POST', body: JSON.stringify({ rating }) }),
  addToCart: (product_id, qty = 1) => request('/cart/add', { method: 'POST', body: JSON.stringify({ product_id, qty }) }),
  createOrder: (items) => request('/orders', { method: 'POST', body: JSON.stringify({ items }) }),
  getOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),
  getProfile: () => request('/user/profile'),
  resetPassword: (email) => request('/user/reset-password', { method: 'POST', body: JSON.stringify({ email }) }),
  adminGetProducts: (page = 1) => request(`/admin/products?page=${page}`),
  adminCreateProduct: (data) => request('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  adminGetOrders: () => request('/admin/orders'),
}

export const api = USE_MOCK ? mockApi : realApi

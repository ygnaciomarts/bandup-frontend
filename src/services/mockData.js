import productsData from './products.json'

// Mock data using real product data from the API
export const mockProducts = productsData.products || productsData

// Keep legacy mock products as fallback
export const mockProductsFallback = [
  {
    id: 1,
    nombre: "Holy Fvck",
    artista: "Demi Lovato",
    tipo: "LP",
    precio: 699,
    precioOriginal: 799,
    precioDescuento: 699,
    existencias: 15,
    rating: 4.5,
    featured: 1,
    cover: null,
    coverUrl: "https://placehold.co/300x300/1a1a2e/e94560?text=Holy+Fvck"
  },
  {
    id: 2,
    nombre: "Better Mistakes",
    artista: "Bebe Rexha",
    tipo: "CD",
    precio: 349,
    precioOriginal: null,
    precioDescuento: null,
    existencias: 22,
    rating: 4.0,
    featured: 1,
    cover: null,
    coverUrl: "https://placehold.co/300x300/16213e/0f3460?text=Better+Mistakes"
  },
  {
    id: 3,
    nombre: "Positions",
    artista: "Ariana Grande",
    tipo: "LP",
    precio: 899,
    precioOriginal: 999,
    precioDescuento: 899,
    existencias: 8,
    rating: 5.0,
    featured: 1,
    cover: null,
    coverUrl: "https://placehold.co/300x300/533483/e94560?text=Positions"
  },
  {
    id: 4,
    nombre: "Renaissance",
    artista: "Beyoncé",
    tipo: "LP",
    precio: 949,
    precioOriginal: null,
    precioDescuento: null,
    existencias: 5,
    rating: 4.8,
    featured: 1,
    cover: null,
    coverUrl: "https://placehold.co/300x300/0f3460/e94560?text=Renaissance"
  },
  {
    id: 5,
    nombre: "Midnights",
    artista: "Taylor Swift",
    tipo: "LP",
    precio: 799,
    precioOriginal: null,
    precioDescuento: null,
    existencias: 30,
    rating: 4.9,
    featured: 0,
    cover: null,
    coverUrl: "https://placehold.co/300x300/1a1a2e/4834d4?text=Midnights"
  },
  {
    id: 6,
    nombre: "SOS",
    artista: "SZA",
    tipo: "CD",
    precio: 299,
    precioOriginal: 399,
    precioDescuento: 299,
    existencias: 18,
    rating: 4.7,
    featured: 0,
    cover: null,
    coverUrl: "https://placehold.co/300x300/eb2f06/fff?text=SOS"
  },
  {
    id: 7,
    nombre: "Happier Than Ever",
    artista: "Billie Eilish",
    tipo: "LP",
    precio: 749,
    precioOriginal: null,
    precioDescuento: null,
    existencias: 12,
    rating: 4.3,
    featured: 0,
    cover: null,
    coverUrl: "https://placehold.co/300x300/b8e994/333?text=Happier+Than+Ever"
  },
  {
    id: 8,
    nombre: "Un Verano Sin Ti",
    artista: "Bad Bunny",
    tipo: "LP",
    precio: 849,
    precioOriginal: 999,
    precioDescuento: 849,
    existencias: 6,
    rating: 4.6,
    featured: 0,
    cover: null,
    coverUrl: "https://placehold.co/300x300/6ab04c/fff?text=Un+Verano+Sin+Ti"
  },
  {
    id: 9,
    nombre: "Motomami",
    artista: "Rosalía",
    tipo: "CD",
    precio: 329,
    precioOriginal: null,
    precioDescuento: null,
    existencias: 25,
    rating: 4.4,
    featured: 0,
    cover: null,
    coverUrl: "https://placehold.co/300x300/e94560/fff?text=Motomami"
  },
  {
    id: 10,
    nombre: "Harry's House",
    artista: "Harry Styles",
    tipo: "LP",
    precio: 699,
    precioOriginal: null,
    precioDescuento: null,
    existencias: 20,
    rating: 4.2,
    featured: 0,
    cover: null,
    coverUrl: "https://placehold.co/300x300/f9ca24/333?text=Harrys+House"
  },
  {
    id: 11,
    nombre: "Eternal Sunshine",
    artista: "Ariana Grande",
    tipo: "CD",
    precio: 349,
    precioOriginal: null,
    precioDescuento: null,
    existencias: 40,
    rating: 4.1,
    featured: 0,
    cover: null,
    coverUrl: "https://placehold.co/300x300/ffeaa7/333?text=Eternal+Sunshine"
  },
  {
    id: 12,
    nombre: "The Tortured Poets Department",
    artista: "Taylor Swift",
    tipo: "LP",
    precio: 899,
    precioOriginal: 999,
    precioDescuento: 899,
    existencias: 10,
    rating: 4.8,
    featured: 0,
    cover: null,
    coverUrl: "https://placehold.co/300x300/dfe6e9/333?text=TTPD"
  }
]

export const mockUser = {
  id: 1,
  nombre: "Usuario Demo",
  email: "demo@bandup.com",
  direccion: "Av. Reforma 123, CDMX",
  cp: "06600",
  telefono: "5512345678",
  avatar: null,
  isAdmin: true
}

export const mockAdminUser = {
  id: 2,
  nombre: "Admin",
  email: "admin@bandup.com",
  direccion: "Av. Insurgentes 456, CDMX",
  cp: "03100",
  telefono: "5598765432",
  avatar: null,
  isAdmin: true
}

export const mockOrders = [
  {
    id: 101,
    fecha: "2026-04-28 14:30:00",
    total: 1748,
    envio: 0,
    estado: "completado",
    tracking: "MX9283746510",
    carrier: "DHL",
    items: [
      { id: 1, nombre: "Holy Fvck", artista: "Demi Lovato", tipo: "LP", precio: 699, qty: 1 },
      { id: 5, nombre: "Midnights", artista: "Taylor Swift", tipo: "LP", precio: 799, qty: 1 },
      { id: 6, nombre: "SOS", artista: "SZA", tipo: "CD", precio: 299, qty: 1 }
    ]
  },
  {
    id: 102,
    fecha: "2026-05-02 09:15:00",
    total: 349,
    envio: 24.43,
    estado: "enviado",
    tracking: "MX1029384756",
    carrier: "Estafeta",
    items: [
      { id: 2, nombre: "Better Mistakes", artista: "Bebe Rexha", tipo: "CD", precio: 349, qty: 1 }
    ]
  }
]

// Fake JWT token for mock auth
export const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tYnJlIjoiVXN1YXJpbyBEZW1vIiwiZW1haWwiOiJkZW1vQGJhbmR1cC5jb20ifQ.mock_signature"

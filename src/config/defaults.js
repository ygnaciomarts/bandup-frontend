// Default site configuration — all current hardcoded values preserved here
// These serve as fallbacks when the DB has no settings yet

export const defaultConfig = {
  // === Branding ===
  siteName: 'BandUp',
  logo: '/img/BandUp.svg',
  tagline: 'Tu tienda de música favorita. LPs, CDs y ediciones especiales.',
  supportEmail: 'soporte@bandup.com',
  copyright: '© 2026 BandUp. Todos los derechos reservados.',

  // === Colors ===
  colors: {
    primary: '#282d35',
    secondary: '#dc454d',
    tickerBg: '#282d35',
    ctaGradient: 'linear-gradient(135deg, #1a1a2e 0%, #282d35 100%)',
  },

  // === Social links ===
  social: {
    instagram: '',
    facebook: '',
    x: '',
  },

  // === SEO ===
  seo: {
    defaultTitle: 'BandUp — Tienda de vinilos, CDs y coleccionables musicales',
    defaultDescription: 'BandUp — Tienda de vinilos, CDs y coleccionables musicales. Envío a todo México.',
  },

  // === Navigation ===
  navLinks: [
    { label: 'INICIO', to: '/', position: 1 },
    { label: 'NOVEDADES', to: '/search?filter=new', position: 2 },
    { label: 'OFERTAS', to: '/search?filter=sale', position: 3 },
    { label: 'CDs', to: '/search?tipo=CD', position: 4 },
    { label: 'LPs', to: '/search?tipo=LP', position: 5 },
    { label: 'COLECCIONES', to: '/collections', position: 6 },
  ],

  // === Footer ===
  footer: {
    tienda: [
      { label: 'Novedades', to: '/search?filter=new' },
      { label: 'Ofertas', to: '/search?filter=sale' },
      { label: 'CDs', to: '/search?tipo=CD' },
      { label: 'LPs', to: '/search?tipo=LP' },
    ],
    info: [
      { label: 'Quiénes somos', to: '/quienes-somos' },
      { label: 'Contacto', to: '/contacto' },
      { label: 'Términos', to: '/terminos' },
      { label: 'Envíos', to: '/envios' },
    ],
  },

  // === Home page blocks ===
  home: {
    promoSlide: {
      title: 'Hot Now',
      subtitle: 'Lo más vendido esta semana',
      link: '/search?sort=top',
    },
    ctaBanner: {
      title: '¿Buscas algo especial?',
      description: 'Explora nuestro catálogo completo con LPs, CDs y ediciones limitadas de cientos de artistas.',
      buttonText: 'Ver catálogo completo',
      buttonLink: '/search',
    },
    categoryCards: [
      {
        overline: 'Colección',
        title: 'Vinilos & LPs',
        description: 'La experiencia analógica que mereces. Ediciones especiales y clásicos.',
        link: '/search?tipo=LP',
        bgcolor: '#1a1a2e',
        accentColor: '#dc454d',
      },
      {
        overline: 'Colección',
        title: 'CDs',
        description: 'Calidad digital, empaque físico. Tus álbumes favoritos a precio accesible.',
        link: '/search?tipo=CD',
        bgcolor: '#dc454d',
        accentColor: '#fff',
      },
    ],
    newsletter: {
      title: 'No te pierdas nada',
      description: 'Suscríbete y recibe 10% OFF en tu primera compra + acceso anticipado a lanzamientos.',
      buttonText: 'Suscribirse',
    },
  },

  // === Ticker fallback messages ===
  fallbackAnnouncements: [
    'ENVÍO GRATIS EN ÓRDENES +$799',
    '10% OFF CON TU PRIMER NEWSLETTER',
  ],
}

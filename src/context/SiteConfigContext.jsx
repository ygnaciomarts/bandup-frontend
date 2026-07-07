import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { defaultConfig } from '../config/defaults'

const SiteConfigContext = createContext(defaultConfig)

function parseJSON(val, fallback) {
  if (!val) return fallback
  try { return JSON.parse(val) } catch { return fallback }
}

function mergeSettings(raw) {
  return {
    siteName: raw.site_name || defaultConfig.siteName,
    logo: raw.logo_url || defaultConfig.logo,
    tagline: raw.tagline || defaultConfig.tagline,
    supportEmail: raw.support_email || defaultConfig.supportEmail,
    copyright: raw.copyright || defaultConfig.copyright,
    colors: {
      primary: raw.color_primary || defaultConfig.colors.primary,
      secondary: raw.color_secondary || defaultConfig.colors.secondary,
      tickerBg: raw.color_primary || defaultConfig.colors.tickerBg,
      ctaGradient: defaultConfig.colors.ctaGradient,
    },
    social: {
      instagram: raw.social_instagram || defaultConfig.social.instagram,
      facebook: raw.social_facebook || defaultConfig.social.facebook,
      x: raw.social_x || defaultConfig.social.x,
    },
    seo: {
      defaultTitle: raw.seo_title || defaultConfig.seo.defaultTitle,
      defaultDescription: raw.seo_description || defaultConfig.seo.defaultDescription,
    },
    navLinks: parseJSON(raw.nav_links, defaultConfig.navLinks),
    footer: {
      tienda: parseJSON(raw.footer_tienda, defaultConfig.footer.tienda),
      info: parseJSON(raw.footer_info, defaultConfig.footer.info),
    },
    home: {
      promoSlide: parseJSON(raw.home_promo_slide, defaultConfig.home.promoSlide),
      ctaBanner: parseJSON(raw.home_cta, defaultConfig.home.ctaBanner),
      categoryCards: parseJSON(raw.home_category_cards, defaultConfig.home.categoryCards),
      newsletter: parseJSON(raw.home_newsletter, defaultConfig.home.newsletter),
    },
    fallbackAnnouncements: defaultConfig.fallbackAnnouncements,
  }
}

export function SiteConfigProvider({ children }) {
  const { data: rawSettings } = useQuery({
    queryKey: ['site-config'],
    queryFn: () => api.getSiteConfig(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const config = rawSettings ? mergeSettings(rawSettings) : defaultConfig

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  return useContext(SiteConfigContext)
}

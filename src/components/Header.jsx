import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  AppBar, Toolbar, Box, IconButton, Badge, InputBase, Button, Container, Typography, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, Menu, MenuItem as MuiMenuItem, Avatar, Paper, CircularProgress
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import './Header.css'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import LogoutIcon from '@mui/icons-material/Logout'
import LoginIcon from '@mui/icons-material/Login'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'
import { useSiteConfig } from '../context/SiteConfigContext'

function AnnouncementTicker() {
  const config = useSiteConfig()
  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.getAnnouncements(),
    staleTime: 5 * 60 * 1000,
  })

  const items = announcements?.length > 0
    ? announcements
    : config.fallbackAnnouncements.map(msg => ({ message: msg, link_url: null }))

  if (items.length === 0) return null

  return (
    <Box sx={{ bgcolor: config.colors.primary, color: '#fff', py: 0.6, overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <Box sx={{ display: 'inline-block', animation: 'ticker 70s linear infinite' }}>
        {[...Array(6)].flatMap((_, r) =>
          items.map((item, i) => (
            item.link_url ? (
              <Typography key={`${r}-${i}`} component="a" href={item.link_url} variant="caption"
                sx={{ mx: 8, fontWeight: 600, letterSpacing: 0.5, fontSize: '0.68rem', color: '#fff', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                {item.message}
              </Typography>
            ) : (
              <Typography key={`${r}-${i}`} component="span" variant="caption" sx={{ mx: 8, fontWeight: 600, letterSpacing: 0.5, fontSize: '0.68rem' }}>
                {item.message}
              </Typography>
            )
          ))
        )}
      </Box>
    </Box>
  )
}

export default function Header() {
  const config = useSiteConfig()
  const { user, logout, openLoginModal } = useAuth()
  const { totalItems } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const debounceRef = useRef(null)
  const navigate = useNavigate()
  const headerRef = useRef(null)

  const updateHeaderHeight = useCallback(() => {
    if (headerRef.current) {
      const bottom = headerRef.current.getBoundingClientRect().bottom
      document.documentElement.style.setProperty('--header-height', `${bottom}px`)
    }
  }, [])

  useEffect(() => {
    requestAnimationFrame(updateHeaderHeight)
    window.addEventListener('resize', updateHeaderHeight)
    window.addEventListener('scroll', updateHeaderHeight)
    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
      window.removeEventListener('scroll', updateHeaderHeight)
    }
  }, [updateHeaderHeight])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    navigate('/search')
  }

  const handleSearchInput = (val) => {
    setSearchQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSuggestionsLoading(true)
      try {
        const data = await api.searchAutocomplete(val)
        setSuggestions(data.results || [])
        setShowSuggestions(true)
      } catch { setSuggestions([]) }
      setSuggestionsLoading(false)
    }, 300)
  }

  const selectSuggestion = (item) => {
    setShowSuggestions(false)
    setSearchQuery('')
    navigate(`/product/${item.slug || item.id}`, { state: { from: '/search', fromLabel: 'Búsqueda' } })
  }

  return (
    <>
      {/* Promo ticker - scrolls away */}
      <AnnouncementTicker />

      {/* Navbar - sticky */}
      <header ref={headerRef} style={{ position: 'sticky', top: 0, zIndex: 1100 }}>

        {/* Main Header */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e5e5', boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none', transition: 'box-shadow 0.3s ease' }}>
          <Container maxWidth="lg" sx={{ maxWidth: '1360px !important' }}>
            <Toolbar disableGutters sx={{ py: 1, gap: 2, minHeight: '60px !important' }}>
              {/* Mobile Menu */}
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Abrir menú"
                sx={{ display: { lg: 'none' }, color: '#282d35' }}
              >
                <MenuIcon />
              </IconButton>

              {/* Logo */}
              <Box component={Link} to="/" sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <img src={config.logo} alt={config.siteName} style={{ height: 42 }} />
              </Box>

              {/* Nav links - desktop */}
              <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.3 }}>
                {config.navLinks.map((link) => (
                  <Button
                    key={link.label}
                    component={Link}
                    to={link.to}
                    sx={{
                      color: '#282d35',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      px: 1.2,
                      py: 0.4,
                      minWidth: 'auto',
                      borderRadius: 50,
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>

              <Box sx={{ flex: 1 }} />

              {/* Search */}
              <Box
                component="form"
                onSubmit={handleSearch}
                sx={{
                  position: 'relative',
                  width: 280,
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: 50,
                  border: '1px solid #e5e5e5',
                  px: 2,
                  py: 0,
                  transition: 'border-color 0.2s',
                  '&:focus-within': { borderColor: '#282d35' },
                }}
              >
                <InputBase
                  placeholder="Buscar LPs, CDs, artistas..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  inputProps={{ 'aria-label': 'Buscar productos' }}
                  sx={{ flex: 1, fontSize: '0.8rem', py: 0.5 }}
                />
                {searchQuery ? (
                  <IconButton onClick={clearSearch} size="small" aria-label="Limpiar búsqueda" sx={{ p: 0.3 }}>
                    <CloseIcon sx={{ fontSize: '0.9rem', color: '#999' }} />
                  </IconButton>
                ) : (
                  <SearchIcon sx={{ color: '#999', fontSize: '1.2rem' }} />
                )}

                {/* Autocomplete dropdown */}
                {showSuggestions && (
                  <Paper
                    elevation={3}
                    sx={{
                      position: 'absolute', top: '100%', left: 0, right: 0, mt: 0.5,
                      borderRadius: 2, overflow: 'hidden', zIndex: 9999, maxHeight: 300, overflowY: 'auto',
                    }}
                  >
                    {suggestionsLoading && <Box sx={{ p: 1.5, textAlign: 'center' }}><CircularProgress size={16} /></Box>}
                    {suggestions.map(item => (
                      <Box
                        key={item.id}
                        onMouseDown={() => selectSuggestion(item)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1,
                          cursor: 'pointer', '&:hover': { bgcolor: 'grey.100' },
                        }}
                      >
                        <Box sx={{ width: 36, height: 36, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.200', flexShrink: 0 }}>
                          {item.coverImage && <img src={item.coverImage} alt={item.title || 'Producto'} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.artist} · {item.type}</Typography>
                        </Box>
                        <Typography variant="caption" fontWeight={700}>${item.price_final?.toLocaleString('es-MX')}</Typography>
                      </Box>
                    ))}

                  </Paper>
                )}
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, md: 1.2, lg: 1.8 }, ml: { xs: 1, lg: 2 } }}>
                {/* Mobile search toggle */}
                <IconButton
                  onClick={() => setMobileSearchOpen((v) => !v)}
                  size="small"
                  aria-label="Buscar"
                  sx={{ display: { sm: 'none' }, color: '#282d35' }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
                {user ? (
                  <>
                    <Button
                      onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                      sx={{ color: '#282d35', display: { xs: 'none', lg: 'flex' }, textTransform: 'none', fontWeight: 500, fontSize: '0.85rem', gap: 0.8, minWidth: 'auto', px: 1.2 }}
                    >
                      <Avatar
                        src={
                          user?.avatar_url
                            ? user.avatar_url
                            : undefined
                        }
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: '#282d35',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {!user?.avatar_url && user.nombre?.charAt(0).toUpperCase()}
                      </Avatar>
                      <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                    </Button>
                    {/* Mobile: person icon opens same menu */}
                    <IconButton
                      onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                      size="small"
                      sx={{ display: { xs: 'inline-flex', lg: 'none' }, color: '#282d35', '& svg': { fontSize: { xs: '1.2rem', lg: '1.4rem' } } }}
                    >
                      <PersonOutlineIcon />
                    </IconButton>
                    <Menu
                      anchorEl={userMenuAnchor}
                      open={Boolean(userMenuAnchor)}
                      onClose={() => setUserMenuAnchor(null)}
                      PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 180, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MuiMenuItem onClick={() => { setUserMenuAnchor(null); navigate('/my-account') }} sx={{ fontSize: '0.82rem', fontWeight: 500, gap: 1.2, py: 1 }}>
                        <PersonOutlineIcon sx={{ fontSize: 18, color: '#6b7280' }} /> Mi cuenta
                      </MuiMenuItem>
                      {!!user.isAdmin && (
                        <MuiMenuItem onClick={() => { setUserMenuAnchor(null); navigate('/admin') }} sx={{ fontSize: '0.82rem', fontWeight: 500, gap: 1.2, py: 1 }}>
                          <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18, color: '#6b7280' }} /> Panel admin
                        </MuiMenuItem>
                      )}
                      <Divider sx={{ my: 0.5 }} />
                      <MuiMenuItem onClick={() => { setUserMenuAnchor(null); logout() }} sx={{ fontSize: '0.82rem', fontWeight: 500, gap: 1.2, py: 1, color: '#dc454d' }}>
                        <LogoutIcon sx={{ fontSize: 18 }} /> Cerrar sesión
                      </MuiMenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    onClick={openLoginModal}
                    startIcon={<PersonOutlineIcon />}
                    sx={{ color: '#282d35', display: { xs: 'none', lg: 'flex' }, textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }}
                  >
                    Entrar
                  </Button>
                )}
                <IconButton component={Link} to="/wishlist" size="small" aria-label="Wishlist" sx={{ color: '#282d35', '& svg': { fontSize: { xs: '1.2rem', lg: '1.4rem' } } }}>
                  <FavoriteBorderIcon />
                </IconButton>
                <IconButton component={Link} to="/cart" size="small" aria-label="Carrito" sx={{ color: '#282d35', '& svg': { fontSize: { xs: '1.2rem', lg: '1.4rem' } } }}>
                  <Badge
                    badgeContent={totalItems}
                    color="secondary"
                    overlap="circular"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        minWidth: 16,
                        height: 16,
                        animation: totalItems > 0 ? 'badge-pop 0.3s ease' : 'none',
                        '@keyframes badge-pop': {
                          '0%': { transform: 'scale(1) translate(50%, -50%)' },
                          '50%': { transform: 'scale(1.4) translate(50%, -50%)' },
                          '100%': { transform: 'scale(1) translate(50%, -50%)' },
                        },
                      },
                    }}
                  >
                    <ShoppingBagOutlinedIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Box>
            </Toolbar>
          </Container>

          {/* Mobile search panel */}
          {mobileSearchOpen && (
            <Box
              component="form"
              onSubmit={(e) => { handleSearch(e); setMobileSearchOpen(false); }}
              sx={{
                display: { sm: 'none' },
                px: 2.5,
                pb: 1.5,
                pt: 0.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 50, border: '1px solid #e5e5e5', px: 2, '&:focus-within': { borderColor: '#282d35' } }}>
                <SearchIcon sx={{ color: '#999', fontSize: '1.1rem', mr: 1 }} />
                <InputBase
                  autoFocus
                  placeholder="Buscar LPs, CDs..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  sx={{ flex: 1, fontSize: '0.85rem', py: 0.8 }}
                />
              </Box>
            </Box>
          )}
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 300, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Drawer header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2.5 }}>
              <img src={config.logo} alt={config.siteName} style={{ height: 38 }} />
              <IconButton onClick={() => setDrawerOpen(false)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Search */}
            <Box
              component="form"
              onSubmit={(e) => { handleSearch(e); setDrawerOpen(false) }}
              sx={{ px: 2.5, pb: 2.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 50, border: '1px solid #e5e5e5', px: 2, '&:focus-within': { borderColor: '#282d35' } }}>
                <SearchIcon sx={{ color: '#999', fontSize: '1.1rem', mr: 1 }} />
                <InputBase
                  placeholder="Buscar LPs, CDs..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  fullWidth
                  sx={{ fontSize: '0.85rem', py: 0.8 }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Nav links */}
            <List sx={{ px: 1.5, py: 1.5 }}>
              {config.navLinks.map((link) => (
                <ListItem
                  key={link.label}
                  component={Link}
                  to={link.to}
                  onClick={() => setDrawerOpen(false)}
                  sx={{ color: '#282d35', borderRadius: 2, py: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }} />
                </ListItem>
              ))}
            </List>

            <Box sx={{ flex: 1 }} />

            {/* User section */}
            <Divider />
            <List sx={{ px: 1.5, py: 1.5 }}>
              {user ? (
                <>
                  <ListItem component={Link} to="/my-account" onClick={() => setDrawerOpen(false)} sx={{ color: '#282d35', borderRadius: 2, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#282d35' }}><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Mi cuenta" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }} />
                  </ListItem>
                  {user.isAdmin && (
                    <ListItem component={Link} to="/admin" onClick={() => setDrawerOpen(false)} sx={{ color: '#282d35', borderRadius: 2, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36, color: '#282d35' }}><AdminPanelSettingsOutlinedIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Panel admin" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }} />
                    </ListItem>
                  )}
                  <ListItem onClick={() => { logout(); setDrawerOpen(false) }} sx={{ cursor: 'pointer', color: '#dc454d', borderRadius: 2, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#dc454d' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }} />
                  </ListItem>
                </>
              ) : (
                <ListItem onClick={() => { openLoginModal(); setDrawerOpen(false) }} sx={{ cursor: 'pointer', color: '#282d35', borderRadius: 2, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: '#282d35' }}><LoginIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Iniciar sesión" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }} />
                </ListItem>
              )}
            </List>
          </Box>
        </Drawer>
      </header>
    </>
  )
}

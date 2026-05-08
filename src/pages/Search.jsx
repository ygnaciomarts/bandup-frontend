import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Container, Typography, Box, Chip, Skeleton, Select, MenuItem, Slider } from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import { api } from '../services/api'
import ProductCard from '../components/ProductCard'

const GENRES = ['Pop', 'R&B', 'Rock', 'Hip-Hop', 'Electrónica', 'Alternativo']
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'A-Z' },
]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [showFilters, setShowFilters] = useState(false)

  const q = searchParams.get('q')
  const rawTipo = searchParams.get('tipo')
  const t = rawTipo && rawTipo !== 'undefined' && rawTipo !== 'null' ? rawTipo : ''
  const genre = searchParams.get('genero') || ''
  const sort = searchParams.get('sort') || 'relevance'

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'search', q, t],
    queryFn: () => q
      ? api.searchProducts(q)
      : api.getProducts({ tipo: t || undefined, limit: 50 }),
  })

  const products = useMemo(() => {
    let items = data?.products || []

    // Genre filter
    if (genre) {
      items = items.filter(p => p.genero?.toLowerCase() === genre.toLowerCase())
    }

    // Price filter
    items = items.filter(p => p.precio >= priceRange[0] && p.precio <= priceRange[1])

    // Sort
    if (sort === 'price-asc') items = [...items].sort((a, b) => a.precio - b.precio)
    else if (sort === 'price-desc') items = [...items].sort((a, b) => b.precio - a.precio)
    else if (sort === 'name') items = [...items].sort((a, b) => a.nombre.localeCompare(b.nombre))

    return items
  }, [data, genre, priceRange, sort])

  const handleFilterTipo = (tipo) => {
    const params = {}
    if (q) params.q = q
    if (tipo) params.tipo = tipo
    if (genre) params.genero = genre
    if (sort !== 'relevance') params.sort = sort
    setSearchParams(params)
  }

  const handleGenre = (g) => {
    const params = {}
    if (q) params.q = q
    if (t) params.tipo = t
    if (g && g !== genre) params.genero = g
    if (sort !== 'relevance') params.sort = sort
    setSearchParams(params)
  }

  const handleSort = (e) => {
    const params = {}
    if (q) params.q = q
    if (t) params.tipo = t
    if (genre) params.genero = genre
    if (e.target.value !== 'relevance') params.sort = e.target.value
    setSearchParams(params)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Page title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {q ? `Resultados para "${q}"` : t ? (t === 'LP' ? 'LPs' : 'CDs') : 'Catálogo'}
        </Typography>
      </Box>

      {/* Format filters + sort */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          label="Todos"
          clickable
          onClick={() => handleFilterTipo('')}
          sx={{
            fontWeight: 600, fontSize: '0.8rem', borderRadius: 50,
            bgcolor: !t ? '#282d35' : 'transparent', color: !t ? '#fff' : '#282d35',
            border: '1.5px solid', borderColor: !t ? '#282d35' : '#e0e0e0',
            '&:hover': { bgcolor: !t ? '#282d35' : '#f5f5f5' },
          }}
        />
        <Chip
          label="LPs"
          clickable
          onClick={() => handleFilterTipo('LP')}
          sx={{
            fontWeight: 600, fontSize: '0.8rem', borderRadius: 50,
            bgcolor: t === 'LP' ? '#282d35' : 'transparent', color: t === 'LP' ? '#fff' : '#282d35',
            border: '1.5px solid', borderColor: t === 'LP' ? '#282d35' : '#e0e0e0',
            '&:hover': { bgcolor: t === 'LP' ? '#282d35' : '#f5f5f5' },
          }}
        />
        <Chip
          label="CDs"
          clickable
          onClick={() => handleFilterTipo('CD')}
          sx={{
            fontWeight: 600, fontSize: '0.8rem', borderRadius: 50,
            bgcolor: t === 'CD' ? '#282d35' : 'transparent', color: t === 'CD' ? '#fff' : '#282d35',
            border: '1.5px solid', borderColor: t === 'CD' ? '#282d35' : '#e0e0e0',
            '&:hover': { bgcolor: t === 'CD' ? '#282d35' : '#f5f5f5' },
          }}
        />

        <Chip
          icon={<TuneIcon sx={{ fontSize: 15 }} />}
          label="Filtros"
          clickable
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            fontWeight: 600, fontSize: '0.8rem', borderRadius: 50, ml: 1,
            bgcolor: showFilters ? '#f0f0f0' : 'transparent',
            border: '1.5px solid', borderColor: '#e0e0e0',
            '&:hover': { bgcolor: '#f5f5f5' },
          }}
        />

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Select
            value={sort}
            onChange={handleSort}
            size="small"
            sx={{ fontSize: '0.8rem', minWidth: 160, '& .MuiSelect-select': { py: 0.8 } }}
          >
            {SORT_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.82rem' }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Expanded filters */}
      {showFilters && (
        <Box sx={{ mb: 3, p: 2.5, bgcolor: '#fafafa', borderRadius: 2, display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Genre */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Género
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              {GENRES.map(g => (
                <Chip
                  key={g}
                  label={g}
                  size="small"
                  clickable
                  onClick={() => handleGenre(g)}
                  sx={{
                    fontSize: '0.72rem', fontWeight: 600, borderRadius: 50,
                    bgcolor: genre === g ? '#282d35' : '#fff', color: genre === g ? '#fff' : '#282d35',
                    border: '1px solid', borderColor: genre === g ? '#282d35' : '#e0e0e0',
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Price range */}
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Precio: ${priceRange[0]} – ${priceRange[1]}
            </Typography>
            <Slider
              value={priceRange}
              onChange={(_, v) => setPriceRange(v)}
              min={0}
              max={2000}
              step={50}
              valueLabelDisplay="auto"
              valueLabelFormat={v => `$${v}`}
              sx={{ mt: 1, color: '#282d35' }}
            />
          </Box>
        </Box>
      )}

      {/* Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {!isLoading && `${products.length} producto(s)`}
      </Typography>

      {/* Results */}
      {isLoading ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Box key={i} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
              <Skeleton variant="rounded" sx={{ aspectRatio: '1', width: '100%', borderRadius: 2 }} />
              <Skeleton sx={{ mt: 1.5, width: '50%', height: 12 }} />
              <Skeleton sx={{ mt: 0.8, width: '80%', height: 16 }} />
              <Skeleton sx={{ mt: 0.8, width: '35%', height: 16 }} />
            </Box>
          ))}
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
            No se encontraron resultados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Intenta con otro término o cambia los filtros
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {products.map(product => (
            <Box key={product.id} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
              <ProductCard product={product} />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  )
}

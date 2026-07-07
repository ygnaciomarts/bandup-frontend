import { useState, useRef, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Button, IconButton, Chip, Skeleton, CircularProgress,
  Drawer, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, Switch,
  FormControlLabel, InputAdornment, Tooltip, Paper, Checkbox, Avatar, Autocomplete,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import CloseIcon from '@mui/icons-material/Close'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import SearchIcon from '@mui/icons-material/Search'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import InventoryIcon from '@mui/icons-material/Inventory'
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel'
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import List from '@mui/material/List'
import { api } from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import RichTextEditor from '../components/ui/RichTextEditor'

export default function AdminProducts() {
  const [tab, setTab] = useState(0)

  const menuItems = [
    { icon: <InventoryIcon sx={{ fontSize: 20 }} />, label: 'Productos' },
    { icon: <ViewModuleIcon sx={{ fontSize: 20 }} />, label: 'Secciones Home' },
    { icon: <ViewCarouselIcon sx={{ fontSize: 20 }} />, label: 'Slider' },
    { icon: <CampaignOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Anuncios' },
    { icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Cupones' },
    { icon: <CollectionsBookmarkOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Colecciones' },
    { icon: <SettingsOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Configuración' },
  ]

  return (
    <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
      {/* Sidebar */}
      <Box sx={{ width: 170, flexShrink: 0 }}>
        <List disablePadding dense>
          {menuItems.map((item, i) => (
            <ListItemButton
              key={item.label}
              selected={tab === i}
              onClick={() => setTab(i)}
              sx={{
                py: 0.7,
                px: 1.5,
                borderRadius: 1.5,
                my: 0.2,
                '&.Mui-selected': { bgcolor: '#f3f4f6', color: '#282d35', '& .MuiListItemIcon-root': { color: '#282d35' } },
                '&:hover': { bgcolor: '#f9fafb' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: '#6b7280' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: tab === i ? 700 : 500 }} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {tab === 0 && <ProductsTab />}
        {tab === 1 && <SectionsTab />}
        {tab === 2 && <SlidersTab />}
        {tab === 3 && <AnnouncementsTab />}
        {tab === 4 && <CouponsTab />}
        {tab === 5 && <CollectionsTab />}
        {tab === 6 && <SettingsTab />}
      </Box>
    </Box>
  )
}

// =============================================
// PRODUCTS TAB
// =============================================
function ProductsTab() {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const [createOpen, setCreateOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    nombre: '', artista: '', descripcion: '', tracklist: '', featured: false
  })
  const [variants, setVariants] = useState([{ type: 'LP', label: '', price_original: '', price_final: '', stock: '' }])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const variantFileRefs = useRef({})
  const variantIdCounter = useRef(0)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => api.adminGetProducts(1, ''),
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.adminCreateProduct(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      const p = res.product
      const variantCount = p?.variants?.length || 0
      notify(`"${p?.nombre || 'Producto'}" agregado al catálogo con ${variantCount} variante${variantCount !== 1 ? 's' : ''}`, 'success')
      handleCloseDialog()
    },
    onError: (err) => notify(`Error al crear producto: ${err.message || 'intenta de nuevo'}`, 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.adminUpdateProduct(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      const p = res.product
      const variantCount = p?.variants?.length || 0
      const changes = []
      if (imageFile) changes.push('portada')
      if (variantCount) changes.push(`${variantCount} variante${variantCount !== 1 ? 's' : ''}`)
      notify(`"${p?.nombre || 'Producto'}" actualizado${changes.length ? ' — ' + changes.join(', ') : ''}`, 'success')
      handleCloseDialog()
    },
    onError: (err) => notify(`Error al actualizar: ${err.message || 'intenta de nuevo'}`, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.adminDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] })
    },
    onError: (err) => notify(`Error al eliminar: ${err.message || 'intenta de nuevo'}`, 'error'),
  })

  const featuredMutation = useMutation({
    mutationFn: ({ id, featured }) => api.adminToggleFeatured(id, featured),
    onMutate: async ({ id, featured }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'products'] })
      const prev = queryClient.getQueryData(['admin', 'products'])
      queryClient.setQueryData(['admin', 'products'], (old) => {
        if (!old?.products) return old
        return { ...old, products: old.products.map(p => p.id === id ? { ...p, featured } : p) }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['admin', 'products'], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const allProducts = data?.products || []
  const artistOptions = useMemo(() => [...new Set(allProducts.map(p => p.artista).filter(Boolean))].sort(), [allProducts])
  const products = useMemo(() => {
    if (!search.trim()) return allProducts
    const s = search.toLowerCase()
    return allProducts.filter(p =>
      p.nombre.toLowerCase().includes(s) || p.artista.toLowerCase().includes(s)
    )
  }, [allProducts, search])

  const ensureVariantDndIds = (vars) => vars.map(v => v._dndId ? v : { ...v, _dndId: `vdnd_${++variantIdCounter.current}` })

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setForm({ nombre: '', artista: '', descripcion: '', tracklist: '', featured: false })
    setVariants(ensureVariantDndIds([{ type: 'LP', label: '', price_original: '', price_final: '', stock: '' }]))
    setImageFile(null)
    setImagePreview(null)
    setCreateOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setForm({
      nombre: product.nombre || '',
      artista: product.artista || '',
      descripcion: product.descripcion || '',
      tracklist: product.tracklist || '',
      featured: product.featured || false,
    })
    setVariants(ensureVariantDndIds(
      product.variants?.length > 0
        ? product.variants.map(v => ({ id: v.id || null, type: v.type, label: v.label || '', price_original: v.price_original || '', price_final: v.price_final || '', stock: v.stock ?? '', tracklist: v.tracklist || '' }))
        : [{ id: null, type: product.tipo || 'LP', label: '', price_original: product.precio || '', price_final: product.precioDescuento || product.precio || '', stock: product.existencias ?? '' }]
    ))
    setImageFile(null)
    setImagePreview(product.imagen || null)
    setDrawerOpen(true)
  }

  const handleCloseDialog = () => {
    setCreateOpen(false)
    setDrawerOpen(false)
    setEditingProduct(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const uploadPendingVariantCovers = async (product) => {
    if (!product?.variants?.length) return
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i]
      if (!v.coverFile) continue
      // Match saved variant by index position (same order as sent)
      const savedVariant = product.variants[i]
      if (!savedVariant?.id) continue
      try {
        const fd = new FormData()
        fd.append('image', v.coverFile)
        await api.adminUploadVariantCover(product.id, savedVariant.id, fd)
      } catch (e) {
        console.error('Error uploading variant cover:', e)
      }
    }
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
  }

  const handleSubmit = () => {
    if (!form.nombre.trim() || !form.artista.trim()) return
    const validVariants = variants.filter(v => v.type && (v.price_original || v.price_final))
    if (validVariants.length === 0) return

    const formData = new FormData()
    formData.append('nombre', form.nombre.trim())
    formData.append('artista', form.artista.trim())
    if (form.descripcion) formData.append('descripcion', form.descripcion.trim())
    if (form.tracklist) formData.append('tracklist', form.tracklist.trim())
    formData.append('featured', form.featured ? 'true' : 'false')
    formData.append('variants', JSON.stringify(validVariants.map(v => ({
      id: v.id || null,
      type: v.type,
      label: v.label || '',
      price_original: Number(v.price_original) || Number(v.price_final),
      price_final: Number(v.price_final) || Number(v.price_original),
      stock: Number(v.stock) || 0,
      tracklist: v.tracklist || '',
    }))))
    if (imageFile) formData.append('imagen', imageFile)

    const hasPendingCovers = validVariants.some(v => v.coverFile)

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData }, {
        onSuccess: (res) => { if (hasPendingCovers && res.product) uploadPendingVariantCovers(res.product) }
      })
    } else {
      createMutation.mutate(formData, {
        onSuccess: (res) => { if (hasPendingCovers && res.product) uploadPendingVariantCovers(res.product) }
      })
    }
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      const nombre = deleteTarget.nombre
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => notify(`"${nombre}" eliminado del catálogo`, 'info')
      })
    }
    setDeleteTarget(null)
  }

  const productFormFields = (
    <>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Nombre del album" size="small" fullWidth required
          value={form.nombre} onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))} />
        <Autocomplete
          freeSolo
          options={artistOptions}
          value={form.artista}
          onInputChange={(_, val) => setForm(f => ({ ...f, artista: val }))}
          size="small"
          sx={{ flex: 1, minWidth: 160 }}
          renderInput={(params) => <TextField {...params} label="Artista" required />}
        />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#6b7280', fontWeight: 500 }}>
          Descripción
        </Typography>
        <RichTextEditor
          value={form.descripcion}
          onChange={(html) => setForm(f => ({ ...f, descripcion: html }))}
          placeholder="Escribe la descripción del producto..."
          minHeight={120}
          maxHeight={250}
        />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#6b7280', fontWeight: 500 }}>
          Tracklist <Typography component="span" variant="caption" sx={{ color: '#9ca3af' }}>(general — una canción por línea, Side A/B para vinilos)</Typography>
        </Typography>
        <TextField
          multiline
          minRows={3}
          maxRows={10}
          fullWidth
          size="small"
          placeholder={'Side A\nCanción uno\nCanción dos\nSide B\nCanción tres'}
          value={form.tracklist}
          onChange={(e) => setForm(f => ({ ...f, tracklist: e.target.value }))}
          sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 } }}
        />
      </Box>
      {/* Imagen de portada */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, fontSize: '0.78rem', color: '#374151' }}>
          Imagen de portada
        </Typography>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleImageChange} />
        <Button variant="outlined" size="small" fullWidth startIcon={<CloudUploadOutlinedIcon />}
          onClick={() => fileInputRef.current?.click()}
          sx={{ borderColor: '#e5e5e5', color: '#6b7280', textTransform: 'none', fontWeight: 500, borderRadius: 2, py: 1, '&:hover': { borderColor: '#282d35', bgcolor: '#fafafa' } }}>
          {imageFile ? imageFile.name : 'Cambiar portada'}
        </Button>
        {imagePreview && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 1.5, overflow: 'hidden', border: '1px solid #f0f0f0', flexShrink: 0 }}>
              <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Button size="small"
              onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              sx={{ color: '#dc2626', textTransform: 'none', fontSize: '0.75rem' }}>
              Quitar
            </Button>
          </Box>
        )}
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, fontSize: '0.78rem', color: '#374151' }}>
          Variantes (formatos)
        </Typography>
        <DndContext collisionDetection={closestCenter} onDragEnd={(event) => {
          const { active, over } = event
          if (active.id !== over?.id) {
            const oldIdx = variants.findIndex(v => v._dndId === active.id)
            const newIdx = variants.findIndex(v => v._dndId === over.id)
            if (oldIdx !== -1 && newIdx !== -1) setVariants(arrayMove(variants, oldIdx, newIdx))
          }
        }}>
          <SortableContext items={variants.map(v => v._dndId)} strategy={verticalListSortingStrategy}>
            {variants.map((v, i) => {
              const savedVariant = v.id ? editingProduct?.variants?.find(sv => sv.id === v.id) : null
              return (
                <Accordion key={v._dndId} defaultExpanded={variants.length <= 2} disableGutters
                  sx={{ boxShadow: 'none', border: i === 0 ? '2px solid #282d35' : '1px solid #f0f0f0', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' }, overflow: 'hidden' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40, px: 1.5, '& .MuiAccordionSummary-content': { my: 0.5, alignItems: 'center', gap: 1 } }}>
                    <SortableVariantHandle dndId={v._dndId} show={variants.length > 1} />
                    <Chip label={v.type || 'LP'} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{v.label || 'Sin etiqueta'}</Typography>
                    {i === 0 && <Chip label="PRINCIPAL" size="small" sx={{ fontWeight: 700, fontSize: '0.55rem', height: 18, bgcolor: '#282d35', color: '#fff' }} />}
                    {v.price_final && <Typography variant="caption" sx={{ color: '#6b7280', ml: 'auto', mr: 1 }}>${v.price_final}</Typography>}
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
                    <SortableVariantCard dndId={v._dndId} v={v} i={i} isFirst={i === 0}
                      variants={variants} setVariants={setVariants} savedVariant={savedVariant}
                      editingProduct={editingProduct} setEditingProduct={setEditingProduct}
                      queryClient={queryClient} variantFileRefs={variantFileRefs} />
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </SortableContext>
        </DndContext>
        <Button size="small" startIcon={<AddIcon />} onClick={() => setVariants([...variants, { _dndId: `vdnd_${++variantIdCounter.current}`, type: 'CD', label: '', price_original: '', price_final: '', stock: '' }])}
          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
          Agregar variante
        </Button>
      </Box>
      <FormControlLabel
        control={<Switch checked={form.featured} onChange={(e) => setForm(f => ({ ...f, featured: e.target.checked }))} color="warning" />}
        label={<Typography variant="body2" fontWeight={500}>Producto destacado (Featured)</Typography>}
      />
    </>
  )

  if (isLoading) {
    return (
      <Box>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={52} sx={{ mb: 0.5, borderRadius: 1 }} />
        ))}
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar productos..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment>
          }}
          sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {products.length} producto(s)
          </Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreate}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            Nuevo producto
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#fafafa' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280', width: 50 }}></TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280' }}>Producto</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280' }}>Variantes</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280' }}>Stock</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => {
              const variantsList = product.variants?.length > 0
                ? product.variants
                : product.tipo ? [{ type: product.tipo, price_final: product.precioDescuento || product.precio, price_original: product.precio, stock: product.existencias }] : []
              const totalStock = variantsList.reduce((sum, v) => sum + (v.stock ?? 0), 0)
              return (
              <TableRow key={product.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>
                  <Avatar
                    src={product.imagen || undefined}
                    variant="rounded"
                    sx={{ width: 40, height: 40, bgcolor: '#f3f4f6' }}
                  >
                    {product.nombre?.[0]}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>{product.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{product.artista}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {variantsList.map((v, i) => (
                      <Box key={v.type + i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={v.type} size="small"
                          sx={{ fontWeight: 600, fontSize: '0.62rem', borderRadius: 50, height: 18, minWidth: 32,
                            bgcolor: v.type === 'LP' ? '#282d35' : v.type === 'CASSETTE' ? '#7c3aed' : '#f0f0f0',
                            color: v.type === 'LP' || v.type === 'CASSETTE' ? '#fff' : '#282d35',
                          }}
                        />
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#111' }}>
                          ${v.price_final?.toLocaleString('es-MX')}
                        </Typography>
                        {v.price_original && v.price_original !== v.price_final && (
                          <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.68rem' }}>
                            ${v.price_original?.toLocaleString('es-MX')}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}
                    sx={{ color: totalStock > 5 ? '#059669' : totalStock > 0 ? '#d97706' : '#dc2626' }}>
                    {totalStock}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.25 }}>
                    <Tooltip title={product.featured ? 'Quitar destacado' : 'Destacar'}>
                      <IconButton size="small"
                        onClick={() => featuredMutation.mutate({ id: product.id, featured: !product.featured })}
                        sx={{ color: product.featured ? '#f59e0b' : '#d1d5db', '&:hover': { color: '#f59e0b' } }}>
                        {product.featured ? <StarIcon sx={{ fontSize: 18 }} /> : <StarBorderIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => handleOpenEdit(product)} sx={{ color: '#6b7280' }}>
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(product)} sx={{ color: '#dc2626' }}>
                      <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
              )
            })}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {search ? 'Sin resultados' : 'No hay productos. Crea el primero.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Create Modal */}
      <Dialog open={createOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Nuevo producto</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {productFormFields}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseDialog} size="small" sx={{ color: '#6b7280' }}>Cancelar</Button>
          <Button variant="contained" size="small" onClick={handleSubmit}
            disabled={createMutation.isPending}
            startIcon={createMutation.isPending ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Crear producto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDialog}
        slotProps={{ paper: { sx: { width: { xs: '92%', sm: '65%', md: '55%', lg: '45%', xl: '38%' }, maxWidth: 700, minWidth: 340 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Typography fontWeight={800} fontSize="1.1rem" fontFamily='"Plus Jakarta Sans", sans-serif'>Editar producto</Typography>
          <IconButton size="small" onClick={handleCloseDialog} sx={{ color: '#6b7280' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {productFormFields}
        </Box>
        <Box sx={{ px: 3, py: 2, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={handleCloseDialog} size="small" sx={{ color: '#6b7280' }}>Cancelar</Button>
          <Button variant="contained" size="small" onClick={handleSubmit}
            disabled={updateMutation.isPending}
            startIcon={updateMutation.isPending ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Guardar cambios
          </Button>
        </Box>
      </Drawer>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Eliminar producto</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Seguro que deseas eliminar <strong>{deleteTarget?.nombre}</strong>? Esta accion no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} size="small" sx={{ color: '#6b7280' }}>Cancelar</Button>
          <Button variant="contained" size="small" onClick={confirmDelete}
            disabled={deleteMutation.isPending}
            sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, borderRadius: 2 }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// =============================================
// SORTABLE DRAG HANDLE (for accordion header)
// =============================================
function SortableVariantHandle({ dndId, show }) {
  const { attributes, listeners } = useSortable({ id: dndId })
  if (!show) return null
  return (
    <Box {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}
      sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'text.disabled', '&:active': { cursor: 'grabbing' }, mr: -0.5 }}>
      <DragIndicatorIcon sx={{ fontSize: 18 }} />
    </Box>
  )
}

// =============================================
// SORTABLE VARIANT CARD (content inside accordion)
// =============================================
function SortableVariantCard({ dndId, v, i, isFirst, variants, setVariants, savedVariant, editingProduct, setEditingProduct, queryClient, variantFileRefs }) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id: dndId })
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 1, alignItems: 'center' }}>
        <Select value={v.type} onChange={(e) => { const nv = [...variants]; nv[i].type = e.target.value; setVariants(nv) }} size="small" sx={{ minWidth: 100 }}>
          <MenuItem value="LP">LP</MenuItem>
          <MenuItem value="CD">CD</MenuItem>
          <MenuItem value="CASSETTE">Cassette</MenuItem>
        </Select>
        <TextField label="Etiqueta (opcional)" size="small" sx={{ flex: 1 }}
          value={v.label || ''} onChange={(e) => { const nv = [...variants]; nv[i].label = e.target.value; setVariants(nv) }}
          placeholder="Ej: Portada alternativa" />
        {variants.length > 1 && (
          <IconButton size="small" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} sx={{ color: '#dc2626' }}>
            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField label="Precio" size="small" type="number" sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          value={v.price_original} onChange={(e) => { const nv = [...variants]; nv[i].price_original = e.target.value; setVariants(nv) }} />
        <TextField label="Oferta" size="small" type="number" sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          value={v.price_final} onChange={(e) => { const nv = [...variants]; nv[i].price_final = e.target.value; setVariants(nv) }}
          placeholder="Opcional" />
        <TextField label="Stock" size="small" type="number" sx={{ flex: 0.7 }}
          value={v.stock} onChange={(e) => { const nv = [...variants]; nv[i].stock = e.target.value; setVariants(nv) }} />
      </Box>
      {/* Variant cover image — select file now, upload on save */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {(v.coverPreview || savedVariant?.cover_image) ? (
          <>
            <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden', border: '1px solid #e5e7eb', flexShrink: 0 }}>
              <img src={v.coverPreview || (savedVariant?.cover_image?.startsWith('http') ? savedVariant.cover_image : `${api.BASE_URL || 'http://localhost:3001'}${savedVariant.cover_image}`)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Button size="small" onClick={() => {
              const nv = [...variants]; nv[i] = { ...nv[i], coverFile: null, coverPreview: null }; setVariants(nv)
              if (savedVariant?.id && editingProduct) {
                api.adminDeleteVariantCover(editingProduct.id, savedVariant.id).then(() => {
                  setEditingProduct(prev => ({ ...prev, variants: prev.variants.map(vv => vv.id === savedVariant.id ? { ...vv, cover_image: null } : vv) }))
                  queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
                })
              }
            }} sx={{ color: '#dc2626', textTransform: 'none', fontSize: '0.7rem', minWidth: 0, p: 0.5 }}>Quitar</Button>
            {v.coverFile && <Typography variant="caption" sx={{ color: '#059669', fontSize: '0.65rem' }}>Se guardará al guardar cambios</Typography>}
          </>
        ) : (
          <>
            <input ref={el => variantFileRefs.current[i] = el} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden
              onChange={(e) => {
                const file = e.target.files[0]; if (!file) return
                const reader = new FileReader()
                reader.onload = (ev) => { const nv = [...variants]; nv[i] = { ...nv[i], coverFile: file, coverPreview: ev.target.result }; setVariants(nv) }
                reader.readAsDataURL(file); e.target.value = ''
              }} />
            <Button size="small" variant="text" startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 14 }} />}
              onClick={() => variantFileRefs.current[i]?.click()}
              sx={{ textTransform: 'none', fontSize: '0.7rem', color: '#6b7280', p: 0.5 }}>
              Portada de variante
            </Button>
          </>
        )}
      </Box>
      {/* Tracklist */}
      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#6b7280', fontWeight: 500 }}>
          Tracklist <Typography component="span" variant="caption" sx={{ color: '#9ca3af' }}>(una canción por línea, Side A/B para vinilos)</Typography>
        </Typography>
        <TextField
          multiline
          minRows={3}
          maxRows={10}
          fullWidth
          size="small"
          placeholder={'Side A\nCanción uno\nCanción dos\nSide B\nCanción tres'}
          value={v.tracklist || ''}
          onChange={(e) => { const nv = [...variants]; nv[i] = { ...nv[i], tracklist: e.target.value }; setVariants(nv) }}
          sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.5 } }}
        />
      </Box>
      {/* Gallery images (only for saved variants) */}
      {savedVariant?.id && editingProduct && (
        <VariantGallery productId={editingProduct.id} variantId={savedVariant.id} />
      )}
    </Box>
  )
}

// =============================================
// VARIANT GALLERY (multiple images per variant)
// =============================================
function VariantGallery({ productId, variantId }) {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const galleryInputRef = useRef(null)

  const { data: images = [] } = useQuery({
    queryKey: ['admin', 'product-images', productId, variantId],
    queryFn: () => api.adminGetProductImages(productId, variantId),
    staleTime: 0,
  })

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('variant_id', variantId)
      return api.adminAddProductImage(productId, fd)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product-images', productId, variantId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: () => notify('Error al subir imagen', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (imageId) => api.adminDeleteProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product-images', productId, variantId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: () => notify('Error al eliminar imagen', 'error'),
  })

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#6b7280', fontWeight: 500 }}>
        Galería <Typography component="span" variant="caption" sx={{ color: '#9ca3af' }}>({images.length} foto{images.length !== 1 ? 's' : ''})</Typography>
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        {images.map(img => (
          <Box key={img.id} sx={{ position: 'relative', width: 56, height: 56, borderRadius: 1, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <img src={img.image_url?.startsWith('http') ? img.image_url : `${api.BASE_URL || 'http://localhost:3001'}${img.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <IconButton size="small" onClick={() => deleteMutation.mutate(img.id)}
              sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', p: 0.2, '&:hover': { bgcolor: 'rgba(220,38,38,0.8)' } }}>
              <CloseIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
        ))}
        <Box
          onClick={() => galleryInputRef.current?.click()}
          sx={{
            width: 56, height: 56, borderRadius: 1, border: '1px dashed #d1d5db', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            '&:hover': { borderColor: '#282d35', bgcolor: '#fafafa' },
          }}
        >
          {uploadMutation.isPending ? <CircularProgress size={16} /> : <AddIcon sx={{ fontSize: 18, color: '#9ca3af' }} />}
        </Box>
      </Box>
      <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden
        onChange={(e) => {
          Array.from(e.target.files).forEach(file => uploadMutation.mutate(file))
          e.target.value = ''
        }} />
    </Box>
  )
}

// =============================================
// VARIANT COVER UPLOAD (legacy - unused)
// =============================================
function VariantCoverUpload({ productId, variant, onCoverChange }) {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const inputRef = useRef(null)

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData()
      fd.append('image', file)
      return api.adminUploadVariantCover(productId, variant.id, fd)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      if (onCoverChange) onCoverChange(res.cover_image)
      notify('Portada de variante actualizada', 'success')
    },
    onError: () => notify('Error al subir imagen', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.adminDeleteVariantCover(productId, variant.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      if (onCoverChange) onCoverChange(null)
      notify('Portada de variante eliminada', 'info')
    },
  })

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) uploadMutation.mutate(file)
    e.target.value = ''
  }

  const coverUrl = variant.cover_image
    ? (variant.cover_image.startsWith('http') ? variant.cover_image : `http://localhost:3001${variant.cover_image}`)
    : null

  return (
    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {coverUrl ? (
        <>
          <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden', border: '1px solid #e5e7eb', flexShrink: 0 }}>
            <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Button size="small" onClick={() => deleteMutation.mutate()}
            sx={{ color: '#dc2626', textTransform: 'none', fontSize: '0.7rem', minWidth: 0, p: 0.5 }}>
            Quitar
          </Button>
        </>
      ) : (
        <>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleFile} />
          <Button size="small" variant="text" startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
            sx={{ textTransform: 'none', fontSize: '0.7rem', color: '#6b7280', p: 0.5 }}>
            {uploadMutation.isPending ? 'Subiendo...' : 'Portada de variante'}
          </Button>
        </>
      )}
    </Box>
  )
}

// =============================================
// SECTIONS TAB
// =============================================
function SectionsTab() {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const [sectionDialog, setSectionDialog] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [sectionForm, setSectionForm] = useState({ title: '', subtitle: '', link_url: '', link_text: '' })
  const [productPickerOpen, setProductPickerOpen] = useState(null) // section id
  const [selectedProducts, setSelectedProducts] = useState([])
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerType, setPickerType] = useState('')
  const [pickerArtist, setPickerArtist] = useState('')

  const { data: sectionsData, isLoading: loadingSections } = useQuery({
    queryKey: ['admin', 'sections'],
    queryFn: () => api.adminGetSections(),
  })

  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => api.adminGetProducts(1, ''),
  })

  const sections = sectionsData?.sections || []
  const allProducts = productsData?.products || []

  // Derive unique types and artists for filters
  const productTypes = useMemo(() => [...new Set(allProducts.map(p => p.tipo || p.type).filter(Boolean))], [allProducts])
  const productArtists = useMemo(() => [...new Set(allProducts.map(p => p.artista || p.artist).filter(Boolean))].sort(), [allProducts])

  // Filtered products for picker
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const name = (p.nombre || p.title || '').toLowerCase()
      const artist = (p.artista || p.artist || '').toLowerCase()
      const type = p.tipo || p.type || ''
      if (pickerSearch && !name.includes(pickerSearch.toLowerCase()) && !artist.includes(pickerSearch.toLowerCase())) return false
      if (pickerType && type !== pickerType) return false
      if (pickerArtist && artist !== pickerArtist.toLowerCase()) return false
      return true
    })
  }, [allProducts, pickerSearch, pickerType, pickerArtist])

  const createSectionMutation = useMutation({
    mutationFn: (data) => api.adminCreateSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] })
      notify('Seccion creada', 'success')
      setSectionDialog(false)
    },
    onError: (err) => notify(err.message || 'Error', 'error'),
  })

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }) => api.adminUpdateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] })
      notify('Seccion actualizada', 'success')
      setSectionDialog(false)
      setEditingSection(null)
    },
    onError: (err) => notify(err.message || 'Error', 'error'),
  })

  const deleteSectionMutation = useMutation({
    mutationFn: (id) => api.adminDeleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] })
      notify('Seccion eliminada', 'info')
    },
    onError: (err) => notify(err.message || 'Error', 'error'),
  })

  const setProductsMutation = useMutation({
    mutationFn: ({ sectionId, productIds }) => api.adminSetSectionProducts(sectionId, productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] })
      notify('Productos de la seccion actualizados', 'success')
      setProductPickerOpen(null)
    },
    onError: (err) => notify(err.message || 'Error', 'error'),
  })

  const reorderMutation = useMutation({
    mutationFn: (order) => api.adminReorderSections(order),
    onMutate: async (order) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'sections'] })
      const prev = queryClient.getQueryData(['admin', 'sections'])
      queryClient.setQueryData(['admin', 'sections'], (old) => {
        if (!old) return old
        const list = old.sections || old
        const sorted = order.map(id => list.find(s => s.id === id)).filter(Boolean)
        return old.sections ? { ...old, sections: sorted } : sorted
      })
      return { prev }
    },
    onError: (_err, _order, context) => {
      if (context?.prev) queryClient.setQueryData(['admin', 'sections'], context.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] }),
  })

  const handleOpenCreate = () => {
    setEditingSection(null)
    setSectionForm({ title: '', subtitle: '', link_url: '', link_text: '' })
    setSectionDialog(true)
  }

  const handleOpenEdit = (section) => {
    setEditingSection(section)
    setSectionForm({
      title: section.title || '',
      subtitle: section.subtitle || '',
      link_url: section.link_url || '',
      link_text: section.link_text || '',
    })
    setSectionDialog(true)
  }

  const handleSectionSubmit = () => {
    if (!sectionForm.title.trim()) return
    if (editingSection) {
      updateSectionMutation.mutate({ id: editingSection.id, data: { ...sectionForm, is_active: editingSection.is_active } })
    } else {
      createSectionMutation.mutate(sectionForm)
    }
  }

  const handleToggleActive = (section) => {
    updateSectionMutation.mutate({
      id: section.id,
      data: { title: section.title, subtitle: section.subtitle, link_url: section.link_url, link_text: section.link_text, is_active: !section.is_active }
    })
  }

  const handleOpenProductPicker = (section) => {
    setProductPickerOpen(section.id)
    setSelectedProducts(section.products?.map(p => p.id) || [])
    setPickerSearch('')
    setPickerType('')
    setPickerArtist('')
  }

  const handleToggleProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  const handleSaveProducts = () => {
    if (productPickerOpen) {
      setProductsMutation.mutate({ sectionId: productPickerOpen, productIds: selectedProducts })
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex(s => s.id === active.id)
    const newIndex = sections.findIndex(s => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = [...sections]
    const [moved] = newOrder.splice(oldIndex, 1)
    newOrder.splice(newIndex, 0, moved)
    reorderMutation.mutate(newOrder.map(s => s.id))
  }

  if (loadingSections) {
    return <Box>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={80} sx={{ mb: 1, borderRadius: 2 }} />)}</Box>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Arrastra las secciones para reordenarlas en el Home.
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreate}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
          Nueva seccion
        </Button>
      </Box>

      {/* Sections list with DnD */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                onToggleActive={() => handleToggleActive(section)}
                onEditProducts={() => handleOpenProductPicker(section)}
                onEdit={() => handleOpenEdit(section)}
                onDelete={() => deleteSectionMutation.mutate(section.id)}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">No hay secciones. Crea la primera para mostrarla en el Home.</Typography>
        </Paper>
      )}

      {/* Section Create/Edit Dialog */}
      <Dialog open={sectionDialog} onClose={() => setSectionDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
          {editingSection ? 'Editar seccion' : 'Nueva seccion'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Titulo" size="small" fullWidth required
            value={sectionForm.title} onChange={(e) => setSectionForm(f => ({ ...f, title: e.target.value }))}
            placeholder='Ej: "Novedades", "Lo Mejor del Rock"' />
          <TextField label="Subtitulo (opcional)" size="small" fullWidth
            value={sectionForm.subtitle} onChange={(e) => setSectionForm(f => ({ ...f, subtitle: e.target.value }))} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="URL del enlace" size="small" fullWidth
              value={sectionForm.link_url} onChange={(e) => setSectionForm(f => ({ ...f, link_url: e.target.value }))}
              placeholder="/search?filter=new" />
            <TextField label="Texto del enlace" size="small" fullWidth
              value={sectionForm.link_text} onChange={(e) => setSectionForm(f => ({ ...f, link_text: e.target.value }))}
              placeholder="Ver todo" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setSectionDialog(false)} size="small" sx={{ color: '#6b7280' }}>Cancelar</Button>
          <Button variant="contained" size="small" onClick={handleSectionSubmit}
            disabled={createSectionMutation.isPending || updateSectionMutation.isPending}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            {editingSection ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Picker Dialog with advanced filters */}
      <Dialog open={Boolean(productPickerOpen)} onClose={() => setProductPickerOpen(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
          Seleccionar productos para la seccion
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Buscar por nombre o artista..."
              size="small"
              value={pickerSearch}
              onChange={e => setPickerSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 160 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
            />
            <Select
              size="small"
              value={pickerType}
              onChange={e => setPickerType(e.target.value)}
              displayEmpty
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="">Todos los tipos</MenuItem>
              {productTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
            <Select
              size="small"
              value={pickerArtist}
              onChange={e => setPickerArtist(e.target.value)}
              displayEmpty
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">Todos los artistas</MenuItem>
              {productArtists.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </Box>

          {/* Selected count chip */}
          {selectedProducts.length > 0 && (
            <Chip
              label={`${selectedProducts.length} seleccionado(s)`}
              size="small"
              color="primary"
              sx={{ mb: 1.5, fontWeight: 600 }}
              onDelete={() => setSelectedProducts([])}
            />
          )}

          {/* Products list */}
          <Box sx={{ maxHeight: 380, overflow: 'auto', border: '1px solid', borderColor: 'grey.200', borderRadius: 1.5 }}>
            {filteredProducts.map(product => {
              const name = product.nombre || product.title
              const artist = product.artista || product.artist
              const type = product.tipo || product.type
              const price = product.precio || product.price_final
              const img = product.coverImage || product.cover_url || product.imagen
              const isSelected = selectedProducts.includes(product.id)
              return (
                <Box key={product.id} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 1.5, cursor: 'pointer',
                  bgcolor: isSelected ? '#eff6ff' : 'transparent',
                  borderBottom: '1px solid', borderColor: 'grey.100',
                  '&:hover': { bgcolor: isSelected ? '#dbeafe' : '#f9fafb' },
                  '&:last-child': { borderBottom: 'none' },
                }} onClick={() => handleToggleProduct(product.id)}>
                  <Checkbox size="small" checked={isSelected} sx={{ p: 0.3 }} />
                  <Avatar src={img || undefined} variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'grey.200' }}>
                    {name?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{name}</Typography>
                    <Typography variant="caption" color="text.secondary">{artist} · {type}</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    ${price?.toLocaleString('es-MX')}
                  </Typography>
                </Box>
              )
            })}
            {filteredProducts.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                {allProducts.length === 0 ? 'No hay productos. Crea algunos primero.' : 'No se encontraron productos con esos filtros.'}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {filteredProducts.length} de {allProducts.length} productos
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setProductPickerOpen(null)} size="small" sx={{ color: '#6b7280' }}>Cancelar</Button>
            <Button variant="contained" size="small" onClick={handleSaveProducts}
              disabled={setProductsMutation.isPending}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Guardar ({selectedProducts.length})
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function SortableSectionItem({ section, onToggleActive, onEditProducts, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Paper ref={setNodeRef} style={style} variant="outlined" sx={{ p: 2.5, borderRadius: 2, opacity: section.is_active ? 1 : 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Drag handle */}
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'text.disabled', '&:active': { cursor: 'grabbing' } }}>
          <DragIndicatorIcon fontSize="small" />
        </Box>

        {/* Section info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>{section.title}</Typography>
            <Chip label={`${section.products?.length || 0} productos`} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
            {!section.is_active && <Chip label="Oculta" size="small" color="default" sx={{ fontSize: '0.7rem', height: 22 }} />}
          </Box>
          {section.subtitle && <Typography variant="caption" color="text.secondary">{section.subtitle}</Typography>}
          {section.products?.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              {section.products.slice(0, 8).map(p => (
                <Tooltip key={p.id} title={`${p.nombre || p.title} - ${p.artista || p.artist}`}>
                  <Avatar src={p.imagen || p.coverImage || undefined} variant="rounded" sx={{ width: 32, height: 32, fontSize: '0.6rem' }}>
                    {(p.nombre || p.title)?.[0]}
                  </Avatar>
                </Tooltip>
              ))}
              {section.products.length > 8 && (
                <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: '#f3f4f6', color: '#6b7280', fontSize: '0.7rem' }}>
                  +{section.products.length - 8}
                </Avatar>
              )}
            </Box>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={section.is_active ? 'Ocultar seccion' : 'Mostrar seccion'}>
            <IconButton size="small" onClick={onToggleActive}>
              {section.is_active ? <VisibilityIcon sx={{ fontSize: 18 }} /> : <VisibilityOffIcon sx={{ fontSize: 18, color: '#9ca3af' }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar productos">
            <IconButton size="small" onClick={onEditProducts} sx={{ color: '#3b82f6' }}>
              <ViewModuleIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onEdit} sx={{ color: '#6b7280' }}>
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" onClick={onDelete} sx={{ color: '#dc2626' }}>
            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  )
}

// =============================================
// SLIDERS TAB
// =============================================
function SlidersTab() {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', subtitle: '', link_url: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef(null)

  const { data: sliders = [], isLoading } = useQuery({
    queryKey: ['admin', 'sliders'],
    queryFn: () => api.adminGetSliders(),
  })

  const createMutation = useMutation({
    mutationFn: (fd) => api.adminCreateSlider(fd),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'sliders'] }); notify('Slider creado', 'success'); closeDialog() },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => api.adminUpdateSlider(id, fd),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'sliders'] }); notify('Slider actualizado', 'success'); closeDialog() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => api.adminDeleteSlider(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'sliders'] }); notify('Slider eliminado', 'success') },
  })
  const reorderMutation = useMutation({
    mutationFn: (order) => api.adminReorderSliders(order),
    onMutate: async (order) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'sliders'] })
      const prev = queryClient.getQueryData(['admin', 'sliders'])
      queryClient.setQueryData(['admin', 'sliders'], (old) => {
        if (!old) return old
        const sorted = order.map(id => old.find(s => s.id === id)).filter(Boolean)
        return sorted
      })
      return { prev }
    },
    onError: (_err, _order, context) => {
      if (context?.prev) queryClient.setQueryData(['admin', 'sliders'], context.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin', 'sliders'] }),
  })

  function closeDialog() {
    setDialogOpen(false); setEditing(null); setForm({ title: '', subtitle: '', link_url: '' }); setImageFile(null); setImagePreview(null)
  }

  function openEdit(slider) {
    setEditing(slider)
    setForm({ title: slider.title || '', subtitle: slider.subtitle || '', link_url: slider.link_url || '' })
    setImagePreview(getImgSrc(slider.image_url))
    setDialogOpen(true)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  function handleSave() {
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('subtitle', form.subtitle)
    fd.append('link_url', form.link_url)
    if (imageFile) fd.append('image', imageFile)
    else if (editing) fd.append('image_url', editing.image_url)

    if (editing) {
      updateMutation.mutate({ id: editing.id, fd })
    } else {
      if (!imageFile) { notify('Se requiere imagen', 'error'); return }
      createMutation.mutate(fd)
    }
  }

  function getImgSrc(url) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    if (url.startsWith('/img/') || url.startsWith('/public/')) return url
    return `http://localhost:3001${url}`
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sliders.findIndex(s => s.id === active.id)
    const newIndex = sliders.findIndex(s => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = [...sliders]
    const [moved] = newOrder.splice(oldIndex, 1)
    newOrder.splice(newIndex, 0, moved)
    reorderMutation.mutate(newOrder.map(s => s.id))
  }

  if (isLoading) return <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Slides del carrusel ({sliders.length})</Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#282d35' }}>
          Nuevo slide
        </Button>
      </Box>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sliders.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {sliders.map((slider) => (
              <SortableSliderItem
                key={slider.id}
                slider={slider}
                imgSrc={getImgSrc(slider.image_url)}
                onEdit={() => openEdit(slider)}
                onDelete={() => deleteMutation.mutate(slider.id)}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>

      {sliders.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No hay slides. Crea uno para mostrar en el carrusel del Home.
        </Typography>
      )}

      {/* Slider dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Editar slide' : 'Nuevo slide'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Título (opcional)" size="small" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <TextField label="Subtítulo (opcional)" size="small" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
          <TextField label="URL de enlace (opcional)" size="small" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} />
          <Box>
            <input type="file" accept="image/*" ref={fileRef} hidden onChange={handleFileChange} />
            <Button startIcon={<CloudUploadOutlinedIcon />} variant="outlined" size="small" onClick={() => fileRef.current?.click()}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
              {editing ? 'Cambiar imagen' : 'Subir imagen'}
            </Button>
            {imagePreview && (
              <Box component="img" src={imagePreview} alt="preview"
                sx={{ mt: 1, width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#282d35' }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function SortableSliderItem({ slider, imgSrc, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slider.id })
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{ p: 1.5, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}
    >
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'text.disabled', '&:active': { cursor: 'grabbing' } }}>
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <Box
        component="img"
        src={imgSrc}
        alt={slider.title || 'slide'}
        sx={{ width: 180, height: 80, objectFit: 'cover', borderRadius: 1.5, border: '1px solid #eee', bgcolor: 'grey.100' }}
        onError={(e) => { e.target.style.display = 'none' }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>{slider.title || '(Sin título)'}</Typography>
        {slider.subtitle && <Typography variant="caption" color="text.secondary" noWrap>{slider.subtitle}</Typography>}
        {slider.link_url && <Typography variant="caption" display="block" color="primary" noWrap>{slider.link_url}</Typography>}
      </Box>
      <Tooltip title="Editar">
        <IconButton size="small" onClick={onEdit}><EditOutlinedIcon fontSize="small" /></IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton size="small" color="error" onClick={onDelete}><DeleteOutlinedIcon fontSize="small" /></IconButton>
      </Tooltip>
    </Paper>
  )
}

// =============================================
// ANNOUNCEMENTS TAB
// =============================================
function AnnouncementsTab() {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const [newMessage, setNewMessage] = useState('')
  const [newLink, setNewLink] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [editingLink, setEditingLink] = useState('')

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: () => api.adminGetAnnouncements(),
  })

  const createMutation = useMutation({
    mutationFn: ({ message, link_url }) => api.adminCreateAnnouncement(message, link_url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setNewMessage('')
      setNewLink('')
      notify('Anuncio creado', 'success')
    },
    onError: () => notify('Error al crear anuncio', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, message, link_url, is_active }) => api.adminUpdateAnnouncement(id, { message, link_url, is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setEditingId(null)
      notify('Anuncio actualizado', 'success')
    },
    onError: () => notify('Error al actualizar', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.adminDeleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      notify('Anuncio eliminado', 'info')
    },
    onError: () => notify('Error al eliminar', 'error'),
  })

  const handleCreate = () => {
    if (!newMessage.trim()) return
    createMutation.mutate({ message: newMessage.trim(), link_url: newLink.trim() || null })
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Anuncios del ticker</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Los mensajes se muestran en la barra superior de la tienda, rotando de forma continua.
      </Typography>

      {/* Add new */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Ej: ENVÍO GRATIS EN ÓRDENES +$799"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleCreate}
            disabled={!newMessage.trim() || createMutation.isPending}
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
          >
            Agregar
          </Button>
        </Box>
        <TextField
          size="small"
          fullWidth
          placeholder="Link (opcional) — ej: /search?filter=sale"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Box>

      {/* List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} height={48} variant="rounded" />)}
        </Box>
      ) : announcements.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No hay anuncios. Los mensajes por defecto se mostrarán hasta que agregues uno.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {announcements.map((ann, idx) => (
            <Box
              key={ann.id}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5,
                borderBottom: idx < announcements.length - 1 ? '1px solid #f0f0f0' : 'none',
                opacity: ann.is_active ? 1 : 0.5,
              }}
            >
              {editingId === ann.id ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') updateMutation.mutate({ id: ann.id, message: editingText, link_url: editingLink, is_active: ann.is_active })
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                    placeholder="Mensaje"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    value={editingLink}
                    onChange={(e) => setEditingLink(e.target.value)}
                    placeholder="Link (opcional)"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Box>
              ) : (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{ann.message}</Typography>
                  {ann.link_url && (
                    <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.68rem' }}>{ann.link_url}</Typography>
                  )}
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                <Tooltip title={ann.is_active ? 'Desactivar' : 'Activar'}>
                  <IconButton size="small" onClick={() => updateMutation.mutate({ id: ann.id, message: ann.message, link_url: ann.link_url, is_active: !ann.is_active })}>
                    {ann.is_active ? <VisibilityIcon sx={{ fontSize: 16, color: '#059669' }} /> : <VisibilityOffIcon sx={{ fontSize: 16, color: '#9ca3af' }} />}
                  </IconButton>
                </Tooltip>
                {editingId === ann.id ? (
                  <Button size="small" onClick={() => updateMutation.mutate({ id: ann.id, message: editingText, link_url: editingLink, is_active: ann.is_active })}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', minWidth: 0 }}>
                    Guardar
                  </Button>
                ) : (
                  <IconButton size="small" onClick={() => { setEditingId(ann.id); setEditingText(ann.message); setEditingLink(ann.link_url || '') }} sx={{ color: '#6b7280' }}>
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
                <IconButton size="small" onClick={() => deleteMutation.mutate(ann.id)} sx={{ color: '#dc2626' }}>
                  <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  )
}

// =============================================
// COUPONS TAB
// =============================================
function CouponsTab() {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const emptyForm = { code: '', type: 'percent', value: '', min_purchase: '', max_uses: '', starts_at: '', expires_at: '', is_active: true }
  const [form, setForm] = useState(emptyForm)

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => api.adminGetCoupons(),
  })

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? api.adminUpdateCoupon(editing.id, data) : api.adminCreateCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      notify(editing ? 'Cupón actualizado' : 'Cupón creado', 'success')
      setDialogOpen(false)
    },
    onError: (err) => notify(err.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.adminDeleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      notify('Cupón eliminado', 'success')
    },
  })

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (c) => {
    setEditing(c)
    setForm({
      code: c.code, type: c.type, value: c.value, min_purchase: c.min_purchase || '',
      max_uses: c.max_uses || '', starts_at: c.starts_at?.slice(0, 10) || '', expires_at: c.expires_at?.slice(0, 10) || '', is_active: c.is_active,
    })
    setDialogOpen(true)
  }

  if (isLoading) return <Skeleton variant="rounded" height={200} />

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700}>Cupones ({coupons.length})</Typography>
        <Button startIcon={<AddIcon />} size="small" variant="contained" onClick={openCreate}>Nuevo cupón</Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Valor</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Usos</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Expira</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coupons.map(c => (
            <TableRow key={c.id}>
              <TableCell><Chip label={c.code} size="small" sx={{ fontFamily: 'monospace', fontWeight: 700 }} /></TableCell>
              <TableCell>{c.type === 'percent' ? 'Porcentaje' : c.type === 'fixed' ? 'Monto fijo' : 'Envío gratis'}</TableCell>
              <TableCell>{c.type === 'percent' ? `${c.value}%` : c.type === 'fixed' ? `$${c.value}` : '—'}</TableCell>
              <TableCell>{c.used_count || 0}/{c.max_uses || '∞'}</TableCell>
              <TableCell>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('es-MX') : '—'}</TableCell>
              <TableCell><Chip label={c.is_active ? 'Activo' : 'Inactivo'} size="small" color={c.is_active ? 'success' : 'default'} /></TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(c)}><EditOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
                <IconButton size="small" onClick={() => deleteMutation.mutate(c.id)}><DeleteOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Editar cupón' : 'Nuevo cupón'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Código" size="small" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          <Select size="small" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <MenuItem value="percent">Porcentaje (%)</MenuItem>
            <MenuItem value="fixed">Monto fijo ($)</MenuItem>
            <MenuItem value="free_shipping">Envío gratis</MenuItem>
          </Select>
          {form.type !== 'free_shipping' && (
            <TextField label="Valor" size="small" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
          )}
          <TextField label="Compra mínima ($)" size="small" type="number" value={form.min_purchase} onChange={e => setForm(f => ({ ...f, min_purchase: e.target.value }))} />
          <TextField label="Usos máximos" size="small" type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} />
          <TextField label="Inicia" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} />
          <TextField label="Expira" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
          <FormControlLabel control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />} label="Activo" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.code}>
            {saveMutation.isPending ? <CircularProgress size={16} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// =============================================
// COLLECTIONS TAB
// =============================================
function CollectionsTab() {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const emptyForm = { name: '', slug: '', description: '', coverImage: '', is_active: true }
  const [form, setForm] = useState(emptyForm)

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['admin-collections'],
    queryFn: () => api.adminGetCollections(),
  })

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? api.adminUpdateCollection(editing.id, data) : api.adminCreateCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] })
      notify(editing ? 'Colección actualizada' : 'Colección creada', 'success')
      setDialogOpen(false)
    },
    onError: (err) => notify(err.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.adminDeleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] })
      notify('Colección eliminada', 'success')
    },
  })

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, description: c.description || '', coverImage: c.coverImage || '', is_active: c.is_active })
    setDialogOpen(true)
  }

  if (isLoading) return <Skeleton variant="rounded" height={200} />

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700}>Colecciones ({collections.length})</Typography>
        <Button startIcon={<AddIcon />} size="small" variant="contained" onClick={openCreate}>Nueva colección</Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {collections.map(c => (
            <TableRow key={c.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {c.coverImage && <Avatar variant="rounded" src={c.coverImage} sx={{ width: 32, height: 32 }} />}
                  <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                </Box>
              </TableCell>
              <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{c.slug}</Typography></TableCell>
              <TableCell><Chip label={c.is_active ? 'Activa' : 'Inactiva'} size="small" color={c.is_active ? 'success' : 'default'} /></TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(c)}><EditOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
                <IconButton size="small" onClick={() => deleteMutation.mutate(c.id)}><DeleteOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Editar colección' : 'Nueva colección'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Nombre" size="small" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <TextField label="Slug (URL)" size="small" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} />
          <TextField label="Descripción" size="small" multiline rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <TextField label="URL imagen de portada" size="small" value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} />
          <FormControlLabel control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />} label="Activa" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name || !form.slug}>
            {saveMutation.isPending ? <CircularProgress size={16} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// =============================================
// SETTINGS TAB
// =============================================
function SettingsTab() {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const [settings, setSettings] = useState(null)
  const [navLinks, setNavLinks] = useState([])
  const [footerTienda, setFooterTienda] = useState([])
  const [footerInfo, setFooterInfo] = useState([])
  const [homeCta, setHomeCta] = useState({})
  const [homePromo, setHomePromo] = useState({})
  const [homeNewsletter, setHomeNewsletter] = useState({})

  const { data: rawSettings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.adminGetSettings(),
  })

  // Initialize local state when data arrives
  const initialized = useRef(false)

  useEffect(() => {
    if (rawSettings && !initialized.current) {
      initialized.current = true
      setSettings({
        site_name: rawSettings.site_name || '',
        logo_url: rawSettings.logo_url || '',
        tagline: rawSettings.tagline || '',
        support_email: rawSettings.support_email || '',
        copyright: rawSettings.copyright || '',
        color_primary: rawSettings.color_primary || '#282d35',
        color_secondary: rawSettings.color_secondary || '#dc454d',
        social_instagram: rawSettings.social_instagram || '',
        social_facebook: rawSettings.social_facebook || '',
        social_x: rawSettings.social_x || '',
        seo_title: rawSettings.seo_title || '',
        seo_description: rawSettings.seo_description || '',
      })
      try { setNavLinks(JSON.parse(rawSettings.nav_links || '[]')) } catch { setNavLinks([]) }
      try { setFooterTienda(JSON.parse(rawSettings.footer_tienda || '[]')) } catch { setFooterTienda([]) }
      try { setFooterInfo(JSON.parse(rawSettings.footer_info || '[]')) } catch { setFooterInfo([]) }
      try { setHomeCta(JSON.parse(rawSettings.home_cta || '{}')) } catch { setHomeCta({}) }
      try { setHomePromo(JSON.parse(rawSettings.home_promo_slide || '{}')) } catch { setHomePromo({}) }
      try { setHomeNewsletter(JSON.parse(rawSettings.home_newsletter || '{}')) } catch { setHomeNewsletter({}) }
    }
  }, [rawSettings])

  const saveMutation = useMutation({
    mutationFn: (payload) => api.adminUpdateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
      queryClient.invalidateQueries({ queryKey: ['site-config'] })
      notify('Configuración guardada', 'success')
    },
    onError: () => notify('Error al guardar', 'error'),
  })

  const handleSave = () => {
    saveMutation.mutate({
      ...settings,
      nav_links: JSON.stringify(navLinks),
      footer_tienda: JSON.stringify(footerTienda),
      footer_info: JSON.stringify(footerInfo),
      home_cta: JSON.stringify(homeCta),
      home_promo_slide: JSON.stringify(homePromo),
      home_newsletter: JSON.stringify(homeNewsletter),
    })
  }

  const updateSetting = (key, value) => setSettings(s => ({ ...s, [key]: value }))

  if (isLoading || !settings) return <Skeleton height={300} variant="rounded" />

  const sectionSx = { mb: 4 }
  const sectionTitle = (text) => (
    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#374151', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {text}
    </Typography>
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Configuración del sitio</Typography>
        <Button variant="contained" size="small" onClick={handleSave} disabled={saveMutation.isPending}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
          {saveMutation.isPending ? <CircularProgress size={14} /> : 'Guardar cambios'}
        </Button>
      </Box>

      {/* General */}
      <Box sx={sectionSx}>
        {sectionTitle('General')}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label="Nombre del sitio" size="small" fullWidth value={settings.site_name} onChange={(e) => updateSetting('site_name', e.target.value)} />
            <TextField label="Email de soporte" size="small" fullWidth value={settings.support_email} onChange={(e) => updateSetting('support_email', e.target.value)} />
          </Box>
          <TextField label="Logo URL" size="small" fullWidth value={settings.logo_url} onChange={(e) => updateSetting('logo_url', e.target.value)} />
          <TextField label="Tagline / Descripción corta" size="small" fullWidth value={settings.tagline} onChange={(e) => updateSetting('tagline', e.target.value)} />
          <TextField label="Copyright" size="small" fullWidth value={settings.copyright} onChange={(e) => updateSetting('copyright', e.target.value)} />
        </Box>
      </Box>

      {/* Colors */}
      <Box sx={sectionSx}>
        {sectionTitle('Colores')}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: settings.color_primary, border: '1px solid #e5e5e5' }} />
            <TextField label="Primario" size="small" value={settings.color_primary} onChange={(e) => updateSetting('color_primary', e.target.value)} sx={{ width: 120 }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: settings.color_secondary, border: '1px solid #e5e5e5' }} />
            <TextField label="Secundario" size="small" value={settings.color_secondary} onChange={(e) => updateSetting('color_secondary', e.target.value)} sx={{ width: 120 }} />
          </Box>
        </Box>
      </Box>

      {/* Social */}
      <Box sx={sectionSx}>
        {sectionTitle('Redes sociales')}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField label="Instagram URL" size="small" fullWidth value={settings.social_instagram} onChange={(e) => updateSetting('social_instagram', e.target.value)} placeholder="https://instagram.com/..." />
          <TextField label="Facebook URL" size="small" fullWidth value={settings.social_facebook} onChange={(e) => updateSetting('social_facebook', e.target.value)} placeholder="https://facebook.com/..." />
          <TextField label="X (Twitter) URL" size="small" fullWidth value={settings.social_x} onChange={(e) => updateSetting('social_x', e.target.value)} placeholder="https://x.com/..." />
        </Box>
      </Box>

      {/* SEO */}
      <Box sx={sectionSx}>
        {sectionTitle('SEO')}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField label="Título por defecto" size="small" fullWidth value={settings.seo_title} onChange={(e) => updateSetting('seo_title', e.target.value)} />
          <TextField label="Meta descripción" size="small" fullWidth multiline minRows={2} value={settings.seo_description} onChange={(e) => updateSetting('seo_description', e.target.value)} />
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={sectionSx}>
        {sectionTitle('Navegación')}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navLinks.map((link, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField size="small" value={link.label} placeholder="Label"
                onChange={(e) => { const n = [...navLinks]; n[i] = { ...n[i], label: e.target.value }; setNavLinks(n) }}
                sx={{ width: 140 }} />
              <TextField size="small" value={link.to} placeholder="/ruta" fullWidth
                onChange={(e) => { const n = [...navLinks]; n[i] = { ...n[i], to: e.target.value }; setNavLinks(n) }} />
              <IconButton size="small" onClick={() => setNavLinks(navLinks.filter((_, idx) => idx !== i))} sx={{ color: '#dc2626' }}>
                <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => setNavLinks([...navLinks, { label: '', to: '/', position: navLinks.length + 1 }])}
            sx={{ textTransform: 'none', alignSelf: 'flex-start', mt: 0.5 }}>
            Agregar link
          </Button>
        </Box>
      </Box>

      {/* Footer links */}
      <Box sx={sectionSx}>
        {sectionTitle('Footer — Tienda')}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {footerTienda.map((link, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField size="small" value={link.label} placeholder="Label"
                onChange={(e) => { const n = [...footerTienda]; n[i] = { ...n[i], label: e.target.value }; setFooterTienda(n) }}
                sx={{ width: 140 }} />
              <TextField size="small" value={link.to} placeholder="/ruta" fullWidth
                onChange={(e) => { const n = [...footerTienda]; n[i] = { ...n[i], to: e.target.value }; setFooterTienda(n) }} />
              <IconButton size="small" onClick={() => setFooterTienda(footerTienda.filter((_, idx) => idx !== i))} sx={{ color: '#dc2626' }}>
                <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => setFooterTienda([...footerTienda, { label: '', to: '/' }])}
            sx={{ textTransform: 'none', alignSelf: 'flex-start', mt: 0.5 }}>
            Agregar link
          </Button>
        </Box>
      </Box>

      <Box sx={sectionSx}>
        {sectionTitle('Footer — Info')}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {footerInfo.map((link, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField size="small" value={link.label} placeholder="Label"
                onChange={(e) => { const n = [...footerInfo]; n[i] = { ...n[i], label: e.target.value }; setFooterInfo(n) }}
                sx={{ width: 140 }} />
              <TextField size="small" value={link.to} placeholder="/ruta" fullWidth
                onChange={(e) => { const n = [...footerInfo]; n[i] = { ...n[i], to: e.target.value }; setFooterInfo(n) }} />
              <IconButton size="small" onClick={() => setFooterInfo(footerInfo.filter((_, idx) => idx !== i))} sx={{ color: '#dc2626' }}>
                <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => setFooterInfo([...footerInfo, { label: '', to: '/' }])}
            sx={{ textTransform: 'none', alignSelf: 'flex-start', mt: 0.5 }}>
            Agregar link
          </Button>
        </Box>
      </Box>

      {/* Home — Promo slide */}
      <Box sx={sectionSx}>
        {sectionTitle('Home — Slide promo')}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField label="Título" size="small" fullWidth value={homePromo.title || ''} onChange={(e) => setHomePromo(p => ({ ...p, title: e.target.value }))} />
          <TextField label="Subtítulo" size="small" fullWidth value={homePromo.subtitle || ''} onChange={(e) => setHomePromo(p => ({ ...p, subtitle: e.target.value }))} />
          <TextField label="Link" size="small" fullWidth value={homePromo.link || ''} onChange={(e) => setHomePromo(p => ({ ...p, link: e.target.value }))} />
        </Box>
      </Box>

      {/* Home — CTA */}
      <Box sx={sectionSx}>
        {sectionTitle('Home — Banner CTA')}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField label="Título" size="small" fullWidth value={homeCta.title || ''} onChange={(e) => setHomeCta(p => ({ ...p, title: e.target.value }))} />
          <TextField label="Descripción" size="small" fullWidth multiline minRows={2} value={homeCta.description || ''} onChange={(e) => setHomeCta(p => ({ ...p, description: e.target.value }))} />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label="Texto del botón" size="small" fullWidth value={homeCta.buttonText || ''} onChange={(e) => setHomeCta(p => ({ ...p, buttonText: e.target.value }))} />
            <TextField label="Link del botón" size="small" fullWidth value={homeCta.buttonLink || ''} onChange={(e) => setHomeCta(p => ({ ...p, buttonLink: e.target.value }))} />
          </Box>
        </Box>
      </Box>

      {/* Home — Newsletter */}
      <Box sx={sectionSx}>
        {sectionTitle('Home — Newsletter')}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField label="Título" size="small" fullWidth value={homeNewsletter.title || ''} onChange={(e) => setHomeNewsletter(p => ({ ...p, title: e.target.value }))} />
          <TextField label="Descripción" size="small" fullWidth multiline minRows={2} value={homeNewsletter.description || ''} onChange={(e) => setHomeNewsletter(p => ({ ...p, description: e.target.value }))} />
          <TextField label="Texto del botón" size="small" value={homeNewsletter.buttonText || ''} onChange={(e) => setHomeNewsletter(p => ({ ...p, buttonText: e.target.value }))} sx={{ maxWidth: 200 }} />
        </Box>
      </Box>

      {/* Bottom save */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #f0f0f0' }}>
        <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
          {saveMutation.isPending ? <CircularProgress size={14} /> : 'Guardar cambios'}
        </Button>
      </Box>
    </Box>
  )
}
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Button, IconButton, Chip, Skeleton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import { api } from '../services/api'
import { useNotification } from '../context/NotificationContext'

export default function AdminProducts() {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ nombre: '', artista: '', tipo: 'LP', precio: '', precioDescuento: '', existencias: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => api.adminGetProducts(1),
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.adminCreateProduct(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      notify(`"${res.product?.nombre || 'Producto'}" se agregó al catálogo`, 'success')
      handleCloseDialog()
    },
    onError: (err) => notify(`No se pudo crear el producto: ${err.message || 'error desconocido'}`, 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.adminUpdateProduct(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      notify(`"${res.product?.nombre || 'Producto'}" actualizado correctamente`, 'success')
      handleCloseDialog()
    },
    onError: (err) => notify(`No se pudo actualizar: ${err.message || 'error desconocido'}`, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.adminDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
    onError: (err) => notify(`No se pudo eliminar el producto: ${err.message || 'error desconocido'}`, 'error'),
  })

  const products = data?.products || []

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setForm({ nombre: '', artista: '', tipo: 'LP', precio: '', precioDescuento: '', existencias: '' })
    setImageFile(null)
    setImagePreview(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setForm({
      nombre: product.nombre || '',
      artista: product.artista || '',
      tipo: product.tipo || 'LP',
      precio: product.precio || product.precioOriginal || '',
      precioDescuento: product.precioDescuento || '',
      existencias: product.existencias ?? '',
    })
    setImageFile(null)
    setImagePreview(product.imagen || null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
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

  const handleSubmit = () => {
    if (!form.nombre.trim() || !form.artista.trim() || !form.precio) return

    const formData = new FormData()
    formData.append('nombre', form.nombre.trim())
    formData.append('artista', form.artista.trim())
    formData.append('tipo', form.tipo)
    formData.append('precio', Number(form.precio))
    formData.append('precioOriginal', Number(form.precio))
    formData.append('precioDescuento', form.precioDescuento ? Number(form.precioDescuento) : '')
    formData.append('existencias', Number(form.existencias) || 0)
    if (imageFile) {
      formData.append('imagen', imageFile)
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (product) => {
    setDeleteTarget(product)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      const nombre = deleteTarget.nombre
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          notify(`"${nombre}" fue eliminado del catálogo`, 'info')
        }
      })
    }
    setDeleteTarget(null)
  }

  if (isLoading) {
    return (
      <Box>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`skel-${i}`} height={52} sx={{ mb: 0.5, borderRadius: 1 }} />
        ))}
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {products.length} producto(s)
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Nuevo producto
        </Button>
      </Box>

      <Box sx={{ border: '1px solid #f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#fafafa' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280' }}>Producto</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280' }}>Precio</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280' }}>Stock</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: '#6b7280' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{product.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{product.artista}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.tipo}
                    size="small"
                    sx={{
                      fontWeight: 600, fontSize: '0.68rem', borderRadius: 50,
                      bgcolor: product.tipo === 'LP' ? '#282d35' : '#f5f5f5',
                      color: product.tipo === 'LP' ? '#fff' : '#282d35',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    ${(product.precioDescuento || product.precio)?.toLocaleString('es-MX')}
                  </Typography>
                  {product.precioDescuento && product.precioOriginal && (
                    <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      ${product.precioOriginal?.toLocaleString('es-MX')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: product.existencias > 5 ? '#059669' : product.existencias > 0 ? '#d97706' : '#dc2626' }}
                  >
                    {product.existencias}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpenEdit(product)} sx={{ color: '#6b7280' }}>
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(product)} sx={{ color: '#dc2626' }}>
                    <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
          {editingProduct ? 'Editar producto' : 'Nuevo producto'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Nombre"
            size="small"
            fullWidth
            value={form.nombre}
            onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
          />
          <TextField
            label="Artista"
            size="small"
            fullWidth
            value={form.artista}
            onChange={(e) => setForm(f => ({ ...f, artista: e.target.value }))}
          />
          <Select
            value={form.tipo}
            onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))}
            size="small"
            fullWidth
          >
            <MenuItem value="LP">LP</MenuItem>
            <MenuItem value="CD">CD</MenuItem>
          </Select>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Precio"
              size="small"
              type="number"
              fullWidth
              value={form.precio}
              onChange={(e) => setForm(f => ({ ...f, precio: e.target.value }))}
            />
            <TextField
              label="Precio desc."
              size="small"
              type="number"
              fullWidth
              value={form.precioDescuento}
              onChange={(e) => setForm(f => ({ ...f, precioDescuento: e.target.value }))}
              placeholder="Opcional"
            />
          </Box>
          <TextField
            label="Existencias"
            size="small"
            type="number"
            fullWidth
            value={form.existencias}
            onChange={(e) => setForm(f => ({ ...f, existencias: e.target.value }))}
          />
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ borderColor: '#e5e5e5', color: '#6b7280', textTransform: 'none', fontWeight: 500, borderRadius: 2, py: 1, '&:hover': { borderColor: '#282d35', bgcolor: '#fafafa', color: '#282d35' } }}
            >
              {imageFile ? imageFile.name : 'Subir imagen'}
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 1.5, overflow: 'hidden', border: '1px solid #f0f0f0', flexShrink: 0 }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Button
                  size="small"
                  onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  sx={{ color: '#dc2626', textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Quitar
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseDialog} size="small" sx={{ color: '#6b7280' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            startIcon={(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {editingProduct ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
          Eliminar producto
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Seguro que deseas eliminar <strong>{deleteTarget?.nombre}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} size="small" sx={{ color: '#6b7280' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

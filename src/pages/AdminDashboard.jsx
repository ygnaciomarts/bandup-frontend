import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Container, Typography, Box, Tabs, Tab, Paper, Skeleton, Grid,
  TextField, Table, TableHead, TableRow, TableCell, TableBody, Switch, InputAdornment
} from '@mui/material'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import BarChartIcon from '@mui/icons-material/BarChart'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import StarIcon from '@mui/icons-material/Star'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import SearchIcon from '@mui/icons-material/Search'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import { api } from '../services/api'
import { useNotification } from '../context/NotificationContext'

function StatsBar() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => api.adminGetProducts(1, ''),
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" width="25%" height={80} sx={{ borderRadius: 2 }} />)}
      </Box>
    )
  }

  const products = data?.products || []
  const total = products.length
  const featured = products.filter(p => p.featured).length
  const lowStock = products.filter(p => p.existencias <= 5 && p.existencias > 0).length
  const outOfStock = products.filter(p => p.existencias === 0).length

  const stats = [
    { label: 'Total productos', value: total, color: '#3b82f6', icon: <InventoryOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: 'Featured', value: featured, color: '#f59e0b', icon: <StarIcon sx={{ fontSize: 20 }} /> },
    { label: 'Stock bajo (≤5)', value: lowStock, color: '#d97706', icon: <WarningAmberIcon sx={{ fontSize: 20 }} /> },
    { label: 'Sin stock', value: outOfStock, color: '#dc2626', icon: <WarningAmberIcon sx={{ fontSize: 20 }} /> },
  ]

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      {stats.map((stat) => (
        <Paper key={stat.label} variant="outlined" sx={{ flex: '1 1 140px', p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>{stat.value}</Typography>
            <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState(0)

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          Panel de administración
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Gestiona productos y órdenes de la tienda.
        </Typography>
      </Box>

      <StatsBar />

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2,
            pt: 1,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', minHeight: 42 },
            '& .MuiTabs-indicator': { bgcolor: '#282d35', height: 2.5, borderRadius: 2 },
          }}
        >
          <Tab icon={<InventoryOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Productos" />
          <Tab icon={<LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Órdenes" />
          <Tab icon={<PeopleOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Usuarios" />
          <Tab icon={<BarChartIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Analítica" />
        </Tabs>

        <Box sx={{ p: 2.5 }}>
          {tab === 0 && <AdminProducts />}
          {tab === 1 && <AdminOrders />}
          {tab === 2 && <UsersTab />}
          {tab === 3 && <AnalyticsTab />}
        </Box>
      </Paper>
    </Container>
  )
}

function AnalyticsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.adminGetAnalytics(),
  })

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1,2,3,4,5,6].map(i => <Grid item xs={6} md={4} key={i}><Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} /></Grid>)}
      </Grid>
    )
  }

  const stats = data || {}
  const cards = [
    { label: 'Ingresos totales', value: `$${(stats.totalRevenue || 0).toLocaleString('es-MX')}`, color: '#059669' },
    { label: 'Órdenes totales', value: stats.totalOrders || 0, color: '#2563eb' },
    { label: 'Ticket promedio', value: `$${(stats.averageOrderValue || 0).toLocaleString('es-MX')}`, color: '#7c3aed' },
    { label: 'Productos activos', value: stats.activeProducts || 0, color: '#282d35' },
    { label: 'Usuarios registrados', value: stats.totalUsers || 0, color: '#0891b2' },
    { label: 'Reseñas', value: stats.totalReviews || 0, color: '#d97706' },
  ]

  return (
    <Grid container spacing={2}>
      {cards.map(card => (
        <Grid item xs={6} md={4} key={card.label}>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #f0f0f0', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {card.label}
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, color: card.color }}>
              {card.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
      {stats.topProducts?.length > 0 && (
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #f0f0f0', borderRadius: 2, mt: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Top productos vendidos</Typography>
            {stats.topProducts.map((p, i) => (
              <Box key={p.id || i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid #f9f9f9' }}>
                <Typography variant="body2">{i + 1}. {p.title}</Typography>
                <Typography variant="body2" fontWeight={600}>{p.totalSold} vendidos</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      )}
    </Grid>
  )
}

function UsersTab() {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const [search, setSearch] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.adminGetUsers(),
  })

  const toggleRole = useMutation({
    mutationFn: ({ id, su }) => api.adminUpdateUserRole(id, su),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      notify('Rol actualizado', 'success')
    },
    onError: (err) => notify(err.message || 'Error al actualizar rol', 'error'),
  })

  const filtered = users.filter(u =>
    !search ||
    u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.usuario?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={48} />)}
    </Box>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Usuarios ({users.length})</Typography>
        <TextField
          size="small" placeholder="Buscar usuario..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
          sx={{ width: 240 }}
        />
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Usuario</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Email</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Admin</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map(u => (
            <TableRow key={u.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
              <TableCell sx={{ fontSize: '0.82rem' }}>{u.usuario}</TableCell>
              <TableCell sx={{ fontSize: '0.82rem' }}>{u.nombre} {u.apellido || ''}</TableCell>
              <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{u.email}</TableCell>
              <TableCell align="center">
                <Switch
                  checked={u.su === '1' || u.su === 1}
                  onChange={() => toggleRole.mutate({ id: u.id, su: !(u.su === '1' || u.su === 1) })}
                  size="small"
                  disabled={toggleRole.isPending}
                />
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                No se encontraron usuarios
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  )
}

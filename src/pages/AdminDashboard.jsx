import { useState } from 'react'
import { Container, Typography, Box, Tabs, Tab } from '@mui/material'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'

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

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', minHeight: 42 },
          '& .MuiTabs-indicator': { bgcolor: '#282d35', height: 2.5, borderRadius: 2 },
        }}
      >
        <Tab icon={<InventoryOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Productos" />
        <Tab icon={<LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Órdenes" />
      </Tabs>

      {tab === 0 && <AdminProducts />}
      {tab === 1 && <AdminOrders />}
    </Container>
  )
}

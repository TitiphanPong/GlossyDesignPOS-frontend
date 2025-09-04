'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// Mock data
const salesData = [
  { month: 'ม.ค.', sales: 1200 },
  { month: 'ก.พ.', sales: 1800 },
  { month: 'มี.ค.', sales: 2200 },
  { month: 'เม.ย.', sales: 900 },
  { month: 'พ.ค.', sales: 2400 },
  { month: 'มิ.ย.', sales: 3100 },
];

const recentOrders = [
  { id: 1, customer: 'คุณเอ', category: 'นามบัตร', status: 'completed', paid: '350฿' },
  { id: 2, customer: 'คุณบี', category: 'ตรายาง', status: 'pending', paid: '250฿' },
  { id: 3, customer: 'คุณซี', category: 'ถ่ายเอกสาร', status: 'completed', paid: '1250฿' },
  { id: 4, customer: 'คุณดี', category: 'สติ๊กเกอร์', status: 'pending', paid: '500฿' },
  { id: 5, customer: 'คุณอี', category: 'โปสเตอร์', status: 'completed', paid: '100฿' },
];

export default function DashboardPage() {
  const summaryCards = [
    { label: 'ยอดขายวันนี้', value: '฿ 12,500', icon: <MonetizationOnIcon sx={{ fontSize: 40, color: '#4caf50' }} /> },
    { label: 'งานค้าง', value: '8', icon: <HourglassEmptyIcon sx={{ fontSize: 40, color: '#ff9800' }} /> },
    { label: 'งานเสร็จสิ้น', value: '15', icon: <CheckCircleIcon sx={{ fontSize: 40, color: '#2196f3' }} /> },
    { label: 'ลูกค้าใหม่', value: '3', icon: <PeopleAltIcon sx={{ fontSize: 40, color: '#9c27b0' }} /> },
  ];

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',

      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{
          textAlign: 'center',
          mb: 4,
          background: 'linear-gradient(90deg, #4a90e2, #9013fe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        ✨ Dashboard Glossy Design ✨
      </Typography>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 3,
          mb: 4,
        }}
      >
        {summaryCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <Card
              sx={{
                borderRadius: 4,
                backdropFilter: 'blur(12px)',
                background: 'rgba(255, 255, 255, 0.7)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                p: 2,
                textAlign: 'center',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box>{card.icon}</Box>
                <Typography variant="h6" mt={1} color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Content Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
        }}
      >
        {/* Sales Chart */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card
            sx={{
              borderRadius: 4,
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              p: 3,
              height: 360,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📈 กราฟยอดขายรายเดือน
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="url(#colorSales)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#42a5f5" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
          <Card
            sx={{
              borderRadius: 4,
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              p: 3,
              height: 360,
              overflow: 'auto',
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📋 งานล่าสุด
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden', background: 'transparent' }} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ลูกค้า</TableCell>
                    <TableCell>ประเภทงาน</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>ยอดชำระ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.customer}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>
                        {row.status === 'completed' ? (
                          <Chip label="เสร็จสิ้น" color="success" size="small" />
                        ) : (
                          <Chip label="รอดำเนินการ" color="warning" size="small" />
                        )}
                      </TableCell>
                      <TableCell>{row.paid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
}

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
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

type CartItem = {
  name: string;
  category?: string;
  quantity?: number;
  price?: number;
};

type Order = {
  _id: string;
  orderId: string;
  customerName?: string;
  status: 'pending' | 'paid' | 'cancelled';
  total?: number;
  payment: 'cash' | 'promptpay';
  createdAt: string;
  cart?: CartItem[]; // ✅ เพิ่ม cart เข้าไป
};

type Summary = {
  salesToday?: number;
  cashToday?: number;
  promptPayToday?: number;
  completed?: number;
};

// ✅ ฟังก์ชันช่วย format เงินแบบปลอดภัย
const money = (n?: number) => (typeof n === 'number' ? `฿ ${n.toLocaleString('th-TH')}` : '฿ 0');

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    if (!base) return;

    Promise.all([
      fetch(`${base}/orders/summary`).then(res => res.json()),
      fetch(`${base}/orders`).then(res => res.json()),
    ])
      .then(([summaryData, orders]) => {
        setSummary(summaryData);

        if (Array.isArray(orders)) {
          // ✅ เรียงจาก createdAt ล่าสุด → เก่าสุด
          const sorted = [...orders].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // ✅ เอามาแค่ 4 ออเดอร์ล่าสุด
          setRecentOrders(sorted.slice(0, 4));
        } else {
          setRecentOrders([]);
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const summaryCards = [
    {
      label: 'ยอดขายรวมวันนี้',
      value: money(summary?.salesToday),
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
    },
    {
      label: 'ยอดขายเงินสด',
      value: money(summary?.cashToday),
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
    },
    {
      label: 'ยอดขายโอน',
      value: money(summary?.promptPayToday),
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
    },
    {
      label: 'งานเสร็จสิ้น',
      value: summary?.completed ?? 0,
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, minHeight: '100vh' }}>
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
        }}>
        ✨ Dashboard Glossy Design ✨
      </Typography>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 3,
          mb: 4,
        }}>
        {summaryCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}>
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
              }}>
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
        }}>
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}>
          <Card
            sx={{
              borderRadius: 4,
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              p: 3,
              height: 360,
            }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📈 กราฟยอดขายรายเดือน
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={[]}>
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
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}>
          <Card
            sx={{
              borderRadius: 4,
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              p: 3,
              height: 360,
              overflow: 'auto',
            }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📋 งานล่าสุด
            </Typography>
            <Box sx={{ flex: 1, overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Order ID</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>ลูกค้า</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>ประเภทงาน</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>สถานะ</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>ยอดรวม</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>วันที่</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map(order => (
                    <TableRow key={order._id} hover>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.customerName || '-'}</TableCell>
                      <TableCell>
                        {order.cart && order.cart.length > 0
                          ? order.cart[0].name // หรือ .category
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {order.status === 'paid' ? (
                          <Chip label="เสร็จสิ้น" color="success" size="small" />
                        ) : order.status === 'pending' ? (
                          <Chip label="รอดำเนินการ" color="warning" size="small" />
                        ) : (
                          <Chip label="ยกเลิก" color="error" size="small" />
                        )}
                      </TableCell>
                      <TableCell>{money(order.total)}</TableCell>
                      <TableCell>
                        {order.createdAt ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
}

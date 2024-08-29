import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FiDollarSign, FiShoppingBag, FiUsers, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminOverview = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalItemsSold, setTotalItemsSold] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [topMenuItems, setTopMenuItems] = useState([]);

  useEffect(() => {
    fetchOverviewData();
    fetchDailyRevenue();
    fetchTopMenuItems();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      
      // Fetch total revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');
      if (revenueError) throw revenueError;
      const revenue = revenueData.reduce((sum, order) => sum + order.total_amount, 0);
      setTotalRevenue(revenue);

      // Fetch total items sold
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('quantity');
      if (itemsError) throw itemsError;
      const itemsSold = itemsData.reduce((sum, item) => sum + item.quantity, 0);
      setTotalItemsSold(itemsSold);

      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      if (usersError) throw usersError;
      setTotalUsers(usersCount);

      // Fetch active orders
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (ordersError) throw ordersError;
      setActiveOrders(ordersCount);

    } catch (error) {
      console.error('Error fetching overview data:', error);
      toast.error('Gagal memuat data ikhtisar');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const dailyData = data.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + order.total_amount;
        return acc;
      }, {});

      setDailyRevenue(Object.entries(dailyData).map(([date, amount]) => ({ date, amount })));
    } catch (error) {
      console.error('Error fetching daily revenue:', error);
      toast.error('Gagal memuat data pendapatan harian');
    }
  };

  const fetchTopMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('menu_items(title), quantity')
        .order('quantity', { ascending: false })
        .limit(5);

      if (error) throw error;

      const topItems = data.reduce((acc, item) => {
        const title = item.menu_items.title;
        acc[title] = (acc[title] || 0) + item.quantity;
        return acc;
      }, {});

      setTopMenuItems(Object.entries(topItems).map(([title, quantity]) => ({ title, quantity })));
    } catch (error) {
      console.error('Error fetching top menu items:', error);
      toast.error('Gagal memuat data menu terpopuler');
    }
  };

  const revenueChartData = {
    labels: dailyRevenue.map(item => item.date),
    datasets: [
      {
        label: 'Pendapatan Harian',
        data: dailyRevenue.map(item => item.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return <div>Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-0">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Total Pendapatan</p>
              <p className="text-3xl font-bold">Rp {totalRevenue.toLocaleString()}</p>
            </div>
            <FiDollarSign className="text-4xl text-green-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Item Terjual</p>
              <p className="text-3xl font-bold">{totalItemsSold}</p>
            </div>
            <FiShoppingBag className="text-4xl text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Total Pengguna</p>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <FiUsers className="text-4xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Pesanan Aktif</p>
              <p className="text-3xl font-bold">{activeOrders}</p>
            </div>
            <FiActivity className="text-4xl text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Grafik Pendapatan Harian</h2>
        <div style={{ height: '300px' }}>
          <Bar data={revenueChartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Menu Terpopuler</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Menu</th>
              <th className="text-right">Jumlah Terjual</th>
            </tr>
          </thead>
          <tbody>
            {topMenuItems.map((item, index) => (
              <tr key={index}>
                <td>{item.title}</td>
                <td className="text-right">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOverview;
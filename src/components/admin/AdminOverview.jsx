import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FiDollarSign, FiShoppingBag, FiUsers, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminOverview = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalItemsSold, setTotalItemsSold] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
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
      toast.error('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-card p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Total Revenue</p>
            <p className="text-3xl font-bold">Rp {totalRevenue.toLocaleString()}</p>
          </div>
          <FiDollarSign className="text-4xl text-green-500" />
        </div>
      </div>
      <div className="bg-card p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Items Sold</p>
            <p className="text-3xl font-bold">{totalItemsSold}</p>
          </div>
          <FiShoppingBag className="text-4xl text-blue-500" />
        </div>
      </div>
      <div className="bg-card p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Total Users</p>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </div>
          <FiUsers className="text-4xl text-yellow-500" />
        </div>
      </div>
      <div className="bg-card p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Active Orders</p>
            <p className="text-3xl font-bold">{activeOrders}</p>
          </div>
          <FiActivity className="text-4xl text-red-500" />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
import React, { useState, useEffect } from "react";
import { productService } from "../services/productServices";

type User = {
  name?: string;
};

interface DashboardProps {
  user?: User;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  [key: string]: unknown;
}

interface Stats {
  totalProducts: number;
  totalValue: number;
  lowStock: number;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await productService.getProducts();
      const products: Product[] = (data && data.products) || [];

      const total = products.length;
      const value = products.reduce((sum: number, p: Product) => {
        const price = Number(p.price) || 0;
        const stock = Number(p.stock) || 0;
        return sum + (price * stock);
      }, 0);
      const low = products.filter((p: Product) => (Number(p.stock) || 0) < 10).length;

      setStats({
        totalProducts: total,
        totalValue: value,
        lowStock: low
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  return (
    <div 
      className="min-h-[calc(100vh-4rem)] p-8"
      style={{ backgroundColor: '#ABC7B1' }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Productos</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Valor Total</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Stock Bajo</p>
                <p className="text-3xl font-bold text-red-600">{stats.lowStock}</p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Bienvenido, {user?.name}! 👋</h2>
          <p className="text-gray-600">
            Este es tu panel de control. Desde aquí puedes ver estadísticas generales de tu tienda.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

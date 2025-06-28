import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { state: cartState } = useCart();
  const { state: authState, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ShopHub</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            {/* Business Dashboard Link for Business Owners */}
            {authState.user?.user_type === 'business_owner' && (
              <Link to="/business" className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
                <Package className="h-6 w-6" />
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartState.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              {authState.user && !authState.loading ? (
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 transition-colors">
                    {authState.user?.avatar_url ? (
                      <img src={authState.user.avatar_url} alt="Profile" className="h-6 w-6 rounded-full" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                    <span className="hidden sm:block text-sm font-medium">
                      {authState.user?.full_name || 'User'}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center space-x-1 p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <User className="h-6 w-6" />
                  <span className="hidden sm:block text-sm font-medium">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 py-4 border-t border-gray-200">
          <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
            Home
          </Link>
          <Link to="/products" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
            Products
          </Link>
          <Link to="/products?category=Electronics" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
            Electronics
          </Link>
          <Link to="/products?category=Fashion" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
            Fashion
          </Link>
          <Link to="/products?category=Home & Garden" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
            Home & Garden
          </Link>
          <Link to="/products?category=Sports" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
            Sports
          </Link>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
            <nav className="space-y-2">
              <Link to="/" className="block py-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Home
              </Link>
              <Link to="/products" className="block py-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Products
              </Link>
              <Link to="/products?category=Electronics" className="block py-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Electronics
              </Link>
              <Link to="/products?category=Fashion" className="block py-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Fashion
              </Link>
              <Link to="/products?category=Home & Garden" className="block py-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Home & Garden
              </Link>
              <Link to="/products?category=Sports" className="block py-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Sports
              </Link>
              {authState.user?.user_type === 'business_owner' && (
                <Link to="/business" className="block py-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                  Business Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
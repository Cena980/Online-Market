import React, { useState } from 'react';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { state: authState, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    signOut();
    navigate('/');
  };

  if (authState.loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!authState.user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
        <p className="text-gray-600 mb-8">You need to be signed in to view your profile.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">
          Sign In
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
              {authState.user?.avatar_url ? (
                <img
                  src={authState.user.avatar_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
              ) : (
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                {authState.user?.full_name || 'User'}
              </h2>
              <p className="text-gray-600">{authState.user.email}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                {authState.user?.user_type === 'business_owner' ? 'Business Owner' : 'Customer'}
              </span>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={authState.user?.full_name || ''}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue={authState.user?.phone || ''}
                        placeholder="+1 (555) 123-4567"
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={authState.user?.email || ''}
                      className="input-field"
                      disabled
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <input
                      type="text"
                      value={authState.user?.user_type === 'business_owner' ? 'Business Owner' : 'Customer'}
                      className="input-field"
                      disabled
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Order History</h3>
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Your order history will appear here
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    className="btn-primary"
                  >
                    Start Shopping
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Wishlist</h3>
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Save items you love for later
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    className="btn-primary"
                  >
                    Start Shopping
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-gray-700">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-gray-700">Order updates</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-gray-700">Marketing emails</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Privacy</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-gray-700">Make profile public</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-gray-700">Share purchase history</span>
                      </label>
                    </div>
                  </div>
                  <button className="btn-primary">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
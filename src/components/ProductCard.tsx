import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../lib/api';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { dispatch } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // Convert API product to cart product format
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: product.image_url,
      category: product.category_name || 'Unknown',
      description: product.description,
      rating: 4.5, // Default rating since it's not in the API response
      reviews: 0, // Default reviews since it's not in the API response
      inStock: product.stock_quantity > 0,
      features: product.features
    };
    dispatch({ type: 'ADD_ITEM', payload: cartProduct });
  };

  const renderStars = (rating: number = 4.5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="card hover:shadow-lg transition-shadow duration-300">
        <div className="relative overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.original_price && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              Sale
            </div>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center space-x-1">
              {renderStars(4.5)}
            </div>
            <span className="text-sm text-gray-500 ml-2">(0)</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">${product.price}</span>
              {product.original_price && (
                <span className="text-sm text-gray-500 line-through">${product.original_price}</span>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
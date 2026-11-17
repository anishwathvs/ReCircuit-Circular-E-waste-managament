import React, { useState, useEffect } from 'react';
import { 
  Heart, ShoppingCart, Trash2, Store, 
  ExternalLink, CheckCircle2, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { MarketplaceListing } from '../../types';
import { getProductImage } from '../../utils/productImages';

export const RetailerWishlistsPage: React.FC = () => {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSampleWishlist = async () => {
      try {
        setLoading(true);
        const res = await api.getMarketplace();
        // Take a slice as sample saved items or from localStorage
        const saved = res.listings?.slice(0, 3) || [];
        setWishlistItems(saved);
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSampleWishlist();
  }, []);

  const handleRemove = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#16834D]" /> Saved Devices & Watchlist
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Monitor bulk inventory lots, track price updates, and move high-demand units into your cart.
          </p>
        </div>
        <Link
          to="/dashboard/retailer/browse"
          className="flex items-center gap-2 bg-[#084D36] hover:bg-[#063b2a] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Store className="w-4 h-4" /> Browse Catalog
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center text-xs text-[#6B756E]">
          Loading saved devices...
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EBE5] p-12 text-center">
          <Heart className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
          <h3 className="font-heading font-bold text-sm text-[#151A17] mb-1">Your wishlist is empty</h3>
          <p className="text-xs text-[#6B756E] mb-4">
            Save devices from the refurbished marketplace to order them when needed.
          </p>
          <Link
            to="/dashboard/retailer/browse"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#084D36] text-white text-xs font-bold rounded-xl"
          >
            Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E5EBE5] overflow-hidden p-4 flex flex-col justify-between shadow-xs hover:shadow-card transition-all"
            >
              <div>
                <div className="aspect-[16/11] bg-[#F8FAF7] rounded-xl border border-[#E5EBE5] p-4 flex items-center justify-center overflow-hidden mb-3 relative">
                  <img
                    src={getProductImage(item)}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold text-[#084D36] bg-[#EBF8E9] rounded-md border border-[#C3E8BF]">
                    In Stock
                  </span>
                </div>

                <h3 className="font-heading font-bold text-sm text-[#151A17] line-clamp-1">{item.title}</h3>
                <div className="text-xs text-[#6B756E] mt-0.5">{item.warranty || '6 Months Warranty'}</div>
                <div className="font-heading font-extrabold text-base text-[#084D36] mt-2">
                  ₹{Number(item.sellingPrice).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-[#E5EBE5] mt-3">
                <button
                  onClick={() => addToCart(item)}
                  className="flex-1 py-2 bg-[#084D36] hover:bg-[#063b29] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 border border-[#E5EBE5] rounded-xl text-[#6B756E] hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


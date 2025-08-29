import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Plus, Minus, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items, updateItemQuantity } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          ),
          users (
            name
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const cartItem = items.find(item => item.product_id === id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (product) {
      addItem(product.id, quantity);
    }
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (product && newQuantity <= product.stock_quantity) {
      updateItemQuantity(product.id, newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-gradient-card">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.categories && (
                <Badge variant="secondary">
                  {product.categories.name}
                </Badge>
              )}
              <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Store className="h-4 w-4" />
              <span>Sold by {product.users?.name}</span>
            </div>
            
            <div className="text-4xl font-bold text-primary mb-6">
              ${product.price.toFixed(2)}
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Add to Cart Section */}
          <Card>
            <CardContent className="p-6">
              {currentQuantity > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">In your cart:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(currentQuantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="font-medium min-w-[2rem] text-center">
                        {currentQuantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(currentQuantity + 1)}
                        className="h-8 w-8 p-0"
                        disabled={currentQuantity >= product.stock_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/cart')} 
                    className="w-full"
                    size="lg"
                  >
                    View Cart
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="font-medium min-w-[2rem] text-center">
                        {quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                        className="h-8 w-8 p-0"
                        disabled={quantity >= product.stock_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart - ${(product.price * quantity).toFixed(2)}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Info */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Category:</span>
                <p className="text-muted-foreground">{product.categories?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Seller:</span>
                <p className="text-muted-foreground">{product.users?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Stock:</span>
                <p className="text-muted-foreground">{product.stock_quantity} units</p>
              </div>
              <div>
                <span className="font-medium">Added:</span>
                <p className="text-muted-foreground">
                  {new Date(product.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  category?: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addItem, items, updateItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

  const cartItem = items.find(item => item.product_id === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addItem(product.id, quantity);
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity <= 0) {
      updateItemQuantity(product.id, 0);
    } else {
      updateItemQuantity(product.id, newQuantity);
    }
  };

  return (
    <Card className="group hover-lift hover:shadow-medium transition-all duration-300 overflow-hidden">
      <div className="aspect-square overflow-hidden bg-gradient-card">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category.name}
            </Badge>
          )}
          
          <h3 
            className="font-semibold text-lg leading-tight cursor-pointer hover:text-primary transition-colors"
            onClick={() => onViewDetails?.(product)}
          >
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            
            <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {currentQuantity > 0 ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantity(currentQuantity - 1)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="font-medium text-sm w-8 text-center">
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
            
            <span className="text-sm text-muted-foreground">
              In cart
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 w-full">
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="font-medium text-sm w-8 text-center">
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
            
            <Button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { setCartItems, addToCart, updateQuantity, removeFromCart, clearCart, setLoading } from '@/store/slices/cartSlice';
import { RootState } from '@/store/store';
import { useToast } from '@/hooks/use-toast';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, total, loading } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      dispatch(clearCart());
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    try {
      dispatch(setLoading(true));
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const cartItems = data.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.products.name,
        price: item.products.price,
        quantity: item.quantity,
        image_url: item.products.image_url,
      }));

      dispatch(setCartItems(cartItems));
    } catch (error: any) {
      console.error('Error loading cart:', error);
      toast({
        title: "Error loading cart",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const addItem = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      // First get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, image_url')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;

        dispatch(updateQuantity({ product_id: productId, quantity: newQuantity }));
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          });

        if (insertError) throw insertError;

        dispatch(addToCart({
          id: crypto.randomUUID(),
          product_id: productId,
          name: product.name,
          price: product.price,
          quantity,
          image_url: product.image_url,
        }));
      }

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error adding to cart",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    if (!user) return;

    try {
      if (newQuantity <= 0) {
        await removeItem(productId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      dispatch(updateQuantity({ product_id: productId, quantity: newQuantity }));
    } catch (error: any) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error updating cart",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeItem = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      dispatch(removeFromCart(productId));
      
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearUserCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch(clearCart());
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error clearing cart",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    items,
    total,
    loading,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart: clearUserCart,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package, Truck, Clock, Star, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ui/product-card';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load featured products
      const { data: products } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .limit(8);

      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .limit(6);

      setFeaturedProducts(products || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Fresh Groceries
              <span className="block bg-white/10 backdrop-blur rounded-2xl px-4 py-2 mt-4 inline-block">
                Delivered Fast
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-slide-up">
              Get your favorite groceries delivered to your doorstep in under 30 minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                <Link to="/products" className="flex items-center">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {!user && (
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  <Link to="/auth?mode=signup">
                    Join SwiftCart
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Get your groceries delivered in under 30 minutes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fresh Quality</h3>
                <p className="text-muted-foreground">
                  Carefully selected fresh products from trusted suppliers
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Service</h3>
                <p className="text-muted-foreground">
                  Order anytime, anywhere with our round-the-clock service
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground text-lg">
              Find everything you need in our organized categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=₹{category.id}`}
                className="group"
              >
                <Card className="hover-lift text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground text-lg">
              Discover our most popular and fresh items
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted"></div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link to="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 hero-gradient text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Star className="h-16 w-16 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Thousands of Happy Customers
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Experience the convenience of fresh grocery delivery today
            </p>
            {!user && (
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                <Link to="/auth?mode=signup">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

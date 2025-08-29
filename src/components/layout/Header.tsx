import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'seller':
        return '/seller';
      default:
        return '/profile';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            SwiftCart
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/products" className="text-foreground/80 hover:text-foreground transition-colors">
            Products
          </Link>
          <Link to="/categories" className="text-foreground/80 hover:text-foreground transition-colors">
            Categories
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/cart" className="relative">
                <Button variant="outline" size="sm" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  {itemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {profile?.name || 'User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  {(profile?.role === 'seller' || profile?.role === 'admin') && (
                    <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/auth?mode=signup')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
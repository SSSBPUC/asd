import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PortalUser {
  id: string;
  username: string;
  full_name: string;
  user_type: string;
  email?: string;
  department?: string;
}

export default function Portal() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('portal_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/portal-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('portal_user');
    navigate('/portal-login');
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome, {user.full_name}!
          </h1>
          <p className="text-lg text-muted-foreground">
            {user.user_type === 'staff' ? 'Staff Portal' : 'Student Portal'}
          </p>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="text-primary" size={24} />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{user.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{user.user_type}</p>
                  </div>
                  {user.department && (
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{user.department}</p>
                    </div>
                  )}
                  {user.email && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" onClick={handleLogout} className="gap-2">
                    <LogOut size={16} />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
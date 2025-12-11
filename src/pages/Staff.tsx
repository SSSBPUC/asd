import { useEffect, useState } from 'react';
import { Users, GraduationCap, Briefcase } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface StaffMember {
  id: string;
  name: string;
  designation: string;
  department: string | null;
  qualification: string | null;
  email: string | null;
  phone: string | null;
  image_url: string | null;
  staff_type: string;
}

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setStaff(data);
    }
    setLoading(false);
  };

  const administrators = staff.filter(s => s.staff_type === 'administrator');
  const lecturers = staff.filter(s => s.staff_type === 'lecturer');
  const nonTeaching = staff.filter(s => s.staff_type === 'non-teaching');

  const StaffCard = ({ member }: { member: StaffMember }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {member.image_url ? (
              <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <Users className="text-primary" size={24} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
            <p className="text-sm text-primary">{member.designation}</p>
            {member.department && (
              <p className="text-sm text-muted-foreground">{member.department}</p>
            )}
            {member.qualification && (
              <p className="text-xs text-muted-foreground mt-1">{member.qualification}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StaffGrid = ({ members, emptyMessage }: { members: StaffMember[]; emptyMessage: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.length > 0 ? (
        members.map(member => <StaffCard key={member.id} member={member} />)
      ) : (
        <p className="text-muted-foreground col-span-full text-center py-8">{emptyMessage}</p>
      )}
    </div>
  );

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Staff</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Meet our dedicated team of educators and administrators committed to excellence
          </p>
        </div>
      </section>

      {/* Staff Tabs */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading staff...</div>
          ) : (
            <Tabs defaultValue="administrators" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="administrators" className="flex items-center gap-2">
                  <Briefcase size={16} />
                  <span className="hidden sm:inline">Administrators</span>
                  <span className="sm:hidden">Admin</span>
                </TabsTrigger>
                <TabsTrigger value="lecturers" className="flex items-center gap-2">
                  <GraduationCap size={16} />
                  <span className="hidden sm:inline">Lecturers</span>
                  <span className="sm:hidden">Faculty</span>
                </TabsTrigger>
                <TabsTrigger value="non-teaching" className="flex items-center gap-2">
                  <Users size={16} />
                  <span className="hidden sm:inline">Non-Teaching</span>
                  <span className="sm:hidden">Staff</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="administrators">
                <StaffGrid members={administrators} emptyMessage="No administrators to display" />
              </TabsContent>

              <TabsContent value="lecturers">
                <StaffGrid members={lecturers} emptyMessage="No lecturers to display" />
              </TabsContent>

              <TabsContent value="non-teaching">
                <StaffGrid members={nonTeaching} emptyMessage="No non-teaching staff to display" />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </Layout>
  );
}
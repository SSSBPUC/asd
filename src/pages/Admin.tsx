import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Home, BookOpen, Image, Users, Info, FileText, RotateCcw, Save, Plus, Trash2, ClipboardList, Loader2, Eye, Check, X, Download, Navigation, PanelBottom, ToggleLeft, ToggleRight, UserCog, UserPlus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { useContent, defaultContent } from '@/contexts/ContentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import collegeLogo from '@/assets/college-logo.png';

function LoginForm() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast({ title: "Account created!", description: "You can now sign in." });
        setIsSignUp(false);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: "Welcome!", description: "You have logged in successfully." });
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Authentication failed", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={collegeLogo} alt="Logo" className="h-20 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl">{isSignUp ? 'Create Account' : 'Admin Login'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create an account to access admin features' : 'Enter your credentials to access the admin panel'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Login')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Note: Admin access requires an admin to assign you the admin role.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface Submission {
  id: string;
  student_name: string;
  date_of_birth: string;
  gender: string;
  contact_number: string;
  email: string;
  address: string;
  parent_name: string;
  parent_contact: string;
  stream: string;
  previous_school: string;
  sslc_result: string;
  preferred_language: string;
  status: string;
  created_at: string;
}

function SubmissionsViewer() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('admission_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      toast({ title: "Error", description: "Failed to load submissions", variant: "destructive" });
    } else {
      setSubmissions(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('admission_submissions')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Status updated to ${status}` });
      fetchSubmissions();
    }
  };

  const exportToExcel = () => {
    if (submissions.length === 0) {
      toast({ title: "No data", description: "No submissions to export", variant: "destructive" });
      return;
    }

    const exportData = submissions.map(sub => ({
      'Date': new Date(sub.created_at).toLocaleDateString(),
      'Student Name': sub.student_name,
      'Date of Birth': sub.date_of_birth,
      'Gender': sub.gender,
      'Contact Number': sub.contact_number,
      'Email': sub.email,
      'Address': sub.address,
      'Parent Name': sub.parent_name,
      'Parent Contact': sub.parent_contact,
      'Stream': sub.stream,
      'Previous School': sub.previous_school,
      'SSLC Result': sub.sslc_result,
      'Preferred Language': sub.preferred_language,
      'Status': sub.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admissions');
    XLSX.writeFile(workbook, `admissions_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: "Exported!", description: "Excel file downloaded successfully" });
  };

  const deleteAllSubmissions = async () => {
    if (!confirm('Are you sure you want to delete ALL submissions? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    const { error } = await supabase
      .from('admission_submissions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      console.error('Error deleting submissions:', error);
      toast({ title: "Error", description: "Failed to delete submissions", variant: "destructive" });
    } else {
      toast({ title: "Deleted!", description: "All submissions have been deleted" });
      fetchSubmissions();
    }
    setIsDeleting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-lg">Admission Submissions ({submissions.length})</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={exportToExcel} disabled={submissions.length === 0}>
            <Download size={16} className="mr-2" /> Export Excel
          </Button>
          <Button size="sm" variant="destructive" onClick={deleteAllSubmissions} disabled={submissions.length === 0 || isDeleting}>
            {isDeleting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
            Delete All
          </Button>
          <Button size="sm" variant="outline" onClick={fetchSubmissions}>
            Refresh
          </Button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No submissions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{sub.student_name}</TableCell>
                  <TableCell>{sub.stream}</TableCell>
                  <TableCell>{sub.contact_number}</TableCell>
                  <TableCell>
                    <Badge variant={
                      sub.status === 'approved' ? 'default' :
                      sub.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setSelectedSubmission(sub)}>
                        <Eye size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => updateStatus(sub.id, 'approved')}>
                        <Check size={16} className="text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => updateStatus(sub.id, 'rejected')}>
                        <X size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Student Name</Label>
                  <p className="font-medium">{selectedSubmission.student_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date of Birth</Label>
                  <p className="font-medium">{selectedSubmission.date_of_birth}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gender</Label>
                  <p className="font-medium capitalize">{selectedSubmission.gender}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact Number</Label>
                  <p className="font-medium">{selectedSubmission.contact_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stream</Label>
                  <p className="font-medium">{selectedSubmission.stream}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Parent Name</Label>
                  <p className="font-medium">{selectedSubmission.parent_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Parent Contact</Label>
                  <p className="font-medium">{selectedSubmission.parent_contact}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Previous School</Label>
                  <p className="font-medium">{selectedSubmission.previous_school}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">SSLC Result</Label>
                  <p className="font-medium">{selectedSubmission.sslc_result}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Preferred Language</Label>
                  <p className="font-medium capitalize">{selectedSubmission.preferred_language}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={
                    selectedSubmission.status === 'approved' ? 'default' :
                    selectedSubmission.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {selectedSubmission.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-medium">{selectedSubmission.address}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => { updateStatus(selectedSubmission.id, 'approved'); setSelectedSubmission(null); }}>
                  <Check size={16} className="mr-2" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => { updateStatus(selectedSubmission.id, 'rejected'); setSelectedSubmission(null); }}>
                  <X size={16} className="mr-2" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HomeEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [homeData, setHomeData] = useState(content.home);

  const handleSave = () => {
    updateContent('home', homeData);
    toast({ title: "Saved!", description: "Home page content updated successfully." });
  };

  const updateAnnouncement = (index: number, field: string, value: string) => {
    const newAnnouncements = [...homeData.announcements];
    newAnnouncements[index] = { ...newAnnouncements[index], [field]: value };
    setHomeData({ ...homeData, announcements: newAnnouncements });
  };

  const addAnnouncement = () => {
    setHomeData({
      ...homeData,
      announcements: [...homeData.announcements, { title: 'New Announcement', date: 'Date', description: 'Description' }]
    });
  };

  const removeAnnouncement = (index: number) => {
    setHomeData({
      ...homeData,
      announcements: homeData.announcements.filter((_, i) => i !== index)
    });
  };

  const updateStatistic = (index: number, field: string, value: string) => {
    const newItems = [...(homeData.statistics?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setHomeData({ ...homeData, statistics: { ...homeData.statistics, items: newItems } });
  };

  const updateFacility = (index: number, field: string, value: string) => {
    const newItems = [...(homeData.facilities?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setHomeData({ ...homeData, facilities: { ...homeData.facilities, items: newItems } });
  };

  const updateSisterInstitute = (index: number, field: string, value: string) => {
    const newItems = [...(homeData.sisterInstitutes?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setHomeData({ ...homeData, sisterInstitutes: { ...homeData.sisterInstitutes, items: newItems } });
  };

  return (
    <div className="space-y-6">
      {/* Video Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Video Section</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="videoEnabled"
            checked={homeData.videoSection?.enabled || false}
            onChange={(e) => setHomeData({ ...homeData, videoSection: { ...homeData.videoSection, enabled: e.target.checked } })}
          />
          <Label htmlFor="videoEnabled">Enable Video Hero</Label>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>YouTube Video ID</Label>
            <Input 
              value={homeData.videoSection?.youtubeVideoId || ''} 
              onChange={(e) => setHomeData({ ...homeData, videoSection: { ...homeData.videoSection, youtubeVideoId: e.target.value } })} 
              placeholder="e.g., zKz4QQKx_jo"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">About Section</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Section Title</Label>
            <Input 
              value={homeData.aboutSection?.title || ''} 
              onChange={(e) => setHomeData({ ...homeData, aboutSection: { ...homeData.aboutSection, title: e.target.value } })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input 
              value={homeData.aboutSection?.heading || ''} 
              onChange={(e) => setHomeData({ ...homeData, aboutSection: { ...homeData.aboutSection, heading: e.target.value } })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={homeData.aboutSection?.description || ''} 
              onChange={(e) => setHomeData({ ...homeData, aboutSection: { ...homeData.aboutSection, description: e.target.value } })}
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Founder Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Founder Section</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium">Founder</h4>
              <Input 
                placeholder="Name" 
                value={homeData.founderSection?.founder?.name || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, founder: { ...homeData.founderSection?.founder, name: e.target.value } } })} 
              />
              <Input 
                placeholder="Title" 
                value={homeData.founderSection?.founder?.title || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, founder: { ...homeData.founderSection?.founder, title: e.target.value } } })} 
              />
              <Textarea 
                placeholder="Description" 
                value={homeData.founderSection?.founder?.description || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, founder: { ...homeData.founderSection?.founder, description: e.target.value } } })} 
              />
              <Input 
                placeholder="Image URL" 
                value={homeData.founderSection?.founder?.imageUrl || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, founder: { ...homeData.founderSection?.founder, imageUrl: e.target.value } } })} 
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium">Blessings</h4>
              <Input 
                placeholder="Name" 
                value={homeData.founderSection?.blessings?.name || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, blessings: { ...homeData.founderSection?.blessings, name: e.target.value } } })} 
              />
              <Input 
                placeholder="Title" 
                value={homeData.founderSection?.blessings?.title || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, blessings: { ...homeData.founderSection?.blessings, title: e.target.value } } })} 
              />
              <Textarea 
                placeholder="Description" 
                value={homeData.founderSection?.blessings?.description || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, blessings: { ...homeData.founderSection?.blessings, description: e.target.value } } })} 
              />
              <Input 
                placeholder="Image URL" 
                value={homeData.founderSection?.blessings?.imageUrl || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, blessings: { ...homeData.founderSection?.blessings, imageUrl: e.target.value } } })} 
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Statistics Section</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input 
            value={homeData.statistics?.title || ''} 
            onChange={(e) => setHomeData({ ...homeData, statistics: { ...homeData.statistics, title: e.target.value } })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input 
            value={homeData.statistics?.description || ''} 
            onChange={(e) => setHomeData({ ...homeData, statistics: { ...homeData.statistics, description: e.target.value } })} 
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {homeData.statistics?.items?.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-4 space-y-2">
                <Input placeholder="Value" value={stat.value} onChange={(e) => updateStatistic(index, 'value', e.target.value)} />
                <Input placeholder="Label" value={stat.label} onChange={(e) => updateStatistic(index, 'label', e.target.value)} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Facilities Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Facilities Section</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input 
            value={homeData.facilities?.title || ''} 
            onChange={(e) => setHomeData({ ...homeData, facilities: { ...homeData.facilities, title: e.target.value } })} 
          />
        </div>
        <div className="grid gap-4">
          {homeData.facilities?.items?.map((facility, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-2">
                  <Input placeholder="Name" value={facility.name} onChange={(e) => updateFacility(index, 'name', e.target.value)} />
                  <Input placeholder="Icon (emoji)" value={facility.icon} onChange={(e) => updateFacility(index, 'icon', e.target.value)} />
                  <Input placeholder="Image URL" value={facility.imageUrl} onChange={(e) => updateFacility(index, 'imageUrl', e.target.value)} className="md:col-span-2" />
                  <Textarea placeholder="Description" value={facility.description} onChange={(e) => updateFacility(index, 'description', e.target.value)} className="md:col-span-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sister Institutes */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Sister Institutes</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input 
            value={homeData.sisterInstitutes?.title || ''} 
            onChange={(e) => setHomeData({ ...homeData, sisterInstitutes: { ...homeData.sisterInstitutes, title: e.target.value } })} 
          />
        </div>
        <div className="grid gap-4">
          {homeData.sisterInstitutes?.items?.map((institute, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-2">
                  <Input placeholder="Name" value={institute.name} onChange={(e) => updateSisterInstitute(index, 'name', e.target.value)} />
                  <Input placeholder="Image URL" value={institute.imageUrl} onChange={(e) => updateSisterInstitute(index, 'imageUrl', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Why SSSBPUC Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Why SSSBPUC Section</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={homeData.whyUs.title} onChange={(e) => setHomeData({ ...homeData, whyUs: { ...homeData.whyUs, title: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={homeData.whyUs.description} onChange={(e) => setHomeData({ ...homeData, whyUs: { ...homeData.whyUs, description: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Points (one per line)</Label>
          <Textarea
            value={homeData.whyUs.points.join('\n')}
            onChange={(e) => setHomeData({ ...homeData, whyUs: { ...homeData.whyUs, points: e.target.value.split('\n').filter(p => p.trim()) } })}
            rows={4}
          />
        </div>
      </div>

      {/* Announcements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Announcements</h3>
          <Button size="sm" onClick={addAnnouncement}><Plus size={16} className="mr-1" /> Add</Button>
        </div>
        {homeData.announcements.map((ann, index) => (
          <Card key={index}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Announcement {index + 1}</span>
                <Button size="sm" variant="ghost" onClick={() => removeAnnouncement(index)}><Trash2 size={16} /></Button>
              </div>
              <Input placeholder="Title" value={ann.title} onChange={(e) => updateAnnouncement(index, 'title', e.target.value)} />
              <Input placeholder="Date" value={ann.date} onChange={(e) => updateAnnouncement(index, 'date', e.target.value)} />
              <Textarea placeholder="Description" value={ann.description} onChange={(e) => updateAnnouncement(index, 'description', e.target.value)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2" /> Save Changes</Button>
    </div>
  );
}

function AcademicsEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [data, setData] = useState(content.academics);

  const handleSave = () => {
    updateContent('academics', data);
    toast({ title: "Saved!", description: "Academics content updated successfully." });
  };

  const updateStream = (index: number, field: string, value: any) => {
    const newStreams = [...data.streams];
    newStreams[index] = { ...newStreams[index], [field]: value };
    setData({ ...data, streams: newStreams });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Introduction</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={data.intro.title} onChange={(e) => setData({ ...data, intro: { ...data.intro, title: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={data.intro.description} onChange={(e) => setData({ ...data, intro: { ...data.intro, description: e.target.value } })} />
        </div>
      </div>

      {data.streams.map((stream, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-lg">{stream.name}</h3>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={stream.description} onChange={(e) => updateStream(index, 'description', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subjects (comma separated)</Label>
            <Textarea value={stream.subjects.join(', ')} onChange={(e) => updateStream(index, 'subjects', e.target.value.split(',').map(s => s.trim()))} />
          </div>
          <div className="space-y-2">
            <Label>Features (one per line)</Label>
            <Textarea value={stream.features.join('\n')} onChange={(e) => updateStream(index, 'features', e.target.value.split('\n').filter(f => f.trim()))} rows={4} />
          </div>
        </div>
      ))}

      <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2" /> Save Changes</Button>
    </div>
  );
}

function GalleryEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [data, setData] = useState(content.gallery);

  const handleSave = () => {
    updateContent('gallery', data);
    toast({ title: "Saved!", description: "Gallery content updated successfully." });
  };

  const updateImage = (index: number, field: string, value: string) => {
    const newImages = [...data.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setData({ ...data, images: newImages });
  };

  const addImage = () => {
    setData({
      ...data,
      images: [...data.images, { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', caption: 'New Image', category: 'Events' }]
    });
  };

  const removeImage = (index: number) => {
    setData({ ...data, images: data.images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Gallery Settings</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Images</h3>
          <Button size="sm" onClick={addImage}><Plus size={16} className="mr-1" /> Add Image</Button>
        </div>
        <div className="grid gap-4">
          {data.images.map((img, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  <img src={img.url} alt={img.caption} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Image URL" value={img.url} onChange={(e) => updateImage(index, 'url', e.target.value)} />
                    <div className="flex gap-2">
                      <Input placeholder="Caption" value={img.caption} onChange={(e) => updateImage(index, 'caption', e.target.value)} />
                      <Input placeholder="Category" value={img.category} onChange={(e) => updateImage(index, 'category', e.target.value)} className="w-32" />
                      <Button size="icon" variant="ghost" onClick={() => removeImage(index)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2" /> Save Changes</Button>
    </div>
  );
}

function CampusLifeEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [data, setData] = useState(content.campusLife);

  const handleSave = () => {
    updateContent('campusLife', data);
    toast({ title: "Saved!", description: "Campus Life content updated successfully." });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const newSections = [...data.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setData({ ...data, sections: newSections });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Page Header</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
        </div>
      </div>

      {data.sections.map((section, index) => (
        <div key={index} className="space-y-2 p-4 border rounded-lg">
          <Label>{section.title}</Label>
          <Textarea value={section.description} onChange={(e) => updateSection(index, 'description', e.target.value)} />
        </div>
      ))}

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Saturday Activities</h3>
        <Textarea
          value={data.saturdayActivities.join('\n')}
          onChange={(e) => setData({ ...data, saturdayActivities: e.target.value.split('\n').filter(a => a.trim()) })}
          rows={5}
        />
      </div>

      <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2" /> Save Changes</Button>
    </div>
  );
}

function AboutEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [data, setData] = useState(content.about);

  const handleSave = () => {
    updateContent('about', data);
    toast({ title: "Saved!", description: "About content updated successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">History</h3>
        <Textarea value={data.history} onChange={(e) => setData({ ...data, history: e.target.value })} rows={4} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Vision</h3>
        <Textarea value={data.vision} onChange={(e) => setData({ ...data, vision: e.target.value })} rows={3} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Mission (one per line)</h3>
        <Textarea value={data.mission.join('\n')} onChange={(e) => setData({ ...data, mission: e.target.value.split('\n').filter(m => m.trim()) })} rows={4} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Principal's Message</h3>
        <Textarea value={data.principalMessage} onChange={(e) => setData({ ...data, principalMessage: e.target.value })} rows={4} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Contact Information</h3>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={data.contact.address} onChange={(e) => setData({ ...data, contact: { ...data.contact, address: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={data.contact.phone} onChange={(e) => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={data.contact.email} onChange={(e) => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2" /> Save Changes</Button>
    </div>
  );
}

function NavbarEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [data, setData] = useState(content.navbar);

  const handleSave = () => {
    updateContent('navbar', data);
    toast({ title: "Saved!", description: "Navbar content updated successfully." });
  };

  const updateLink = (index: number, field: string, value: string | boolean) => {
    const newLinks = [...data.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setData({ ...data, links: newLinks });
  };

  const addLink = () => {
    setData({ ...data, links: [...data.links, { name: "New Link", path: "/new-page", enabled: true }] });
  };

  const removeLink = (index: number) => {
    setData({ ...data, links: data.links.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">College Info</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>College Name</Label>
            <Input value={data.collegeName} onChange={(e) => setData({ ...data, collegeName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Logos</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Left Logo URL</Label>
            <Input value={data.leftLogoUrl} onChange={(e) => setData({ ...data, leftLogoUrl: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Left Logo Link (href)</Label>
            <Input value={data.leftLogoHref || '/'} onChange={(e) => setData({ ...data, leftLogoHref: e.target.value })} placeholder="/" />
          </div>
          <div className="space-y-2">
            <Label>Right Logo URL</Label>
            <Input value={data.rightLogoUrl} onChange={(e) => setData({ ...data, rightLogoUrl: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Right Logo Link (href)</Label>
            <Input value={data.rightLogoHref || '/'} onChange={(e) => setData({ ...data, rightLogoHref: e.target.value })} placeholder="/" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Admission Button</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input value={data.admissionButtonText} onChange={(e) => setData({ ...data, admissionButtonText: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Button
              type="button"
              variant={data.admissionButtonEnabled !== false ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => setData({ ...data, admissionButtonEnabled: data.admissionButtonEnabled === false ? true : false })}
            >
              {data.admissionButtonEnabled !== false ? <><ToggleRight size={14} className="mr-1" /> Visible</> : <><ToggleLeft size={14} className="mr-1" /> Hidden</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Navigation Links</h3>
          <Button size="sm" variant="outline" onClick={addLink}><Plus size={14} className="mr-1" /> Add</Button>
        </div>
        {data.links.map((link, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Link Name</Label>
                    <Input value={link.name} onChange={(e) => updateLink(index, 'name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Path</Label>
                    <Input value={link.path} onChange={(e) => updateLink(index, 'path', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Visible</Label>
                    <Button
                      type="button"
                      variant={link.enabled !== false ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateLink(index, 'enabled', link.enabled === false ? true : false)}
                    >
                      {link.enabled !== false ? <><ToggleRight size={14} className="mr-1" /> On</> : <><ToggleLeft size={14} className="mr-1" /> Off</>}
                    </Button>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => removeLink(index)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} size="sm" className="w-full"><Save size={14} className="mr-1" /> Save Changes</Button>
    </div>
  );
}

function FooterEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [data, setData] = useState(content.footer);

  const handleSave = () => {
    updateContent('footer', data);
    toast({ title: "Saved!", description: "Footer content updated successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Basic Info</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>College Name</Label>
            <Input value={data.collegeName} onChange={(e) => setData({ ...data, collegeName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input value={data.logoUrl} onChange={(e) => setData({ ...data, logoUrl: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tagline</Label>
          <Textarea value={data.tagline} onChange={(e) => setData({ ...data, tagline: e.target.value })} rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Copyright Text</Label>
          <Input value={data.copyright} onChange={(e) => setData({ ...data, copyright: e.target.value })} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Contact Information</h3>
        <div className="space-y-2">
          <Label>Address</Label>
          <Textarea value={data.contact.address} onChange={(e) => setData({ ...data, contact: { ...data.contact, address: e.target.value } })} rows={2} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={data.contact.phone} onChange={(e) => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={data.contact.email} onChange={(e) => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">College Hours</h3>
        <div className="space-y-2">
          <Label>Weekdays</Label>
          <Input value={data.hours.weekdays} onChange={(e) => setData({ ...data, hours: { ...data.hours, weekdays: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Saturday</Label>
          <Input value={data.hours.saturday} onChange={(e) => setData({ ...data, hours: { ...data.hours, saturday: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Sunday</Label>
          <Input value={data.hours.sunday} onChange={(e) => setData({ ...data, hours: { ...data.hours, sunday: e.target.value } })} />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2" /> Save Changes</Button>
    </div>
  );
}

function AdmissionEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [data, setData] = useState(content.admission);

  const handleSave = () => {
    updateContent('admission', data);
    toast({ title: "Saved!", description: "Admission content updated successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Page Header</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Eligibility (one per line)</h3>
        <Textarea value={data.eligibility.join('\n')} onChange={(e) => setData({ ...data, eligibility: e.target.value.split('\n').filter(el => el.trim()) })} rows={4} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Required Documents (one per line)</h3>
        <Textarea value={data.documents.join('\n')} onChange={(e) => setData({ ...data, documents: e.target.value.split('\n').filter(d => d.trim()) })} rows={6} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Instructions</h3>
        <Textarea value={data.instructions} onChange={(e) => setData({ ...data, instructions: e.target.value })} rows={3} />
      </div>

      <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2" /> Save Changes</Button>
    </div>
  );
}

interface Staff {
  id: string;
  name: string;
  designation: string;
  department: string | null;
  staff_type: 'admin' | 'lecturer' | 'non_teaching';
  email: string | null;
  phone: string | null;
  qualification: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

function StaffEditor() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admin' | 'lecturer' | 'non_teaching'>('admin');
  const [editingStaff, setEditingStaff] = useState<Partial<Staff> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching staff:', error);
      toast({ title: "Error", description: "Failed to load staff", variant: "destructive" });
    } else {
      setStaff((data || []) as Staff[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSave = async () => {
    if (!editingStaff?.name || !editingStaff?.designation) {
      toast({ title: "Error", description: "Name and designation are required", variant: "destructive" });
      return;
    }

    const staffData = {
      name: editingStaff.name,
      designation: editingStaff.designation,
      department: editingStaff.department || null,
      staff_type: editingStaff.staff_type || activeTab,
      email: editingStaff.email || null,
      phone: editingStaff.phone || null,
      qualification: editingStaff.qualification || null,
      image_url: editingStaff.image_url || null,
      is_active: editingStaff.is_active ?? true,
      display_order: editingStaff.display_order ?? 0,
    };

    if (editingStaff.id) {
      const { error } = await supabase.from('staff').update(staffData).eq('id', editingStaff.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update staff", variant: "destructive" });
        return;
      }
      toast({ title: "Updated!", description: "Staff member updated successfully" });
    } else {
      const { error } = await supabase.from('staff').insert(staffData);
      if (error) {
        toast({ title: "Error", description: "Failed to add staff", variant: "destructive" });
        return;
      }
      toast({ title: "Added!", description: "Staff member added successfully" });
    }

    setIsDialogOpen(false);
    setEditingStaff(null);
    fetchStaff();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete staff", variant: "destructive" });
      return;
    }
    toast({ title: "Deleted!", description: "Staff member deleted" });
    fetchStaff();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('staff').update({ is_active: !isActive }).eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      return;
    }
    fetchStaff();
  };

  const filteredStaff = staff.filter(s => s.staff_type === activeTab);
  const staffLabels = { admin: 'Administrators', lecturer: 'Lecturers', non_teaching: 'Non-Teaching Staff' };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-lg">Staff Management</h3>
        <Button size="sm" onClick={() => { setEditingStaff({ staff_type: activeTab, is_active: true }); setIsDialogOpen(true); }}>
          <Plus size={14} className="mr-1" /> Add Staff
        </Button>
      </div>

      <div className="flex gap-2">
        {(['admin', 'lecturer', 'non_teaching'] as const).map(type => (
          <Button
            key={type}
            size="sm"
            variant={activeTab === type ? 'default' : 'outline'}
            onClick={() => setActiveTab(type)}
          >
            {staffLabels[type]} ({staff.filter(s => s.staff_type === type).length})
          </Button>
        ))}
      </div>

      {filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No {staffLabels[activeTab].toLowerCase()} added yet.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.designation}</TableCell>
                  <TableCell>{member.department || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? 'default' : 'secondary'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => toggleActive(member.id, member.is_active)}>
                        {member.is_active ? <ToggleRight size={14} className="text-green-600" /> : <ToggleLeft size={14} />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditingStaff(member); setIsDialogOpen(true); }}>
                        <Eye size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(member.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStaff?.id ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={editingStaff?.name || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Designation *</Label>
                <Input value={editingStaff?.designation || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, designation: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={editingStaff?.department || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, department: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Qualification</Label>
                <Input value={editingStaff?.qualification || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, qualification: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={editingStaff?.email || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={editingStaff?.phone || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={editingStaff?.image_url || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                size="sm"
                variant={editingStaff?.is_active !== false ? 'default' : 'outline'}
                onClick={() => setEditingStaff(prev => ({ ...prev, is_active: !prev?.is_active }))}
              >
                {editingStaff?.is_active !== false ? <><ToggleRight size={14} className="mr-1" /> Active</> : <><ToggleLeft size={14} className="mr-1" /> Inactive</>}
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave}><Save size={14} className="mr-1" /> Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple hash function for password - must match edge function
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface PortalUser {
  id?: string;
  username: string;
  password_hash?: string;
  user_type: 'staff' | 'student';
  full_name: string;
  email?: string;
  department?: string;
  is_active: boolean;
}

function PortalUsersEditor() {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PortalUser | null>(null);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'staff' | 'student'>('staff');
  const { toast } = useToast();

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('portal_users')
      .select('id, username, user_type, full_name, email, department, is_active')
      .order('full_name');

    if (!error && data) {
      setUsers(data as PortalUser[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async () => {
    if (!editingUser?.username || !editingUser?.full_name) {
      toast({ title: "Error", description: "Username and full name are required", variant: "destructive" });
      return;
    }

    if (!editingUser.id && !password) {
      toast({ title: "Error", description: "Password is required for new users", variant: "destructive" });
      return;
    }

    const userData: any = {
      username: editingUser.username,
      full_name: editingUser.full_name,
      user_type: editingUser.user_type || activeTab,
      email: editingUser.email || null,
      department: editingUser.department || null,
      is_active: editingUser.is_active ?? true,
    };

    if (password) {
      userData.password_hash = await hashPassword(password);
    }

    if (editingUser.id) {
      const { error } = await supabase.from('portal_users').update(userData).eq('id', editingUser.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
        return;
      }
      toast({ title: "Updated!", description: "User updated successfully" });
    } else {
      const { error } = await supabase.from('portal_users').insert(userData);
      if (error) {
        if (error.code === '23505') {
          toast({ title: "Error", description: "Username already exists", variant: "destructive" });
        } else {
          toast({ title: "Error", description: "Failed to add user", variant: "destructive" });
        }
        return;
      }
      toast({ title: "Added!", description: "User added successfully" });
    }

    setIsDialogOpen(false);
    setEditingUser(null);
    setPassword('');
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    const { error } = await supabase.from('portal_users').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
      return;
    }
    toast({ title: "Deleted!", description: "User deleted" });
    fetchUsers();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('portal_users').update({ is_active: !isActive }).eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      return;
    }
    fetchUsers();
  };

  const filteredUsers = users.filter(u => u.user_type === activeTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-lg">Portal Users (Login Credentials)</h3>
        <Button size="sm" onClick={() => { setEditingUser({ username: '', full_name: '', user_type: activeTab, is_active: true }); setPassword(''); setIsDialogOpen(true); }}>
          <UserPlus size={14} className="mr-1" /> Add User
        </Button>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={activeTab === 'staff' ? 'default' : 'outline'} onClick={() => setActiveTab('staff')}>
          Staff ({users.filter(u => u.user_type === 'staff').length})
        </Button>
        <Button size="sm" variant={activeTab === 'student' ? 'default' : 'outline'} onClick={() => setActiveTab('student')}>
          Students ({users.filter(u => u.user_type === 'student').length})
        </Button>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No {activeTab} users added yet.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => toggleActive(user.id!, user.is_active)}>
                        {user.is_active ? <ToggleRight size={14} className="text-green-600" /> : <ToggleLeft size={14} />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditingUser(user); setPassword(''); setIsDialogOpen(true); }}>
                        <Eye size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(user.id!)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser?.id ? 'Edit User' : 'Add User'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input
                  value={editingUser?.username || ''}
                  onChange={(e) => setEditingUser({ ...editingUser!, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label>Password {editingUser?.id ? '(leave blank to keep)' : '*'}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser?.id ? '••••••••' : 'Enter password'}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={editingUser?.full_name || ''}
                onChange={(e) => setEditingUser({ ...editingUser!, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingUser?.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser!, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={editingUser?.department || ''}
                  onChange={(e) => setEditingUser({ ...editingUser!, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>User Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={editingUser?.user_type === 'staff' ? 'default' : 'outline'}
                  onClick={() => setEditingUser({ ...editingUser!, user_type: 'staff' })}
                >
                  Staff
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={editingUser?.user_type === 'student' ? 'default' : 'outline'}
                  onClick={() => setEditingUser({ ...editingUser!, user_type: 'student' })}
                >
                  Student
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}><Save size={14} className="mr-1" /> Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminDashboard() {
  const { signOut, user, isAdmin } = useAuth();
  const { resetContent } = useContent();
  const { toast } = useToast();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all content to defaults?')) {
      resetContent();
      toast({ title: "Reset Complete", description: "All content has been reset to defaults." });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <X size={32} className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don't have admin privileges. Please contact an administrator to request access.
            </p>
            <p className="text-sm text-muted-foreground mb-4">Logged in as: {user?.email}</p>
            <div className="flex gap-2 justify-center">
              <Link to="/">
                <Button variant="outline"><Home size={16} className="mr-2" /> Go Home</Button>
              </Link>
              <Button onClick={signOut}><LogOut size={16} className="mr-2" /> Sign Out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={collegeLogo} alt="Logo" className="h-10 w-auto" />
            <div>
              <h1 className="font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home size={16} className="mr-1" /> View Site
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw size={16} className="mr-1" /> Reset All
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut size={16} className="mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="submissions">
          <TabsList className="grid grid-cols-6 md:grid-cols-11 mb-8">
            <TabsTrigger value="submissions" className="flex items-center gap-1 text-xs">
              <ClipboardList size={14} /> <span className="hidden sm:inline">Submissions</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-1 text-xs">
              <UserCog size={14} /> <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="portal-users" className="flex items-center gap-1 text-xs">
              <UserPlus size={14} /> <span className="hidden sm:inline">Portal</span>
            </TabsTrigger>
            <TabsTrigger value="navbar" className="flex items-center gap-1 text-xs">
              <Navigation size={14} /> <span className="hidden sm:inline">Navbar</span>
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-1 text-xs">
              <PanelBottom size={14} /> <span className="hidden sm:inline">Footer</span>
            </TabsTrigger>
            <TabsTrigger value="home" className="flex items-center gap-1 text-xs">
              <Home size={14} /> <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="academics" className="flex items-center gap-1 text-xs">
              <BookOpen size={14} /> <span className="hidden sm:inline">Academics</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-1 text-xs">
              <Image size={14} /> <span className="hidden sm:inline">Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="campus" className="flex items-center gap-1 text-xs">
              <Users size={14} /> <span className="inline">Campus</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1 text-xs">
              <Info size={14} /> <span className="hidden sm:inline">About</span>
            </TabsTrigger>
            <TabsTrigger value="admission" className="flex items-center gap-1 text-xs">
              <FileText size={14} /> <span className="hidden sm:inline">Admission</span>
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="pt-6">
              <TabsContent value="submissions"><SubmissionsViewer /></TabsContent>
              <TabsContent value="staff"><StaffEditor /></TabsContent>
              <TabsContent value="portal-users"><PortalUsersEditor /></TabsContent>
              <TabsContent value="navbar"><NavbarEditor /></TabsContent>
              <TabsContent value="footer"><FooterEditor /></TabsContent>
              <TabsContent value="home"><HomeEditor /></TabsContent>
              <TabsContent value="academics"><AcademicsEditor /></TabsContent>
              <TabsContent value="gallery"><GalleryEditor /></TabsContent>
              <TabsContent value="campus"><CampusLifeEditor /></TabsContent>
              <TabsContent value="about"><AboutEditor /></TabsContent>
              <TabsContent value="admission"><AdmissionEditor /></TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </main>
    </div>
  );
}

export default function Admin() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <AdminDashboard />;
}

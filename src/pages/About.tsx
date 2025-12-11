import { Target, Eye, MapPin, Phone, Mail, User } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import trustLogo from '@/assets/trust-logo.png';

export default function About() {
  const { content } = useContent();
  const { about } = content;

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{about.title}</h1>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="section-title">Our Story</h2>
                <p className="text-muted-foreground leading-relaxed">{about.history}</p>
              </div>
              <div className="flex justify-center">
                <img src={trustLogo} alt="Sri Sathya Sai Baba" className="max-w-xs w-full rounded-lg shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="card-hover">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="text-primary" size={32} />
                </div>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{about.vision}</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Target className="text-accent" size={32} />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {about.mission.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Principal's Message */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="text-primary" size={40} />
                </div>
                <CardTitle className="text-2xl">Message from the Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center italic leading-relaxed">
                  "{about.principalMessage}"
                </p>
                <p className="text-center mt-4 font-semibold text-foreground">- The Principal</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Contact Us</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="card-hover text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground text-sm">{about.contact.address}</p>
              </CardContent>
            </Card>

            <Card className="card-hover text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-muted-foreground">{about.contact.phone}</p>
              </CardContent>
            </Card>

            <Card className="card-hover text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">{about.contact.email}</p>
              </CardContent>
            </Card>
          </div>

          {/* Map Placeholder */}
          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg overflow-hidden border border-border">
              <div className="bg-muted h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">
                    Sri Sathya Sai Baba PU College<br />
                    Jayalakshmipuram, Mysuru<br />
                    <span className="text-sm">(Map placeholder - Replace with Google Maps embed)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

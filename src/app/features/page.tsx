
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/common/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Bell, MapPin, Shield, Users } from 'lucide-react';

const features = [
  {
    icon: <MapPin className="h-10 w-10 text-primary" />,
    title: 'Real-time Issue Mapping',
    description: 'Visualize reported issues on an interactive map, providing a clear overview of problems in your area.',
  },
  {
    icon: <BarChart className="h-10 w-10 text-primary" />,
    title: 'Live Air Quality Index',
    description: 'Stay informed about the air you breathe with real-time AQI data from sensors across the city.',
  },
  {
    icon: <Bell className="h-10 w-10 text-primary" />,
    title: 'Disaster Alerts',
    description: 'Receive timely alerts and updates about local emergencies and potential disasters to ensure your safety.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Community Collaboration',
    description: 'Join a community of citizens actively working together to improve their neighborhoods.',
  },
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: 'Admin Oversight',
    description: 'Dedicated admin dashboard to manage reports, track progress, and ensure issues are resolved efficiently.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex-1 w-full bg-background">
       <header className="sticky top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Platform Features</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            A comprehensive suite of tools designed for citizens and administrators to foster transparency and efficiency in civic issue resolution.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
              <CardHeader className="items-center text-center">
                {feature.icon}
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
       <footer className="bg-background border-t">
        <div className="container mx-auto py-6 px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JanSetu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart, Bell, MapPin, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import Logo from '@/components/common/Logo';

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


export default function LandingPage() {
  return (
    <div className="flex-1 w-full bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
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

      {/* Hero Section */}
      <section className="relative w-full h-[70vh] flex items-center justify-center text-center bg-cover bg-center pt-16">
         <Image
            src="https://picsum.photos/seed/hero/1800/1200"
            alt="Cityscape"
            fill
            className="object-cover"
            priority
            data-ai-hint="cityscape modern"
          />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-white">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">
            Building Better Communities, Together
          </h1>
          <div className="mb-8">
            <p className="text-2xl font-semibold text-slate-100">जनसेवा हि धर्मः</p>
            <p className="text-sm text-slate-300 italic">(&quot;Service to the people is the highest duty&quot;)</p>
          </div>
          <p className="text-lg md:text-xl text-slate-200 mb-8">
            JanSetu is a platform for civic engagement. Report issues, monitor your environment, and contribute to a smarter, cleaner, and safer city.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Platform Features</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              A comprehensive suite of tools designed for citizens and administrators to foster transparency and efficiency.
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
        </div>
      </section>

       {/* How it works Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              A simple three-step process to make your voice heard.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary text-primary-foreground mb-4">
                    <span className="text-3xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Report an Issue</h3>
                <p className="text-muted-foreground">Snap a photo, add a description, and tag the location of a civic problem you encounter.</p>
            </div>
             <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary text-primary-foreground mb-4">
                    <span className="text-3xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">Admins review your report, and you can track its status from 'Pending' to 'Resolved'.</p>
            </div>
             <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary text-primary-foreground mb-4">
                    <span className="text-3xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">See the Change</h3>
                <p className="text-muted-foreground">Get notified when the issue is resolved and see the positive impact of your contribution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Ready to Make a Difference?</h2>
          <p className="text-muted-foreground mt-2 mb-8 max-w-2xl mx-auto">
            Your voice matters. Create an account today to start reporting issues and help build a better tomorrow for your community.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Sign Up Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto py-6 px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JanSetu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

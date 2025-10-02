
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/common/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Bell, Shield, Users, Sparkles, ThumbsUp, Award, MapPin } from 'lucide-react';

const features = [
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Classification',
    description: 'Our Genkit-powered AI automatically analyzes report descriptions to assign a relevant category and urgency level, streamlining the dispatch process.',
  },
  {
    icon: <MapPin className="h-10 w-10 text-primary" />,
    title: 'Geo-tagged Issue Reporting',
    description: 'Accurately tag the location of an issue using your device\'s GPS, providing administrators with the exact coordinates for swift action.',
  },
  {
    icon: <ThumbsUp className="h-10 w-10 text-primary" />,
    title: 'Community Upvoting',
    description: 'Users can upvote existing reports in the community feed, helping administrators identify and prioritize the most critical and widespread issues.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Admin Dashboards',
    description: 'Department-specific and super-admin dashboards provide powerful tools to manage, assign, and track the status of all reported issues.',
  },
  {
    icon: <BarChart className="h-10 w-10 text-primary" />,
    title: 'Advanced Analytics',
    description: 'Visual analytics on report statuses, categories, resolution times, and costs help administrators make data-driven decisions.',
  },
  {
    icon: <Award className="h-10 w-10 text-primary" />,
    title: 'Gamified Leaderboard',
    description: 'A community leaderboard recognizes and rewards the most active and impactful citizens, encouraging continuous engagement.',
  },
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: 'Privacy-First Image Moderation',
    description: 'To protect privacy, our AI automatically detects and blurs faces in any images uploaded with a report.',
  },
  {
    icon: <Bell className="h-10 w-10 text-primary" />,
    title: 'Disaster Alerts',
    description: 'Receive timely, location-aware alerts about local emergencies and potential disasters to ensure your safety.',
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
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card flex flex-col">
              <CardHeader className="items-center text-center">
                {feature.icon}
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-1">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
         <div className="text-center mt-16">
          <h2 className="text-3xl font-headline font-bold">Ready to Contribute?</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-xl mx-auto">
            Join thousands of other citizens making a real difference in their community.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">
              Sign Up for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>
       <footer className="bg-background border-t">
        <div className="container mx-auto py-8 px-4 text-center">
            <div className="flex justify-center gap-6 mb-4">
                <Link href="/features" className="text-sm text-muted-foreground hover:text-primary">Features</Link>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link>
            </div>
            <p className="text-muted-foreground">&copy; {new Date().getFullYear()} JanSetu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

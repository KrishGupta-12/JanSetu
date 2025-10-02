
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/common/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUsPage() {
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
      <main className="container mx-auto max-w-4xl py-16 px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
            <p className="text-muted-foreground">We&apos;d love to hear from you. Here&apos;s how you can reach us.</p>
          </CardHeader>
          <CardContent className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Mail className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Email</h3>
              <p className="text-muted-foreground">For general inquiries</p>
              <a href="mailto:contact@jansetu.gov.in" className="text-primary hover:underline">contact@jansetu.gov.in</a>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Phone</h3>
              <p className="text-muted-foreground">Mon-Fri, 9am-5pm IST</p>
              <a href="tel:+911123456789" className="text-primary hover:underline">+91-11-23456789</a>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Office</h3>
              <p className="text-muted-foreground">Pragati Maidan, New Delhi</p>
              <p className="text-primary">India</p>
            </div>
          </CardContent>
        </Card>
      </main>
       <footer className="bg-background border-t">
        <div className="container mx-auto py-6 px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JanSetu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

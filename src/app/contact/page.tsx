
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from '@/components/common/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, ShieldQuestion, Code } from 'lucide-react';

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
      <main className="container mx-auto max-w-5xl py-16 px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
            <CardDescription className="max-w-2xl mx-auto">
                We are here to help. Whether you have a question about a report, a technical issue, or a general inquiry, please reach out to the appropriate department below.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <Card className="p-6 text-center flex flex-col items-center">
              <Mail className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold">General Inquiries</h3>
              <p className="text-muted-foreground text-sm flex-1 mb-4">For questions about the JanSetu initiative, partnerships, or media requests.</p>
              <Button asChild variant="outline">
                <a href="mailto:info@jansetu-chandigarh.gov.in">info@jansetu-chandigarh.gov.in</a>
              </Button>
            </Card>

            <Card className="p-6 text-center flex flex-col items-center">
              <ShieldQuestion className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Report Follow-up</h3>
              <p className="text-muted-foreground text-sm flex-1 mb-4">For questions about a specific report you've submitted or its status.</p>
              <Button asChild variant="outline">
                <a href="mailto:support@jansetu-chandigarh.gov.in">support@jansetu-chandigarh.gov.in</a>
              </Button>
            </Card>

            <Card className="p-6 text-center flex flex-col items-center">
              <Code className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Technical Support</h3>
              <p className="text-muted-foreground text-sm flex-1 mb-4">If you are experiencing technical difficulties with the app or website.</p>
              <Button asChild variant="outline">
                <a href="mailto:tech@jansetu-chandigarh.gov.in">tech@jansetu-chandigarh.gov.in</a>
              </Button>
            </Card>

          </CardContent>
           <CardContent className="mt-6 text-center">
            <div className="flex flex-col items-center border-t pt-8">
                <MapPin className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold">Head Office</h3>
                <p className="text-muted-foreground">Municipal Corporation Chandigarh</p>
                <p className="text-muted-foreground">Sector 17, Chandigarh, India</p>
            </div>
           </CardContent>
        </Card>
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

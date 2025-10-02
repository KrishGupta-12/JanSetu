
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/common/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsOfServicePage() {
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
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Terms of Service</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-stone dark:prose-invert max-w-none">
            <p>Welcome to JanSetu. These terms and conditions outline the rules and regulations for the use of JanSetu's Website and mobile application.</p>
            <p>By accessing this platform, we assume you accept these terms and conditions. Do not continue to use JanSetu if you do not agree to all of the terms and conditions stated on this page.</p>
            
            <h3 className="text-xl font-semibold pt-4">1. Accounts and User Responsibility</h3>
            <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
            
            <h3 className="text-xl font-semibold pt-4">2. User Conduct and Content</h3>
            <p>You agree not to use the Service to submit any false, misleading, or malicious reports. Reports should be truthful and submitted in good faith to help civic authorities. Any content you post (such as text and images) is your responsibility.</p>
            <p>You grant JanSetu a non-exclusive, worldwide, royalty-free license to use, reproduce, and display the content you submit for the purpose of operating and improving the service. This includes displaying reports publicly on the map and feed.</p>
            
            <h3 className="text-xl font-semibold pt-4">3. Prohibited Activities</h3>
            <p>Abusing the platform by submitting spam, hateful content, irrelevant information, or engaging in any activity that disrupts the service is strictly prohibited. Submitting a high volume of false or rejected reports may lead to account suspension or a permanent ban, at the discretion of our administrators.</p>
            
            <h3 className="text-xl font-semibold pt-4">4. Termination</h3>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>

            <h3 className="text-xl font-semibold pt-4">5. Limitation of Liability</h3>
            <p>In no event shall JanSetu, nor its directors, employees, or affiliates, be liable for any indirect, incidental, or consequential damages resulting from your use of the service. The platform is provided on an "AS IS" and "AS AVAILABLE" basis.</p>

            <h3 className="text-xl font-semibold pt-4">6. Changes to Terms</h3>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.</p>
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

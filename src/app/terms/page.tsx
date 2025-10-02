
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            <p>Welcome to JanSetu. These terms and conditions outline the rules and regulations for the use of JanSetu's Website, located at this domain.</p>
            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use JanSetu if you do not agree to take all of the terms and conditions stated on this page.</p>
            
            <h3 className="text-xl font-semibold pt-4">1. Accounts</h3>
            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            
            <h3 className="text-xl font-semibold pt-4">2. User Conduct</h3>
            <p>You agree not to use the service to submit any false, misleading, or malicious reports. Abusing the platform by submitting spam or inappropriate content will result in an account suspension or ban.</p>
            
            <h3 className="text-xl font-semibold pt-4">3. Content</h3>
            <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material (&quot;Content&quot;). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>
            <p>We reserve the right to remove any content that violates these terms without prior notice.</p>
            
            <h3 className="text-xl font-semibold pt-4">4. Limitation of Liability</h3>
            <p>In no event shall JanSetu, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

            <h3 className="text-xl font-semibold pt-4">5. Changes</h3>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
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

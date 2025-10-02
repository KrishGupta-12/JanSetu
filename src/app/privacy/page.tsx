
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/common/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
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
            <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-stone dark:prose-invert max-w-none">
            <p>JanSetu ("us", "we", or "our") operates the JanSetu application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
            
            <h3 className="text-xl font-semibold pt-4">1. Information Collection and Use</h3>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
            <h4 className="font-semibold">Types of Data Collected:</h4>
            <ul className="list-disc list-inside">
                <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information, including but not limited to: Email address, Full Name, and Phone Number.</li>
                <li><strong>Report Data:</strong> When you submit a report, we collect the information you provide, such as the description, category, attached photo, and the precise geolocation (latitude and longitude) of the issue.</li>
                <li><strong>Usage Data:</strong> We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device.</li>
            </ul>
            
            <h3 className="text-xl font-semibold pt-4">2. Use of Data</h3>
            <p>JanSetu uses the collected data for the following purposes:</p>
            <ul className="list-disc list-inside">
              <li>To provide and maintain our Service, including authenticating users and processing reports.</li>
              <li>To allow civic authorities to view, manage, and resolve the issues you report.</li>
              <li>To display reports publicly on our map and community feed to promote transparency.</li>
              <li>To notify you about the status of your reported issues.</li>
              <li>To analyze data to improve the Service's functionality and user experience.</li>
              <li>To send disaster alerts based on your geographical area.</li>
            </ul>
            
            <h3 className="text-xl font-semibold pt-4">3. Publicly Shared Information and Privacy</h3>
            <p>To foster community engagement and transparency, certain information is shared publicly:</p>
            <ul className="list-disc list-inside">
              <li>Your name is associated with the reports you submit on the Community Feed.</li>
              <li>The location, description, category, and photo of a report are made public.</li>
              <li><strong>Face Blurring:</strong> To protect the privacy of individuals, our system uses AI to automatically detect and blur any faces in the photos you upload. While we strive for accuracy, this process is automated and may not be perfect.</li>
            </ul>
            <p>Your personal contact information, such as your email and phone number, is never shared publicly.</p>

            <h3 className="text-xl font-semibold pt-4">4. Data Security</h3>
            <p>The security of your data is important to us. We use Firebase, a Google platform, which employs industry-standard security measures to protect your data. However, remember that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
            
            <h3 className="text-xl font-semibold pt-4">5. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us by visiting the contact page on our website.</p>
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

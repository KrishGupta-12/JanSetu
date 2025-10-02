
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            <p>JanSetu operates this website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
            
            <h3 className="text-xl font-semibold pt-4">1. Information Collection and Use</h3>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you. This may include, but is not limited to: Email address, First name and last name, Phone number, Address, State, Province, ZIP/Postal code, City, and Cookies and Usage Data.</p>
            
            <h3 className="text-xl font-semibold pt-4">2. Use of Data</h3>
            <p>JanSetu uses the collected data for various purposes: to provide and maintain the Service, to notify you about changes to our Service, to allow you to participate in interactive features of our Service when you choose to do so, to provide customer care and support, and to provide analysis or valuable information so that we can improve the Service.</p>
            
            <h3 className="text-xl font-semibold pt-4">3. Data Security</h3>
            <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
            
            <h3 className="text-xl font-semibold pt-4">4. Publicly Shared Information</h3>
            <p>Certain information you provide, such as your name and the content of the issues you report, may be visible to the public. The exact location of a reported issue is shared, but not your personal address. We automatically blur faces in any uploaded images to protect privacy.</p>
            
            <h3 className="text-xl font-semibold pt-4">5. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us by visiting the contact page on our website.</p>
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

'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DisasterAlert() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // In a real app, this would be determined by user's location and active disaster zones
    // from a service like Firestore. We'll simulate it with a timeout.
    const timer = setTimeout(() => {
      // Check if the alert has been dismissed before
      if (sessionStorage.getItem('disasterAlertDismissed') !== 'true') {
        setShowAlert(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowAlert(false);
    // Persist dismissal in session storage
    sessionStorage.setItem('disasterAlertDismissed', 'true');
  };

  if (!showAlert) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl z-50">
      <Alert variant="destructive" className="shadow-2xl flex items-start">
        <TriangleAlert className="h-5 w-5" />
        <div className="flex-1 ml-3">
          <AlertTitle className="font-bold">High-Priority Alert: Water Logging</AlertTitle>
          <AlertDescription>
            Severe water logging reported in Central and Old Delhi areas due to heavy rainfall. Avoid non-essential travel.
          </AlertDescription>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  );
}

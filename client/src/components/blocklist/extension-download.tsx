import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, Chrome, Shield } from 'lucide-react';

export default function ExtensionDownload() {
  // This would be the URL to your Chrome extension in the Chrome Web Store
  // For now, using a placeholder URL
  const extensionUrl = "https://chrome.google.com/webstore/category/extensions";
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Chrome className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-700">FocusFlow Chrome Extension</CardTitle>
        </div>
        <CardDescription>
          Enhance your focus with our browser extension
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pb-2">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>Block distracting websites across all tabs and windows</p>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>Sync your blocklist settings with your FocusFlow account</p>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>Stay focused even when FocusFlow isn't open</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="default" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.open(extensionUrl, '_blank')}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Extension
        </Button>
      </CardFooter>
    </Card>
  );
}
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, Chrome, Shield, Check, ExternalLink } from 'lucide-react';

export default function ExtensionDownload() {
  const [downloadStarted, setDownloadStarted] = useState(false);
  // Local extension file path
  const extensionFilePath = "/focusflow-extension.zip";
  
  const handleDownload = () => {
    // Start the download
    window.location.href = extensionFilePath;
    // Set the download started state to true
    setDownloadStarted(true);
  };
  
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
      <CardFooter className="flex flex-col gap-2">
        <Button 
          variant="default" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleDownload}
        >
          {downloadStarted ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Downloaded Extension
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Extension
            </>
          )}
        </Button>
        
        {downloadStarted && (
          <div className="text-xs text-muted-foreground mt-2 space-y-2">
            <p className="font-medium">Installation instructions:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Unzip the downloaded file</li>
              <li>Open Chrome and go to <code>chrome://extensions</code></li>
              <li>Enable "Developer mode" in the top-right corner</li>
              <li>Click "Load unpacked" and select the unzipped folder</li>
              <li>The extension is now installed!</li>
            </ol>
            <Button 
              variant="link" 
              className="text-blue-600 hover:text-blue-800 p-0 h-auto text-xs"
              onClick={() => window.open('https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Chrome's official instructions
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Blocklist from "@/components/blocklist/blocklist";
import AddSiteDialog from "@/components/blocklist/add-site-dialog";
import ExtensionDownload from "@/components/blocklist/extension-download";
import { BlocklistProvider } from "@/hooks/use-blocklist";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { Helmet } from "react-helmet";

function BlocklistPageContent() {
  return (
    <>
      <Helmet>
        <title>Distraction Blocklist | FocusFlow</title>
        <meta name="description" content="Manage your website blocklist to eliminate distractions during focus sessions. Block social media and other time-wasting sites." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="container mx-auto p-6 max-w-3xl space-y-6">
              <Card className="bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl font-semibold">Distraction Blocklist</CardTitle>
                    <CardDescription>
                      Manage the websites you want to block during focus sessions
                    </CardDescription>
                  </div>
                  <AddSiteDialog />
                </CardHeader>
                <CardContent className="pt-6">
                  <Blocklist />
                </CardContent>
                <CardFooter className="flex items-center text-sm text-muted-foreground border-t pt-4">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  <span>Sites are only blocked during focus time</span>
                </CardFooter>
              </Card>

              {/* Chrome Extension Download Card */}
              <ExtensionDownload />
            </div>
          </main>
        </div>
        
        <MobileNav />
      </div>
    </>
  );
}

export default function BlocklistPage() {
  return (
    <BlocklistProvider>
      <BlocklistPageContent />
    </BlocklistProvider>
  );
}

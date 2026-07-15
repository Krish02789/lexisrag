import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import Layout from '@/components/layout';
import Hub from '@/pages/hub';
import Documents from '@/pages/documents';
import DocumentDetail from '@/pages/document-detail';
import Evaluate from '@/pages/evaluate';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Hub} />
        <Route path="/documents" component={Documents} />
        <Route path="/documents/:id" component={DocumentDetail} />
        <Route path="/evaluate" component={Evaluate} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Link, useLocation } from 'wouter';
import { useGetStats } from '@workspace/api-client-react';
import { Book, Scale, BarChart3, Database } from 'lucide-react';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: stats } = useGetStats({ query: { queryKey: ['/api/stats'] } });

  const navItems = [
    { href: '/', label: 'Q&A Hub', icon: Scale },
    { href: '/documents', label: 'Document Library', icon: Book },
    { href: '/evaluate', label: 'Evaluation', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 text-sidebar-primary group">
            <Scale className="h-8 w-8 group-hover:scale-105 transition-transform" />
            <h1 className="text-2xl font-serif font-bold tracking-wide text-sidebar-foreground">LexisRAG</h1>
          </Link>
          <p className="text-xs text-sidebar-accent-foreground mt-2 uppercase tracking-widest font-semibold">Precision Research</p>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                  isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' 
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {stats && (
          <div className="p-6 mt-auto">
            <div className="bg-sidebar-accent/30 rounded-lg p-4 border border-sidebar-border">
              <h3 className="text-xs font-bold text-sidebar-accent-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database className="h-4 w-4" />
                System Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-sidebar-foreground/70">Total Documents</span>
                  <span className="font-mono text-sidebar-foreground">{stats.totalDocuments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-sidebar-foreground/70">Total Chunks</span>
                  <span className="font-mono text-sidebar-foreground">{stats.totalChunks.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

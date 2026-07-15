import React, { useState } from 'react';
import { useListDocuments } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { FileText, Search, Clock, Hash } from 'lucide-react';
import { format } from 'date-fns';

export default function Documents() {
  const { data: documents, isLoading } = useListDocuments({ query: { queryKey: ['/api/documents'] } });
  const [filterType, setFilterType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  if (isLoading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;
  }

  const types = Array.from(new Set(documents?.map(d => d.docType) || []));

  const filtered = documents?.filter(d => {
    if (filterType && d.docType !== filterType) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="font-serif text-4xl font-medium text-primary mb-3">Document Library</h1>
          <p className="text-muted-foreground text-lg">Browse and search the complete repository of {documents?.length || 0} legal documents.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <input 
              type="text"
              placeholder="Search titles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-3 border border-border rounded-lg text-base w-72 focus:outline-none focus:ring-2 focus:ring-accent/50 bg-card shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        <button 
          onClick={() => setFilterType(null)}
          className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-sm ${!filterType ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-muted'}`}
        >
          All Types
        </button>
        {types.map(type => (
          <button 
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-sm ${filterType === type ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-muted'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground w-1/2">Document Title</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Type</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Pages</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered?.map((doc) => (
              <tr key={doc.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-8 py-6">
                  <Link href={`/documents/${doc.id}`} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-serif font-medium text-primary text-xl group-hover:text-accent transition-colors leading-tight mb-1">{doc.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1 max-w-lg">{doc.description}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-8 py-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground border border-border/50">
                    {doc.docType}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    {doc.pageCount}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </div>
                </td>
              </tr>
            ))}
            {filtered?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center text-lg font-serif text-muted-foreground">
                  No documents found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

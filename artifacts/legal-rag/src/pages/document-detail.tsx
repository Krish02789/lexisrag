import React from 'react';
import { useParams } from 'wouter';
import { useGetDocument, getGetDocumentQueryKey } from '@workspace/api-client-react';
import { ArrowLeft, Hash, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';

export default function DocumentDetail() {
  const { id } = useParams();
  const documentId = parseInt(id || '0', 10);
  
  const { data: doc, isLoading } = useGetDocument(documentId, { 
    query: { 
      enabled: !!documentId,
      queryKey: getGetDocumentQueryKey(documentId) 
    } 
  });

  if (isLoading) {
    return (
      <div className="p-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!doc) {
    return <div className="p-20 text-center text-xl font-serif text-muted-foreground">Document not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 pb-24">
      <div className="px-8 mb-12">
        <Link href="/documents" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </Link>
        
        <header className="bg-card border border-border rounded-2xl p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground shadow-sm">
              {doc.docType}
            </span>
          </div>
          
          <h1 className="text-5xl font-serif font-bold text-primary mb-6 leading-tight">{doc.title}</h1>
          
          {doc.description && (
            <p className="text-xl text-muted-foreground font-serif leading-relaxed max-w-3xl mb-10">
              {doc.description}
            </p>
          )}
          
          <div className="flex items-center gap-8 border-t border-border pt-8">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Hash className="h-5 w-5 text-accent" />
              <span className="text-foreground">{doc.pageCount} Pages</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-5 w-5 text-accent" />
              <span className="text-foreground">Added {format(new Date(doc.createdAt), 'MMMM d, yyyy')}</span>
            </div>
          </div>
        </header>
      </div>

      <div className="px-8 space-y-16">
        {doc.chunks.map((chunk, index) => (
          <div key={chunk.id} className="relative group">
            <div className="absolute -left-16 top-0 bottom-0 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-border bg-card flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:border-accent group-hover:text-accent transition-colors">
                {chunk.pageNum}
              </div>
              {index !== doc.chunks.length - 1 && (
                <div className="w-0.5 h-full bg-border my-4 group-hover:bg-accent/30 transition-colors"></div>
              )}
            </div>
            
            <div className="bg-card border border-border rounded-xl p-10 shadow-sm hover:shadow-md hover:border-accent/40 transition-all">
              <div className="prose prose-lg max-w-none font-serif text-foreground/90 leading-relaxed text-lg">
                {chunk.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-6 last:mb-0">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

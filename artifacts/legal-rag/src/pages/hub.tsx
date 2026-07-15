import React, { useState } from 'react';
import { useQueryDocuments } from '@workspace/api-client-react';
import { Search, Loader2, CheckCircle2, ChevronRight, Hash } from 'lucide-react';
import type { QueryInputSearchMode } from '@workspace/api-client-react';
import { Link } from 'wouter';

export default function Hub() {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<QueryInputSearchMode>('hybrid');
  const { mutate: queryDocs, isPending, data: result } = useQueryDocuments();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    queryDocs({ data: { query, searchMode, topK: 5 } });
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <header className="mb-12 text-center">
        <h1 className="font-serif text-5xl text-primary font-medium mb-6">Legal Research Hub</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Ask complex legal questions and receive answers synthesized directly from authoritative source documents.
        </p>
      </header>

      <form onSubmit={handleSearch} className="bg-card shadow-xl rounded-xl border border-card-border p-2 mb-16 flex flex-col group focus-within:ring-2 focus-within:ring-accent/50 transition-all relative z-10">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="E.g., What are the tax implications of remote work under the new precedent?"
          className="w-full bg-transparent resize-none outline-none min-h-[140px] p-6 text-xl placeholder:text-muted-foreground/50 font-serif"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSearch(e);
            }
          }}
        />
        
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-b-lg border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search Mode</span>
              <select
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value as QueryInputSearchMode)}
                className="text-sm bg-card border border-border rounded-md px-4 py-2 outline-none focus:border-accent font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <option value="hybrid">Hybrid Search</option>
                <option value="vector">Semantic Vector</option>
                <option value="keyword">BM25 Keyword</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isPending || !query.trim()}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-bold uppercase tracking-wider text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Synthesize Answer
          </button>
        </div>
      </form>

      {isPending && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin mb-6 text-accent" />
          <p className="font-serif text-2xl animate-pulse text-primary">Retrieving jurisprudence...</p>
        </div>
      )}

      {result && !isPending && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white rounded-xl shadow-lg border border-accent/20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent"></div>
            <div className="p-10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-accent mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Synthesized Answer
              </h2>
              <div className="prose prose-lg max-w-none font-serif leading-relaxed text-foreground/90">
                {result.answer.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Processed in {(result.processingTimeMs / 1000).toFixed(2)}s</span>
                <span className="mx-3">•</span>
                <span>Using {result.searchMode} retrieval</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-3xl font-medium mb-8 text-primary border-b border-border pb-4">Cited Sources</h3>
            <div className="grid grid-cols-1 gap-6">
              {result.citations.map((citation, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-8 shadow-sm hover:shadow-md hover:border-accent/40 transition-all relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-5">
                      <div className="w-10 h-10 rounded-full bg-muted text-primary flex items-center justify-center font-bold text-lg shrink-0 border border-border/50 group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors">
                        {idx + 1}
                      </div>
                      <div>
                        <Link href={`/documents/${citation.documentId}`} className="text-xl font-serif font-medium text-primary group-hover:text-accent transition-colors flex items-center gap-2">
                          {citation.documentTitle}
                          <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                        </Link>
                        <div className="flex items-center gap-3 mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <span className="bg-secondary px-2.5 py-1 rounded text-secondary-foreground border border-border/50">{citation.docType}</span>
                          <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> Page {citation.pageNum}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-4xl font-light font-serif text-accent">{(citation.score * 100).toFixed(0)}%</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Relevance</div>
                    </div>
                  </div>
                  <div className="bg-muted/40 p-6 rounded-lg text-base leading-relaxed border-l-2 border-border font-serif text-foreground/80 group-hover:border-accent/40 transition-colors">
                    "{citation.excerpt}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

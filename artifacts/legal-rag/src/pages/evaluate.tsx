import React from 'react';
import { useRunEvaluation, useGetEvaluationResults } from '@workspace/api-client-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Play, Activity, CheckCircle, XCircle, Beaker } from 'lucide-react';
import { format } from 'date-fns';

export default function Evaluate() {
  const { data: results, refetch, isLoading: isResultsLoading } = useGetEvaluationResults({ query: { queryKey: ['/api/evaluation/results'] } });
  const { mutate: runEval, isPending: isRunning } = useRunEvaluation();

  const handleRunEvaluation = () => {
    runEval(undefined, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const chartData = results ? [
    { metric: 'Retrieval Accuracy', score: results.avgRetrievalAccuracy * 100 },
    { metric: 'Faithfulness', score: results.avgFaithfulness * 100 },
    { metric: 'Passing Rate', score: (results.passedEntries / results.totalEntries) * 100 }
  ] : [];

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="font-serif text-4xl font-medium text-primary mb-3">Evaluation Dashboard</h1>
          <p className="text-muted-foreground text-lg">Benchmark system performance against curated golden-set ground truth responses.</p>
        </div>
        <button
          onClick={handleRunEvaluation}
          disabled={isRunning}
          className="bg-accent text-accent-foreground px-8 py-3.5 rounded-md font-bold uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-accent/90 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          {isRunning ? (
            <Activity className="h-5 w-5 animate-pulse" />
          ) : (
            <Play className="h-5 w-5 fill-current" />
          )}
          {isRunning ? 'Running Eval...' : 'Run Evaluation'}
        </button>
      </header>

      {isRunning && (
        <div className="bg-card border border-accent/30 rounded-2xl p-16 text-center shadow-lg mb-10 relative overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="absolute inset-0 bg-accent/5 animate-pulse"></div>
          <Beaker className="h-16 w-16 text-accent mx-auto mb-6 animate-bounce" />
          <h3 className="font-serif text-3xl text-primary font-medium mb-4 relative z-10">Evaluating knowledge retrieval and generation...</h3>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto relative z-10">Running queries against the golden set, extracting citations, and grading LLM faithfulness. This process may take a minute.</p>
        </div>
      )}

      {isResultsLoading && !results && !isRunning && (
        <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div></div>
      )}

      {results && !isRunning && (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Passing Rate</div>
              <div className="flex items-end gap-4">
                <span className="text-6xl font-serif text-primary">
                  {Math.round((results.passedEntries / results.totalEntries) * 100)}%
                </span>
                <span className="text-muted-foreground font-medium mb-1.5 pb-1 border-b border-border/50">
                  {results.passedEntries} / {results.totalEntries} queries
                </span>
              </div>
            </div>
            
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Avg Retrieval Acc</div>
              <div className="flex items-end gap-4">
                <span className="text-6xl font-serif text-accent">
                  {(results.avgRetrievalAccuracy * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-6 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${results.avgRetrievalAccuracy * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Avg Faithfulness</div>
              <div className="flex items-end gap-4">
                <span className="text-6xl font-serif text-emerald-600">
                  {(results.avgFaithfulness * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-6 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${results.avgFaithfulness * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-8">
              <h3 className="font-serif text-2xl text-primary font-medium mb-8">Detailed Query Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-5 py-4 font-bold uppercase tracking-widest text-xs text-muted-foreground rounded-tl-lg">Status</th>
                      <th className="px-5 py-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">Query</th>
                      <th className="px-5 py-4 font-bold uppercase tracking-widest text-xs text-muted-foreground text-center">Retrieval</th>
                      <th className="px-5 py-4 font-bold uppercase tracking-widest text-xs text-muted-foreground text-center rounded-tr-lg">Faithful</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {results.results.map(r => {
                      const passed = r.retrievalAccuracy >= 0.7 && r.faithfulness >= 0.8;
                      return (
                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-5">
                            {passed ? <CheckCircle className="h-6 w-6 text-emerald-500" /> : <XCircle className="h-6 w-6 text-destructive" />}
                          </td>
                          <td className="px-5 py-5 font-serif text-foreground/90 max-w-md text-base leading-relaxed">
                            {r.query}
                          </td>
                          <td className="px-5 py-5 font-mono text-center">
                            <span className={`px-3 py-1.5 rounded-md text-sm font-semibold ${r.retrievalAccuracy >= 0.7 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {(r.retrievalAccuracy * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-5 py-5 font-mono text-center">
                            <span className={`px-3 py-1.5 rounded-md text-sm font-semibold ${r.faithfulness >= 0.8 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {(r.faithfulness * 100).toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center min-h-[450px]">
              <h3 className="font-serif text-2xl text-primary font-medium mb-6 self-start w-full">Score Distribution</h3>
              <div className="w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#0f172a', fontSize: 13, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Radar name="System Score" dataKey="score" stroke="#c59b27" strokeWidth={2} fill="#d4af37" fillOpacity={0.5} />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Score']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6 pt-6 border-t border-border">
                Last run: {format(new Date(results.ranAt), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

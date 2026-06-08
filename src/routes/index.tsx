import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ALL_SKILLS, recommend, type Recommendation } from "@/lib/recommender";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Cpu, Target, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tech Stack Recommender — AI Matchmaker" },
      { name: "description", content: "Pick your skills and discover the tech roles that match using TF-IDF and cosine similarity." },
      { property: "og:title", content: "Tech Stack Recommender" },
      { property: "og:description", content: "Content-based AI recommender for tech career roles." },
    ],
  }),
  component: Index,
});

function Index() {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recommendation[] | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_SKILLS.filter(
      (s) => !selected.includes(s) && (!q || s.includes(q))
    ).slice(0, 18);
  }, [query, selected]);

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const run = () => setResults(recommend(selected, 3));

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <div className="container mx-auto max-w-5xl px-6 py-16">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 backdrop-blur px-4 py-1.5 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Project 3 · Content-Based AI Recommender
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-text bg-clip-text text-transparent">
            The Digital Matchmaker
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick at least three skills. We translate them into TF-IDF vectors and rank tech roles by cosine similarity.
          </p>
        </header>

        <Card className="border-border/50 bg-card/60 backdrop-blur shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" /> Your Skill Profile
            </CardTitle>
            <CardDescription>Select your skills — order doesn't matter.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2 min-h-10">
              {selected.length === 0 && (
                <span className="text-sm text-muted-foreground">No skills selected yet.</span>
              )}
              {selected.map((s) => (
                <Badge
                  key={s}
                  variant="default"
                  className="cursor-pointer gap-1 capitalize"
                  onClick={() => toggle(s)}
                >
                  {s} <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>

            <Input
              placeholder="Search skills (e.g. python, react, kubernetes)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              {filtered.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="cursor-pointer capitalize hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => toggle(s)}
                >
                  + {s}
                </Badge>
              ))}
              {filtered.length === 0 && (
                <span className="text-sm text-muted-foreground">No more matching skills.</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                {selected.length} selected · minimum 3 recommended
              </p>
              <Button
                size="lg"
                onClick={run}
                disabled={selected.length === 0}
                variant="hero"
              >
                <Target className="h-4 w-4" /> Find My Roles
              </Button>
            </div>
          </CardContent>
        </Card>

        {results && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Top Matches
            </h2>
            {results[0].score === 0 ? (
              <p className="text-muted-foreground">
                Cold start — no overlap with our role vocabulary. Try adding common skills like “python” or “javascript”.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {results.map((r, i) => (
                  <Card
                    key={r.role.title}
                    className="border-border/50 bg-card/60 backdrop-blur shadow-elegant relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-text"
                      style={{ opacity: 0.4 + r.score * 0.6 }}
                    />
                    <CardHeader>
                      <div className="text-xs font-mono text-primary">#{i + 1} · {(r.score * 100).toFixed(1)}% match</div>
                      <CardTitle className="text-lg">{r.role.title}</CardTitle>
                      <CardDescription>{r.role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {r.role.skills.map((s) => (
                          <Badge
                            key={s}
                            variant={r.matched.includes(s) ? "default" : "secondary"}
                            className="capitalize text-xs"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Input → TF-IDF Vector → Cosine Similarity → Top-N · DecodeLabs Project 3
        </footer>
      </div>
    </div>
  );
}

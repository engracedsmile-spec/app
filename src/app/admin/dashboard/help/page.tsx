
"use client"

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubHeader } from "@/components/sub-header";
import { Search, ArrowRight } from "lucide-react";
import { helpContent, type HelpCategory, type HelpArticle } from "./content";
import Link from "next/link";

const ArticleCard = ({ article, categorySlug }: { article: HelpArticle, categorySlug: string }) => (
    <Link href={`/admin/dashboard/help/${categorySlug}/${article.slug}`} className="block">
        <Card className="hover:border-primary/50 hover:bg-muted/50 transition-colors h-full">
            <CardHeader>
                <CardTitle className="text-lg">{article.title}</CardTitle>
                <CardDescription>{article.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm font-semibold text-primary">
                    Read Article <ArrowRight className="ml-2 h-4 w-4" />
                </div>
            </CardContent>
        </Card>
    </Link>
);


export default function HelpCenterPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredContent = useMemo(() => {
        if (!searchTerm.trim()) {
            return helpContent;
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        
        const filtered = helpContent.map(category => {
            const matchingArticles = category.articles.filter(article => 
                article.title.toLowerCase().includes(lowercasedTerm) ||
                article.description.toLowerCase().includes(lowercasedTerm) ||
                article.content.toLowerCase().includes(lowercasedTerm)
            );
            return { ...category, articles: matchingArticles };
        }).filter(category => category.articles.length > 0);
        
        return filtered;

    }, [searchTerm]);

    return (
        <>
            <SubHeader title="Help Center & Knowledgebase" />
            <main className="p-4 md:p-6 space-y-8">
                <div className="relative w-full max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search articles (e.g., 'payouts', 'create user')"
                        className="pl-12 h-14 text-lg rounded-full shadow-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredContent.length > 0 ? (
                    filteredContent.map(category => (
                        <section key={category.slug} id={category.slug}>
                            <h2 className="text-2xl font-bold tracking-tight mb-4 px-1">{category.title}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.articles.map(article => (
                                    <ArticleCard key={article.slug} article={article} categorySlug={category.slug} />
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg font-semibold">No Results Found</p>
                        <p>No articles match your search term "{searchTerm}". Please try a different query.</p>
                    </div>
                )}
            </main>
        </>
    );
}

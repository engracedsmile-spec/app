
'use client'

import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { helpContent, type HelpArticle } from "./help/content";
import React, { useState, useMemo } from "react";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerBody, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from "@/components/ui/card";
import { usePreloader } from "@/context/preloader-context";
import { useRouter } from "next/navigation";

// A utility function to find a help article based on a page slug.
const getArticleByPage = (page: string): HelpArticle | undefined => {
    let slug = page;
    let category = "dashboard";

    const pageToArticleMap: { [key: string]: { slug: string, category: string } } = {
        'dashboard': { slug: 'overview', category: 'dashboard' },
        'shipments': { slug: 'manage-trips', category: 'bookings' },
        'departures': { slug: 'schedule-departures', category: 'bookings' },
        'users': { slug: 'manage-users', category: 'users' },
        'drivers': { slug: 'manage-drivers', category: 'users' },
        'payouts': { slug: 'payouts', category: 'financials' },
        'report': { slug: 'reports', category: 'financials' },
        'routes': { slug: 'manage-routes', category: 'settings' },
        'terminals': { slug: 'manage-terminals', category: 'settings' },
        'vehicles': { slug: 'manage-vehicles', category: 'settings' },
        'charter': { slug: 'charter-packages', category: 'settings' },
        'general': { slug: 'general-settings', category: 'settings' },
        'operations': { slug: 'general-settings', category: 'settings' }, // Redirecting, might need own article
    };

    if (pageToArticleMap[page]) {
        slug = pageToArticleMap[page].slug;
        category = pageToArticleMap[page].category;
    }
    
    const cat = helpContent.find(c => c.slug === category);
    return cat?.articles.find(art => art.slug === slug);
};


export const AdminHelp = ({ page = "dashboard" }: { page?: string }) => {
    const [open, setOpen] = useState(false);
    const { showPreloader } = usePreloader();
    const router = useRouter();
    
    // Use useMemo to prevent re-calculating the article on every render
    const article = useMemo(() => getArticleByPage(page), [page]);
    
    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        showPreloader();
        router.push(href);
    };

    // Render a fallback button if no article is found for the current page
    if (!article) {
        return (
            <Link href="/admin/dashboard/help" onClick={(e) => handleLinkClick(e, "/admin/dashboard/help")}>
                <Button variant="ghost" size="icon" aria-label="Open help center">
                    <HelpCircle className="h-6 w-6"/>
                </Button>
            </Link>
        );
    }

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={
            <Button variant="ghost" size="icon" aria-label="Open help for this page">
                <HelpCircle className="h-6 w-6"/>
            </Button>
        }>
            <DrawerHeader className="border-b px-4 py-3">
                <DrawerTitle className="text-xl font-bold">{article.title}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>
                        {article.content}
                    </ReactMarkdown>
                </div>
                {article.relatedArticles && article.relatedArticles.length > 0 && (
                    <div className="mt-8 pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-3">Related Articles</h3>
                        <div className="space-y-2">
                        {article.relatedArticles.map(related => (
                            <Link 
                                key={related.slug} 
                                href={`/admin/dashboard/help/${related.category}/${related.slug}`} 
                                onClick={(e) => {
                                    setOpen(false);
                                    handleLinkClick(e, `/admin/dashboard/help/${related.category}/${related.slug}`);
                                }}
                            >
                                <Card className="hover:bg-muted transition-colors">
                                    <CardContent className="p-3 flex items-center justify-between">
                                        <span className="font-medium text-sm">{related.title}</span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                        </div>
                    </div>
                )}
            </DrawerBody>
        </ResponsiveDialog>
    );
};

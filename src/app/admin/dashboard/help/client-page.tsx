/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

"use client"

import { SubHeader } from '@/components/sub-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { HelpArticle } from '../../content';

export const HelpArticleClientPage = ({ article }: { article: HelpArticle }) => {
    return (
        <>
            <SubHeader title={article.title} />
            <main className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-6">
                            <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
                                <ReactMarkdown>
                                    {article.content}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Related Articles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {article.relatedArticles && article.relatedArticles.length > 0 ? (
                                article.relatedArticles.map(related => (
                                    <Link key={related.slug} href={`/admin/dashboard/help/${related.category}/${related.slug}`}>
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                                            <span className="font-medium">{related.title}</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No related articles.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */


import { notFound } from 'next/navigation';
import { helpContent } from '../../content';
import { HelpArticleClientPage } from './client-page';

export default function HelpArticlePage({ params }: { params: { category: string, slug: string } }) {
    const category = helpContent.find(cat => cat.slug === params.category);
    const article = category?.articles.find(art => art.slug === params.slug);

    if (!article) {
        notFound();
    }

    return <HelpArticleClientPage article={article} />;
}

// Generate static paths for all help articles
export async function generateStaticParams() {
  const paths = helpContent.flatMap(category =>
    category.articles.map(article => ({
      category: category.slug,
      slug: article.slug,
    }))
  );
  return paths;
}


import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Rss } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getPublishedBlogPosts } from "@/lib/blog-data";
import { getSettings } from "@/lib/settings-data";

export const dynamic = 'force-dynamic';

const BlogCard = ({ post }: { post: any }) => (
    <Link href={`/blog/${post._id}`} className="group">
        <Card className="h-full flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="p-0">
                <Image
                    src={post.featureImage || 'https://placehold.co/400x250.png'}
                    alt={post.title}
                    width={400}
                    height={250}
                    className="w-full h-56 object-cover"
                    data-ai-hint="blog topic"
                />
            </CardHeader>
            <CardContent className="p-6 flex-1">
                {post.category?.name && <Badge className="mb-2">{post.category.name}</Badge>}
                <CardTitle className="font-headline text-xl mb-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.content.substring(0, 150)}...</CardDescription>
            </CardContent>
            <CardFooter className="p-6 pt-0 text-sm text-muted-foreground">
                <span>By {post.author?.name || 'DayTourGuides'} on {format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}</span>
            </CardFooter>
        </Card>
    </Link>
)


export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  const settings = await getSettings();

  const pageTitle = settings.blog_page_title || "DayTourGuides Georgia Blog";
  const pageDescription = settings.blog_page_description || "Travel tips, destination guides, and stories from the heart of Georgia.";

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
         <section className="py-12 bg-secondary text-center">
          <div className="container mx-auto px-4">
            <Rss className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
              {pageTitle}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {pageDescription}
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
             {posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post: any) => (
                        <BlogCard key={post._id} post={post} />
                    ))}
                </div>
            ) : (
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>No Blog Posts Yet</AlertTitle>
                    <AlertDescription>
                        We're busy writing up new content. Please check back soon!
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

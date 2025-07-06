
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getPublishedBlogPostById } from "@/lib/blog-data";

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await getPublishedBlogPostById(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <article className="container relative max-w-3xl mx-auto py-12 px-4">
            <div className="text-center mb-8">
                {post.category?.name && <Badge>{post.category.name}</Badge>}
                <h1 className="text-4xl font-headline font-extrabold tracking-tight lg:text-5xl mt-4">
                    {post.title}
                </h1>
                <div className="flex justify-center items-center gap-6 mt-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4"/>
                        <span>{post.author?.name || 'TourVista'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4"/>
                        <time dateTime={post.publishedAt || post.createdAt}>
                            {format(new Date(post.publishedAt || post.createdAt), "MMMM d, yyyy")}
                        </time>
                    </div>
                </div>
            </div>
            
            <Image
                src={post.featureImage || 'https://placehold.co/1200x600.png'}
                alt={post.title}
                width={1200}
                height={600}
                className="w-full rounded-lg shadow-lg mb-8 aspect-video object-cover"
                data-ai-hint="blog topic"
                priority
            />

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            <Separator className="my-12"/>

            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={post.author?.profilePhoto} alt={post.author?.name || 'TourVista'} />
                    <AvatarFallback>{post.author?.name?.charAt(0).toUpperCase() || 'T'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-lg">Written by {post.author?.name || 'TourVista'}</p>
                    <p className="text-muted-foreground">Author at TourVista Georgia</p>
                </div>
            </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

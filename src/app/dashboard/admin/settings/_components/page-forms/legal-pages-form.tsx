
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const legalPagesSchema = z.object({
  terms_page_content: z.string().optional(),
  privacy_page_content: z.string().optional(),
  cancellation_page_content: z.string().optional(),
});

type LegalPagesValues = z.infer<typeof legalPagesSchema>;

export function LegalPagesForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<LegalPagesValues>({
    resolver: zodResolver(legalPagesSchema),
    defaultValues: {
        terms_page_content: "",
        privacy_page_content: "",
        cancellation_page_content: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error("Failed to fetch settings.");
        const data = await res.json();
        form.reset({
            terms_page_content: data.terms_page_content || "",
            privacy_page_content: data.privacy_page_content || "",
            cancellation_page_content: data.cancellation_page_content || "",
        });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not load settings." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [form, toast]);

  const handleSave = async (values: LegalPagesValues) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to save settings.");
      toast({ title: "Success", description: "Legal pages updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save settings." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legal Pages</CardTitle>
        <CardDescription>Manage the content for Terms, Privacy, and Cancellation pages.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <CardContent>
            <Accordion type="multiple" className="w-full space-y-4">
              <AccordionItem value="terms" className="border rounded-md px-4">
                <AccordionTrigger className="font-semibold">Terms of Service</AccordionTrigger>
                <AccordionContent>
                  <FormField name="terms_page_content" render={({ field }) => (<FormItem><FormLabel>Content (Markdown supported)</FormLabel><FormControl><Textarea className="min-h-[300px]" {...field} /></FormControl></FormItem>)} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="privacy" className="border rounded-md px-4">
                <AccordionTrigger className="font-semibold">Privacy Policy</AccordionTrigger>
                <AccordionContent>
                  <FormField name="privacy_page_content" render={({ field }) => (<FormItem><FormLabel>Content (Markdown supported)</FormLabel><FormControl><Textarea className="min-h-[300px]" {...field} /></FormControl></FormItem>)} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="cancellation" className="border rounded-md px-4">
                <AccordionTrigger className="font-semibold">Cancellation Policy</AccordionTrigger>
                <AccordionContent>
                  <FormField name="cancellation_page_content" render={({ field }) => (<FormItem><FormLabel>Content (Markdown supported)</FormLabel><FormControl><Textarea className="min-h-[300px]" {...field} /></FormControl></FormItem>)} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Legal Pages
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

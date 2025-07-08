
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trash2, PlusCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqItemSchema = z.object({
  question: z.string().min(1, "Question is required."),
  answer: z.string().min(1, "Answer is required."),
});

const faqPageSchema = z.object({
  faq_page_title: z.string().optional(),
  faq_page_description: z.string().optional(),
  faq_page_items: z.array(faqItemSchema).optional(),
});

type FaqPageValues = z.infer<typeof faqPageSchema>;

export function FaqForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FaqPageValues>({
    resolver: zodResolver(faqPageSchema),
    defaultValues: {
        faq_page_title: "",
        faq_page_description: "",
        faq_page_items: []
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faq_page_items",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error("Failed to fetch settings.");
        const data = await res.json();
        form.reset({
            faq_page_title: data.faq_page_title || "",
            faq_page_description: data.faq_page_description || "",
            faq_page_items: data.faq_page_items || [],
        });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not load settings." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [form, toast]);

  const handleSave = async (values: FaqPageValues) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to save settings.");
      toast({ title: "Success", description: "FAQ page settings updated." });
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
        <CardTitle>FAQ Page</CardTitle>
        <CardDescription>Manage the Questions and Answers on the /faq page.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <CardContent className="space-y-6">
            <FormField name="faq_page_title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField name="faq_page_description" render={({ field }) => (<FormItem><FormLabel>Page Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Q&A Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ question: "", answer: "" })}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
              </div>
               <Accordion type="multiple" className="w-full space-y-2">
                {fields.map((field, index) => {
                  const itemName = form.watch(`faq_page_items.${index}.question`);
                  return (
                  <AccordionItem value={`item-${index}`} key={field.id} className="border rounded-lg bg-secondary/50">
                      <AccordionTrigger className="px-4 py-2 hover:no-underline">
                        <span className="font-semibold text-sm truncate pr-4">
                            {itemName || `Q&A ${index + 1}`}
                        </span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="p-4 border-t flex gap-4 items-start">
                            <div className="flex-1 space-y-4">
                            <FormField name={`faq_page_items.${index}.question`} render={({ field }) => (<FormItem><FormLabel>Question</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                            <FormField name={`faq_page_items.${index}.answer`} render={({ field }) => (<FormItem><FormLabel>Answer</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="text-red-500 mt-6" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                )})}
              </Accordion>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save FAQ Page
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

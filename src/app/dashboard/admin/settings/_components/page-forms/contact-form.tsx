
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const contactPageSchema = z.object({
  contact_page_title: z.string().optional(),
  contact_page_description: z.string().optional(),
  contact_page_email: z.string().email().optional().or(z.literal('')),
  contact_page_phone: z.string().optional(),
  contact_page_address: z.string().optional(),
});

type ContactPageValues = z.infer<typeof contactPageSchema>;

export function ContactForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ContactPageValues>({
    resolver: zodResolver(contactPageSchema),
    defaultValues: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error("Failed to fetch settings.");
        const data = await res.json();
        form.reset(data);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not load settings." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [form, toast]);

  const handleSave = async (values: ContactPageValues) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to save settings.");
      toast({ title: "Success", description: "Contact page settings updated." });
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
        <CardTitle>Contact Page</CardTitle>
        <CardDescription>Manage the content displayed on the /contact page.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <CardContent className="space-y-6">
            <FormField name="contact_page_title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField name="contact_page_description" render={({ field }) => (<FormItem><FormLabel>Page Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="contact_page_email" render={({ field }) => (<FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl></FormItem>)} />
              <FormField name="contact_page_phone" render={({ field }) => (<FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            </div>
            <FormField name="contact_page_address" render={({ field }) => (<FormItem><FormLabel>Office Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Contact Page
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

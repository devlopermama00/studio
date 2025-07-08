
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { HslColorInput } from "@/components/ui/hsl-color-input";
import { uploadFile } from "@/services/fileUploader";
import Image from "next/image";

const contactPageSchema = z.object({
  contact_page_title: z.string().optional(),
  contact_page_description: z.string().optional(),
  contact_page_hero_image: z.string().optional(),
  contact_page_hero_bg: z.string().optional(),
  contact_info_title: z.string().optional(),
  contact_info_description: z.string().optional(),
  contact_page_email: z.string().email().optional().or(z.literal('')),
  contact_page_phone: z.string().optional(),
  contact_page_address: z.string().optional(),
});

type ContactPageValues = z.infer<typeof contactPageSchema>;

export function ContactForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
  
  const handleHeroImageUpload = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
        const url = await uploadFile(file, 'contact-page-assets');
        form.setValue('contact_page_hero_image', url, { shouldValidate: true });
        toast({ title: "Success", description: "Hero image updated. Click Save to apply." });
    } catch (error) {
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload hero image." });
    } finally {
        setIsUploading(false);
    }
  };

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
  
  const heroImageValue = form.watch('contact_page_hero_image');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Page</CardTitle>
        <CardDescription>Manage the content displayed on the /contact page.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <CardContent className="space-y-6">
            <FormField name="contact_page_title" render={({ field }) => (<FormItem><FormLabel>Page Header Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField name="contact_page_description" render={({ field }) => (<FormItem><FormLabel>Page Header Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            
             <Separator />

             <FormLabel className="text-lg font-medium">Header Background</FormLabel>
             <FormDescription>Upload an image for the header. If no image is provided, you can set a solid background color.</FormDescription>
             <FormField
              control={form.control}
              name="contact_page_hero_image"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Background Image</FormLabel>
                  <div className="flex items-center gap-2">
                  <Input
                      readOnly
                      placeholder="Upload an image..."
                      value={field.value || ''}
                      className="flex-1 bg-muted"
                  />
                  <FormControl>
                      <Button asChild type="button" variant="outline">
                      <label htmlFor="contact-hero-image-upload" className="cursor-pointer flex items-center">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                          <Input
                          id="contact-hero-image-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleHeroImageUpload(e.target.files?.[0] || null)}
                          disabled={isUploading}
                          />
                      </label>
                      </Button>
                  </FormControl>
                  </div>
                  {isUploading && <Loader2 className="h-5 w-5 animate-spin my-2" />}
                  
                  {heroImageValue && !isUploading && (
                  <div className="mt-2 relative w-full max-w-sm aspect-video">
                      <Image src={heroImageValue} alt="Hero preview" fill className="rounded-md object-cover" />
                  </div>
                  )}
                  <FormMessage />
              </FormItem>
              )}
            />
            <FormField name="contact_page_hero_bg" render={({ field }) => (
              <FormItem><FormLabel>Background Color (HSL or HEX)</FormLabel><FormControl><HslColorInput {...field} placeholder="e.g., 204 75% 50% or #00AEEF" /></FormControl><FormDescription>Fallback if no image is set.</FormDescription><FormMessage /></FormItem>
            )} />

            <Separator />
            <FormField name="contact_info_title" render={({ field }) => (<FormItem><FormLabel>Contact Info Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField name="contact_info_description" render={({ field }) => (<FormItem><FormLabel>Contact Info Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            
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

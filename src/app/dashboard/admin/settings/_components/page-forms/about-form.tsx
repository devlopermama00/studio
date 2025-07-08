
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trash2, PlusCircle, ShieldCheck, CalendarCheck, Sparkles, Globe, MousePointerClick, Star, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { uploadFile } from "@/services/fileUploader";
import Image from "next/image";

const featureSchema = z.object({
  icon: z.string().min(1, "Icon is required."),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
});

const aboutPageSchema = z.object({
  about_page_hero_image: z.string().optional(),
  about_page_hero_title: z.string().optional(),
  about_page_intro_title: z.string().optional(),
  about_page_intro_desc: z.string().optional(),
  about_page_features_title: z.string().optional(),
  about_page_features: z.array(featureSchema).optional(),
  about_page_why_choose_us_title: z.string().optional(),
  about_page_why_choose_us_description: z.string().optional(),
  about_page_why_choose_us_items: z.array(featureSchema).optional(),
  about_page_cta_title: z.string().optional(),
  about_page_cta_desc: z.string().optional(),
});

type AboutPageValues = z.infer<typeof aboutPageSchema>;

const availableIcons = ["ShieldCheck", "CalendarCheck", "Sparkles", "Globe", "MousePointerClick", "Star"];

export function AboutForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<AboutPageValues>({
    resolver: zodResolver(aboutPageSchema),
    defaultValues: {
      about_page_features: [],
      about_page_why_choose_us_items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "about_page_features",
  });
  
  const { fields: whyChooseUsFields, append: appendWhyChooseUs, remove: removeWhyChooseUs } = useFieldArray({
    control: form.control,
    name: "about_page_why_choose_us_items",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error("Failed to fetch settings.");
        const data = await res.json();
        form.reset({
            about_page_hero_image: data.about_page_hero_image || "",
            about_page_hero_title: data.about_page_hero_title || "",
            about_page_intro_title: data.about_page_intro_title || "",
            about_page_intro_desc: data.about_page_intro_desc || "",
            about_page_features_title: data.about_page_features_title || "",
            about_page_features: data.about_page_features || [],
            about_page_why_choose_us_title: data.about_page_why_choose_us_title || "",
            about_page_why_choose_us_description: data.about_page_why_choose_us_description || "",
            about_page_why_choose_us_items: data.about_page_why_choose_us_items || [],
            about_page_cta_title: data.about_page_cta_title || "",
            about_page_cta_desc: data.about_page_cta_desc || "",
        });
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
        const url = await uploadFile(file, 'about-page-assets');
        form.setValue('about_page_hero_image', url, { shouldValidate: true });
        // Save immediately
        const response = await fetch('/api/admin/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ about_page_hero_image: url }),
        });
        if (!response.ok) throw new Error("Failed to save hero image.");
        toast({ title: "Success", description: "Hero image updated." });
    } catch (error) {
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload hero image." });
    } finally {
        setIsUploading(false);
    }
  };

  const handleSave = async (values: AboutPageValues) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to save settings.");
      toast({ title: "Success", description: "About Us page settings updated." });
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
        <CardTitle>About Us Page</CardTitle>
        <CardDescription>Manage the content displayed on the /about page.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="about_page_hero_image"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Hero Background Image</FormLabel>
                  <div className="flex items-center gap-2">
                  <Input
                      readOnly
                      placeholder="Upload an image to see URL"
                      value={field.value || ''}
                      className="flex-1 bg-muted"
                  />
                  <FormControl>
                      <Button asChild type="button" variant="outline">
                      <label htmlFor="about-hero-image-upload" className="cursor-pointer flex items-center">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                          <Input
                          id="about-hero-image-upload"
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
                  
                  {field.value && !isUploading && (
                  <div className="mt-2 relative w-full max-w-sm aspect-video">
                      <Image src={field.value} alt="Hero preview" fill className="rounded-md object-cover" />
                  </div>
                  )}
                  <FormDescription>Upload an image for the hero section background. The image is saved automatically upon successful upload.</FormDescription>
                  <FormMessage />
              </FormItem>
              )}
            />
            <FormField name="about_page_hero_title" render={({ field }) => (<FormItem><FormLabel>Hero Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <Separator/>
            <FormField name="about_page_intro_title" render={({ field }) => (<FormItem><FormLabel>Intro Section Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField name="about_page_intro_desc" render={({ field }) => (<FormItem><FormLabel>Intro Section Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <Separator/>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Features Section ("What makes us different?")</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ icon: "ShieldCheck", title: "", description: "" })}><PlusCircle className="mr-2 h-4 w-4" /> Add Feature</Button>
              </div>
              <FormField name="about_page_features_title" render={({ field }) => (<FormItem><FormLabel>Features Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg bg-secondary/50">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField name={`about_page_features.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Feature Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                       <FormField name={`about_page_features.${index}.icon`} render={({ field }) => (<FormItem><FormLabel>Icon</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{availableIcons.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                      <FormField name={`about_page_features.${index}.description`} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Feature Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-red-500 mt-6" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
             <Separator/>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Why Choose Us Section</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => appendWhyChooseUs({ icon: "ShieldCheck", title: "", description: "" })}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
              </div>
              <FormField name="about_page_why_choose_us_title" render={({ field }) => (<FormItem><FormLabel>Section Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <FormField name="about_page_why_choose_us_description" render={({ field }) => (<FormItem><FormLabel>Section Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
              <div className="space-y-4">
                {whyChooseUsFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg bg-secondary/50">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField name={`about_page_why_choose_us_items.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Item Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                       <FormField name={`about_page_why_choose_us_items.${index}.icon`} render={({ field }) => (<FormItem><FormLabel>Icon</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{availableIcons.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                      <FormField name={`about_page_why_choose_us_items.${index}.description`} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Item Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-red-500 mt-6" onClick={() => removeWhyChooseUs(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
             <Separator/>
            <FormField name="about_page_cta_title" render={({ field }) => (<FormItem><FormLabel>CTA Section Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField name="about_page_cta_desc" render={({ field }) => (<FormItem><FormLabel>CTA Section Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />

          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSaving || isUploading}>
              {(isSaving || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save About Page
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}


"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

import { TourVistaLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, User, Mail, Lock, FileText, Search } from "lucide-react";
import { currencies } from "@/context/currency-context";
import { uploadFile } from "@/services/fileUploader";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const formSchema = z.object({
  name: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  currency: z.string({ required_error: "Please select your payout currency." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Must contain at least one special character." }),
  confirmPassword: z.string(),
  companyDocument: z
    .any()
    .refine((files) => files?.length === 1, "Company document is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .pdf, .jpg, .jpeg, and .png formats are supported."
    ),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions." }),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ProviderRegisterPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyDocument: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const documentFile = values.companyDocument[0] as File;
      const companyDocumentUrl = await uploadFile(documentFile, 'provider-documents');
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          currency: values.currency,
          companyDocumentUrl: companyDocumentUrl,
          role: 'provider',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      toast({
        title: "Success!",
        description: "Your provider account has been created. Please log in.",
      });
      window.location.href = '/login';

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const FormPasswordInput = ({ field, placeholder, show, toggleShow }: { field: any, placeholder: string, show: boolean, toggleShow: () => void}) => (
     <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input type={show ? "text" : "password"} placeholder={placeholder} {...field} className="pl-10 h-12 text-base" />
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
            onClick={toggleShow}
        >
            {show ? <EyeOff /> : <Eye />}
        </Button>
    </div>
  )

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <TourVistaLogo className="justify-center mb-4" />
          <CardTitle className="font-headline">Become a Tour Provider</CardTitle>
          <CardDescription>Join our network of trusted guides and grow your business.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Company Name" {...field} className="pl-10 h-12 text-base" />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="email" placeholder="Email Address" {...field} className="pl-10 h-12 text-base" />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                        <div className="relative">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger className="pl-10 h-12 text-base">
                                    <SelectValue placeholder="Select Payout Currency" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.symbol})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyDocument"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Company Document</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="file"
                            className="pl-10 h-12 text-base"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => field.onChange(e.target.files)}
                        />
                        </div>
                    </FormControl>
                    <FormDescription>
                        PDF, JPG, or PNG. Max 5MB. This is required for verification.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormControl><FormPasswordInput field={field} placeholder="Password" show={showPassword} toggleShow={() => setShowPassword(s => !s)} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem><FormControl><FormPasswordInput field={field} placeholder="Confirm Password" show={showConfirmPassword} toggleShow={() => setShowConfirmPassword(s => !s)} /></FormControl><FormMessage /></FormItem>)} />
              </div>

               <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        By creating an account, you agree to our{' '}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms & Conditions
                        </Link>
                        {' and '}
                         <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full mt-6 h-12 text-base" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Provider Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">Already a provider?&nbsp;</p>
          <Link href="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

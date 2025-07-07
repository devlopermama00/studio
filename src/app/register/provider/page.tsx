
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
import { Loader2, Eye, EyeOff, User, Mail, Lock, FileText, Wallet, Upload, CheckCircle } from "lucide-react";
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
  licenseDocument: z
    .any()
    .refine((files) => files?.length === 1, "Company license is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .pdf, .jpg, .jpeg, and .png formats are supported."
    ),
  idDocument: z
    .any()
    .refine((files) => files?.length === 1, "ID document is required.")
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
  const [licenseFileName, setLicenseFileName] = useState<string | null>(null);
  const [idFileName, setIdFileName] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      licenseDocument: undefined,
      idDocument: undefined,
    },
  });

  const licenseFileRef = form.register("licenseDocument");
  const idFileRef = form.register("idDocument");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const licenseFile = values.licenseDocument[0] as File;
      const idFile = values.idDocument[0] as File;
      
      const [licenseUrl, idProofUrl] = await Promise.all([
          uploadFile(licenseFile, 'provider-documents'),
          uploadFile(idFile, 'provider-documents')
      ]);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          currency: values.currency,
          licenseUrl,
          idProofUrl,
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

  const PasswordRequirement = ({ text, met }: { text: string, met: boolean }) => (
      <div className="flex items-center text-xs">
          <CheckCircle className={`mr-2 h-3 w-3 ${met ? 'text-green-500' : 'text-muted-foreground'}`} />
          <span className={met ? 'text-foreground' : 'text-muted-foreground'}>{text}</span>
      </div>
  );

  const passwordValue = form.watch("password", "");

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
                 <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Company or Full Name</FormLabel>
                        <FormControl>
                            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Your business name" {...field} className="pl-10" /></div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="email" render={({ field }) => (
                     <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                             <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type="email" placeholder="Email Address" {...field} className="pl-10" /></div>
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                )} />
              </div>
              
              <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payout Currency</FormLabel>
                    <FormControl>
                        <div className="relative">
                             <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger className="pl-10"><SelectValue placeholder="Select Payout Currency" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>{currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.symbol})</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
              )} />

                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="licenseDocument" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Company License</FormLabel>
                        <FormControl>
                           <label className="flex items-center justify-center w-full h-12 px-2 transition bg-background border border-input rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none">
                                <span className="flex items-center space-x-2 text-muted-foreground overflow-hidden">
                                    <Upload className="w-5 h-5 flex-shrink-0" />
                                    {licenseFileName ? (
                                        <span className="font-medium text-sm truncate">{licenseFileName}</span>
                                    ) : (
                                        <span className="font-medium text-sm">Upload License</span>
                                    )}
                                </span>
                                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" {...licenseFileRef} onChange={(e) => {
                                    field.onChange(e.target.files);
                                    setLicenseFileName(e.target.files?.[0]?.name || null);
                                }}/>
                            </label>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="idDocument" render={({ field }) => (
                        <FormItem>
                        <FormLabel>National ID / Proof of ID</FormLabel>
                        <FormControl>
                           <label className="flex items-center justify-center w-full h-12 px-2 transition bg-background border border-input rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none">
                                <span className="flex items-center space-x-2 text-muted-foreground overflow-hidden">
                                    <Upload className="w-5 h-5 flex-shrink-0" />
                                    {idFileName ? (
                                        <span className="font-medium text-sm truncate">{idFileName}</span>
                                    ) : (
                                        <span className="font-medium text-sm">Upload ID</span>
                                    )}
                                </span>
                                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" {...idFileRef} onChange={(e) => {
                                    field.onChange(e.target.files);
                                    setIdFileName(e.target.files?.[0]?.name || null);
                                }}/>
                            </label>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <FormDescription>PDF, JPG, or PNG. Max 5MB. Required for verification.</FormDescription>

              <div className="grid md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                         <FormLabel>Password</FormLabel>
                        <FormControl>
                             <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input type={showPassword ? "text" : "password"} placeholder="Password" {...field} className="pl-10" />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(s => !s)}>{showPassword ? <EyeOff /> : <Eye />}</Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                 )} />
                 <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" {...field} className="pl-10" />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirmPassword(s => !s)}>{showConfirmPassword ? <EyeOff /> : <Eye />}</Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                 )} />
              </div>

               <div className="grid grid-cols-2 gap-2 p-2 rounded-md bg-secondary">
                    <PasswordRequirement text="8+ characters" met={passwordValue.length >= 8} />
                    <PasswordRequirement text="1 uppercase letter" met={/[A-Z]/.test(passwordValue)} />
                    <PasswordRequirement text="1 lowercase letter" met={/[a-z]/.test(passwordValue)} />
                    <PasswordRequirement text="1 number" met={/[0-9]/.test(passwordValue)} />
                    <PasswordRequirement text="1 special character" met={/[^A-Za-z0-9]/.test(passwordValue)} />
                </div>


               <FormField control={form.control} name="terms" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary hover:underline">Terms</Link>
                        {' & '}
                         <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
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

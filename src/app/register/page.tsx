import Link from "next/link";
import { TourVistaLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <TourVistaLogo className="justify-center mb-4" />
          <CardTitle className="font-headline">Create an Account</CardTitle>
          <CardDescription>Join TourVista to discover or provide amazing tours.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label>I want to:</Label>
                <RadioGroup defaultValue="traveler" className="flex space-x-4 pt-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="traveler" id="r1" />
                    <Label htmlFor="r1">Travel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="provider" id="r2" />
                    <Label htmlFor="r2">Provide Tours</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create a strong password" />
              </div>
            </div>
            <Button type="submit" className="w-full mt-6">
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">Already have an account?&nbsp;</p>
          <Link href="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

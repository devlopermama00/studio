import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function DocumentsPage() {
    const verificationStatus = 'approved'; // 'pending', 'rejected', 'approved'
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Verification</CardTitle>
        <CardDescription>
          Upload the required documents to get your provider account verified.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
          {verificationStatus === 'approved' && <CheckCircle className="h-6 w-6 text-green-500" />}
          {verificationStatus === 'pending' && <Clock className="h-6 w-6 text-amber-500" />}
          {verificationStatus === 'rejected' && <AlertCircle className="h-6 w-6 text-red-500" />}
          <div>
            <p className="font-semibold">
              Current Status: <span className={`capitalize font-bold ${
                verificationStatus === 'approved' ? 'text-green-500' :
                verificationStatus === 'pending' ? 'text-amber-500' : 'text-red-500'
              }`}>
                {verificationStatus}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
                {
                    verificationStatus === 'approved' ? "Your documents are verified. You can now publish tours." :
                    verificationStatus === 'pending' ? "Your documents are under review. This usually takes 2-3 business days." :
                    "Your documents were rejected. Please review the feedback and re-upload."
                }
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="business-license" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Business License
                </Label>
                <Input id="business-license" type="file" />
                <p className="text-xs text-muted-foreground">PDF, JPG, or PNG. Max 5MB.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="id-proof" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    National ID / Passport
                </Label>
                <Input id="id-proof" type="file" />
                <p className="text-xs text-muted-foreground">PDF, JPG, or PNG. Max 5MB.</p>
            </div>
        </div>
        
        <Button disabled={verificationStatus === 'pending' || verificationStatus === 'approved'}>
            Submit for Verification
        </Button>
      </CardContent>
    </Card>
  );
}

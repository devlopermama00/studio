import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const pendingProviders = [
    {
        id: 'provider-3',
        name: 'Tbilisi Trekkers',
        email: 'contact@tbilisitrekkers.com',
        submittedAt: '2023-11-10',
        documents: [
            { name: 'Business License', url: '#' },
            { name: 'ID Proof', url: '#' },
        ]
    },
    {
        id: 'provider-4',
        name: 'Batumi Boat Tours',
        email: 'info@batumiboats.com',
        submittedAt: '2023-11-08',
        documents: [
            { name: 'Business License', url: '#' },
            { name: 'ID Proof', url: '#' },
        ]
    }
]

export default function AdminApprovalsPage() {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Approvals</CardTitle>
        <CardDescription>
          Review and approve new provider applications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead className="hidden md:table-cell">Documents</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingProviders.map(provider => (
                <TableRow key={provider.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarImage src="https://placehold.co/100x100.png" alt={provider.name} />
                                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-0.5">
                                <p className="font-medium">{provider.name}</p>
                                <p className="text-xs text-muted-foreground">{provider.email}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>{provider.submittedAt}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div className="flex gap-2">
                           {provider.documents.map(doc => (
                                <Button key={doc.name} variant="link" asChild className="p-0 h-auto">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</a>
                                </Button>
                           ))}
                        </div>
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="text-green-600">Approve</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

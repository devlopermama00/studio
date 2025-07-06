import Image from "next/image"
import { MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { tours as mockTours } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function AdminToursPage() {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Management</CardTitle>
        <CardDescription>
          Approve, reject, and manage all tours on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTours.map(tour => (
                <TableRow key={tour.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={tour.title}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={tour.images[0]}
                    width="64"
                    data-ai-hint="tour destination"
                  />
                </TableCell>
                <TableCell className="font-medium">{tour.title}</TableCell>
                <TableCell className="hidden md:table-cell">{tour.providerName}</TableCell>
                <TableCell>
                  <Badge variant={tour.approved ? "default" : "secondary"} className={cn({"bg-green-500": tour.approved, "bg-amber-500": !tour.approved})}>
                    {tour.approved ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">${tour.price}</TableCell>
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
                      {!tour.approved && <DropdownMenuItem>Approve</DropdownMenuItem>}
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-6</strong> of <strong>6</strong> tours
        </div>
      </CardFooter>
    </Card>
  )
}

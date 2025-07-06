import Image from "next/image"
import { MoreHorizontal, PlusCircle } from "lucide-react"

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

export default function ProviderToursPage() {
  const providerTours = mockTours.filter(t => t.providerId === 'user-2');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>My Tours</CardTitle>
                <CardDescription>
                Manage your tours and view their performance.
                </CardDescription>
            </div>
            <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Tour
                </span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">
                Rating
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providerTours.map(tour => (
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
                <TableCell>
                  <Badge variant={tour.approved ? "default" : "secondary"} className={cn({"bg-green-500": tour.approved, "bg-amber-500": !tour.approved})}>
                    {tour.approved ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">${tour.price}</TableCell>
                <TableCell className="hidden md:table-cell">{tour.rating}</TableCell>
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Bookings</DropdownMenuItem>
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
          Showing <strong>1-6</strong> of <strong>6</strong> products
        </div>
      </CardFooter>
    </Card>
  )
}

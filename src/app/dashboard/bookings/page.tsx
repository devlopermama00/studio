import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { bookings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookingsPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>A list of all your booked tours.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead className="hidden md:table-cell">
                    Booking Date
                    </TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                    <TableCell className="hidden sm:table-cell">
                        <Image
                        alt={booking.tourTitle}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={booking.tourImage}
                        width="64"
                        data-ai-hint="tour destination"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{booking.tourTitle}</TableCell>
                    <TableCell>
                        <Badge
                        variant="outline"
                        className={cn({
                            "text-green-600 border-green-600": booking.status === "confirmed",
                            "text-blue-600 border-blue-600": booking.status === "completed",
                            "text-red-600 border-red-600": booking.status === "cancelled",
                        })}
                        >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">${booking.totalPrice.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                        <Button size="sm" variant="outline">View Details</Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Star, Map } from "lucide-react";

const stats = [
    { title: "Upcoming Bookings", value: "2", icon: BookOpen, description: "Ready for your next adventure." },
    { title: "Completed Tours", value: "12", icon: Map, description: "Memories made, stories to tell." },
    { title: "Reviews Written", value: "8", icon: Star, description: "Your feedback helps others." },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold font-headline">Welcome back, Alex!</h1>
                <p className="text-muted-foreground">Here's a quick look at your adventures.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Become a Provider</CardTitle>
                    <CardDescription>Share your passion for Georgia with travelers from around the world. Start creating and managing your own tours today!</CardDescription>
                </CardHeader>
                <CardContent>
                    <button className="text-primary font-semibold">Learn more about providing tours</button>
                </CardContent>
            </Card>
        </div>
    )
}

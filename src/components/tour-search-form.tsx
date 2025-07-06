import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Tag } from "lucide-react";

export function TourSearchForm() {
  return (
    <div className="p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="text" placeholder="Where to?" className="pl-10 h-12 text-base" />
        </div>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Select>
            <SelectTrigger className="pl-10 h-12 text-base">
              <SelectValue placeholder="Any category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="city">City Tours</SelectItem>
              <SelectItem value="hiking">Mountain & Hiking</SelectItem>
              <SelectItem value="wine">Wine & Gastronomy</SelectItem>
              <SelectItem value="historical">Historical & Cultural</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="date" placeholder="Any date" className="pl-10 h-12 text-base" />
        </div>
        <Button size="lg" className="h-12 w-full text-base">
          <Search className="mr-2 h-5 w-5" />
          Search
        </Button>
      </div>
    </div>
  );
}

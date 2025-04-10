import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface PolicyCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  imageUrl: string;
}

export default function PolicyCard({ title, description, icon, imageUrl }: PolicyCardProps) {
  return (
    <Card className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-48 bg-gray-200 group-hover:opacity-75">
        <img className="h-full w-full object-cover" src={imageUrl} alt={title} />
      </div>
      <div className="p-6">
        <div className="flex items-center">
          {icon}
          <h3 className="ml-2 text-xl font-medium text-gray-900">{title}</h3>
        </div>
        <p className="mt-3 text-base text-gray-500">
          {description}
        </p>
        <div className="mt-6">
          <Button>
            Explore Plans
          </Button>
        </div>
      </div>
    </Card>
  );
}

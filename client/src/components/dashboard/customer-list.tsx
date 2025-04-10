import { Customer } from "@shared/schema";
import { Mail, Phone, MoreVertical, User, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomerListProps {
  customers: Customer[];
}

export default function CustomerList({ customers }: CustomerListProps) {
  // If there are no customers, show a message
  if (customers.length === 0) {
    return (
      <div className="py-4 px-6 text-center text-gray-500">
        No prominent customers found.
      </div>
    );
  }

  // Map customer initials from their gender or first letter of qualification
  const getInitials = (customer: Customer): string => {
    if (customer.gender === 'male') {
      return 'M';
    } else if (customer.gender === 'female') {
      return 'F';
    } else if (customer.qualification) {
      return customer.qualification.charAt(0).toUpperCase();
    } else {
      return 'C'; // Default to "C" for Customer
    }
  };

  // Get policy text based on policiesChosen
  const getPolicyText = (policiesString: string | null): string => {
    if (!policiesString) return "No policies";
    
    const policies = policiesString.split(',');
    if (policies.length === 1) {
      return capitalizeFirstLetter(policies[0]) + " Insurance";
    } else if (policies.length === 2) {
      return `${capitalizeFirstLetter(policies[0])} + ${capitalizeFirstLetter(policies[1])} Insurance`;
    } else {
      return "Multiple Insurance Policies";
    }
  };

  // Helper to capitalize first letter
  const capitalizeFirstLetter = (string: string | null): string => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <ul className="divide-y divide-gray-200">
      {customers.map((customer) => (
        <li key={customer.id} className="px-5 py-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-full ${customer.isProminent ? 'bg-green-600' : 'bg-gray-600'} flex items-center justify-center text-white font-medium`}>
                  {getInitials(customer)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900 truncate mr-2">
                    Customer #{customer.id}
                  </p>
                  {customer.isProminent && (
                    <Badge className="bg-green-100 text-green-800">
                      Prominent
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-2">
                  <div className="flex items-center text-xs text-gray-500 truncate">
                    {customer.gender && (
                      <span className="flex items-center mr-2">
                        <User2 className="mr-1 h-3 w-3" />
                        {capitalizeFirstLetter(customer.gender)}
                      </span>
                    )}
                    {customer.qualification && (
                      <span className="mr-2">{capitalizeFirstLetter(customer.qualification)}</span>
                    )}
                    {customer.income && (
                      <span className="text-primary font-medium">{customer.income}</span>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {getPolicyText(customer.policiesChosen)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {customer.prominenceScore}% Match
                </span>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
                  <Phone className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Policy Details</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                    <DropdownMenuItem>Schedule Call</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

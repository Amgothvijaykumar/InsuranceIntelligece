import { Customer } from "@shared/schema";

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
  const getPolicyText = (policiesString: string): string => {
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
  const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <ul className="divide-y divide-gray-200">
      {customers.map((customer) => (
        <li key={customer.id} className="px-5 py-4 hover:bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                {getInitials(customer)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Customer #{customer.id}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {getPolicyText(customer.policiesChosen)}
              </p>
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {customer.prominenceScore}% Match
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

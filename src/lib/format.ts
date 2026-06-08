export function formatSalary(min: number, max: number) {
  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 1000).toFixed(0)}k`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
    return `₹${n}`;
  };
  if (min === max) return `${fmt(min)}/month`;
  return `${fmt(min)} – ${fmt(max)}/month`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export const CATEGORIES = [
  { slug: "delivery", name: "Delivery Boy", icon: "Bike" },
  { slug: "driver", name: "Driver", icon: "Car" },
  { slug: "security", name: "Security Guard", icon: "Shield" },
  { slug: "housekeeping", name: "Housekeeping", icon: "Sparkles" },
  { slug: "cook", name: "Cook", icon: "ChefHat" },
  { slug: "office-boy", name: "Office Boy", icon: "Briefcase" },
  { slug: "receptionist", name: "Receptionist", icon: "Phone" },
  { slug: "sales", name: "Sales Executive", icon: "TrendingUp" },
  { slug: "warehouse", name: "Warehouse Staff", icon: "Package" },
  { slug: "helper", name: "Helper", icon: "HandHelping" },
  { slug: "electrician", name: "Electrician", icon: "Zap" },
  { slug: "plumber", name: "Plumber", icon: "Wrench" },
  { slug: "beautician", name: "Beautician", icon: "Scissors" },
  { slug: "tailor", name: "Tailor", icon: "Shirt" },
  { slug: "data-entry", name: "Data Entry", icon: "Keyboard" },
];

export const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Ahmedabad", "Kolkata",
];

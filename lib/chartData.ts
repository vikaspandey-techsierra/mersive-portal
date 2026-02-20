export type SalesData = {
  name: string;
  value: number;
};

export const pieData: SalesData[] = [
  { name: "Electronics", value: 400 },
  { name: "Clothing", value: 300 },
  { name: "Groceries", value: 300 },
  { name: "Furniture", value: 200 },
  { name: "Essentials", value: 100 },
];

export const barData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 210 },
  { month: "Mar", users: 180 },
  { month: "Apr", users: 260 },
  { month: "May", users: 300 },
];

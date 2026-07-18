const products = [
  {
    id: 1,
    name: "Wireless Mouse",
    price: 799,
    category: "Electronics",
    stock: 45,
    createdAt: "2026-01-12",
    image:
      "https://images.pexels.com/photos/32890143/pexels-photo-32890143.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: 3499,
    category: "Electronics",
    stock: 20,
    createdAt: "2026-02-05",
    image:
      "https://images.pexels.com/photos/18311093/pexels-photo-18311093.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 2799,
    category: "Footwear",
    stock: 18,
    createdAt: "2026-03-10",
    image:
      "https://images.pexels.com/photos/29342147/pexels-photo-29342147.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 4,
    name: "Cotton T-Shirt",
    price: 599,
    category: "Clothing",
    stock: 60,
    createdAt: "2026-01-28",
    image:
      "https://images.pexels.com/photos/37191616/pexels-photo-37191616.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    price: 1999,
    category: "Electronics",
    stock: 12,
    createdAt: "2026-04-15",
    image:
      "https://images.pexels.com/photos/12502430/pexels-photo-12502430.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 6,
    name: "Office Chair",
    price: 5499,
    category: "Furniture",
    stock: 8,
    createdAt: "2026-05-02",
    image:
      "https://images.pexels.com/photos/12269763/pexels-photo-12269763.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 7,
    name: "Coffee Mug",
    price: 299,
    category: "Kitchen",
    stock: 100,
    createdAt: "2026-02-18",
    image:
      "https://images.pexels.com/photos/2168346/pexels-photo-2168346.png?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 8,
    name: "Gaming Monitor",
    price: 14999,
    category: "Electronics",
    stock: 7,
    createdAt: "2026-06-01",
    image:
      "https://images.pexels.com/photos/5552789/pexels-photo-5552789.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 9,
    name: "Backpack",
    price: 1299,
    category: "Accessories",
    stock: 35,
    createdAt: "2026-03-22",
    image:
      "https://images.pexels.com/photos/20094394/pexels-photo-20094394.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 10,
    name: "Water Bottle",
    price: 499,
    category: "Kitchen",
    stock: 80,
    createdAt: "2026-01-09",
    image:
      "https://images.pexels.com/photos/7397134/pexels-photo-7397134.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 11,
    name: "Smart Watch",
    price: 6999,
    category: "Electronics",
    stock: 14,
    createdAt: "2026-05-20",
    image:
      "https://images.pexels.com/photos/31541678/pexels-photo-31541678.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 12,
    name: "Notebook",
    price: 99,
    category: "Stationery",
    stock: 200,
    createdAt: "2026-04-08",
    image:
      "https://images.pexels.com/photos/5321357/pexels-photo-5321357.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 13,
    name: "Desk Lamp",
    price: 899,
    category: "Furniture",
    stock: 25,
    createdAt: "2026-02-27",
    image:
      "https://images.pexels.com/photos/112811/pexels-photo-112811.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 14,
    name: "Leather Wallet",
    price: 999,
    category: "Accessories",
    stock: 40,
    createdAt: "2026-03-14",
    image:
      "https://images.pexels.com/photos/4452372/pexels-photo-4452372.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 15,
    name: "Yoga Mat",
    price: 1199,
    category: "Fitness",
    stock: 22,
    createdAt: "2026-06-12",
    image:
      "https://images.pexels.com/photos/8436580/pexels-photo-8436580.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 16,
    name: "Protein Shaker",
    price: 399,
    category: "Fitness",
    stock: 50,
    createdAt: "2026-04-30",
    image:
      "https://images.pexels.com/photos/16412053/pexels-photo-16412053.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 17,
    name: "LED Bulb",
    price: 249,
    category: "Home",
    stock: 150,
    createdAt: "2026-01-19",
    image:
      "https://images.pexels.com/photos/20943579/pexels-photo-20943579.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 18,
    name: "Sunglasses",
    price: 1599,
    category: "Accessories",
    stock: 16,
    createdAt: "2026-05-11",
    image:
      "https://images.pexels.com/photos/32677246/pexels-photo-32677246.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 19,
    name: "Electric Kettle",
    price: 1899,
    category: "Kitchen",
    stock: 11,
    createdAt: "2026-02-21",
    image:
      "https://images.pexels.com/photos/10900909/pexels-photo-10900909.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 20,
    name: "Laptop Stand",
    price: 999,
    category: "Office",
    stock: 30,
    createdAt: "2026-06-25",
    image:
      "https://images.pexels.com/photos/4533076/pexels-photo-4533076.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

export { products };

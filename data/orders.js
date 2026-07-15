let orders = [];

let orderIdCount = 1;

export function incrementOrderIdCount() {
  orderIdCount++; // Or use idCount++
}
export { orders, orderIdCount };

// Order structure:
// {
//   id,
//   userId,
//   items: [
//     {
//       id,
//       name,
//       price,
//       quantity
//     }
//   ],
//   total
// }

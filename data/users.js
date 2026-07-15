let users = [];
let idCount = 1;
export function increment() {
  idCount++; // Or use idCount++
}
export function incrementQuantity(itemObj) {
  itemObj++;
}
export function updateQuantity(item, quantity) {
  item.quantity = quantity;
}
export function deleteItem(itemId, user) {
  user.cart = user.cart.filter((item) => item.id != itemId);
}
export function emptyCart(user) {
  user.cart.length = 0;
}
export { users, idCount };

// users = [
//   {
//     id: Number,
//     email: String,
//     password: String, // bcrypt hash
//     cart: [
//       {
//         id: Number,
//         name: String,
//         price: Number,
//         quantity: Number
//       }
//     ]
//   }
// ];

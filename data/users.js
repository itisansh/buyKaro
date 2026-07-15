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
export { users, idCount };

# buyKaro 🛒

A full-stack e-commerce web application built to understand backend architecture — authentication, sessions, middleware, and REST API design — from the ground up.

🔗 **Live Demo:** https://buykaro-rfew.onrender.com/ (free tier — first load may take ~30s to spin up)

## Features

- User signup, login, and logout with session-based authentication
- Password hashing with bcrypt (no plaintext storage)
- Protected routes via custom auth middleware
- Product browsing with category filters, sorting, and search
- Pagination for product listings
- Shopping cart — add, update, remove items
- Order placement and order history
- Responsive design with dark mode

## Tech Stack

- **Backend:** Node.js, Express.js
- **Auth:** express-session, bcrypt
- **Frontend:** Vanilla JavaScript, HTML, CSS
- **Deployment:** Render (CI/CD from GitHub)
- **Environment config:** dotenv

## Current Limitations

- Data is currently stored in-memory (resets on server restart) — MongoDB integration is planned for persistent storage
- Frontend is vanilla JS — a React rewrite is planned next

## API Routes

**Auth**
- `POST /auth/signup` — create a new user account
- `POST /auth/login` — authenticate and start a session
- `POST /auth/logout` — end the current session

**Products**
- `GET /products` — list all products (supports filtering, sorting, pagination)
- `GET /products/:id` — get a single product

**Cart**
- `GET /cart` — view current user's cart
- `POST /cart` — add item to cart
- `PUT /cart/:id` — update item quantity
- `DELETE /cart/:id` — remove item from cart

**Orders**
- `POST /orders` — place an order from current cart
- `GET /orders` — view order history

## Setup Locally

```bash
git clone https://github.com/itisansh/buyKaro.git
cd buyKaro
npm install
```

Create a `.env` file in the root with:
SESSION_SECRET=your_secret_here
PORT=3000


Run the server:
```bash
node server.js
```

Visit `http://localhost:3000`

## Roadmap

- [ ] MongoDB integration for persistent data
- [ ] React frontend
- [ ] Payment gateway integration
- [ ] Order tracking status

---

Built by [Ansh Kumar Vishwakarma](https://github.com/itisansh)

# Express & MERN Backend Handbook

> Compiled from our backend learning sessions while building your first
> e-commerce backend.

# Table of Contents

1.  Philosophy
2.  Project Architecture
3.  Express Basics
4.  Middleware
5.  next() and next(err)
6.  Error Handling
7.  Sessions
8.  Authentication
9.  bcrypt
10. Request Validation
11. REST API Design
12. HTTP Status Codes
13. Users / Products / Cart / Orders Design
14. JavaScript Concepts
15. Common Array Methods
16. Imported Bindings
17. Shallow vs Deep Copy
18. Route Patterns
19. Debugging Guide
20. Common Errors We Hit
21. Best Practices
22. Personal Rules To Remember

------------------------------------------------------------------------

# 1. Philosophy

The backend is the source of truth.

Never trust the client.

The client should usually send identifiers (IDs), not authoritative data
like prices, stock, roles or totals.

------------------------------------------------------------------------

# 2. Project Architecture

Current project structure:

-   data/
    -   users.js
    -   products.js
    -   orders.js
-   routes/
    -   auth.js
    -   products.js
    -   cart.js
    -   orders.js
-   middleware/
    -   auth.js

Each route has one responsibility.

------------------------------------------------------------------------

# 3. Express Basics

Every request follows

Client ↓ Middleware ↓ Route ↓ Response

Always return after sending a response.

Example:

``` js
return res.status(404).send({...});
```

------------------------------------------------------------------------

# 4. Middleware

Middleware runs before routes.

Authentication middleware example:

``` js
(req,res,next)
```

If authenticated:

``` js
next();
```

Otherwise:

``` js
return res.status(401).send(...);
```

------------------------------------------------------------------------

# 5. next()

## next()

Continue normally.

## next(err)

Skip all normal middleware.

Jump directly to global error middleware.

Memory rule

-   next() → Continue.
-   next(err) → Error handler.
-   return res.send() → Finish request.

If middleware neither calls next() nor sends a response, the request
hangs forever.

------------------------------------------------------------------------

# 6. Error Handling

Wrap async routes.

``` js
try{

}catch(err){
    next(err);
}
```

Global error middleware

``` js
app.use((err,req,res,next)=>{
 console.error(err);
 res.status(500).send({
   ok:false,
   message:"Internal Server Error"
 });
});
```

404 handler

``` js
app.use((req,res)=>{
 res.status(404).send({
  ok:false,
  message:"Route not found"
 });
});
```

Expected errors (400/401/404/etc) are NOT exceptions.

Unexpected runtime failures belong inside catch.

------------------------------------------------------------------------

# 7. Sessions

Current project:

``` js
req.session.userId = user.id;
```

Session stores only user identity.

MemoryStore loses sessions after restart.

Real applications store sessions in Redis/database or use JWT.

------------------------------------------------------------------------

# 8. Authentication

Signup

-   validate input
-   hash password
-   save user

Login

-   find user
-   bcrypt.compare()
-   store session

Logout

-   destroy session

Never hash password again during login.

Always compare plain password against stored hash.

------------------------------------------------------------------------

# 9. bcrypt

Hash

``` js
await bcrypt.hash(password,10)
```

Compare

``` js
await bcrypt.compare(password,user.password)
```

Remember

bcrypt.compare() returns

true → password correct

false → password incorrect

------------------------------------------------------------------------

# 10. Request Validation

Validate

-   email
-   password
-   ids
-   quantity
-   stock
-   page
-   limit

Never assume client input is valid.

------------------------------------------------------------------------

# 11. REST API

Client sends IDs.

Correct

``` json
{
 "itemId":5
}
```

Wrong

Sending full product including price.

Server owns:

-   prices
-   stock
-   permissions

------------------------------------------------------------------------

# 12. HTTP Status Codes

200 OK

Successful fetch/update.

201 Created

New resource created.

400 Bad Request

Invalid request.

401 Unauthorized

Authentication required / invalid.

403 Forbidden

Authenticated but not allowed.

404 Not Found

Resource missing.

409 Conflict

Duplicate email etc.

500 Internal Server Error

Unexpected server failure.

------------------------------------------------------------------------

# 13. Data Structures

## User

``` js
{
 id,
 email,
 password, // bcrypt hash
 cart:[
   {
    id,
    name,
    price,
    quantity
   }
 ]
}
```

## Order

``` js
{
 id,
 userId,
 items:[
   {
    id,
    name,
    price,
    quantity
   }
 ],
 total
}
```

Orders array contains ALL users' orders.

Each order belongs to one user using userId.

Cart = temporary.

Orders = permanent history.

Checkout flow

Cart ↓ Create order ↓ Push into orders\[\] ↓ Empty cart

------------------------------------------------------------------------

# 14. Imported Bindings

Important rule

Imported bindings are read-only.

Allowed

``` js
users.push(...)
user.cart=[]
item.quantity++
```

Not allowed

``` js
users=[]
idCount++
```

unless exported helper updates it.

Comment to remember

Imported variables can't be reassigned, but their object/array contents
can be modified.

------------------------------------------------------------------------

# 15. Shallow Copy

``` js
let arr=[...products]
```

Creates

New array

Same referenced objects.

Useful before sort() because sort mutates arrays.

------------------------------------------------------------------------

# 16. Array Methods

find()

Returns object OR undefined.

Always check.

``` js
const product=products.find(...);

if(!product){
 return res.status(404).send(...);
}
```

Rule:

Never access properties after find() without checking.

some()

Returns boolean.

filter()

Returns new array.

reduce()

Accumulates values.

slice()

Pagination.

------------------------------------------------------------------------

# 17. Debugging

Read stack traces.

Example

routes/auth.js:29:12

Means

File ↓

Line 29 ↓

Column 12

Always inspect first error.

Console log strategically.

------------------------------------------------------------------------

# 18. Common Errors We Solved

bcrypt is not defined

→ Forgot import.

Assignment to constant variable

→ Tried reassigning imported binding.

Cannot GET /login

→ Used GET on POST route.

Unexpected token JSON

→ Invalid JSON body.

Cannot read properties of undefined

→ Forgot null check after find().

data and hash must be strings

→ compare() received invalid password/hash.

ReferenceError next is not defined

→ Forgot route parameter.

ReferenceError cart is not defined

→ Variable scope issue.

------------------------------------------------------------------------

# 19. Validation Habits

Always validate

-   find()
-   request body
-   route params
-   query params

Examples

Quantity \>0

Stock available

Cart not empty

Order exists

Product exists

User exists

------------------------------------------------------------------------

# 20. API Contract

Know what each endpoint expects.

Client sends

Signup

email,password

Login

email,password

Cart add

itemId

Update

itemId,quantity

Delete

productId

Order

Nothing except authenticated session.

------------------------------------------------------------------------

# 21. Best Practices

Use const unless reassignment needed.

Prefer ===.

Early return.

One responsibility per helper.

Small helper functions.

Don't mutate response objects.

Keep route handlers readable.

Always validate result of find().

Never trust client.

------------------------------------------------------------------------

# 22. Personal Rules To Remember

✓ Imported bindings are read-only.

✓ find() returns object or undefined.

✓ next() continues.

✓ next(err) jumps to error middleware.

✓ return res.send() ends request.

✓ Hash on signup.

✓ Compare on login.

✓ Client sends IDs.

✓ Orders contain all users.

✓ Cart belongs inside user.

✓ Order history belongs in orders\[\].

✓ Make shallow copy before sort().

✓ Validate before property access.

✓ Read stack traces from top.

✓ Route order matters.

✓ 404 handler goes after all routes.

✓ Error middleware has four parameters.

✓ Wrap async routes in try/catch.

✓ Prefer const.

✓ Use strict equality.

✓ Use helper functions for repeated logic.

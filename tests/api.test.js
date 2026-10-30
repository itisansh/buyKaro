import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";

test("account, catalog, cart and checkout regression checks", async () => {
  const port = 3200 + Math.floor(Math.random() * 1000);
  const server = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT: String(port), SESSION_SECRET: "test-secret" }, stdio: ["ignore", "pipe", "inherit"] });
  try {
    for (let attempt = 0; attempt < 50; attempt++) {
      try { await fetch(`http://localhost:${port}/api/products`); break; }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    const client = () => {
      let cookie = "";
      return async (path, method = "GET", body, status = 200) => {
        const response = await fetch(`http://localhost:${port}/api${path}`, { method, headers: { Cookie: cookie, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
        cookie = response.headers.get("set-cookie")?.split(";")[0] || cookie;
        const result = await response.json();
        assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(result)}`);
        return result;
      };
    };
    for (const path of ['/home', '/shop', '/cart', '/orders', '/login', '/signup', '/products/1']) {
      const response = await fetch(`http://localhost:${port}${path}`);
      assert.equal(response.status, 200, path);
      assert.match(response.headers.get('content-type'), /text\/html/);
    }
    for (const [oldPath, newPath] of [['/', '/home'], ['/index.html', '/home'], ['/cart.html', '/cart'], ['/product.html?id=1', '/products/1']]) {
      const response = await fetch(`http://localhost:${port}${oldPath}`, { redirect: 'manual' });
      assert.equal(response.status, 302);
      assert.equal(response.headers.get('location'), newPath);
    }
    const missing = await fetch(`http://localhost:${port}/not-a-page`);
    assert.equal(missing.status, 404);
    const a = client(), b = client();
    await a('/cart', 'GET', undefined, 401);
    await a('/auth/signup','POST',{},400);
    await a('/auth/login','POST',{email:'admin',password:'wrong'},401);
    await a('/auth/login','POST',{email:'admin',password:'password'});
    assert.equal((await a('/auth/me')).userWithoutPassword.password, undefined);
    await b('/auth/signup','POST',{email:' TEST@example.com ',password:'test'},201);
    await b('/auth/signup','POST',{email:'test@example.com',password:'test'},409);
    await b('/auth/login','POST',{email:'TEST@example.com',password:'test'});
    for (const query of ['page=-1','limit=0','page=1x','minPrice=20&maxPrice=10','search=x&search=y']) await a('/products?'+query,'GET',undefined,400);
    const catalog = await a('/products?sort=low&limit=8');
    assert.equal(catalog.total,20); assert.equal(catalog.totalPages,3);
    assert.ok(catalog.productArray.every((p,i,arr) => !i || p.price >= arr[i-1].price));
    await a('/products/1bad','GET',undefined,404);
    await a('/cart/update','PUT',{itemId:1,quantity:1},404);
    await a('/cart/add','POST',{itemId:1},201);
    await a('/cart/update','PUT',{itemId:1,quantity:1.5},400);
    await a('/cart/update','PUT',{itemId:1,quantity:46},409);
    await a('/cart/update','PUT',{itemId:1,quantity:45});
    await a('/cart/add','POST',{itemId:1},409);
    await b('/cart/add','POST',{itemId:1},201);
    const order = (await a('/orders','POST',undefined,201)).orderObj;
    assert.equal(order.total,799*45);
    assert.equal((await a('/cart')).cart.length,0);
    assert.equal((await a('/products/1')).productObj.stock,0);
    await b('/orders','POST',undefined,409);
    assert.equal((await b('/cart')).cart.length,1);
    await b('/orders/'+order.id,'GET',undefined,404);
    assert.equal((await a('/orders/'+order.id)).order.items[0].quantity,45);
    assert.equal((await a('/orders')).userOrders.length,1);
    assert.equal((await b('/cart/remove/1','DELETE')).cart.length,0);
    await a('/orders','POST',undefined,400);
    await a('/auth/logout','POST');
    await a('/auth/me','GET',undefined,401);
    const malformed = await fetch(`http://localhost:${port}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});
    assert.equal(malformed.status,400);
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit');
      server.kill();
      await exited;
    }
  }
});

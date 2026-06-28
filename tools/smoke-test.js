#!/usr/bin/env node
(async () => {
  const port = process.env.PORT || 3002;
  const base = `http://localhost:${port}`;

  try {
    const fd = new FormData();
    fd.append('name', 'Smoke Test Product');
    fd.append('price', '9.99');
    fd.append('description', 'Created by smoke-test script');
    fd.append('category', 'Smoke');

    const createRes = await fetch(`${base}/api/products`, {
      method: 'POST',
      body: fd
    });
    const createBody = await createRes.json().catch(() => null);
    console.log('/api/products POST ->', createRes.status, createBody);
    if (!createRes.ok) process.exit(1);

    const id = createBody?.product?.id;
    if (!id) {
      console.error('No product id returned; aborting delete step.');
      process.exit(1);
    }

    const delRes = await fetch(`${base}/api/products/${id}`, {
      method: 'DELETE'
    });
    const delBody = await delRes.json().catch(() => null);
    console.log(`/api/products/${id} DELETE ->`, delRes.status, delBody);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

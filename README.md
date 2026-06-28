# MartNow / ShopFront E-commerce Website

This project is a Node.js + Express e-commerce demo that supports product listings, admin product creation, and image uploads.

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3002

## Deploy to Render

1. Push this project to GitHub.
2. Create a new Render Web Service and connect the GitHub repository.
3. Render will detect the included render.yaml file.
4. Your app will be available at a public Render URL that your phone can open.

## Notes

- The app stores product data in data/products.json.
- Image uploads are stored under public/uploads.
- GitHub Pages cannot host this full app because it needs a Node server. Use Render, Railway, Fly.io, or a VPS for the complete experience.

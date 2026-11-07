# Sumedha Handmades storefront

## Run locally

1. Start the API from `Server` first. See [Server setup](../Server/README.md).
2. Install the client dependencies with `npm install`.
3. Start the storefront with `npm start` and open `http://localhost:3000`.

The API defaults to `http://localhost:5050`. Set `REACT_APP_API_URL` in a client `.env` file when using a different API host. For a deployed build, set it to the public API URL before running `npm run build`.

Checkout opens Razorpay Standard Checkout. The cart stays available if payment fails, and the order is confirmed only after the server verifies a captured payment.

## Admin

Open `/admin-login` and sign in with an account whose database record has `isAdmin: true`. Admin access is also checked by the API on protected routes.

## Production build

Run `npm run build` to create the optimized static site in `build/`.

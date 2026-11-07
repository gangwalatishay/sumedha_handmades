# Sumedha Handmades API

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in the MongoDB URI, a random `JWT_SECRET` of at least 32 characters, and the email/payment credentials you plan to use.
3. Start the API with `npm start` (or `npm run dev` during development). The API listens on port `5050` by default.
4. Start the client in `../client`; it expects the API at `http://localhost:5050` unless `REACT_APP_API_URL` is set.

The API waits for MongoDB before listening. Order creation, cancellations, and admin status changes use MongoDB transactions to keep inventory and order records consistent, so the database must support transactions (MongoDB Atlas clusters do).

## Razorpay setup

Use Razorpay **Test Mode** keys for development. Keep `RAZORPAY_KEY_SECRET` on the server; only the public key ID is sent to the storefront. The checkout verifies the Razorpay signature and confirms the payment is captured before it marks an order paid or sends the order invoice.

For payment updates when a customer closes the checkout, configure a Razorpay webhook URL at `https://<your-api-host>/api/payment/webhook`, set its signing secret as `RAZORPAY_WEBHOOK_SECRET`, and subscribe to `payment.captured`, `payment.failed`, `refund.processed`, and `refund.failed`. The server also reconciles expired payment and refund states periodically.

In production, set `CLIENT_ORIGIN` to the exact storefront origin and `NODE_ENV=production`. Set the client’s `REACT_APP_API_URL` to this API’s public URL before building the frontend.

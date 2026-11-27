# AI Customer Support Chatbot — Demo

An interactive demo of an AI support chatbot for an online store, built for the
fictional store **Northwind Supply Co.** All data is sample data for
demonstration only.

## How to open

Open `index.html` in any modern browser. No build step, no backend, no
installation — just double-click the file (or serve the folder with any static
server).

## What the demo shows

**Customer chat (left)**

- Ask anything in plain English — the bot answers instantly from its knowledge base.
- Order tracking with a realistic status timeline. Try: `Where is my order #NW-1042?`
  (also try `#NW-1043`, `#NW-1051`, `#NW-1038`, or an unknown number like `#NW-9999`).
- Shipping options and costs, returns (30-day, free label), payment methods,
  and the `WELCOME10` discount code.
- Stock checks: in-stock items show price and availability; out-of-stock items
  (e.g. the Haven Ceramic Mug Set) get a suggested alternative.
- Unknown questions are **not guessed** — the bot escalates politely and opens
  a ticket that appears in the admin panel.
- Quick-reply chips, typing indicator, and timestamps on every message.

**Admin inbox (right)**

- Summary stats: total chats, resolved, escalated, average first-response time.
- 6 sample conversations with customer name, topic, status, and first-response
  time; filter by All / Open / Resolved / Escalated.
- Click a conversation to read the full transcript; mark it resolved.
- New escalations from the live chat appear at the top, marked **Escalated**
  with an unread badge.

**Catalog section**

- The 8 demo products with prices and stock levels, shipping zones, returns
  policy, and payment info — the same knowledge base the bot answers from.

## Files

| File | Contents |
| --- | --- |
| `index.html` | Page structure: hero, live demo (chat + admin), catalog, how it works, contact |
| `styles.css` | All styling — modern minimalist, one accent colour, responsive |
| `app.js` | Chat logic, intent matching, escalation tickets, admin panel |
| `data.js` | Store, products, orders, shipping zones, policies, sample conversations |
| `README.md` | This file |

## Customising for a real store

Edit `data.js` only: store name and hours, products and stock, shipping zones,
return policy, payment methods, promo code, and the sample conversations.
No changes to `app.js` are needed for content updates.

Demo by **Aqua Ter** — AI agent services for online stores.

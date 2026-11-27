/* Sample data for the AI Customer Support Chatbot demo.
   Store, products, orders, shipping zones and conversations are all
   fictional examples for demonstration only. */
const STORE = {
  name: "Northwind Supply Co.",
  tagline: "Everyday goods, honestly made.",
  supportHours: "Mon–Fri, 9:00–17:00 PT",
  supportEmail: "help@northwindsupply.example",
  returnDays: 30,
  freeShippingOver: 75,
  currency: "$"
};

const PRODUCTS = [
  { id: "P-101", name: "Aurora Desk Lamp", price: 49.99, stock: 14, category: "Home", blurb: "Warm-white LED lamp with a dimmable touch base." },
  { id: "P-102", name: "Trailhead Backpack 28L", price: 89.00, stock: 6, category: "Outdoors", blurb: "Weather-resistant 28L pack with a padded laptop sleeve." },
  { id: "P-103", name: "Haven Ceramic Mug Set", price: 34.50, stock: 0, category: "Kitchen", blurb: "Set of two speckled ceramic mugs, 12 oz each." },
  { id: "P-104", name: "Ember Stoneware Mug", price: 18.00, stock: 22, category: "Kitchen", blurb: "Single hand-glazed stoneware mug, 14 oz." },
  { id: "P-105", name: "Solstice Wireless Headphones", price: 129.00, stock: 9, category: "Electronics", blurb: "Noise-cancelling over-ear headphones, 40-hour battery." },
  { id: "P-106", name: "Field Notes Leather Journal", price: 27.00, stock: 0, category: "Stationery", blurb: "Full-grain leather journal, 192 dotted pages." },
  { id: "P-107", name: "Everyday Canvas Notebook", price: 16.00, stock: 31, category: "Stationery", blurb: "Lay-flat canvas notebook, 120 lined pages." },
  { id: "P-108", name: "Nimbus Portable Charger 20,000 mAh", price: 39.99, stock: 3, category: "Electronics", blurb: "Fast-charge power bank with USB-C and USB-A." }
];

const SHIPPING_ZONES = [
  { zone: "US Standard", cost: 4.95, eta: "3–5 business days", note: "Free on orders over $75" },
  { zone: "US Express", cost: 12.95, eta: "1–2 business days", note: "Order by 2pm PT for same-day dispatch" },
  { zone: "International", cost: 19.95, eta: "7–14 business days", note: "Duties calculated at checkout" }
];

const PAYMENT_METHODS = ["Visa", "Mastercard", "American Express", "PayPal", "Apple Pay", "Google Pay"];

const PROMO = { code: "WELCOME10", discount: "10% off your first order", terms: "One use per customer. Cannot be combined with other offers." };

const RETURN_POLICY = {
  days: 30,
  condition: "Items must be unused, in original packaging, with tags attached.",
  label: "Return shipping is free — we email you a prepaid label.",
  refund: "Refunds go back to your original payment method within 3–5 business days of us receiving the return.",
  exceptions: "Final-sale items (marked 'Final sale' on the product page) cannot be returned."
};

/* Sample orders. Order numbers are the ones visitors can try in the chat. */
const ORDERS = {
  "NW-1042": {
    customer: "Maya Chen", total: 89.00, items: ["Trailhead Backpack 28L"],
    status: "Out for delivery",
    timeline: [
      { label: "Order placed", date: "Nov 24, 2026", done: true },
      { label: "Payment confirmed", date: "Nov 24, 2026", done: true },
      { label: "Packed at our Portland warehouse", date: "Nov 25, 2026", done: true },
      { label: "Shipped — US Express", date: "Nov 25, 2026", done: true },
      { label: "Arrived at Seattle sorting facility", date: "Nov 26, 2026", done: true },
      { label: "Out for delivery", date: "Nov 27, 2026", done: true },
      { label: "Delivered", date: "Expected today by 8pm", done: false }
    ]
  },
  "NW-1043": {
    customer: "Daniel Okafor", total: 129.00, items: ["Solstice Wireless Headphones"],
    status: "In transit",
    timeline: [
      { label: "Order placed", date: "Nov 25, 2026", done: true },
      { label: "Payment confirmed", date: "Nov 25, 2026", done: true },
      { label: "Packed at our Portland warehouse", date: "Nov 26, 2026", done: true },
      { label: "Shipped — US Standard", date: "Nov 26, 2026", done: true },
      { label: "In transit — Denver, CO", date: "Nov 27, 2026", done: true },
      { label: "Delivered", date: "Expected Nov 29, 2026", done: false }
    ]
  },
  "NW-1051": {
    customer: "Priya Nair", total: 67.99, items: ["Aurora Desk Lamp", "Ember Stoneware Mug"],
    status: "Processing",
    timeline: [
      { label: "Order placed", date: "Nov 27, 2026", done: true },
      { label: "Payment confirmed", date: "Nov 27, 2026", done: true },
      { label: "Being packed", date: "In progress", done: true },
      { label: "Shipped", date: "Expected Nov 28, 2026", done: false },
      { label: "Delivered", date: "Expected Dec 1, 2026", done: false }
    ]
  },
  "NW-1038": {
    customer: "Tom Becker", total: 39.99, items: ["Nimbus Portable Charger 20,000 mAh"],
    status: "Delivered",
    timeline: [
      { label: "Order placed", date: "Nov 21, 2026", done: true },
      { label: "Payment confirmed", date: "Nov 21, 2026", done: true },
      { label: "Shipped — US Standard", date: "Nov 22, 2026", done: true },
      { label: "Delivered", date: "Nov 25, 2026", done: true }
    ]
  }
};

/* Suggested alternatives when a product is out of stock. */
const ALTERNATIVES = {
  "P-103": "P-104",
  "P-106": "P-107"
};

/* Sample past conversations for the admin panel. */
const SAMPLE_CONVERSATIONS = [
  {
    id: "C-201", customer: "Maya Chen", topic: "Order tracking — #NW-1042", status: "resolved",
    firstResponseMin: 1, started: "Nov 27, 10:04", unread: false,
    messages: [
      { from: "customer", text: "Hi, where is my order #NW-1042?", time: "10:04" },
      { from: "bot", text: "Hi Maya! Order #NW-1042 is out for delivery and should arrive today by 8pm. It left the Seattle sorting facility this morning.", time: "10:04" },
      { from: "customer", text: "Perfect, thank you!", time: "10:05" }
    ]
  },
  {
    id: "C-202", customer: "Daniel Okafor", topic: "Shipping cost to Canada", status: "resolved",
    firstResponseMin: 1, started: "Nov 27, 09:31", unread: false,
    messages: [
      { from: "customer", text: "How much is shipping to Toronto?", time: "09:31" },
      { from: "bot", text: "Shipping to Canada is $19.95 (International) and takes 7–14 business days. Duties are calculated at checkout, so there are no surprise fees on delivery.", time: "09:31" },
      { from: "customer", text: "Got it, thanks.", time: "09:33" }
    ]
  },
  {
    id: "C-203", customer: "Priya Nair", topic: "Return — wrong size", status: "open",
    firstResponseMin: 2, started: "Nov 27, 08:47", unread: true,
    messages: [
      { from: "customer", text: "I need to return the lamp, it doesn't fit my desk.", time: "08:47" },
      { from: "bot", text: "No problem, Priya. Returns are free within 30 days. I can email you a prepaid return label — would you like me to start that for order #NW-1051?", time: "08:49" },
      { from: "customer", text: "Yes please, send the label.", time: "08:52" }
    ]
  },
  {
    id: "C-204", customer: "Tom Becker", topic: "Discount code not working", status: "escalated",
    firstResponseMin: 1, started: "Nov 26, 16:20", unread: true,
    messages: [
      { from: "customer", text: "WELCOME10 says invalid at checkout.", time: "16:20" },
      { from: "bot", text: "Sorry about that, Tom. WELCOME10 is for first orders only and can't be combined with other offers. It looks like your account already used it on order #NW-1038.", time: "16:21" },
      { from: "customer", text: "That was my wife's order on the same card. I want a human.", time: "16:23" },
      { from: "bot", text: "Of course — I've opened ticket ESC-1047 and a human agent will pick this up within 2 hours during support hours.", time: "16:23" }
    ]
  },
  {
    id: "C-205", customer: "Sofia Rossi", topic: "Out of stock — Haven Mug Set", status: "resolved",
    firstResponseMin: 1, started: "Nov 26, 14:02", unread: false,
    messages: [
      { from: "customer", text: "Is the Haven Ceramic Mug Set ever coming back?", time: "14:02" },
      { from: "bot", text: "It's out of stock right now, Sofia — a restock is expected in about 2 weeks. In the meantime, the Ember Stoneware Mug ($18.00) is the same glaze and size, and it's in stock.", time: "14:03" },
      { from: "customer", text: "I'll take the Ember one, thanks!", time: "14:05" }
    ]
  },
  {
    id: "C-206", customer: "Alex Morgan", topic: "Payment methods", status: "open",
    firstResponseMin: 3, started: "Nov 26, 11:15", unread: false,
    messages: [
      { from: "customer", text: "Do you take Apple Pay?", time: "11:15" },
      { from: "bot", text: "Yes, we accept Apple Pay, Google Pay, PayPal, and all major cards (Visa, Mastercard, American Express).", time: "11:18" },
      { from: "customer", text: "Great, ordering now.", time: "11:19" }
    ]
  }
];

const QUICK_REPLIES = [
  { label: "Track my order", text: "Where is my order #NW-1042?" },
  { label: "Shipping info", text: "What are your shipping options and costs?" },
  { label: "Return an item", text: "How do I return an item?" },
  { label: "Talk to a human", text: "I want to talk to a human agent" }
];

const BOT_GREETING =
  "Hi there! I'm Northwind's support assistant. I can track orders, explain shipping and returns, check stock, and help with payment questions — instantly, 24/7. What can I do for you?";

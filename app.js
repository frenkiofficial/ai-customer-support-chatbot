/* AI Customer Support Chatbot — demo logic (sample data, no backend). */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var money = function (n) { return "$" + n.toFixed(2); };
  var nowTime = function () {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var ap = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" : "") + m + " " + ap;
  };

  /* --- State --- */
  var state = {
    conversations: JSON.parse(JSON.stringify(SAMPLE_CONVERSATIONS)),
    activeConvId: null,
    filter: "all",
    ticketSeq: 1048,
    liveTicketCount: 0
  };

  /* --- Catalog & policies (rendered from data.js) --- */
  function renderCatalog() {
    var grid = $("productGrid");
    grid.innerHTML = "";
    PRODUCTS.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "product-card";
      var stockCls = p.stock === 0 ? "stock-out" : (p.stock <= 3 ? "stock-low" : "stock-in");
      var stockTxt = p.stock === 0 ? "Out of stock" : (p.stock <= 3 ? "Only " + p.stock + " left" : p.stock + " in stock");
      card.innerHTML =
        '<p class="product-cat"></p><h3></h3><p class="product-blurb"></p>' +
        '<div class="product-foot"><span class="product-price"></span><span class="stock-pill ' + stockCls + '"></span></div>';
      card.querySelector(".product-cat").textContent = p.category + " · " + p.id;
      card.querySelector("h3").textContent = p.name;
      card.querySelector(".product-blurb").textContent = p.blurb;
      card.querySelector(".product-price").textContent = money(p.price);
      card.querySelector(".stock-pill").textContent = stockTxt;
      grid.appendChild(card);
    });

    var ship = $("shippingList");
    ship.innerHTML = "";
    SHIPPING_ZONES.forEach(function (z) {
      var li = document.createElement("li");
      li.innerHTML = "<strong></strong> — <span></span>";
      li.querySelector("strong").textContent = z.zone + ": " + money(z.cost);
      li.querySelector("span").textContent = z.eta + ". " + z.note;
      ship.appendChild(li);
    });

    $("returnSummary").textContent =
      RETURN_POLICY.days + "-day returns. " + RETURN_POLICY.condition + " " +
      RETURN_POLICY.label + " " + RETURN_POLICY.refund;
    $("paymentSummary").textContent =
      "We accept " + PAYMENT_METHODS.join(", ") + ". " +
      "Code " + PROMO.code + " gives " + PROMO.discount.toLowerCase() + " — " + PROMO.terms;
  }

  /* --- Admin panel --- */
  function avgResponse() {
    var list = state.conversations;
    if (!list.length) return "—";
    var sum = list.reduce(function (a, c) { return a + (c.firstResponseMin || 0); }, 0);
    var avg = sum / list.length;
    return (Math.round(avg * 10) / 10) + " min";
  }

  function renderStats() {
    var list = state.conversations;
    $("statTotal").textContent = list.length;
    $("statResolved").textContent = list.filter(function (c) { return c.status === "resolved"; }).length;
    $("statEscalated").textContent = list.filter(function (c) { return c.status === "escalated"; }).length;
    $("statAvgResponse").textContent = avgResponse();
  }

  function renderUnread() {
    var n = state.conversations.filter(function (c) { return c.unread; }).length;
    var badge = $("unreadBadge");
    badge.textContent = n;
    badge.classList.toggle("zero", n === 0);
    badge.title = n + " unread conversation" + (n === 1 ? "" : "s");
  }

  function renderConvList() {
    var list = $("convList");
    list.innerHTML = "";
    var filtered = state.conversations.filter(function (c) {
      return state.filter === "all" || c.status === state.filter;
    });
    if (!filtered.length) {
      var p = document.createElement("p");
      p.className = "conv-empty-list";
      p.textContent = "No " + (state.filter === "all" ? "" : state.filter + " ") + "conversations yet.";
      list.appendChild(p);
      return;
    }
    filtered.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "conv-item" + (state.activeConvId === c.id ? " selected" : "");
      b.setAttribute("role", "option");
      b.setAttribute("aria-selected", state.activeConvId === c.id ? "true" : "false");
      var unreadDot = c.unread ? '<span class="conv-unread" title="Unread"></span>' : "";
      b.innerHTML =
        '<span class="conv-top"><span class="conv-name"></span><span class="conv-time"></span></span>' +
        '<span class="conv-topic"></span>' +
        '<span class="conv-meta"><span class="status-pill status-' + c.status + '">' + c.status + '</span>' +
        '<span class="conv-resp"></span>' + unreadDot + "</span>";
      b.querySelector(".conv-name").textContent = c.customer;
      b.querySelector(".conv-time").textContent = c.started;
      b.querySelector(".conv-topic").textContent = c.topic;
      b.querySelector(".conv-resp").textContent = "First response: " + c.firstResponseMin + " min";
      b.addEventListener("click", function () { selectConversation(c.id); });
      list.appendChild(b);
    });
  }

  function renderDetail() {
    var detail = $("convDetail");
    var conv = null;
    state.conversations.forEach(function (c) { if (c.id === state.activeConvId) conv = c; });
    if (!conv) {
      detail.innerHTML = '<p class="conv-empty">Select a conversation to read it.</p>';
      return;
    }
    detail.innerHTML = "";
    var head = document.createElement("div");
    head.className = "detail-head";
    head.innerHTML = '<h4></h4><span class="status-pill status-' + conv.status + '">' + conv.status + "</span>";
    head.querySelector("h4").textContent = conv.customer + " — " + conv.id;
    var sub = document.createElement("p");
    sub.className = "detail-sub";
    sub.textContent = conv.topic + " · Started " + conv.started + " · First response: " + conv.firstResponseMin + " min";
    var msgs = document.createElement("div");
    msgs.className = "detail-msgs";
    conv.messages.forEach(function (m) {
      var div = document.createElement("div");
      div.className = "msg " + (m.from === "customer" ? "msg-user" : "msg-bot");
      var who = document.createElement("p");
      who.innerHTML = "<strong></strong> ";
      who.querySelector("strong").textContent = m.from === "customer" ? conv.customer : "Northwind Assistant";
      var txt = document.createElement("span");
      txt.textContent = m.text;
      who.appendChild(txt);
      var t = document.createElement("span");
      t.className = "msg-time";
      t.textContent = m.time;
      div.appendChild(who);
      div.appendChild(t);
      msgs.appendChild(div);
    });
    var actions = document.createElement("div");
    actions.className = "detail-actions";
    if (conv.status !== "resolved") {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary btn-small";
      btn.textContent = "Mark resolved";
      btn.addEventListener("click", function () {
        conv.status = "resolved";
        conv.unread = false;
        refreshAdmin();
      });
      actions.appendChild(btn);
    } else {
      var note = document.createElement("p");
      note.className = "resolved-note";
      note.textContent = "Resolved — no further action needed.";
      actions.appendChild(note);
    }
    detail.appendChild(head);
    detail.appendChild(sub);
    detail.appendChild(msgs);
    detail.appendChild(actions);
  }

  function selectConversation(id) {
    state.activeConvId = id;
    state.conversations.forEach(function (c) { if (c.id === id) c.unread = false; });
    renderUnread();
    renderConvList();
    renderDetail();
  }

  function refreshAdmin() {
    renderStats();
    renderUnread();
    renderConvList();
    renderDetail();
  }

  document.querySelectorAll("#convFilters .filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("#convFilters .filter-btn").forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      state.filter = btn.dataset.filter;
      renderConvList();
    });
  });

  /* --- Live chat --- */
  var chatBox = $("chatMessages");

  function scrollChat() { chatBox.scrollTop = chatBox.scrollHeight; }

  function addMessage(from, html, isHtml) {
    var div = document.createElement("div");
    div.className = "msg " + (from === "user" ? "msg-user" : "msg-bot");
    if (isHtml) {
      div.innerHTML = html;
    } else {
      var p = document.createElement("p");
      p.textContent = html;
      div.appendChild(p);
    }
    var t = document.createElement("span");
    t.className = "msg-time";
    t.textContent = nowTime();
    div.appendChild(t);
    chatBox.appendChild(div);
    scrollChat();
    return div;
  }

  function showTyping() {
    var div = document.createElement("div");
    div.className = "msg msg-bot typing";
    div.id = "typingIndicator";
    div.innerHTML = "<span></span><span></span><span></span>";
    chatBox.appendChild(div);
    scrollChat();
    return div;
  }

  function sendMessage(text) {
    text = (text || "").trim();
    if (!text) return;
    addMessage("user", text, false);
    var typing = showTyping();
    setTimeout(function () {
      typing.remove();
      var reply = resolveIntent(text);
      addMessage("bot", reply.html, reply.isHtml);
      if (reply.escalate) createEscalation(reply.topic || "General question", text);
    }, 700 + Math.random() * 600);
  }

  $("chatForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("chatInput");
    var text = input.value;
    input.value = "";
    input.focus();
    sendMessage(text);
  });

  /* Quick-reply chips */
  var chips = $("quickChips");
  QUICK_REPLIES.forEach(function (q) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip-btn";
    b.textContent = q.label;
    b.addEventListener("click", function () { sendMessage(q.text); });
    chips.appendChild(b);
  });

  $("resetChatBtn").addEventListener("click", function () {
    chatBox.innerHTML = "";
    addMessage("bot", BOT_GREETING, false);
  });

  /* --- Escalation --- */
  function createEscalation(topic, userText) {
    state.ticketSeq += 1;
    state.liveTicketCount += 1;
    var ticket = "ESC-" + state.ticketSeq;
    var conv = {
      id: "C-" + (300 + state.liveTicketCount),
      customer: "Website visitor",
      topic: topic + " — ticket " + ticket,
      status: "escalated",
      firstResponseMin: 1,
      started: "Today, " + nowTime(),
      unread: true,
      messages: [
        { from: "customer", text: userText, time: nowTime() },
        { from: "bot", text: "I've opened ticket " + ticket + " and a human agent will pick this up within 2 hours during support hours (" + STORE.supportHours + ").", time: nowTime() }
      ]
    };
    state.conversations.unshift(conv);
    refreshAdmin();
    return ticket;
  }

  function escalationHtml(ticket, extra) {
    return '<span class="tag tag-escalated">Escalated — ' + esc(ticket) + "</span>" +
      "<p>" + esc(extra) + "</p>" +
      "<p>A human agent will pick this up within 2 hours during support hours (" + esc(STORE.supportHours) + "). " +
      "You don't need to do anything else — we'll reply to this chat and by email.</p>";
  }

  /* --- Bot brain: intent matching over the knowledge base --- */
  var PRODUCT_KEYS = [
    { keys: ["aurora", "desk lamp", "lamp"], id: "P-101" },
    { keys: ["trailhead", "backpack"], id: "P-102" },
    { keys: ["haven", "mug set", "ceramic mug"], id: "P-103" },
    { keys: ["ember", "stoneware"], id: "P-104" },
    { keys: ["solstice", "headphones"], id: "P-105" },
    { keys: ["field notes", "leather journal", "journal"], id: "P-106" },
    { keys: ["canvas notebook", "notebook"], id: "P-107" },
    { keys: ["nimbus", "portable charger", "charger", "power bank"], id: "P-108" }
  ];

  function findProduct(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < PRODUCT_KEYS.length; i++) {
      for (var j = 0; j < PRODUCT_KEYS[i].keys.length; j++) {
        if (lower.indexOf(PRODUCT_KEYS[i].keys[j]) !== -1) return productById(PRODUCT_KEYS[i].id);
      }
    }
    return null;
  }

  function productById(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  function orderTimelineHtml(order, num) {
    var items = order.items.join(", ");
    var html = "<p>Here's order <span class='order-no'>" + esc(num) + "</span> — " +
      esc(items) + " (" + money(order.total) + ").</p>" +
      "<p><strong>Status: " + esc(order.status) + "</strong></p><ul class='timeline'>";
    order.timeline.forEach(function (step) {
      html += '<li class="' + (step.done ? "done" : "pending") + '">' + esc(step.label) +
        ' <span class="tl-date">· ' + esc(step.date) + "</span></li>";
    });
    html += "</ul>";
    if (order.status === "Delivered") {
      html += "<p>Delivered — enjoy! If anything's wrong with it, returns are free within 30 days.</p>";
    }
    return html;
  }

  function shippingHtml() {
    var html = "<p>Here are our shipping options:</p><ul class='timeline'>";
    SHIPPING_ZONES.forEach(function (z) {
      html += "<li class='done'><strong>" + esc(z.zone) + " — " + money(z.cost) + "</strong> · " +
        esc(z.eta) + ". " + esc(z.note) + "</li>";
    });
    html += "</ul><p>US Standard is free on orders over " + money(STORE.freeShippingOver) + ".</p>";
    return html;
  }

  function returnHtml() {
    return "<p>Returns are free within <strong>" + RETURN_POLICY.days + " days</strong>.</p>" +
      "<p>" + esc(RETURN_POLICY.condition) + " " + esc(RETURN_POLICY.label) + "</p>" +
      "<p>" + esc(RETURN_POLICY.refund) + " " + esc(RETURN_POLICY.exceptions) + "</p>" +
      "<p>If you share your order number, I can start the return and email you the label right away.</p>";
  }

  function resolveIntent(text) {
    var lower = text.toLowerCase();

    /* 1. Order tracking — an order number anywhere in the message wins. */
    var orderMatch = lower.match(/nw[-\s]?(\d{3,4})/);
    if (orderMatch || /\btrack\b|\border status\b|\bwhere is my order\b|\bwhere's my order\b/.test(lower)) {
      if (orderMatch) {
        var num = "NW-" + orderMatch[1];
        var order = ORDERS[num];
        if (order) return { html: orderTimelineHtml(order, num), isHtml: true };
        return {
          html: "<p>I couldn't find order <strong>" + esc(num) + "</strong> in our system. " +
            "Could you double-check the number? Orders look like #NW-1042. " +
            "Try <strong>#NW-1042</strong>, <strong>#NW-1043</strong> or <strong>#NW-1051</strong> — or I can connect you with a human agent to look into it.</p>",
          isHtml: true
        };
      }
      return {
        html: "<p>Happy to track that for you — what's your order number? It looks like <strong>#NW-1042</strong> and is in your confirmation email.</p>",
        isHtml: true
      };
    }

    /* 2. Talk to a human. */
    if (/\bhuman\b|\bagent\b|\breal person\b|\bperson\b|\brepresentative\b|\bsupport team\b|\btalk to someone\b/.test(lower)) {
      var t1 = createEscalationTicketOnly();
      return { html: escalationHtml(t1, "Of course — connecting you with a human agent now."), isHtml: true, escalate: false };
    }

    /* 3. Greeting. */
    if (/^(hi|hello|hey|good (morning|afternoon|evening)|yo)\b/.test(lower)) {
      return { html: "Hi! " + BOT_GREETING, isHtml: false };
    }

    /* 4. Thanks. */
    if (/\b(thank|thanks|thx)\b/.test(lower)) {
      return { html: esc("You're welcome! Anything else I can help with — tracking, shipping, returns, or stock?"), isHtml: false };
    }

    /* 5. Shipping. */
    if (/\bship\w*|\bdeliver\w*|\bshipping cost\b|\bhow long.*(arrive|get here|delivery)\b|\binternational\b/.test(lower)) {
      return { html: shippingHtml(), isHtml: true };
    }

    /* 6. Returns / refunds. */
    if (/\breturn\b|\brefund\b|\bexchange\b|\bsend (it )?back\b/.test(lower)) {
      return { html: returnHtml(), isHtml: true };
    }

    /* 7. Discounts / promo codes. */
    if (/\bdiscount\b|\bpromo\b|\bcoupon\b|\bcode\b|\boffer\b|\bsale\b|\bwelcome10\b/.test(lower)) {
      return {
        html: "<p>Our current offer is code <strong>" + esc(PROMO.code) + "</strong> — " + esc(PROMO.discount.toLowerCase()) + ".</p>" +
          "<p>" + esc(PROMO.terms) + " Just enter it at checkout.</p>",
        isHtml: true
      };
    }

    /* 8. Payment methods. */
    if (/\bpay\w*|\bpayment\b|\bapple pay\b|\bgoogle pay\b|\bpaypal\b|\bvisa\b|\bmastercard\b|\bamex\b|\bcredit card\b/.test(lower)) {
      return {
        html: "<p>We accept " + esc(PAYMENT_METHODS.join(", ")) + ".</p>" +
          "<p>Payment is taken securely at checkout — we never see or store your card details.</p>",
        isHtml: true
      };
    }

    /* 9. Support hours. */
    if (/\bhours\b|\bwhen.*open\b|\bopen.*(today|now)\b/.test(lower)) {
      return {
        html: "<p>Our human team works " + esc(STORE.supportHours) + ". I'm here 24/7 for tracking, shipping, returns and stock questions.</p>",
        isHtml: true
      };
    }

    /* 10. Stock — match a product, suggest an alternative when out of stock. */
    var product = findProduct(text);
    if (product || /\bstock\b|\bin stock\b|\bavailable\b|\bavailability\b/.test(lower)) {
      if (!product) {
        return {
          html: "<p>Which product would you like me to check? For example: the Aurora Desk Lamp, the Trailhead Backpack, or the Haven Ceramic Mug Set.</p>",
          isHtml: true
        };
      }
      if (product.stock === 0) {
        var alt = productById(ALTERNATIVES[product.id]);
        var altHtml = alt
          ? "<p>As an alternative, the <strong>" + esc(alt.name) + "</strong> (" + money(alt.price) + ") is very similar and we have " + alt.stock + " in stock right now.</p>"
          : "";
        return {
          html: "<p>Sorry — the <strong>" + esc(product.name) + "</strong> (" + money(product.price) + ") is <strong>out of stock</strong> at the moment. " +
            "A restock is expected in about 2 weeks, and I can let you know when it's back if you'd like.</p>" + altHtml,
          isHtml: true
        };
      }
      var lowNote = product.stock <= 3 ? " — selling fast, only " + product.stock + " left." : ".";
      return {
        html: "<p>Good news — the <strong>" + esc(product.name) + "</strong> (" + money(product.price) + ") is <strong>in stock</strong>" + esc(lowNote) + "</p>" +
          "<p>" + esc(product.blurb) + "</p>",
        isHtml: true
      };
    }

    /* 11. Unknown — honest escalation, never a guessed answer. */
    var ticket = "ESC-" + (state.ticketSeq + 1);
    return {
      html: escalationHtml(ticket, "I don't have a confident answer for that yet, so I won't guess — let me bring in a human agent instead."),
      isHtml: true,
      escalate: true,
      topic: "Unknown question"
    };
  }

  /* Ticket number preview for the "talk to a human" path (the ticket itself
     is created by createEscalation). */
  function createEscalationTicketOnly() {
    state.ticketSeq += 1;
    var ticket = "ESC-" + state.ticketSeq;
    state.liveTicketCount += 1;
    var conv = {
      id: "C-" + (300 + state.liveTicketCount),
      customer: "Website visitor",
      topic: "Request for human agent — ticket " + ticket,
      status: "escalated",
      firstResponseMin: 1,
      started: "Today, " + nowTime(),
      unread: true,
      messages: [
        { from: "customer", text: "I want to talk to a human agent", time: nowTime() },
        { from: "bot", text: "I've opened ticket " + ticket + " and a human agent will pick this up within 2 hours during support hours (" + STORE.supportHours + ").", time: nowTime() }
      ]
    };
    state.conversations.unshift(conv);
    refreshAdmin();
    return ticket;
  }

  /* --- DM template copy --- */
  function copyText(text, stateEl) {
    function done() {
      if (stateEl) {
        stateEl.textContent = "Copied.";
        setTimeout(function () { stateEl.textContent = ""; }, 2000);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  $("copyDmBtn").addEventListener("click", function () {
    copyText($("dmText").textContent, $("copyDmState"));
  });

  /* --- Init --- */
  $("storeName").textContent = STORE.name;
  renderCatalog();
  refreshAdmin();
  addMessage("bot", BOT_GREETING, false);
})();

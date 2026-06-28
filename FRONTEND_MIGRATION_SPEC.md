# Kazza (cafe-park) Vue Frontend — Full Specification for Django HTML Template Migration

> **Purpose:** This document describes the complete Vue 3 SPA frontend so a Django backend project can replace it with server-rendered HTML templates. The existing REST API endpoints should remain; only the client layer changes from Vue SPA to Django views + templates.
>
> **Product:** Restaurant/waitress POS system branded **Kazza** — table floor plan, order taking, kitchen confirmation, check printing, payments.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Directory Structure](#2-directory-structure)
3. [Technology Stack](#3-technology-stack)
4. [Application Pages & Routing](#4-application-pages--routing)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [HTTP Client Configuration](#6-http-client-configuration)
7. [Complete API Reference](#7-complete-api-reference)
8. [Data Models (Expected JSON Shapes)](#8-data-models-expected-json-shapes)
9. [Feature Modules & User Flows](#9-feature-modules--user-flows)
10. [Forms & User Input](#10-forms--user-input)
11. [Role-Based UI Rules](#11-role-based-ui-rules)
12. [UI/UX Details](#12-uiux-details)
13. [Environment Configuration](#13-environment-configuration)
14. [Known Frontend Bugs & Inconsistencies](#14-known-frontend-bugs--inconsistencies)
15. [Django Migration Checklist](#15-django-migration-checklist)

---

## 1. Project Overview

| Property | Value |
|----------|-------|
| npm package name | `cafe-park` |
| UI brand name | **Kazza** |
| Framework | Vue 3 SPA |
| State | Vuex 4 (auth only) + localStorage persistence |
| Routing | Vue Router 4 (3 routes) |
| HTTP | Axios via `src/backend-services/` |
| Language | Azerbaijani UI strings |
| Target devices | Touch POS tablets, mobile waiters (QR login), Safari 12+ |

The app has **3 screens**:

1. **Login** — 4-digit PIN keypad + QR code for mobile access
2. **Hall / Floor Plan** — grid of tables in a selected hall/room
3. **Order View** — split layout: order items (left) + menu (right)

There is **no** separate admin panel, reports, or settings UI in this frontend.

---

## 2. Directory Structure

```
frontend/
├── public/
│   └── index.html                 # SPA shell, title "Kazza"
├── src/
│   ├── App.vue                    # Root: <RouterView /> only
│   ├── main.js                    # Bootstrap: Vue, Vuex, Router, Font Awesome
│   ├── disableZoom.js             # Prevent pinch/double-tap zoom (touch POS)
│   ├── EventBus.js                # mitt pub/sub (order refresh events)
│   ├── event-bus.js               # Unused legacy duplicate
│   ├── router/
│   │   └── index.js               # 3 routes + auth guard
│   ├── store/
│   │   ├── index.js               # Vuex root
│   │   ├── localStoragePlugin.js  # Persists entire store to localStorage
│   │   └── auth/
│   │       ├── index.js           # Auth state
│   │       ├── getters.js
│   │       └── mutations.js
│   ├── backend-services/
│   │   ├── custom-axios.js        # Axios instance, base URL from env
│   │   └── backend-services.js    # ALL API methods (~23 endpoints)
│   ├── services/
│   │   └── OrderService.js        # Dead/incomplete code, NOT used
│   └── components/
│       ├── LoginView.vue
│       ├── VirtualKeyboard.vue    # On-screen AZ keyboard
│       ├── ErrorPopup.vue
│       ├── SuccessPopup.vue
│       ├── PrinterLoading.vue     # Loading overlay for print/kitchen
│       ├── MainRestorantView/
│       │   ├── MainView.vue       # Floor plan (ACTIVE)
│       │   ├── HallComponent.vue  # Legacy, unused in template
│       │   ├── HallListComponent.vue
│       │   └── TableComponent.vue
│       └── MainOrderView/
│           ├── MainOrderView.vue  # Order screen shell
│           ├── OrderItems.vue     # Order list + line items
│           ├── OrderDropdown.vue  # Item actions (comment, transfer, return)
│           ├── Menu.vue           # Meal groups/categories/items
│           ├── Actions.vue        # Admin actions (pay, print, transfer…)
│           └── CustomerCountPopup.vue
├── vue.config.js
├── babel.config.js
├── jsconfig.json                  # @/* → src/*
├── package.json
├── .env.example
└── .env.template
```

**Important:** All API calls go through `src/backend-services/backend-services.js`. There is no `src/api/` or `src/views/` folder.

---

## 3. Technology Stack

### Runtime dependencies

| Package | Version | Usage |
|---------|---------|-------|
| vue | ^3.2.13 | UI framework |
| vue-router | ^4.1.6 | Client routing |
| vuex | ^4.0.2 | Auth state only |
| axios | ^1.6.8 | HTTP client |
| @fortawesome/* | ^6.6.0 | Icons |
| vue-qrcode | ^2.2.2 | Login QR code |
| mitt | ^3.0.1 | Event bus |
| core-js | ^3.8.3 | Polyfills (Safari 12) |

### NOT used

- Element UI, Vuetify, Bootstrap
- Chart libraries
- JWT / OAuth libraries

### Styling

- Custom CSS only (no component library)
- CSS variables in `App.vue`:
  - `--primary-color: #4CAF50`
  - `--primary-hover: #388E3C`
- Touch-optimized: large buttons, on-screen numpads/keyboards
- Responsive breakpoint: `1024px` (mobile tabs on order screen)

---

## 4. Application Pages & Routing

**File:** `src/router/index.js`

| Vue Route | Component | Auth Required | Description |
|-----------|-----------|---------------|-------------|
| `/` | `LoginView.vue` | No | PIN login + QR |
| `/home/:id` | `MainView.vue` | Yes | Floor plan; `:id` = **hall/room ID** |
| `/home/:tableId/main-order-view/:id` | `MainOrderView.vue` | Yes | Order screen; confusing params — see below |

### Route parameter naming (important)

The order route has misleading param names:

```
/home/:tableId/main-order-view/:id
       ↑ hall ID              ↑ actual TABLE ID
```

In `MainOrderView.vue`:
```javascript
this.tableId = this.$route.params.id;  // table ID
// this.$route.params.tableId is actually the hall ID
```

### Suggested Django URL mapping

| Django URL | Replaces |
|------------|----------|
| `/` | Login |
| `/hall/<hall_id>/` | Floor plan |
| `/hall/<hall_id>/table/<table_id>/` | Order view |
| `/logout/` | Client-side logout (no API call today) |

### Auth guard

```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (!store.getters['auth/IS_USER_AUTHENTICATED']) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});
```

Django equivalent: `@login_required` decorator or middleware checking session.

---

## 5. Authentication & Authorization

### Login flow (`LoginView.vue`)

1. On page load: `GET /api/users/network-ip/` → build QR URL as `{FRONTEND_PROTOCOL}://{network_ip}:{FRONTEND_PORT}/`
2. User enters 4-digit PIN via on-screen keypad (auto-submits when length = 4)
3. `POST /api/users/login/` with body `{ "pin": "1234" }`
4. On success, store in Vuex:
   - `authenticated = true`
   - `role` from response
   - `username` from response (**this value is sent as `X-PIN` header on all subsequent requests**)
   - `full_name` from response
5. Fetch halls: `GET /api/tables/rooms/`
6. Redirect to `/home/{firstHall.id}`

On failure: show `"Yanlış PİN!"`, clear PIN.

### Logout flow

Called from `MainView.vue` and `MainOrderView.vue`:

```javascript
SET_AUTHENTICATION(null)
SET_ROLE(null)
SET_USERNAME(null)
router.push('/')
```

- **No backend logout endpoint** is called
- localStorage persists until overwritten on next login

### Auth mechanism for API calls

Every authenticated request (except login) sends:

```http
Accept: application/json
X-PIN: <value stored as username after login>
Content-Type: application/json
```

There is **no JWT**, **no session cookie** in the Vue app, **no token refresh**, **no 401 interceptor**.

Django migration options:
- Replace `X-PIN` with Django session auth (recommended for HTML templates)
- Or keep `X-PIN` middleware for backward compatibility with existing API views

### Vuex auth state

**File:** `src/store/auth/index.js`

| Field | Type | Notes |
|-------|------|-------|
| `authenticated` | boolean | Login flag |
| `username` | string | **Actually the PIN** — used as `X-PIN` |
| `role` | string | See roles below |
| `full_name` | string | Display name |
| `ip_address` | string | Defined but never set |

**Getters:** `IS_USER_AUTHENTICATED`, `GET_USERNAME`, `GET_ROLE`, `GET_FULL_NAME`, `GET_IP_ADDRESS`

**Persistence:** `localStoragePlugin.js` saves entire Vuex store to `localStorage['vuex']` on every mutation.

### User roles

| Role | Display name | Access |
|------|--------------|--------|
| `waitress` | Ofsiant | Own tables only; limited actions |
| `captain_waitress` | — | Same action filter as waitress |
| `admin` | Adminstrator | Full access; 5s table polling |
| `restaurant` | Admin | Full access; 5s table polling |

---

## 6. HTTP Client Configuration

**File:** `src/backend-services/custom-axios.js`

```javascript
baseURL = `${VUE_APP_API_PROTOCOL}://${VUE_APP_API_HOST}:${VUE_APP_API_PORT}`
// Defaults: http://192.168.1.121:8000
timeout = 5000ms
headers = { 'Content-Type': 'application/json' }
```

Interceptors are pass-through only — no auth injection, no error handling.

All API methods are in `src/backend-services/backend-services.js` and import the axios instance + Vuex store for `X-PIN`.

---

## 7. Complete API Reference

Base URL: `http://{host}:{port}` (default `http://127.0.0.1:8000`)

### 7.1 Users

#### POST `/api/users/login/`

| | |
|---|---|
| **Auth** | None |
| **Body** | `{ "pin": "1234" }` |
| **Response** | `{ "username": string, "role": string, "full_name": string }` |
| **Used by** | LoginView |

#### GET `/api/users/network-ip/`

| | |
|---|---|
| **Auth** | Sends `X-PIN` (may be empty on login page) |
| **Response** | `{ "network_ip": "192.168.x.x" }` |
| **Used by** | LoginView (QR code URL) |

---

### 7.2 Tables / Halls

#### GET `/api/tables/rooms/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Response** | `[{ "id": number, "name": string, "description": string }]` |
| **Used by** | LoginView, MainView, Actions, OrderDropdown |

#### GET `/api/tables/{hallId}/tables/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Response** | Array of table objects (see [Table](#table-list-item)) |
| **Used by** | MainView, Actions, OrderDropdown |

#### GET `/api/tables/{tableId}/details`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Note** | No trailing slash in frontend code |
| **Response** | Table details object (see [Table Details](#table-details)) |
| **Used by** | MainOrderView, Actions, OrderItems |

---

### 7.3 Orders

#### POST `/api/orders/{tableId}/create/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Body** | `null` (empty) |
| **Used by** | Menu.vue (auto-create on first item), MainOrderView.vue |
| **Note** | MainOrderView passes `customerCount` but backend-services ignores it |

#### GET `/api/orders/{tableId}/list-orders/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Response** | `[{ "pk": number, "is_main": boolean }]` |
| **Used by** | OrderItems, MainOrderView |

#### GET `/api/orders/{tableId}/list-order-items/?order_id={orderId}`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Query param** | `order_id` (required) |
| **Response** | Array of order items (see [Order Item](#order-item)) |
| **Used by** | OrderItems, OrderDropdown |

#### POST `/api/orders/{tableId}/add-order-item/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Body** | See below |
| **Used by** | Menu, OrderItems |

```json
{
  "meal_id": 1,
  "quantity": 1,
  "order_id": 42,
  "description": "optional custom text for extra items",
  "price": 5.50
}
```

#### DELETE `/api/orders/{tableId}/delete-order-item/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Body** (JSON in DELETE) | See below |
| **Used by** | OrderItems (simple decrement), OrderDropdown (return/waste) |

```json
{
  "meal_id": 1,
  "quantity": 1,
  "order_id": 42,
  "reason": "return",
  "reason_comment": "customer changed mind",
  "confirmed": true,
  "order_item_id": 99
}
```

- `reason`: `"return"` | `"waste"` | omitted (simple decrement)
- `confirmed`: boolean — whether item was sent to kitchen

#### POST `/api/orders/{tableId}/comment/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Body** | `{ "meal_id": 1, "comment": "no onion", "order_id": 42 }` |
| **Used by** | OrderDropdown |

#### POST `/api/orders/{tableId}/tranfer-order-items/`

> **Note:** Typo in URL — `tranfer` not `transfer`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Body** | See below |
| **Used by** | OrderDropdown |

```json
{
  "order_id": 42,
  "meal_id": 1,
  "quantity": 2,
  "target_table_id": 5,
  "transfer_comment": "moving to table 5",
  "order_item_id": 99
}
```

#### POST `/api/orders/{oldTableId}/change-table-for-order/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Body** | `{ "new_table_id": 5 }` |
| **Used by** | Actions |

#### POST `/api/orders/{tableId}/change-waitress/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Body** | `{ "new_waitress_id": 3 }` |
| **Used by** | Actions |

#### GET `/api/orders/list-waitress/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Response** | `[{ "id": number, "full_name": string }]` |
| **Used by** | Actions |

#### POST `/api/orders/{tableId}/print-check/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Body** | `null` |
| **Used by** | Actions ("Hesab Çeki") |

#### DELETE `/api/orders/{tableId}/print-check/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Used by** | Actions ("Çeki ləğv et") |

#### POST `/api/orders/{tableId}/join-tables-orders/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Body** | `{ "other_table_ids": [5, 7] }` |
| **Used by** | Actions ("Masanı birləşdir") |

#### POST `/api/orders/{orderId}/confirm/`

| | |
|---|---|
| **Auth** | `X-PIN`, `X-CSRFTOKEN` (broken — getter missing) |
| **Body** | `{}` |
| **Used by** | Actions ("Hazırla" — send to kitchen) |
| **Bug** | Actions passes `tableId`, not `orderId` |

---

### 7.4 Payments

#### POST `/api/payments/{tableId}/pay-orders/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Body** | See below |
| **Used by** | Actions ("Ödəniş" — close table / payment) |

```json
{
  "payment_methods": [
    { "payment_type": "cash", "amount": 50.00 },
    { "payment_type": "card", "amount": 30.00 },
    { "payment_type": "other", "amount": 0 }
  ],
  "paid_amount": 80.00,
  "discount_amount": 10.00,
  "discount_comment": "regular customer"
}
```

- `payment_type` values: `"cash"` | `"card"` | `"other"`
- Only payment types with amount > 0 are included in `payment_methods`
- On success: navigates back to floor plan

---

### 7.5 Meals / Menu

#### GET `/api/meals/groups/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Response** | `[{ "id": 1, "name": "Food", "categories": [{ "id": 2, "name": "Soups" }] }]` |
| **Used by** | Menu |

#### GET `/api/meals/meals/?meal_category_id={categoryId}`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Query param** | `meal_category_id` (optional — without it returns all meals) |
| **Response** | `[{ "id": 1, "name": "Borscht", "price": 5.00, "is_extra": false }]` |
| **Used by** | Menu |

#### GET `/api/meals/categories/`

| | |
|---|---|
| **Auth** | `X-PIN` |
| **Status** | **Defined in backend-services but NEVER called from UI** |

---

### API Endpoint Summary Table

| # | Method | Path | Component(s) |
|---|--------|------|----------------|
| 1 | POST | `/api/users/login/` | LoginView |
| 2 | GET | `/api/users/network-ip/` | LoginView |
| 3 | GET | `/api/tables/rooms/` | LoginView, MainView, Actions, OrderDropdown |
| 4 | GET | `/api/tables/{hallId}/tables/` | MainView, Actions, OrderDropdown |
| 5 | GET | `/api/tables/{tableId}/details` | MainOrderView, Actions, OrderItems |
| 6 | POST | `/api/orders/{tableId}/create/` | Menu, MainOrderView |
| 7 | GET | `/api/orders/{tableId}/list-orders/` | OrderItems, MainOrderView |
| 8 | GET | `/api/orders/{tableId}/list-order-items/` | OrderItems, OrderDropdown |
| 9 | POST | `/api/orders/{tableId}/add-order-item/` | Menu, OrderItems |
| 10 | DELETE | `/api/orders/{tableId}/delete-order-item/` | OrderItems, OrderDropdown |
| 11 | POST | `/api/orders/{tableId}/comment/` | OrderDropdown |
| 12 | POST | `/api/orders/{tableId}/tranfer-order-items/` | OrderDropdown |
| 13 | POST | `/api/orders/{tableId}/change-table-for-order/` | Actions |
| 14 | POST | `/api/orders/{tableId}/change-waitress/` | Actions |
| 15 | GET | `/api/orders/list-waitress/` | Actions |
| 16 | POST | `/api/orders/{tableId}/print-check/` | Actions |
| 17 | DELETE | `/api/orders/{tableId}/print-check/` | Actions |
| 18 | POST | `/api/orders/{tableId}/join-tables-orders/` | Actions |
| 19 | POST | `/api/orders/{orderId}/confirm/` | Actions |
| 20 | POST | `/api/payments/{tableId}/pay-orders/` | Actions |
| 21 | GET | `/api/meals/groups/` | Menu |
| 22 | GET | `/api/meals/meals/` | Menu |
| 23 | GET | `/api/meals/categories/` | *(unused)* |

---

## 8. Data Models (Expected JSON Shapes)

### Login response

```json
{
  "username": "1234",
  "role": "waitress",
  "full_name": "Aysel M."
}
```

### Hall / Room

```json
{
  "id": 1,
  "name": "Main Hall",
  "description": "Ground floor"
}
```

### Table (list item)

```json
{
  "id": 5,
  "number": "12",
  "waitress": { "id": 3, "name": "Aysel M." },
  "total_price": 45.50,
  "print_check": false,
  "serviceTax": 0
}
```

- `waitress.id === 0` means empty table
- `print_check: true` → table shows "check printed" state

### Table (details)

```json
{
  "number": "12",
  "waitress": { "name": "Aysel M." },
  "total_price": 45.50,
  "print_check": false,
  "status": "empty"
}
```

### Order

```json
{
  "pk": 42,
  "is_main": true
}
```

- One table can have multiple orders: one `is_main: true`, others sub-orders

### Order Item

```json
{
  "meal": { "id": 1, "name": "Borscht", "price": 5.00 },
  "quantity": 2,
  "order_item_id": 99,
  "confirmed": false,
  "comment": "no onion",
  "transfer_comment": null
}
```

- `confirmed: false` → waiting (hourglass icon)
- `confirmed: true` → sent to kitchen (check icon)
- `order_item_id === 0` → item not yet persisted (can increment)

### Meal Group

```json
{
  "id": 1,
  "name": "Yeməklər",
  "categories": [
    { "id": 2, "name": "Suplar" },
    { "id": 3, "name": "Salatlar" }
  ]
}
```

### Meal

```json
{
  "id": 10,
  "name": "Borscht",
  "price": 5.00,
  "is_extra": false
}
```

- `is_extra: true` → opens popup for custom description + price before adding

### Waitress

```json
{
  "id": 3,
  "full_name": "Aysel M."
}
```

---

## 9. Feature Modules & User Flows

### 9.1 Login Screen (`LoginView.vue`)

**UI elements:**
- QR code (left side on desktop) — links to frontend URL for mobile waiter login
- PIN input (disabled text field, shows dots)
- Numeric keypad 0–9
- "Təmizlə" (clear) and "Daxil ol" (login) buttons
- Auto-login when PIN reaches 4 digits

**Flow:**
```
Load page → GET network-ip → show QR
Enter PIN → POST login → store auth → GET rooms → redirect to /home/{firstRoom.id}
```

---

### 9.2 Floor Plan (`MainView.vue`)

**UI elements:**
- Header: role + full name, "Çıxış" (logout) button
- Grid of table cards showing: number, waitress name, total price
- Bottom bar: hall switcher (name + description)

**Table color states (CSS classes):**

| Class | Condition | Meaning |
|-------|-----------|---------|
| `occupied` | `table.waitress.name` exists | Table has waitress |
| `waitress-id-zero` | `waitress.id === 0` | Empty table |
| `waitress-id-not-zero` | occupied, no print_check | Active order |
| `check-printed` | `print_check === true` | Bill printed |
| `not-current-waitress` | waitress ≠ current user (waitress role) | Cannot click |

**Behavior:**
- Click table → navigate to order view
- Waitress role: can only click own tables
- Admin/restaurant: auto-refresh tables every **5 seconds**
- Switch hall → `GET /api/tables/{hallId}/tables/` + update URL

---

### 9.3 Order Screen Shell (`MainOrderView.vue`)

**Layout:**
- Collapsible header with: user info, table number, total price
- Action buttons: "Masalar" (back), "Çıxış" (logout)
- Admin action bar (`Actions.vue`)
- Split content: `OrderItems` (left) + `Menu` (right)
- Mobile (≤1024px): tab switcher "Sifarişlər" / "Menyu"

**On load:**
- Read `tableId` from route param `:id`
- `GET /api/tables/{tableId}/details` → show table number, waitress, total

---

### 9.4 Order Items (`OrderItems.vue` + `OrderDropdown.vue`)

**Structure:**
- Lists orders for table (main order + sub-orders)
- Each order expandable dropdown with line items
- Columns: Name, Quantity, Price, Total, Status

**Item actions (via OrderDropdown):**

| Action | Condition | API |
|--------|-----------|-----|
| Add comment | Item not confirmed | POST comment |
| Increment qty | `order_item_id === 0` | POST add-order-item |
| Decrement qty | Admin only, not confirmed | DELETE delete-order-item |
| Return/waste | Admin only, confirmed | DELETE with reason |
| Transfer to another table | Admin only, confirmed | POST tranfer-order-items |

**Event bus:**
- `selectedOrderId` → tells Menu which order to add items to
- `orderItemAdded` → refreshes table total price

---

### 9.5 Menu (`Menu.vue`)

**Navigation:**
1. Show meal groups (horizontal tabs)
2. Click group → show categories within group
3. Click category → `GET /api/meals/meals/?meal_category_id={id}`
4. Search filter (client-side, case-insensitive)

**Adding items:**
1. If no order exists → `POST /api/orders/{tableId}/create/` first
2. If `is_extra` meal → popup for description + price
3. `POST /api/orders/{tableId}/add-order-item/`
4. Emit `orderItemAdded` event

---

### 9.6 Admin Actions (`Actions.vue`)

**Action buttons (Azerbaijani labels):**

| ID | Label | Method | API |
|----|-------|--------|-----|
| 1 | Hesab Çeki | printOrder | POST print-check |
| 5 | Çeki ləğv et | cancelPrintOrder | DELETE print-check |
| 7 | Hazırla | confirmKitchen | POST confirm |
| 3 | Ödəniş | cancelOrder | POST pay-orders |
| 2 | Ofsianti dəyiş | changeWaitress | POST change-waitress |
| 4 | Masanı köçür | openTransferModal | POST change-table-for-order |
| 6 | Masanı birləşdir | openCombine | POST join-tables-orders |

**Modals:**
- **Payment:** split cash/card/other amounts, discount %, discount amount, discount comment, numpad
- **Transfer table:** select hall → select table → confirm
- **Combine tables:** select hall → select occupied table → confirm
- **Change waitress:** dropdown of waitresses → confirm

**Loading overlay:** `PrinterLoading.vue` shown during print and kitchen confirm.

---

## 10. Forms & User Input

### Login PIN

| Field | Type | Validation |
|-------|------|------------|
| PIN | 4-digit password | Non-empty, auto-submit at 4 chars |

### Customer count popup (`CustomerCountPopup.vue`)

| Field | Values | Sent to API? |
|-------|--------|--------------|
| Guest count | Buttons 1–10 | **No** — `createOrder` ignores it |

### Extra meal popup

| Field | API field |
|-------|-----------|
| Description | `description` |
| Price (AZN) | `price` |

### Order item comment

| Field | API field |
|-------|-----------|
| Custom note textarea | `comment` in POST comment |

### Transfer item modal

| Field | API field |
|-------|-----------|
| Hall select | — (loads tables) |
| Table select | `target_table_id` |
| Quantity | `quantity` |
| Comment | `transfer_comment` |

### Return/waste modal

| Field | Values | API field |
|-------|--------|-----------|
| Action | `return`, `waste` | `reason` |
| Message | text | `reason_comment` |
| Quantity | 1..max | `quantity` |

### Payment modal

| Field | API field |
|-------|-----------|
| Cash amount | `payment_methods[].amount` where `payment_type: "cash"` |
| Card amount | `payment_methods[].amount` where `payment_type: "card"` |
| Other amount | `payment_methods[].amount` where `payment_type: "other"` |
| Discount % | UI-only (calculates discount amount) |
| Discount amount | `discount_amount` |
| Discount comment | `discount_comment` |
| Total paid | `paid_amount` |

---

## 11. Role-Based UI Rules

### Floor plan table access

| Role | Can click |
|------|-----------|
| `waitress` | Only tables where `waitress.name === current user` OR empty tables |
| `captain_waitress` | Same as waitress |
| `admin`, `restaurant` | All tables |

### Action buttons visibility (`filteredActions`)

| Role | Visible actions |
|------|-----------------|
| `admin`, `restaurant` | All 7 actions |
| `waitress`, `captain_waitress` | Only "Hesab Çeki" (id=1) and "Hazırla" (id=7) |
| Other | None |

### Order item admin actions (`checkViewPermissionForAdmin`)

Only `admin` and `restaurant` roles can:
- Decrement confirmed items (return/waste)
- Transfer items between tables
- Decrement unconfirmed items

### Auto-refresh

Only `admin` and `restaurant` roles: poll `GET /api/tables/{hallId}/tables/` every 5 seconds on floor plan.

---

## 12. UI/UX Details

### Touch POS optimizations

- `disableZoom.js` — prevents pinch zoom
- Double-tap zoom disabled in `App.vue`
- On-screen numeric keypads (login, payment)
- `VirtualKeyboard.vue` — Azerbaijani layout for text search/comments
- Large touch targets, `touch-action: manipulation`

### Azerbaijani UI strings (key labels)

| Key | Translation |
|-----|-------------|
| Daxil ol | Login |
| Çıxış | Logout |
| Masalar | Tables |
| Sifarişlər | Orders |
| Menyu | Menu |
| Ödəniş | Payment |
| Hazırla | Prepare (send to kitchen) |
| Hesab Çeki | Print bill |
| Masanı köçür | Transfer table |
| Masanı birləşdir | Combine tables |
| Ofsianti dəyiş | Change waitress |
| Nagd / Kart / Diger | Cash / Card / Other |

### Visual design

- Primary green: `#4CAF50`
- Floor plan: background image with dark overlay
- Order screen: light gradient background
- Table states use color-coded borders/backgrounds
- Font: Avenir, Helvetica, Arial

### Assets referenced (may be in repo assets folder)

- `src/assets/login-back.jpg`
- `src/assets/restaurantBackgroundImage.jpeg`

---

## 13. Environment Configuration

From `.env.example` / `.env.template`:

```env
# Backend API
VUE_APP_API_HOST=127.0.0.1
VUE_APP_API_PORT=8000

# Frontend dev server
VUE_APP_FRONTEND_HOST=192.168.1.121
VUE_APP_FRONTEND_PORT=8080
```

Additional vars used in code (with defaults):

| Variable | Default | Used in |
|----------|---------|---------|
| `VUE_APP_API_PROTOCOL` | `http` | custom-axios.js |
| `VUE_APP_FRONTEND_PROTOCOL` | `http` | LoginView.vue (QR URL) |
| `BASE_URL` | `/` | router/index.js |

### vue.config.js dev server

```javascript
host: VUE_APP_FRONTEND_HOST || '192.168.1.121'
port: VUE_APP_FRONTEND_PORT || 8080
open: true
```

---

## 14. Known Frontend Bugs & Inconsistencies

Fix or preserve behavior during Django migration:

| Issue | Location | Details |
|-------|----------|---------|
| `fetchOrders()` undefined | MainOrderView.vue:258 | Calls non-existent method; should be `listOrders` |
| Customer count not sent | MainOrderView + backend-services | UI collects guest count but `createOrder` sends null body |
| CSRF token getter missing | backend-services.js:398 | `GET_CSRFTOKEN` not in auth getters |
| Confirm order ID mismatch | Actions.vue | Passes `tableId` to `/api/orders/{orderId}/confirm/` |
| Route param naming | router/index.js | `:tableId` is hall ID, `:id` is table ID |
| Typo in API path | backend-services.js | `tranfer-order-items` (missing 's') |
| `fetchMealCategories` unused | backend-services.js | Defined but never called |
| OrderService.js dead code | src/services/ | Incomplete, not imported |
| Logout doesn't clear localStorage | MainView, MainOrderView | Only clears Vuex; localStorage persists |
| Page reload on qty=0 | OrderItems.vue | `window.location.reload()` after decrement to 0 |

---

## 15. Django Migration Checklist

### Pages to implement

- [ ] **Login page** — PIN form, QR code, session creation
- [ ] **Floor plan page** — hall switcher, table grid, role-based click rules, optional 5s polling (HTMX or meta refresh)
- [ ] **Order page** — order items list, menu browser, action bar, all modals

### Auth

- [ ] Replace Vuex + localStorage with Django session
- [ ] Replace `X-PIN` header with session middleware (or keep both for API compat)
- [ ] Implement logout view that clears session
- [ ] Role checks in views/templates mirror frontend rules

### API integration options

**Option A — Server-rendered forms (recommended):**
- Django views handle POST/redirect for each action
- Templates use standard HTML forms with CSRF tokens
- No JavaScript required for core flows

**Option B — HTMX partial updates:**
- Keep SPA-like feel without Vue
- Partial template swaps for order items, table grid refresh

**Option C — Keep REST API, thin JS client:**
- Django serves HTML shell
- Minimal fetch/HTMX calls to existing `/api/*` endpoints

### Components to replicate

| Vue Component | Django equivalent |
|---------------|-------------------|
| LoginView | `login.html` + PIN keypad (JS widget or form) |
| MainView | `floor_plan.html` |
| MainOrderView | `order.html` base template |
| OrderItems | `order_items.html` partial |
| Menu | `menu.html` partial |
| Actions | `actions.html` partial + modals |
| VirtualKeyboard | Static JS widget or native inputs |
| ErrorPopup / SuccessPopup | Django messages framework |
| PrinterLoading | Loading spinner partial |

### Suggested Django app structure

```
restaurant/
├── templates/
│   ├── base.html
│   ├── login.html
│   ├── floor_plan.html
│   ├── order/
│   │   ├── detail.html
│   │   ├── _order_items.html
│   │   ├── _menu.html
│   │   ├── _actions.html
│   │   └── modals/
│   │       ├── payment.html
│   │       ├── transfer_table.html
│   │       ├── combine_tables.html
│   │       └── change_waitress.html
├── views/
│   ├── auth.py
│   ├── floor_plan.py
│   ├── order.py
│   └── actions.py
├── urls.py
└── middleware.py          # X-PIN or session auth
```

### Cross-cutting concerns

- [ ] CSRF on all POST forms (fix broken CSRF in Vue confirm)
- [ ] Touch-friendly CSS (reuse existing styles or port to static files)
- [ ] Mobile responsive layout (1024px breakpoint)
- [ ] QR code generation server-side (pass network IP in template context)
- [ ] Print check / kitchen confirm loading states
- [ ] Error/success flash messages

---

## Appendix: Inter-Component Events (EventBus)

Currently handled via `mitt` EventBus. In Django, replace with:

| Event | Current behavior | Django equivalent |
|-------|------------------|-----------------|
| `orderItemAdded` | Refresh table total, order items | Redirect or HTMX refresh |
| `selectedOrderId` | Menu knows which order to add to | Form hidden field or session |
| `order-confirmed` | Refresh order items | Redirect after kitchen confirm |

---

*Generated from Vue frontend source at `/Users/kamranhacili/Projects/frontend`. All API paths match `src/backend-services/backend-services.js`.*

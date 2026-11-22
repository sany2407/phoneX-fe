# phoneX — User Flows

## Flow 1: Guest browses and discovers a skin

```
Landing (/)
  └─ Sees hero → clicks "Find My Device"
       └─ Device finder scrolls into view
            ├─ [Search path] Types "iPhone 16" → sees results → clicks model
            │    └─ /devices/apple/iphone-16
            └─ [Dropdown path] Selects brand → selects model → clicks "Go"
                 └─ /devices/apple/iphone-16
                      └─ Browses compatible skins
                           └─ Clicks a skin card → /products/[slug]
                                └─ Selects finish → clicks "Add to cart"
                                     └─ Toast: "Added to cart" · Cart badge +1
                                          └─ Guest checkout (proceeds to sign in or continues as guest)
```

---

## Flow 2: New user registers and completes a purchase

```
Navbar → "Sign in" button
  └─ /login → clicks "Create an account"
       └─ /signup
            └─ Fills name, email, password → submits
                 └─ Account created → redirected to /account
                      └─ Navigates to /cart
                           └─ Items present (synced from guest session)
                                └─ Enters address details → applies coupon (optional)
                                     └─ Proceeds to payment → Razorpay opens
                                          ├─ Payment success → /orders/[id]?placed=1
                                          │    └─ Order confirmation shown
                                          └─ Payment cancelled → back to checkout, cart preserved
```

---

## Flow 3: Returning user tracks an order

```
Navbar → User icon → "My orders"
  └─ /orders (list)
       └─ Clicks an order
            └─ /orders/[id]
                 └─ Status timeline shown
                      (Confirmed → Designing → Printing → Packed → Shipped → Delivered)
                           └─ Shipping address shown
                                └─ Payment status shown (PAID / PENDING)
```

---

## Flow 4: Custom skin creation

```
Navbar → "Customize" link
  └─ /customize
       └─ Clicks "Mobile skin" row (or "Start with a phone" CTA)
            └─ /customize/phone-skin
                 └─ Studio loads — Step 1: Device picker
                      └─ Selects brand → selects model → confirms
                           └─ Step 2: Upload artwork
                                └─ Clicks "Upload image" → file picker opens
                                     └─ Image selected → composited onto customize.png mockup
                                          └─ Step 3: Pick finish (Matte, Glossy, Carbon etc.)
                                               └─ Price shown in summary
                                                    ├─ "Save design" → saved to account → /account/designs
                                                    └─ "Add to cart" → cart updated → /cart
```

---

## Flow 5: Guest adds to wishlist

```
Any product card
  └─ Clicks heart icon
       └─ Skin saved to local wishlist store (Zustand + localStorage)
            └─ Heart icon turns filled (primary blue)
                 └─ Wishlist count badge +1 in navbar
                      └─ Navbar heart → /wishlist
                           └─ All saved skins listed
                                └─ Clicking a card → product page
```

---

## Flow 6: Coupon discovery and application

```
Announcement marquee (top of page)
  └─ Shows active coupon codes scrolling (e.g. "10% off — use code WELCOME10")
       └─ User copies code (or sees it in /offers sidebar)
            └─ Goes to /cart
                 └─ Enters code in coupon field → clicks "Apply"
                      ├─ Valid   → discount applied, free shipping if applicable
                      └─ Invalid → error toast "Not a valid code"
```

---

## Flow 7: Admin manages products

```
/admin/login
  └─ Admin email + password → redirected to /admin
       └─ Dashboard (KPIs, charts, recent orders)
            └─ Sidebar → "Products"
                 └─ /admin/products
                      └─ Sees paginated product list
                           └─ Clicks "+ Add product"
                                └─ Modal: name, description, category, upload images (Cloudinary)
                                     └─ Create → product appears in list
                                          └─ Clicks "›" on product row to expand
                                               └─ Variant sub-table shown
                                                    └─ "Add variant" → modal
                                                         └─ Searches device model, sets SKU/price/stock
                                                              └─ Save → variant row appears
```

---

## Flow 8: Admin manages a device brand and models

```
/admin/devices
  └─ Sees 8 brands per page (paginated)
       └─ Type filter: All / Phones / Tablets / Laptops
            └─ Searches "Apple" → filtered to Apple only
                 └─ Expands Apple card → sees all models with type chips
                      └─ "Add model" → modal
                           └─ Name, slug, type (Phone/Tablet/Laptop) → Create
                                └─ Model appears in table immediately
```

---

## Flow 9: Admin moderates reviews

```
/admin/reviews
  └─ Sees list of pending reviews
       └─ Each review shows: star rating, title, body, author, date
            ├─ "Approve" → PATCH /admin/reviews/:id/approve → removed from list
            └─ "Reject"  → PATCH /admin/reviews/:id/reject  → removed from list
```

---

## Flow 10: Admin manages coupons

```
/admin/coupons
  └─ Sees active coupon list (code, type, value, validity period, usage count)
       └─ "+ Add coupon"
            └─ Modal: code, discountType (PERCENTAGE/FLAT/FREE_SHIPPING),
                      discountValue, minOrderValue, maxDiscount,
                      validFrom (date), validUntil (date), usageLimit
                 └─ Create → coupon appears in list
```

---

## Flow 11: Admin updates order status

```
/admin/orders
  └─ Filters by status (e.g. "Confirmed")
       └─ Finds order → clicks "Update"
            └─ Modal shows all statuses as radio buttons
                 └─ Selects "Printing" → save
                      └─ Order row updates to new status immediately
```

---

## Flow 12: Admin activates/deactivates a user

```
/admin/users
  └─ Paginated user list (name, email, role, order count, total spend, status)
       └─ Finds user → clicks "Deactivate"
            └─ PATCH /admin/users/:id/status { isActive: false }
                 └─ Status badge changes to "Inactive" immediately
```

---

## Critical Paths for Testing

| Priority | Flow | Why |
|---|---|---|
| P0 | Flow 2 (register → purchase) | Core revenue path |
| P0 | Flow 7 (admin create product + variant) | Store setup dependency |
| P1 | Flow 1 (browse → discover) | Primary acquisition path |
| P1 | Flow 4 (custom skin creation) | Differentiating feature |
| P1 | Flow 11 (order status update) | Ops workflow |
| P2 | Flow 6 (coupon application) | Conversion uplift |
| P2 | Flow 5 (wishlist) | Retention feature |
| P3 | Flows 8–10 (admin moderation) | Supporting ops |

---

## Edge Cases to Test

| Case | Expected Behaviour |
|---|---|
| Add to cart without login | Cart works locally; prompted to sign in at checkout |
| Duplicate email on signup | 400 error → "Email already in use" toast |
| Invalid coupon code | Error toast, no discount applied |
| Payment cancelled mid-flow | Order preserved, cart preserved, user returned to checkout |
| Admin login with customer credentials | Rejected with "Access denied" toast |
| `/devices/tablets` route | Renders Tablet Skins & Wraps page (not 404) |
| Image upload > 10 files | Backend enforces limit; frontend shows error toast |
| Out-of-stock variant | Cannot be added to cart |
| Expired coupon (`validUntil` in past) | Rejected at validation |
| Address without `name` field | Blocked; `name` required by backend Prisma schema |

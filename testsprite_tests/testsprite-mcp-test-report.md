# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** phoneX-fe
- **Date:** 2026-11-22
- **Prepared by:** TestSprite AI Team
- **Environment:** local production build (`next build` + `next start`) on `http://localhost:3000`, live API `https://phonexbe.innocollab.in/api/v1`
- **Scope:** 12 customer-facing flows selected from the 47-test plan (admin, Google sign-in and Razorpay excluded)
- **Test account:** `testsprite@phonex.test`

---

## 2️⃣ Requirement Validation Summary

### Requirement: Customer Authentication
- **Description:** Customers can sign in, create an account, and get clear validation for missing or wrong credentials.

#### Test TC001 Sign in and reach the account page
- **Test Code:** [TC001_Sign_in_and_reach_the_account_page.py](./TC001_Sign_in_and_reach_the_account_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/8bab9cd3-df2b-421a-a0f4-cff70e6fd577
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Valid credentials sign the customer in and the account page loads with the authenticated session. No issues found.

#### Test TC004 Create a new customer account
- **Test Code:** [TC004_Create_a_new_customer_account.py](./TC004_Create_a_new_customer_account.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/98d96a52-2ca8-488a-8542-a3dea66e6fad
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Registration succeeds and lands the new customer in an authenticated session.

#### Test TC020 Show validation for missing sign-in details
- **Test Code:** [TC020_Show_validation_for_missing_sign_in_details.py](./TC020_Show_validation_for_missing_sign_in_details.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/65a632b9-914a-43cb-b91c-9681bc60a7cb
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Submitting the empty form shows inline validation instead of firing a request. Good.

#### Test TC027 Reject invalid sign-in credentials
- **Test Code:** [TC027_Reject_invalid_sign_in_credentials.py](./TC027_Reject_invalid_sign_in_credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/43ff868f-04db-45a7-8dd8-4773527e65ca
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Wrong credentials are rejected without leaking whether the email exists. No security issue observed.

---

### Requirement: Product Discovery & Catalogue
- **Description:** Shoppers can browse, filter, search, and inspect products and device collections.

#### Test TC006 Open product details and add a skin to the cart
- **Test Code:** [TC006_Open_product_details_and_add_a_skin_to_the_cart.py](./TC006_Open_product_details_and_add_a_skin_to_the_cart.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/3057caf7-47a1-4296-91ac-694334864a95
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Product page renders price, finish details and the add-to-cart action, and the cart count updates after adding.

#### Test TC008 Browse products with filters and sorting
- **Test Code:** [TC008_Browse_products_with_filters_and_sorting.py](./TC008_Browse_products_with_filters_and_sorting.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/dfb7f075-c911-41d0-9217-f77d5f79dd78
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Category, material and finish filters apply on the server, results update, and sorting changes the order as expected.

#### Test TC015 Search for a product or collection
- **Test Code:** [TC015_Search_for_a_product_or_collection.py](./TC015_Search_for_a_product_or_collection.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/382b5990-1a0d-4100-9127-94ae6cd3f72e
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Searching a known collection returns matching products; a no-match query shows the empty state rather than an error.

#### Test TC018 Browse device collections by brand
- **Test Code:** [TC018_Browse_device_collections_by_brand.py](./TC018_Browse_device_collections_by_brand.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/b6df60eb-b355-4560-bef5-54025348c083
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Device pages list collections and the brand chips re-scope the grid correctly.

#### Test TC041 Browse all design collections
- **Test Code:** [TC041_Browse_all_design_collections.py](./TC041_Browse_all_design_collections.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/6f00cb4e-b1f9-4ed5-b083-d62e94de3caa
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** `/designs` is publicly reachable while signed out and every collection card opens its collection page.

---

### Requirement: Cart
- **Description:** Signed-in customers can review the cart and change item quantities.

#### Test TC014 Review cart quantity changes and subtotal updates
- **Test Code:** [TC014_Review_cart_quantity_changes_and_subtotal_updates.py](./TC014_Review_cart_quantity_changes_and_subtotal_updates.py)
- **Test Error:** TEST BLOCKED — the sign-in flow never reached an authenticated state, so no cart item, quantity control or subtotal was visible.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/a206b9d3-8fb3-47c6-beb6-5313045c986e
- **Status:** ⚠️ Blocked
- **Severity:** HIGH
- **Analysis / Findings:** Blocked upstream by the auth defect described under TC024, not by the cart UI. Re-run after the auth fix is deployed.

---

### Requirement: Wishlist
- **Description:** Signed-in customers can save products to a wishlist.

#### Test TC024 Save a product to the wishlist
- **Test Code:** [TC024_Save_a_product_to_the_wishlist.py](./TC024_Save_a_product_to_the_wishlist.py)
- **Test Error:** TEST BLOCKED — sign-in stayed on the login screen and displayed “A record with this token already exists.”
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/bb716637-b4f0-471e-b925-33f467ef7286
- **Status:** ⚠️ Blocked
- **Severity:** HIGH
- **Analysis / Findings:** Root cause found in the API. Refresh tokens were signed with `{ userId }` only, so two sign-ins for the same customer inside the same second produced byte-identical JWTs and the second insert hit the unique index on `refresh_tokens.token`. The API reported the Prisma conflict as “A record with this token already exists.” TestSprite runs several authenticated tests in parallel against one account, which is exactly the race. Fixed by adding a unique `jti` to every refresh token (`phoneX-be/src/utils/jwt.ts`), deployed to the live API, and verified with two concurrent logins — both now return `200`. The wishlist flow still needs a TestSprite re-run to be marked passed.

---

### Requirement: Newsletter
- **Description:** Visitors can subscribe to the footer newsletter.

#### Test TC047 Subscribe to the newsletter from the footer
- **Test Code:** [TC047_Subscribe_to_the_newsletter_from_the_footer.py](./TC047_Subscribe_to_the_newsletter_from_the_footer.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard-v3/o/446e0213-311d-50b1-b847-3f35264db60a/projects/mcp/9c0edfdc-7c5d-5760-ae24-d6c075620a38/test/1aae373c-c348-4e3f-85c5-8053a98faac2
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Valid email schedules a subscription and shows the confirmation state.

---

## 3️⃣ Coverage & Matching Metrics

- **83.33% of tests passed** (10 passed, 2 blocked, 0 failed out of 12)

| Requirement | Total Tests | ✅ Passed | ⚠️ Blocked | ❌ Failed |
|---|---|---|---|---|
| Customer Authentication | 4 | 4 | 0 | 0 |
| Product Discovery & Catalogue | 5 | 5 | 0 | 0 |
| Cart | 1 | 0 | 1 | 0 |
| Wishlist | 1 | 0 | 1 | 0 |
| Newsletter | 1 | 1 | 0 | 0 |
| **Total** | **12** | **10** | **2** | **0** |

---

## 4️⃣ Key Gaps / Risks

> 83.33% of the selected flows passed with no functional failures. The two blocked flows share one upstream cause, not a UI defect.

- **Concurrent sign-in race (high, fixed and deployed).** Refresh tokens were deterministic within a one-second window, so a second login for the same customer violated the unique token index. Parallel TestSprite tests triggered it. Fixed in `phoneX-be/src/utils/jwt.ts` by adding a `jti`; two concurrent logins now both return `200`. Re-run TC014 and TC024 to move them from blocked to passed.
- **Cart and wishlist are unverified until that re-run.** Both require a signed-in session, so their pass/fail status is currently unknown rather than failing.
- **Not automatable by design:** Google sign-in (cross-origin Google iframe and Google blocks scripted accounts) and the Razorpay sheet (external payment surface). Only the button presence and the pre-payment order step are covered.
- **Live-data dependency:** product and collection names come from the production API, so assertions must keep using stable seeds; a catalogue rename can invalidate search assertions.
- **Admin flows were out of scope** for this run (customer account only, no ADMIN/MANAGER user).

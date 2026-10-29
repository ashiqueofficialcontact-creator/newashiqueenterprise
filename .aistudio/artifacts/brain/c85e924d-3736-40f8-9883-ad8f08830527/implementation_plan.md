# New Ashique Enterprise - Mobile Experience & Management Overhaul

Comprehensive blueprint for refining and elevating the New Ashique Enterprise RO Water Purifier & Plant management system into a fast, touch-optimized, and gesture-friendly mobile application.

---

> [!IMPORTANT]
> **User Confirmed Decisions from Clarification Phase:**
> 1. **Role Switcher Location & Style**: Prominent badge button placed in the top-right header adjacent to the business name, with an intuitive lock icon and live mode text ("গেস্ট মোড" / "ওনার মোড").
> 2. **WhatsApp Order & Quotation Format**: Formatted itemized list with product names, ordered quantities, individual rates, and an estimated total sum sent directly to New Ashique Enterprise (9563340244).

---

## 1. Overview & Core Concept

- **What It Does**: A mobile-first retail and wholesale RO purification hardware catalog and business management tool for New Ashique Enterprise (Kaliachak, Malda). Customers can browse wholesale/retail catalogs, assemble instant orders, and dispatch formatted WhatsApp inquiries. The shop owner can manage stock, unlock private margins via 4-digit PIN, toggle wholesale visibility, and review profit metrics.
- **Target Audience / Persona**:
  - **Retail & Wholesale Customers**: Technicians, plant installers, and households ordering water purifier filters, membrane housings, pumps, and commercial plants.
  - **Shop Owner (New Ashique Enterprise)**: Quick inventory tracking, customer approval management, wholesale price hiding/unhiding, and compact profit calculations on an Android smartphone.
- **Key Value**: Native app feel with zero browser scroll interference, ultra-smooth page swiping, instant 4-digit PIN auto-entry, and one-tap order generation for WhatsApp.

---

## 2. User Experience & Visual Design

### Key Layout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  NEW ASHIQUE ENTERPRISE              [ 🔒 ওনার মোড / গেস্ট ] │  <-- Top-Right Role Badge
│  ISO Quality RO Spare Parts & Commercial Plants            │  <-- Clean single-layer tagline
├─────────────────────────────────────────────────────────────┤
│  [ 📞 9563340244 ]  [ 📋 নাম্বার কপি ]  [ 📍 শপ লোকেশন ]     │  <-- Enhanced Action Bar
│  [ ↗ শপ শেয়ার ]                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   PRODUCT CARD DETAIL                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 100 GPD Booster Pump                                  │  │
│  ├───────────────────────────────────────────────────────┤  │  <-- Clean Dividing Border
│  │ খুচরা মূল্য: ₹1,650      পাইকারি: ₹1,250                │  │
│  │ [ - 1 + ]  [ + কার্টে যোগ করুন ]                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│   (Touch Swipe Left / Right to switch views effortlessly)   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│         ┌───────────────────────────────────────┐           │
│         │  🏠 হোম   🏷️ হোলসেল   🛍️ রিটেইল   ⚙️ আরও  │           │  <-- Elevated Floating Bar
│         └───────────────────────────────────────┘           │      (Safe from Android buttons)
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme
- **Color Palette**:
  - Dominant Neutral Canvas: `#F8FAFC` (Slate-50) & `#FFFFFF` (White cards).
  - Primary Brand & Accent: Emerald `#059669` (Wholesale active & primary WhatsApp links), Deep Teal `#0F766E`, and Classic Slate `#0F172A`.
  - Accent Alerts: Amber `#D97706` (Pending approval) and Rose `#E11D48` (Low stock / Deactivated).
- **Typography & Formatting**:
  - Display & Headings: `Plus Jakarta Sans`, SemiBold/Bold, high contrast for outdoor mobile readability.
  - Numerals & Currency: `font-mono tabular-nums` for prices, quantities, and profit tables.
  - Bengali labels: Natural, clear phrasing without robotic jargon.
- **Micro-Interactions & Gestures**:
  - **Swipe Navigation**: Fine-tuned touch threshold (`deltaX > 45px` with horizontal dominance check) providing smooth transitions between Home, Wholesale, Retail, and Management views.
  - **Zero Pull-to-Refresh**: Global CSS `overscroll-behavior-y: contain` and `overscroll-behavior-y: none` on mobile root containers prevents unintended page reloads when scrolling lists.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Role Switcher Relocation
- **Chosen Approach**: Relocate the Owner/Guest toggle from the awkward top-left corner to a prominent badge button at the top-right of the header card, directly opposite the business name.
- **Why**: Natural thumb reach on right hand, prominent visual indicator of current operating mode, and frees up the left zone for clean branding.

### Decision 2: Elimination of Pull-to-Refresh Reloads & In-UI Refresh
- **Chosen Approach**: Inject `overscroll-behavior-y: none` in `index.html` and `src/index.css` to disable Android Chrome pull-to-refresh gestures. Add explicit in-app "রিফ্রেশ" (Sync) buttons inside Wholesale and Approvals headers.
- **Why**: Mobile web users pulling down on a scrollable catalog or approvals list frequently trigger accidental browser reloads, resetting state. Dedicated in-UI buttons give predictable, instant data sync.

### Decision 3: Bottom Navigation Safe Clearance
- **Chosen Approach**: Elevate the floating navigation bar to `bottom-9 sm:bottom-10` with substantial content bottom padding (`pb-44`).
- **Why**: Prevents Android 3-button navigation bars and gesture pill handles from intercepting taps on the Wholesale or Retail navigation icons.

### Decision 4: Add Product Form Simplification
- **Chosen Approach**: Remove the mandatory Category selector. Convert price input states to allow completely empty inputs (no sticky initial `0`).
- **Why**: Eliminates typing frustration where users had to backspace past `0` before typing `1500`.

### Decision 5: Compact Vertical Profit Statement
- **Chosen Approach**: Strip unnecessary horizontal columns (salaries, multiple date filters) into a compact vertical card/table displaying strictly:
  - Product Name (`নাম`)
  - Purchase Cost (`ক্রয় মূল্য`)
  - Retail Price (`বিক্রয় মূল্য`)
  - Net Profit (`মুনাফা`)
  - Profit Margin (`লাভের হার %`)
- **Why**: Eliminates awkward horizontal scrolling on narrow smartphone screens.

### Decision 6: Instant 4-Digit Owner PIN Verification
- **Chosen Approach**: The PIN input automatically validates on the 4th digit. If correct, it unlocks Owner Mode instantly and redirects directly to the Home Dashboard without requiring a secondary "Submit" tap.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       State Storage                         │
│       localStorage ('new_ashique_products_v3', etc.)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│     Guest Session     │             │     Owner Session     │
│   - Retail catalog    │             │   - Full Wholesale    │
│   - Wholesale status  │             │   - Profit Desk       │
│   - WhatsApp Order    │             │   - Approvals Hub     │
│   - Shop Contact/Map  │             │   - Add/Edit Products │
└───────────┬───────────┘             └───────────┬───────────┘
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Mobile Presentation Layer                   │
│  - Header (Top-Right Role Badge, Shop Action Bar)           │
│  - Swipe Controller (touchStart / touchEnd with 45px delta) │
│  - Catalogs (WholesaleView, RetailView with item dividers)  │
│  - Modals (ProductFormModal, PinModal with auto-unlock)     │
│  - Elevated BottomNav (bottom-9, z-40)                      │
└─────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

| Target Area | Core Changes | Handlers / State Transitions |
| :--- | :--- | :--- |
| **`index.html` & `index.css`** | Add `overscroll-behavior-y: none;` on `html, body, #root` | Completely suppresses pull-to-refresh on mobile WebViews/browsers. |
| **`src/components/Header.tsx`** | Top-right badge button for Mode Switch; Shop Action Bar with Copy Phone, Share Shop Info, Direct Google Maps pin link | `handleCopyPhone` (with copy feedback toast), `handleShareShop` (Web Share API fallback to clipboard), Maps link to `https://maps.google.com/?q=New+Ashique+Enterprise+Kaliachak+Malda`. |
| **`src/App.tsx`** | Calibrate swipe thresholds; auto-PIN navigation to Home; increased bottom padding `pb-44` | `handleTouchStart`, `handleTouchEnd` with horizontal velocity ratio checking to keep swipes smooth without stutter. |
| **`src/components/BottomNav.tsx`** | Elevate bar placement to `bottom-9 sm:bottom-10` | Higher bottom offset ensures zero overlap with Android system back/home/apps navigation. |
| **`src/components/ProductFormModal.tsx`** | Remove category input; convert price states to handle blank strings cleanly | Initial values empty string `""`; eliminates stuck `0` on backspace. |
| **`src/components/PinModal.tsx`** | Auto-submit trigger upon typing 4 digits | `onChange`: when length === 4, invoke `onVerify(pin)`. Redirects to Home upon success. |
| **`src/components/WholesaleApprovalsView.tsx`** | Single consolidated customer list; clear "অ্যাক্টিভ" / "ডিঅ্যাক্টিভ" status badges; in-UI sync button | Direct status toggle with real-time feedback; in-app delete modal without `window.confirm`. |
| **`src/components/OwnerProfitDesk.tsx`** | Compact 5-column vertical table: Product, Purchase, Retail, Profit, Margin % | Zero horizontal overflow; clean card design optimized for 360px–430px mobile screens. |
| **`src/components/RetailView.tsx` & `WholesaleView.tsx`** | Card divider between title and price; item selection checkbox/quantity picker with WhatsApp Order Generator | Formats order message with items, quantities, and total estimate to `9563340244`. In-UI refresh button. |

---

## 5. Verification Plan

1. **Compilation & Linting**: Run `lint_applet` and `compile_applet` to ensure zero TypeScript errors or missing imports.
2. **Gesture & Mobile Testing**:
   - Verify swipe gestures navigate between Home, Wholesale, Retail, and More views with fluid transitions.
   - Verify that pulling down anywhere on the screen does not reload the page.
3. **Owner Mode & PIN Verification**:
   - Verify typing 4 digits in PIN modal automatically unlocks Owner Mode and lands on Home.
   - Verify switching back to Guest Mode cleans up active states.
4. **Form Usability**:
   - Verify "Add Product" opens with blank price fields and no Category field.
5. **Shop Actions**:
   - Verify "নাম্বার কপি" copies `9563340244` to clipboard with visual toast.
   - Verify "শপ লোকেশন" opens Google Maps query for New Ashique Enterprise Kaliachak Malda.
   - Verify "শপ শেয়ার" shares the business details.

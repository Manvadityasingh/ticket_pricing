# Reasoning behind the solution

## 1. Problem framing

The booking system needed to behave like a real multiplex counter, not just a simple static page. The main pain points were:

- ticket classes had different prices
- some classes sold out for certain showtimes
- discounts had to be applied correctly
- taxes and convenience fees had to be included
- totals needed to be exact to the paisa
- customers needed to see a clear bill breakdown
- a real booking flow needed seats, customer data, and a receipt view

The app therefore needed a single source of truth for pricing and booking state, plus a clear UI for selection and receipt output.

## 2. Design approach

I used a simple frontend architecture because the requirement was a prototype, not a production backend system. That kept the project lightweight and easy to run locally while still covering the critical booking logic.

The solution separates concerns into:

- data definitions for movie/showtime, seats, and tiers
- UI rendering for seat map, bill summary, and forms
- pricing calculation logic
- cleanup logic for messy imported seat-class lists
- receipt generation for printing

## 3. Why use paise internally

A common issue in billing systems is floating-point inaccuracy. If you store prices in rupees using decimals, totals can drift by a few paise.

To avoid this, the app stores all money values in paise internally and converts only at the final display step. This makes the arithmetic exact and predictable. It is especially important when GST and convenience fees are added together.

## 4. Tier and inventory logic

Each seat type is mapped to a tier, and each tier has a defined price. A showtime then has a limited set of available seats. This means the system can:

- mark sold-out tiers as unavailable
- stop users from selecting booked seats
- keep the selected ticket count in sync with the seat map
- accurately compute the invoice based on the exact selected seats

This keeps the booking experience realistic while still being manageable in a frontend-only app.

## 5. Discount and tax calculation

The app applies calculations in a controlled order:

1. compute base ticket subtotal
2. apply member discount
3. apply festival flat discount
4. add convenience fee by ticket count
5. add GST to the chargeable value
6. compute final total

This mirrors normal pricing logic and ensures the invoice breakdown is transparent.

## 6. Seat map and customer flow

The seat map makes the selection process more natural by showing real seats instead of just counters. The system tracks selected seats and groups them by tier.

Once the user enters customer details and confirms the booking, the app generates a receipt from the current state. This helps simulate a real check-out and gives the user a final record to print.

## 7. Cleaning imported seat-class data

The messy import feature was added because real-world pricing data is rarely clean. In production, CSV or spreadsheet exports often include:

- duplicate names with different casing
- values with currency symbols or commas
- blank values
- negatives
- invalid entries

The app cleans this by:

- trimming whitespace
- normalizing class names to a common form
- removing duplicates after normalization
- rejecting empty, invalid, or non-positive prices
- reporting what was imported, deduplicated, and rejected

This makes the pricing source reasonable before it is used in calculations.

## 8. Why a simple UI was chosen

A static browser app is enough for this use case because the goal was to model the booking flow and the pricing rules clearly. It keeps the code easy to read and helps demonstrate the logic without the overhead of a backend, database, or package-heavy framework.

The result is a working prototype that can be extended later with features such as:

- API-backed inventory
- persistent booking records
- real payment gateway integration
- multi-page checkout
- PDF or email receipts

## 9. Summary

The solution balances realism and simplicity. It models the important business logic of cinema booking, keeps pricing exact, makes the customer bill easy to understand, and includes a cleaning layer for messy data imports. That makes it useful as both a demonstration project and a foundation for a fuller booking system.

# CineMax Booking Counter

A lightweight multiplex booking interface for managing seat selection, pricing, discounts, and customer checkout in a single-page web app.

## What this project does

This app lets a customer:
- choose a movie showtime
- select seats from a seat map
- choose ticket classes such as Silver, Gold, and Recliner
- apply festival and member discounts
- view a live line-by-line bill breakdown
- enter customer details
- confirm a booking and print a receipt

It is designed to simulate a real cinema booking counter with pricing and validation logic, while keeping the project simple and easy to run locally.

## Tech stack

This project uses:
- HTML5 for structure
- CSS3 for layout and styling
- Vanilla JavaScript for app logic and DOM updates
- No framework or backend required for the current version

This makes it a straightforward static web app that can run in any browser without extra setup.

## Features included

- Showtime-based seat availability
- Sold-out tier handling
- Tier pricing for Silver / Gold / Recliner
- Festival flat discount
- Member percentage discount
- Convenience fee per ticket
- GST calculation
- Exact paisa-safe pricing logic to avoid rounding issues
- Seat map selection with booked and selected seats
- Customer details form
- Confirmation message and print-ready receipt
- Import cleanup for messy seat-class pricing data

## Project structure

- `index.html` – main page layout
- `styles.css` – styling and print layout
- `app.js` – booking logic, pricing logic, seat mapping, cleanup rules, and receipt generation

## How the pricing works

The app calculates costs using paise internally, which prevents floating-point rounding errors. The following rules are applied:

- base ticket amount for selected seats
- member discount percentage on ticket subtotal
- festival flat discount
- per-ticket convenience fee
- GST on the chargeable amount
- final total displayed in INR

The bill summary shows each component clearly so a customer can understand exactly what they are paying for.

## How to run

From the project folder, start a local static server:

```bash
cd /workspaces/index
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Example use case

A user can:
1. pick a showtime
2. select seats from the screen layout
3. choose any applicable discounts
4. review the ticket summary
5. enter booking details
6. confirm the booking
7. print the receipt

## Notes

This is a frontend demo and does not connect to a database or payment gateway. It is intended as a usable prototype for cinema booking flows and pricing logic.

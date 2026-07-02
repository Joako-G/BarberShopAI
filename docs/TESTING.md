# Testing — BarberShop MVP

## Automated tests

Run every command with `pnpm`.

Backend:

```bash
cd Backend
pnpm test:run
pnpm test:typecheck
pnpm test:coverage
```

Frontend:

```bash
cd Frontend/barber-client
pnpm test:run
pnpm test:coverage
```

The automated suite uses mocks and does not write data to Supabase.

## Manual pre-release checklist

Use a dedicated testing date and test phone number. Remove or cancel test
appointments after verification.

### Public booking

- [ ] `/` redirects to `/reservar`.
- [ ] Booking is accessible without login.
- [ ] Only active services are displayed.
- [ ] Selecting a service and date loads available slots.
- [ ] Past dates, malformed phone numbers and invalid emails are rejected.
- [ ] A valid booking is created as `pending`.
- [ ] Reusing the same phone does not duplicate the customer.
- [ ] Formatted and unformatted versions of the same phone reuse one customer.
- [ ] Two concurrent requests with the same new phone create only one customer.
- [ ] A rejected booking does not leave a newly created customer without appointments.
- [ ] Two requests for the same slot produce one success and one `409`.
- [ ] Two truly concurrent requests for the same slot create only one appointment.
- [ ] The confirmation screen shows service, date, time and pending status.
- [ ] Mobile layout works at 320–390 px without horizontal scrolling.

### Authentication and authorization

- [ ] Invalid login credentials show a clear error.
- [ ] `/appointments`, `/customers`, `/services/admin`, `/settings` return `401` without token.
- [ ] `/api/settings/general` returns `401` without token.
- [ ] `/profiles` and `/profiles/:id` return `401` without token.
- [ ] Admin routes work with a valid admin token.
- [ ] Logging out prevents access to private pages.
- [ ] An expired token shows an error and does not expose protected data.
- [ ] An authenticated `401` clears the persisted session and redirects to login.
- [ ] Invalid login credentials do not trigger the expired-session message.

### Admin appointments

- [ ] Opening Turnos initially lists today's appointments.
- [ ] "Today" matches `America/Argentina/Buenos_Aires` near UTC midnight.
- [ ] Filters work by date, status and customer name/phone.
- [ ] Admin creation with an existing customer creates `confirmed`.
- [ ] Admin creation with a new phone creates a customer and a confirmed appointment.
- [ ] Admin creation with an existing phone reuses the customer.
- [ ] Duration and buffer produce the expected `end_time`.
- [ ] Overlapping `pending` and `confirmed` appointments are rejected.
- [ ] `cancelled`, `completed` and `no_show` appointments free their slot.
- [ ] Editing service/date/time recalculates `end_time`.
- [ ] Editing ignores the current appointment in conflict validation.
- [ ] A concurrent create or edit cannot claim the same active time range.
- [ ] Final appointments cannot be edited.

### Status transitions

- [ ] `pending` can be confirmed or cancelled.
- [ ] `confirmed` can be cancelled, completed or marked `no_show`.
- [ ] `no_show` cannot be applied from `pending`.
- [ ] `completed`, `cancelled` and `no_show` cannot transition again.
- [ ] Two simultaneous status actions result in one valid transition and one `422`.

### Customers

- [ ] Customer list loads only for admin.
- [ ] Create and edit validate required fields.
- [ ] Duplicate phone handling is clear and does not create duplicates.
- [ ] Editing a customer with another customer's phone returns `409`.

### Services

- [ ] Public `GET /api/services` returns only active services.
- [ ] Admin `GET /api/services/admin` returns active and inactive services.
- [ ] Creating a service uses database defaults for `is_active` and `buffer_minutes`.
- [ ] Editing a service preserves fields not included in the form.
- [ ] Deactivating a service removes it from public booking.
- [ ] Inactive services cannot be used to create new appointments.

### Settings

- [ ] `/settings` is only accessible to an authenticated admin.
- [ ] The form loads the current business settings.
- [ ] Required fields show validation errors.
- [ ] Invalid email shows a validation error.
- [ ] Saving changes persists them in Supabase.
- [ ] Reloading the panel keeps the saved values.
- [ ] `system_name` is visible in the sidebar, header and dashboard.
- [ ] Empty optional fields are stored and rendered consistently.
- [ ] Working-hour logic remains unchanged.

### Regression and quality

- [ ] `pnpm lint` passes in the frontend.
- [ ] `pnpm build` passes in backend and frontend.
- [ ] No tokens, passwords or service-role keys appear in logs.
- [ ] `APP_TIMEZONE` and `VITE_APP_TIMEZONE` use the same IANA time zone.
- [ ] Loading, empty, error and success states are visible and readable.

### CORS and rate limiting

- [ ] Localhost works during development on different Vite ports.
- [ ] `127.0.0.1` works during development.
- [ ] Production rejects origins not listed in `ALLOWED_ORIGINS`.
- [ ] Requests without `Origin`, such as curl or server-to-server calls, work.
- [ ] Six failed login attempts inside the configured window return `429`.
- [ ] Successful logins do not consume the failed-login limit.
- [ ] Exceeding the public booking limit returns the standard API error with `429`.
- [ ] Admin routes and availability queries remain unaffected.

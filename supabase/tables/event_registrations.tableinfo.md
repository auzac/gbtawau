# event_registrations

Tracks public registrations for specific events.

## Columns

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | gen_random_uuid() | Primary key |
| event_id | uuid | no | — | FK → events(id) |
| name | text | no | — | Attendee full name |
| email | text | no | — | Attendee email |
| phone | text | yes | — | Optional contact number |
| fields | jsonb | yes | '{}' | Custom field answers per event (e.g. t-shirt size, dietary restrictions) |
| submitted_at | timestamptz | no | now() | When the registration was submitted |

## Indexes

- `idx_event_registrations_event_id` on `event_id` — for looking up who registered for an event

## Relations

- Many-to-one to `events` via `event_id`

## Notes

- `fields` jsonb keeps the schema stable when different events need different extra fields. Validate on insert at the application layer since Supabase doesn't enforce jsonb shape.

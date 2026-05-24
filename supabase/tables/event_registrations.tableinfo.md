# event_registrations

Tracks public registrations for special events (camps, conferences, one-off gatherings).

## Columns

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | gen_random_uuid() | Primary key |
| special_event_id | uuid | no | — | FK → special_events(id) |
| name | text | no | — | Attendee full name |
| email | text | no | — | Attendee email |
| phone | text | yes | — | Optional contact number |
| fields | jsonb | yes | '{}' | Custom field answers per event (e.g. t-shirt size, dietary restrictions) |
| submitted_at | timestamptz | no | now() | When the registration was submitted |

## Indexes

- `idx_event_registrations_event` on `special_event_id`

## Relations

- Many-to-one to `special_events` via `special_event_id`

## Notes

- `fields` jsonb keeps the schema stable when different events need different extra fields. Validate on insert at the application layer since Supabase doesn't enforce jsonb shape.

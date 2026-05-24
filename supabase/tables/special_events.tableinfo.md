# special_events

One-off or quarterly events: camps, conferences, retreats, etc. Distinct from the weekly `events` table used for church scheduling.

## Columns

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | gen_random_uuid() | Primary key |
| title_en | text | no | — | Public title (English) |
| title_bm | text | yes | — | Public title (Bahasa Malaysia) |
| description_en | text | yes | — | Event details (English) |
| description_bm | text | yes | — | Event details (Bahasa Malaysia) |
| start_date | date | no | — | Event start |
| end_date | date | yes | — | Null = single-day event |
| location | text | yes | — | Venue or online link |
| max_attendees | int | yes | null | Null = unlimited |
| image_url | text | yes | — | Hero image for the event card |
| published | boolean | no | false | Controls public visibility |
| created_at | timestamptz | no | now() | |
| updated_at | timestamptz | no | now() | |

## Indexes

- `idx_special_events_published` on `published` — filter published events for the public site
- `idx_special_events_dates` on `start_date` — ordering upcoming events

## Relations

- One-to-many to `event_registrations` via `special_event_id`

## Notes

- Separate from the `events` table, which is for weekly church scheduling (services, cell groups, etc.)
- Staff manage these through a dedicated section in the staff portal
- Registration form on the public site reads from `published = true` and `start_date >= today`

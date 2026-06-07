alter table public.subscriptions
  add column if not exists authorization_url text,
  add column if not exists access_code text,
  add column if not exists initialization_started_at timestamptz,
  add column if not exists initialized_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists last_error text;

create index if not exists subscriptions_pending_lookup_idx
  on public.subscriptions (photographer_id, pricing_plan_id, created_at desc)
  where status = 'pending';

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  reference text,
  event_type text not null,
  status text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_events_subscription_idx
  on public.payment_events (subscription_id, created_at desc);

create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.payment_events enable row level security;
alter table public.rate_limit_buckets enable row level security;

drop policy if exists "Admin payment events" on public.payment_events;
create policy "Admin payment events"
  on public.payment_events
  for select
  using (public.current_role() = 'admin');

create or replace function public.consume_rate_limit(
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  if p_bucket_key is null or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.rate_limit_buckets (
    bucket_key,
    window_started_at,
    request_count,
    updated_at
  )
  values (p_bucket_key, now(), 1, now())
  on conflict (bucket_key) do update
  set
    window_started_at = case
      when public.rate_limit_buckets.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then now()
      else public.rate_limit_buckets.window_started_at
    end,
    request_count = case
      when public.rate_limit_buckets.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then 1
      else public.rate_limit_buckets.request_count + 1
    end,
    updated_at = now()
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

create or replace function public.activate_subscription_payment(
  p_reference text,
  p_amount_minor bigint,
  p_currency text,
  p_channel text,
  p_source text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  subscription_row record;
  expected_amount bigint;
begin
  select
    subscriptions.*,
    pricing_plans.currency as plan_currency
  into subscription_row
  from public.subscriptions
  join public.pricing_plans
    on pricing_plans.id = subscriptions.pricing_plan_id
  where subscriptions.transaction_id = p_reference
  for update of subscriptions;

  if not found then
    insert into public.payment_events (
      reference,
      event_type,
      status,
      details
    )
    values (
      p_reference,
      p_source,
      'subscription_not_found',
      jsonb_build_object('amount_minor', p_amount_minor, 'currency', p_currency)
    );
    return 'subscription_not_found';
  end if;

  if subscription_row.status = 'active' then
    return 'already_active';
  end if;

  if subscription_row.status <> 'pending' then
    return 'invalid_status';
  end if;

  expected_amount := round(subscription_row.amount * 100);
  if expected_amount <> p_amount_minor
    or upper(subscription_row.plan_currency) <> upper(p_currency)
  then
    update public.subscriptions
    set
      status = 'failed',
      last_error = 'Payment amount or currency did not match the subscription.',
      updated_at = now()
    where id = subscription_row.id;

    insert into public.payment_events (
      subscription_id,
      reference,
      event_type,
      status,
      details
    )
    values (
      subscription_row.id,
      p_reference,
      p_source,
      'verification_failed',
      jsonb_build_object(
        'expected_amount_minor', expected_amount,
        'received_amount_minor', p_amount_minor,
        'expected_currency', subscription_row.plan_currency,
        'received_currency', p_currency
      )
    );
    return 'verification_failed';
  end if;

  update public.subscriptions
  set
    status = 'active',
    payment_method = coalesce(nullif(p_channel, ''), 'paystack'),
    renewal_date = (current_date + interval '30 days')::date,
    last_error = null,
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'activated_by', p_source,
      'paid_reference', p_reference
    ),
    updated_at = now()
  where id = subscription_row.id;

  update public.photographers
  set
    is_active = true,
    pricing_plan_id = subscription_row.pricing_plan_id,
    updated_at = now()
  where id = subscription_row.photographer_id;

  insert into public.payment_events (
    subscription_id,
    reference,
    event_type,
    status,
    details
  )
  values (
    subscription_row.id,
    p_reference,
    p_source,
    'activated',
    jsonb_build_object('channel', p_channel)
  );

  return 'activated';
end;
$$;

revoke all on function public.activate_subscription_payment(text, bigint, text, text, text) from public;
grant execute on function public.activate_subscription_payment(text, bigint, text, text, text) to service_role;

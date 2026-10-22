// Pin the time zone so date tests give the same results on every machine.
// New Zealand has daylight saving, which several tests rely on.
export default function globalSetup() {
  process.env.TZ = 'Pacific/Auckland';
}

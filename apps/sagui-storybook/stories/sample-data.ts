/** Copied from apps/docs/demos/sample-data.ts; keep the two in step.
 *
 * Sample data for the chart, table and timeline demos. Every value comes from a seeded generator,
 * so the server and the browser render the same numbers and nothing shifts on hydration.
 */
import type { BrushChartDatum, LineChartDatum, StreamgraphDatum, TimelineEvent, TreemapNode } from "@sagui/ui";

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86_400_000;
const END = Date.UTC(2026, 8, 21);
const dayLabel = (time: number) => new Date(time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const shortDay = (time: number) => new Date(time).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const iso = (time: number) => new Date(time).toISOString().slice(0, 10);

/** Daily signups for the last `days` days, with the previous period alongside. */
export function signups(days: number, seed = 7): LineChartDatum[] {
  const random = seeded(seed);
  return Array.from({ length: days }, (_, index) => {
    const time = END - (days - 1 - index) * DAY;
    const weekday = new Date(time).getUTCDay();
    const weekend = weekday === 0 || weekday === 6 ? 0.62 : 1;
    const trend = 150 + index * (90 / days);
    return {
      key: iso(time),
      label: dayLabel(time),
      axisLabel: index % Math.ceil(days / 5) === 0 ? shortDay(time) : undefined,
      values: { signups: Math.round(trend * weekend + random() * 40), previous: Math.round((trend - 30) * weekend + random() * 34) },
    };
  });
}
export const signupSeries = [
  { key: "signups", label: "This period" },
  { key: "previous", label: "Previous period", dashed: true },
];

/** Active minutes per day for a week or a fortnight. */
export function activeMinutes(days: 7 | 14, seed = 3) {
  const random = seeded(seed);
  return Array.from({ length: days }, (_, index) => {
    const time = END - (days - 1 - index) * DAY;
    return { key: iso(time), label: dayLabel(time), axisLabel: new Date(time).toLocaleDateString("en-US", { weekday: "narrow", timeZone: "UTC" }), value: Math.round(18 + random() * 46) };
  });
}

export const trafficThisMonth = [
  { key: "search", label: "Search", value: 4210 },
  { key: "direct", label: "Direct", value: 2380 },
  { key: "social", label: "Social", value: 1190 },
  { key: "email", label: "Email", value: 640 },
  { key: "ads", label: "Ads", value: 120 },
  { key: "referral", label: "Referral", value: 90 },
];
export const trafficLastMonth = [
  { key: "search", label: "Search", value: 3650 },
  { key: "direct", label: "Direct", value: 2710 },
  { key: "social", label: "Social", value: 820 },
  { key: "email", label: "Email", value: 910 },
  { key: "ads", label: "Ads", value: 260 },
  { key: "referral", label: "Referral", value: 140 },
];

export const ticketTopics = [
  { key: "bugs", label: "Bugs" },
  { key: "billing", label: "Billing" },
  { key: "onboarding", label: "Onboarding" },
  { key: "integrations", label: "Integrations" },
];
/** Weekly support tickets by topic. */
export function tickets(weeks: number, seed = 11): StreamgraphDatum[] {
  const random = seeded(seed);
  return Array.from({ length: weeks }, (_, index) => {
    const time = END - (weeks - 1 - index) * 7 * DAY;
    const date = new Date(time);
    const monthStart = date.getUTCDate() <= 7;
    const wave = (phase: number) => Math.sin(index / 3 + phase) * 0.5 + 1;
    return {
      key: iso(time),
      label: `Week of ${shortDay(time)}`,
      axisLabel: monthStart ? date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }) : undefined,
      values: {
        bugs: Math.round(60 * wave(0) + random() * 20),
        billing: Math.round(34 * wave(1.4) + random() * 14),
        onboarding: Math.round(26 * wave(2.6) + random() * 12),
        integrations: Math.round(18 * wave(4) + random() * 10),
      },
    };
  });
}

/** A year of daily active users, rising, with a launch bump in March. */
export function dailyActiveUsers(seed = 5): BrushChartDatum[] {
  const random = seeded(seed);
  return Array.from({ length: 365 }, (_, index) => {
    const date = END - (364 - index) * DAY;
    const weekday = new Date(date).getUTCDay();
    const launch = date > Date.UTC(2026, 2, 24) ? 1400 : 0;
    return { date, value: Math.round(4200 + index * 9 + launch + (weekday === 0 || weekday === 6 ? -900 : 0) + random() * 500) };
  });
}
export const launches = [
  { date: Date.UTC(2026, 2, 24), label: "v2", description: "Offline mode and shared spaces" },
  { date: Date.UTC(2026, 6, 8), label: "API", description: "Public API opened to every plan" },
];

export const powerMix2023 = [
  { key: "wind-solar", label: "Wind and solar", value: 218 },
  { key: "hydro", label: "Hydro", value: 20 },
  { key: "gas", label: "Gas", value: 76 },
  { key: "coal", label: "Coal", value: 132 },
  { key: "other", label: "Other", value: 61 },
];
export const powerMix2015 = [
  { key: "wind-solar", label: "Wind and solar", value: 96 },
  { key: "hydro", label: "Hydro", value: 19 },
  { key: "gas", label: "Gas", value: 62 },
  { key: "coal", label: "Coal", value: 272 },
  { key: "other", label: "Other", value: 98 },
];

export const channelsQ2 = [
  { key: "email", label: "Email", start: 3.1, end: 4.6 },
  { key: "search", label: "Organic search", start: 3.4, end: 3.6 },
  { key: "social", label: "Paid social", start: 1.9, end: 1.3 },
  { key: "referral", label: "Referral", start: 2.6, end: 2.9 },
  { key: "direct", label: "Direct", start: 2.2, end: 2.0 },
];
export const channelsQ3 = [
  { key: "email", label: "Email", start: 4.6, end: 4.1 },
  { key: "search", label: "Organic search", start: 3.6, end: 4.4 },
  { key: "social", label: "Paid social", start: 1.3, end: 2.1 },
  { key: "referral", label: "Referral", start: 2.9, end: 2.7 },
  { key: "direct", label: "Direct", start: 2.0, end: 2.3 },
];

/** One entry per day from January to the sample end date. */
export function contributions(seed = 13) {
  const random = seeded(seed);
  const start = Date.UTC(2026, 0, 1);
  const days = Math.round((END - start) / DAY) + 1;
  return Array.from({ length: days }, (_, index) => {
    const time = start + index * DAY;
    const weekday = new Date(time).getUTCDay();
    const roll = random();
    const count = roll < 0.22 ? 0 : Math.round(random() * (weekday === 0 || weekday === 6 ? 4 : 12));
    return { date: iso(time), count };
  });
}

/** Request latency observations per region, in ms. */
export function latency(seed = 17) {
  const random = seeded(seed);
  const normal = () => Math.sqrt(-2 * Math.log(random() || 1e-9)) * Math.cos(2 * Math.PI * random());
  const region = (id: string, label: string, mean: number, spread: number) => ({
    id,
    label,
    values: Array.from({ length: 160 }, () => Math.max(8, Math.round(mean + normal() * spread))),
  });
  return [
    region("use1", "US East", 62, 14),
    region("usw2", "US West", 78, 18),
    region("euw1", "Europe West", 96, 20),
    region("aps1", "Asia South", 148, 34),
    region("sae1", "South America", 132, 28),
    region("apse2", "Australia", 171, 30),
  ];
}

export const revenueByRegion: TreemapNode = {
  id: "all",
  label: "All regions",
  children: [
    { id: "na", label: "North America", children: [
      { id: "us", label: "United States", value: 18400, color: 24 },
      { id: "ca", label: "Canada", value: 2350, color: 19 },
      { id: "mx", label: "Mexico", value: 960, color: 31 },
    ] },
    { id: "eu", label: "Europe", children: [
      { id: "de", label: "Germany", value: 4120, color: 28 },
      { id: "uk", label: "United Kingdom", value: 3870, color: 12 },
      { id: "fr", label: "France", value: 2440, color: 17 },
      { id: "nl", label: "Netherlands", value: 1210, color: 35 },
    ] },
    { id: "apac", label: "Asia Pacific", children: [
      { id: "jp", label: "Japan", value: 3010, color: 9 },
      { id: "au", label: "Australia", value: 1980, color: 22 },
      { id: "in", label: "India", value: 1460, color: 48 },
      { id: "sg", label: "Singapore", value: 740, color: 30 },
    ] },
  ],
};

export const projects = [
  { id: "p1", name: "Harbour", owner: "Maya Chen", status: "Live", budget: 42000, updated: "2026-09-18" },
  { id: "p2", name: "Atlas", owner: "Leo Fischer", status: "Draft", budget: 18500, updated: "2026-09-20" },
  { id: "p3", name: "Billing migration", owner: "Samir Patel", status: "Review", budget: 26800, updated: "2026-09-12" },
  { id: "p4", name: "Onboarding", owner: "Ana Souza", status: "Live", budget: 9400, updated: "2026-08-30" },
  { id: "p5", name: "Search", owner: "Priya Nair", status: "Draft", budget: 31200, updated: "2026-09-21" },
  { id: "p6", name: "Mobile app", owner: "Tom Becker", status: "Review", budget: 57600, updated: "2026-09-05" },
];

const face = (id: string) => `https://images.unsplash.com/${id}?w=96&h=96&q=80&auto=format&fit=crop&crop=faces`;
const maya = face("photo-1494790108377-be9c29b29330");
const samir = face("photo-1507003211169-0a1dd7228f2d");
const leo = face("photo-1500648767791-00dcc994a43e");
const priya = face("photo-1438761681033-6461ffad8d80");

/** The sample "now", so relative times read the same on every render. */
export const timelineNow = Date.UTC(2026, 8, 22, 10, 0);
export const activity: TimelineEvent[] = [
  { id: "e1", at: "2026-09-22T09:12:00Z", actor: "Maya Chen", avatar: maya, title: "merged Checkout redesign into main", meta: "PR #482" },
  { id: "e2", at: "2026-09-22T08:40:00Z", title: "Deploy failed", tone: "danger", detail: "Build step exited with code 1: missing environment variable STRIPE_KEY." },
  { id: "e3", at: "2026-09-22T07:55:00Z", actor: "Leo Fischer", avatar: leo, title: "opened Billing migration", meta: "PR #481" },
  { id: "e4", at: "2026-09-21T16:20:00Z", actor: "Priya Nair", avatar: priya, title: "commented on Search relevance", detail: "Ranking looks better. Can we keep the old weights behind a flag for a week?" },
  { id: "e5", at: "2026-09-21T11:05:00Z", actor: "Samir Patel", avatar: samir, title: "released v2.4.0", meta: "Production" },
  { id: "e6", at: "2026-09-19T14:30:00Z", actor: "Ana Souza", title: "invited 3 people to the workspace" },
];

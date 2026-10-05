import { Button } from "@sagui/ui";
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-5xl font-semibold tracking-tight">SagUI</h1>
      <p className="mt-4 text-lg text-muted-foreground">React components with motion built in.</p>
      <div className="mt-8 flex gap-3">
        <Button>Get started</Button>
        <Button variant="outline">Storybook</Button>
      </div>
    </main>
  );
}

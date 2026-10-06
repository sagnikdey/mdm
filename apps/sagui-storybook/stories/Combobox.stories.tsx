import type { Meta, StoryObj } from "@storybook/react-vite";
import { Combobox } from "@sagui/ui";

const meta = {
  title: "Selection/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    label: "Framework",
    options: [
      { value: "next", label: "Next.js", keywords: ["react"] },
      { value: "remix", label: "Remix", keywords: ["react"] },
      { value: "astro", label: "Astro" },
      { value: "svelte", label: "SvelteKit" },
      { value: "nuxt", label: "Nuxt", keywords: ["vue"] },
    ],
  },
  decorators: [(Story) => <div className="h-[340px] w-[340px]"><Story /></div>],
} satisfies Meta<typeof Combobox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { defaultValue: "astro" } };
export const WithError: Story = { args: { error: "Pick a framework." } };

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion } from "@sagui/ui";

const items = [
  { title: "What is SagUI?", content: "A React design system with spring motion and Tailwind v4 styling." },
  { title: "Can I use it without Tailwind?", content: "Components ship as Tailwind classes, so your app needs Tailwind v4 to generate them." },
  { title: "Does it support dark mode?", content: "Yes. Set data-theme=\"dark\" on a parent element." },
];

const meta = {
  title: "Disclosure/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { items, defaultOpen: 0, size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["md", "lg"] } },
  decorators: [(Story) => <div className="w-[520px]"><Story /></div>],
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllClosed: Story = { args: { defaultOpen: -1 } };
export const Large: Story = { args: { size: "lg" }, decorators: [(Story) => <div className="w-[720px]"><Story /></div>] };

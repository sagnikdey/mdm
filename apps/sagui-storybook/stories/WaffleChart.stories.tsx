import type { Meta, StoryObj } from "@storybook/react-vite";
import { WaffleChart } from "@sagui/ui";
import { powerMix2015, powerMix2023 } from "./sample-data";

const meta = {
  title: "Charts/Waffle chart",
  component: WaffleChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Electricity generation, 2023", unit: "TWh", data: powerMix2023 },
  decorators: [(Story) => <div className="w-[560px] max-w-full"><Story /></div>],
} satisfies Meta<typeof WaffleChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Earlier: Story = { args: { label: "Electricity generation, 2015", data: powerMix2015 } };
export const Focused: Story = { args: { defaultActiveKey: "coal" } };

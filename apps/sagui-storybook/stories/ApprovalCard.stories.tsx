import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApprovalCard, type ApprovalQuestion } from "@sagui/ui";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const questions: ApprovalQuestion[] = [
  { id: "flavors", question: "How many flavors should we launch?", options: [{ value: "three", label: "Three (core line)" }, { value: "five", label: "Five (full case)" }, { value: "one", label: "Just one hero" }] },
  { id: "mixins", question: "Which mix-ins should we stock?", type: "multiple", options: [{ value: "chocolate", label: "Chocolate chips" }, { value: "waffle", label: "Waffle bits" }, { value: "sprinkles", label: "Sprinkles" }] },
  { id: "market", question: "Which market do we enter first?", options: [{ value: "trucks", label: "Food trucks" }, { value: "grocery", label: "Grocery freezers" }, { value: "shops", label: "Scoop shops" }] },
];

const meta = {
  title: "Components/Approval card",
  component: ApprovalCard,
  tags: ["autodocs"],
  args: { questions, onSubmit: () => wait(700), onDismiss: () => {} },
  decorators: [(Story) => <div className="grid min-h-[320px] place-items-center"><Story /></div>],
} satisfies Meta<typeof ApprovalCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleQuestion: Story = { args: { questions: [questions[0]] } };
export const MultipleChoice: Story = { args: { questions: [questions[1]] } };

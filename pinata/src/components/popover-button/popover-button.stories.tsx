import type {Meta, StoryObj} from '@stencil/storybook-plugin';
import {PopoverButton} from "./popover-button";
import {h} from "@stencil/core"

import "./popover-button.css";

const meta: Meta<PopoverButton> = {
  title: 'Komponenter/Popover Button',
  component: PopoverButton,
  parameters: {
    layout: 'centered',
  },
  args: {
    popoverId: "Hello",
    buttonText: "Hello",
    showOnHover: false,
    popoverType: "auto"
  },
  argTypes: {
    popoverType: {
      control: "radio",
      options: ["auto", "hint"]
    }
  },
  tags: ["autodocs", "button", "dialog"]
};

export default meta;

type Story = StoryObj<PopoverButton>;

export const Popover: Story = {
  render: (args) => <popover-button {...args}>
    Popover
  </popover-button>
}

export const Popovers: Story = {
  render: (args) =>
    <div style={{display: "flex", gap: "24px"}}>
      <popover-button {...args} popoverId="popover1">
        Popover 1
      </popover-button>
      <popover-button {...args} popoverId="popover2">
        Popover 2
      </popover-button>
      <popover-button {...args} popoverId="popover3">
        Popover 3
      </popover-button>
    </div>
}

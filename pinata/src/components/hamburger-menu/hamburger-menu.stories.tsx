import type {Meta, StoryObj} from '@stencil/storybook-plugin';
import {HamburgerMenu} from "./hamburger-menu";
import {h} from "@stencil/core"


import "./hamburger-menu.css";


const meta: Meta<HamburgerMenu> = {
  title: 'Komponenter/Hamburger Menu',
  component: HamburgerMenu,
  parameters: {
    layout: 'centered',
  },
  args: {
    id: "Hello",
    buttonText: "Hello",
    // @ts-ignore
    slot: "Hei"
  },
  tags: ["autodocs", "button"]
};

export default meta;

type Story = StoryObj<HamburgerMenu>;

export const Hamburger: Story = {

  render: (args) => <hamburger-menu {...args}>
    {// @ts-ignore
      args.slot
    }
  </hamburger-menu>
}

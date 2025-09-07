import type {Meta, StoryObj} from '@stencil/storybook-plugin';
import {PNote} from "./p-note";

import "./p-note.css";

const meta: Meta<PNote> = {
  title: 'Komponenter/Note',
  component: PNote,
  parameters: {
    layout: 'centered',
  },
  args: {
    text: "Jeg har nettopp begynt å utforske web-komponenter, så denne siden" +
      " har blitt en test-side for det arbeidet 😭",
    variant: "info"
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "hint", "warning", "danger"],
      table: {
        defaultValue: {
          summary: "info"
        }
      }
    }
  },
  tags: ["autodocs", "text"]
};

export default meta;

type Story = StoryObj<PNote>;

export const Note: Story = {};

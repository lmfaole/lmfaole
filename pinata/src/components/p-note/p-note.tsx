import {Component, h, Host} from '@stencil/core';

@Component({
  tag: 'p-note',
  styleUrl: 'p-note.css',
  shadow: true,
})
export class PNote {
  render() {
    return (
      <Host>
        <aside>
          <slot></slot>
        </aside>
      </Host>
    );
  }
}

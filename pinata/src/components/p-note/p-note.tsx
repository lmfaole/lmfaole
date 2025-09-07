import {Component, h, Host, Prop} from '@stencil/core';

@Component({
  tag: 'p-note',
  styleUrl: 'p-note.css',
  scoped: true,
})
export class PNote {
  @Prop() text: string = "Notat";
  /**
   * Lar deg differansiere mellom ulike beskjeder.
   * Merk at semantikken på elementet ikke endres.
   */
  @Prop() variant?: "warning" | "danger" | "hint" | "info" = 'info';

  render() {
    return (
      <Host>
        <aside class={`p-note ${this.variant}`}>
          <p>{this.text}</p>
        </aside>
      </Host>
    );
  }
}

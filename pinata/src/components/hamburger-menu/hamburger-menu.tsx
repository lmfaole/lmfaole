import {Component, h, Host, Prop} from '@stencil/core';

@Component({
  tag: 'hamburger-menu',
  styleUrl: 'hamburger-menu.css',
  shadow: true,
})
export class HamburgerMenu {
  @Prop() id: string = 'hamburger-menu';
  @Prop() buttonText: string = "Åpne popover";

  render() {
    return (
      <Host>
        <button popoverTarget={this.id}>{this.buttonText}</button>
        <div id={this.id} popover="">
          <slot />
        </div>
      </Host>
    );
  }
}

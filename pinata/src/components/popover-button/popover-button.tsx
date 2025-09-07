import {Component, h, Host, Listen, Prop} from '@stencil/core';

@Component({
  tag: 'popover-button',
  styleUrl: 'popover-button.css',
  scoped: true,
})
export class PopoverButton {
  @Prop() popoverId: string = 'popover 1';
  @Prop() buttonText: string = "Åpne popover";
  @Prop() popoverType?: "auto" | "hint" = 'auto';
  @Prop() showOnHover?: boolean = false;

  @Listen("mouseover")
  handleMouseOver() {
    if (this.showOnHover) {
      const popoverEl = document.getElementById(this.popoverId);
      popoverEl.showPopover();
    }
  }

  @Listen("mouseOut")
  handleMouseOut() {
    if (this.showOnHover) {
      const popoverEl = document.getElementById(this.popoverId);
      popoverEl.hidePopover();
    }
  }

  @Listen("focus")
  handleFocus() {
    const popoverEl = document.getElementById(this.popoverId);
    popoverEl.showPopover();
  }

  @Listen("blur")
  handleBlur() {
    const popoverEl = document.getElementById(this.popoverId);
    popoverEl.hidePopover();
  }

  render() {
    return (
      <Host>
        <button
          popoverTarget={this.popoverId}
          style={{"anchor-name": `--${this.popoverId}`}}
        >
          {this.buttonText}
        </button>
        <div
          id={this.popoverId}
          popover={this.popoverType}
          style={{"position-anchor": `--${this.popoverId}`}}
        >
          <slot />
        </div>
      </Host>
    );
  }
}

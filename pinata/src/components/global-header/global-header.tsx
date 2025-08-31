import {Component, h, Host} from '@stencil/core';

@Component({
  tag: 'global-header',
  styleUrl: 'global-header.css',
  shadow: true,
})
export class GlobalHeader {
  render() {
    return (
      <Host>
        <h1 class="name">Velkommen til lmfaole.party: web-component versjon</h1>
      </Host>
    );
  }
}

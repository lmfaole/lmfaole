import {Component, h, Host} from '@stencil/core';

@Component({
  tag: 'global-footer',
  styleUrl: 'global-footer.css',
  shadow: false,
})
export class GlobalFooter {
  render() {
    return (
      <Host>
        <p>
          <b>Trans-rettigheter er menneskerettigheter. Fritt Palestina</b>
        </p>
      </Host>
    );
  }
}

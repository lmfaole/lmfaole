---
title: The address element
description: An element used for contact information for people or organization.
date: 2025-11-08
created: 2025-11-08
modified: 2025-11-09
tags:
  - element
  - html
draft: false
---

> **From [the address spec](https://html.spec.whatwg.org/multipage/sections.html#the-address-element)**
>
> The address element represents the contact information for its nearest `article` or `body` element ancestor. If that is the `body` element, then the contact information applies to the document as a whole.

I used the address element in the `footer` on this website with the following
markup:

``` html
<address>
 You can find me on <a href="https://bsky.app/profile/lmfaole.party">Bluesky</a>.
</address>
```

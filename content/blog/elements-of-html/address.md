---
title: The Elements of HTML — address
description: An element used for contact information for people, or for an organization.
date: "git Created"
tags: html elements, flow content, palpable content
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

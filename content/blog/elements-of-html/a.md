---
title: The Elements of HTML — anchor
description: An element used to create a link.
date: "git Created"
tags: html elements, flow content, palpable content, interactive content, phrasing content
---

> **From [the address spec](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element)**
>
> If the a element has an `href` attribute, then it represents a hyperlink (a hypertext anchor) labeled by its contents.
> 
> If the a element has no `href` attribute, then the element represents a placeholder for where a link might otherwise have been placed, if it had been relevant, consisting of just the element's contents.

## Attributes

### Download

The [download attribute][download] makes the browser download the document referred to. Take my favicon for example: <a href="https://lmfaole.party/img/favicon.png" download>download my favicon</a>. In this example the file gets it's name programmatically using the resource URL. 

You can, however, specify the filename using the `download` attribute. Take this link for example: <a href="https://lmfaole.party/img/favicon.png" download="an_awesome_favicon.png">download my awesome favicon</a>. The `href` is still the same, but I've changed the value of the download attribute: `download="an_awesome_favicon.png"`.

``` html
// Programmatically determined file name
<a href="https://lmfaole.party/img/favicon.png" download>

// Custom file name
<a href="https://lmfaole.party/img/favicon.png" download="filename.png">
```



[download]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#download
[href]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#href
[hreflang]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#hreflang
[ping]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#ping
[rel]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#rel
[referrerpolicy]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#referrerpolicy

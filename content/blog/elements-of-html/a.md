---
title: The Elements of HTML — anchor
description: An element used to create a link.
date: 2025-11-09
tags: html elements, flow content, palpable content, interactive content, phrasing content
---

> **From [the anchor spec](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element)**
>
> If the a element has an `href` attribute, then it represents a hyperlink (a hypertext anchor) labeled by its contents.
> 
> If the a element has no `href` attribute, then the element represents a placeholder for where a link might otherwise have been placed, if it had been relevant, consisting of just the element's contents.

## Useful attributes

### Download links

The [download attribute][download] makes the browser download the document referred to. Take my favicon for example: <a href="https://lmfaole.party/img/favicon.png" download>download my favicon</a>. In this example the file gets it's name programmatically using the resource URL. 

You can, however, specify the filename using the `download` attribute. Take this link for example: <a href="https://lmfaole.party/img/favicon.png" download="an_awesome_favicon.png">download my awesome favicon</a>. The `href` is still the same, but I've changed the value of the download attribute: `download="an_awesome_favicon.png"`.

``` html
<!-- Programmatically determined file name -->
<a href="https://lmfaole.party/img/favicon.png" download>

<!-- Custom file name -->
<a href="https://lmfaole.party/img/favicon.png" download="filename.png">
```

### href

The [href] is the backbone of the entire thing that is a link. There are a number of use-cases: 

#### Start a user action

- Call numbers: <a href="tel:12345678">Call me<span class="sr"> (test link)</span></a>
- Send an SMS: <a href="sms:12345678">Send me a message<span class="sr"> (test link)</span></a>
- Start a mail app with a predefined address: <a href="mailto:olejorgenbakken@gmail.com">Send me a mail</a>

#### Link to a specific part of a document

- Go to an element with an id: <a href="#attributes">Go to the attributes section</a>
- Go to a specific piece of text in a document: <a href="https://en.wikipedia.org/wiki/Vinstra#:~:text=The%20village%20of%20Vinstra%20was%20granted%20the%20status%20of%20a%20%22town%22%5B1%5D%20on%201%20September%202013%2C%20an%20event%20that%20was%20celebrated%20for%203%20days.">Feast your eyes on a fun fact about my hometown</a>
- Go to a specific timestamp in a piece of media: I love <a href="https://youtu.be/1NxyVkRC0MA?t=129" target="_blank">Pattie Labelle and Mariah Carey's on-stage banter during this live performance</a>

``` html
<!-- Actions -->
Call numbers: <a href="tel:12345678">Call me<span class="sr"> (test link)</span></a>
Send an SMS: <a href="sms:12345678">Send me a message<span class="sr"> (test link)</span></a>
Start a mail app with a predefined address: <a href="mailto:olejorgenbakken@gmail.com">Send me a mail</a>

<!-- Parts of a document -->
Go to an element with an id: <a href="#attributes">Go to the attributes section</a>
Go to a specific piece of text in a document: <a href="https://en.wikipedia.org/wiki/Vinstra#:~:text=The%20village%20of%20Vinstra%20was%20granted%20the%20status%20of%20a%20%22town%22%5B1%5D%20on%201%20September%202013%2C%20an%20event%20that%20was%20celebrated%20for%203%20days.">Feast your eyes on a fun fact about my hometown</a>
Go to a specific timestamp in a piece of media: I love <a href="https://youtu.be/1NxyVkRC0MA?t=129" target="_blank">Pattie Labelle and Mariah Carey's on-stage banter during this live performance</a>
```

### rel

> The [rel] attribute defines the relationship between a linked resource and the current document.
>
> [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel)

There are a bunch of fun stuff here. Some highlights from specification (described by the MDN article) include:

- `alternate`: Alternate representations of the current document. Especially useful for documents in different languages than the current one.
- `author`: Author of the current document or article.
- `external`: The referenced document is not part of the same site as the current document.
- `help`: Link to context-sensitive help.
- `me`: Indicates that the current document represents the person who owns the linked content.
- `next` and `prev`: Indicates that the current document is a part of a series and that the next/previous document in the series is the referenced document.
- `tag`: Gives a tag (identified by the given address) that applies to the current document (like at the bottom of this post!).

### hreflang

The [hreflang] gives a hint about the language of a linked document (for example this <a href="https://freak.no/forum/showthread.php?t=206290" hreflang="no">forum post about the 2011 Norwegian butter crisis</a>). 

[Manuel Matuzovic] has written [a great article about some basics of HTML](https://htmhell.dev/adventcalendar/2023/4/) over at [HTMHell], where he gives some reasons why might want to use hreflang.

``` html
<a href="https://freak.no/forum/showthread.php?t=206290" hreflang="no">forum post about the 2011 Norwegian butter crisis</a>
```

### target

The [target] attribute defines where to open the link, you've probably encountered (and hated) this a bunch. The most used ones are:

- `_self`: Same context as the current one (usually meaning the same tab).
- `_blank`: Usually meaning a new tab (ugh). [Chris Coyier] wrote an article about [cases for and against setting `target="_blank"` on links](https://css-tricks.com/use-target_blank/) for CSS-tricks.

PS: [Kyrylo Silin] has written [a post about why target values use underscores](https://kyrylo.org/html/2024/10/25/why-does-target-blank-have-an-underscore-in-front.html).

``` html
<a href="https://en.wikipedia.org/wiki/Rickrolling" target="_self">Get kinda rick-rolled</a>
<a href="https://en.wikipedia.org/wiki/Rickrolling" target="_blank">Get kinda rick-rolled</a>
```

### Attributes not mentioned

- [ping]: Used mostly for tracking. Not really that interesting to me, at the time of writing this, anyway.
- [referrerpolicy]: cross-origin stuff makes my head hurt. I'll learn it when I need to, ok?

## Resources

- [Best practices for creating links](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Creating_links#link_best_practices)

<!-- Meta links -->
[download]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#download
[href]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#href
[hreflang]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#hreflang
[ping]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#ping
[rel]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#rel
[referrerpolicy]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#referrerpolicy
[target]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#target

<!-- People -->
[Manuel Matuzovic]: https://www.matuzo.at/
[Chris Coyier]: https://chriscoyier.net/
[Kyrylo Silin]: https://kyrylo.org/

<!-- Resources -->
[HTMHell]: https://htmhell.dev/
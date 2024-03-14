# Obsidian Kindle Plugin

Sync (and resync) your Kindle notes and highlights directly into your [Obsidian][1] vault. You
can choose to sync using one of two methods:

## Kindle Device (My Clippings)

Sync your highlights by uploading your `My Clippings.txt` file stored on your Kindle device.
This file includes highlights, bookmarks and notes for any book on your Kindle regardless
if it has been purchased via Amazon.

You can extract your `My Clippings.txt` file by plugging it into your computer using USB.

## Features

- **Sync non-Amazon books** — Sync your highlights by uploading your `My Clippings.txt` file from your Kindle device

- **Enriched metadata** — Enrich your notes by downloading extra metadata information about your book from Amazon.com

- **Powerful, flexible templating with preview** — Customise your highlights and file names to your liking by configuring your own template using ([Nunjucks][2]) templating language with live preview

### Export limits

For several reasons (see [here][5] and [here][6]) the Kindle platform can sometimes limit the amount
of highlighted text that can be exported from a particular book. This limit varies from book to book, purchased from Amazon or have DRM protection. There is currently no known alternative to work around this.

## License

[MIT](LICENSE)

[1]: https://obsidian.md
[2]: https://mozilla.github.io/nunjucks
[3]: https://github.com/pjeby/hot-reload
[4]: https://read.amazon.com/notebook
[5]: https://help.readwise.io/article/47-why-are-my-kindle-highlights-truncated-ellipses#:~:text=Publishers%20require%20Amazon%20to%20place,the%20book%20will%20be%20truncated.
[6]: https://brian.carnell.com/articles/2018/route-around-amazon-kindles-ridiculous-limits-on-highlights-exporting-with-bookcision/

# Obsidian Kindle Clippings Plugin

As I personally have no use for online amazon syncing,
this fork of obsidian kindle plugin will only focus on the "My Clipping.txt" file to create the notes for your clippings.

## Added Features

- **Ability to seperate clippings by their corresponding authors.**
- **The front matter of the original "kindle-sync" has been removed**
  thus accomodating for obsidian properties.
- _more features soon_

## Kindle Device (My Clippings)

Sync your highlights by uploading your `My Clippings.txt` file stored on your Kindle device.
This file includes highlights, bookmarks and notes for any book on your Kindle regardless
if it has been purchased via Amazon.

You can extract your `My Clippings.txt` file by plugging it into your computer using USB.

## Features

- **Sync non-Amazon books** — Sync your highlights by uploading your `My Clippings.txt` file from your Kindle device

- **Powerful, flexible templating with preview** — Customise your highlights and file names to your liking by configuring your own template using ([Nunjucks][1]) templating language with live preview

### Export limits

For several reasons (see [here][2]] and [here][3]) the Kindle platform can sometimes limit the amount
of highlighted text that can be exported from a particular book. This limit varies from book to book, purchased from Amazon or have DRM protection. There is currently no known alternative to work around this.

## License

[MIT](LICENSE)

[1]: https://mozilla.github.io/nunjucks
[2]: https://help.readwise.io/article/47-why-are-my-kindle-highlights-truncated-ellipses#:~:text=Publishers%20require%20Amazon%20to%20place,the%20book%20will%20be%20truncated.
[3]: https://brian.carnell.com/articles/2018/route-around-amazon-kindles-ridiculous-limits-on-highlights-exporting-with-bookcision/

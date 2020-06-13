## Image Height
Responsive Masonry style image plugin, with equal height by row. Requires [JQuery](https://code.jquery.com/).

## Try the example
You can try the example [Here](https://pskyvader.github.io/minilibs/JS/ImageHeight/)

### How to use 
Download the file "ImageHeight.min.js" and add it to your html:
```html
<script src="yourproject/ImageHeight.min.js"></script>
```
Start with a container and put some images:
```html
<div class="myclasscontainer">
    <img src="yoururl" />
</div>
```

You can also use links:
```html
<div class="myclasscontainer">
    <a href="yourlinkurl">
      <img src="yoururl" />
    </a>
</div>
```

And start the script

```javascript
$('.myclasscontainer').ImageHeight({
    minwidth: 300,
    minheight: 100,
    maxrow: 5,
    margin: 0,
    placeholder:false, // True If you want to see placeholders for images to be loaded, or False to wait until a line is completely loaded to show it
    showerrors: false // If you want to see broken images And console logs (images visibility overrided by placeholder)
});
```

**You can also Download the example file. Just put both files in the same folder**




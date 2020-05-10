## Image Height
Library for masonry style image gallery, with same height by row. Requires [JQuery](https://code.jquery.com/).
### How to use 
Download the file "ImageHeight.js" and add it to your html:
```html
<script src="yourproject/ImageHeight.js"></script>
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
new ImageHeight('.myclasscontainer', {
    minwidth: 300,
    minheight: 100,
    maxrow: 5,
    margin: 10,
    showerrors:false // If you want to see broken images and console logs
});
```

**You can also try the example file. Just Download both files in the same folder**




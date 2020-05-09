# Mini Libs
Minilibraries for lazy people

* [Image Height](#image-height)




### Image Height
Librarie for masonry style image gallery, with same height by row. Requires [JQuery](https://code.jquery.com/).
#### How to use 
Include the file in your html:
```html
<script src="yourfolder/imageheight.js"></script>
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
new ImageHeight('.myclasscontainer',{
    minwidth:300,
    minheight:100,
    maxrow:5,
    margin:null //just in case the script fails
});
```




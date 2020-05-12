(function($) {
    class ImageHeight {
        container = null;

        minwidth = 300;
        minheight = 100;
        maxrow = 5;
        margin = 10;
        showerrors = false;


        imagelist = [];
        last_containerwidth = 0;
        last_column = 0;
        containerwidth = null;
        lasti = 0;
        maxcolumn = 1;
        allloaded = false;

        timeoutstep = 200;
        timeout = null;

        constructor(container, params) {
            this.container = container;
            if (this.container.length != 1) {
                throw new Error('Container object "' + container + '" not valid');
            }


            this.minwidth = params.minwidth;
            this.minheight = params.minheight;
            this.maxrow = params.maxrow;
            this.margin = params.margin;
            this.showerrors = params.showerrors;
            let t = this;

            t.message("Container", t.container);


            //reset de estilos para evitar errores de calculo
            $("a", t.container).css("font-size", 0).css("padding", 0).css("margin", 0);
            $("img", t.container).css("max-width", "100%").css("padding", t.margin).hide();

            //agregar imagenes a la lista total de imagenes 
            $("img", t.container).each(function() {
                let img = {
                    "img": $(this),
                    "loaded": false,
                    "error": false
                };
                t.imagelist.push(img);
                $(this).on('load', function() {
                    img.loaded = true;
                    t.message("Image loaded", img);
                    //img.img.fadeIn();
                });
                $(this).on('error', function() {
                    img.loaded = true;
                    img.error = true;
                    t.message("Image load error", img);
                    if(this.showerrors){
                        //img.img.fadeIn();
                    }
                });
            });

            t.message("Image list", t.imagelist);

            if (t.imagelist.length == 0) {
                throw new Error('No valid images to show');
            }

            $(document).ready(function() {
                t.message("Start Process...");
                t.setcolumns();
                $(window).on("load resize", t.setcolumns);
            });
        }

        message = (...msg) => {
            if (this.showerrors) {
                console.log(...msg);
            }
        }



        setcolumns = () => {
            this.message("Set Columns");
            if (!this.allloaded) {
                this.container.height(1000000000);
                this.containerwidth = $(this.container).width();
                this.container.height("auto");
            } else {
                this.containerwidth = $(this.container).width();
            }


            this.message("Container width", this.containerwidth);
            // obtener ancho maximo 
            this.maxcolumn = parseInt(this.containerwidth / this.minwidth);
            // cantidad de fotos maximas en esta resolucion 
            if (this.maxcolumn > this.maxrow) this.maxcolumn = this.maxrow;
            if (this.maxcolumn < 1) this.maxcolumn = 1;

            this.message("Max columns", this.maxcolumn);


            if (this.allloaded) {
                //control para evitar recalcular innecesariamente 
                if (this.containerwidth == this.last_containerwidth && this.maxcolumn == this.last_column) {
                    return;
                }
                if (this.maxcolumn == 1) {
                    if (this.last_column != this.maxcolumn) {
                        $("img", this.container).height("auto").css("width", "100%");
                    }
                    this.last_column = this.maxcolumn;
                    return;
                }
            }

            this.last_containerwidth = this.containerwidth;
            this.last_column = this.maxcolumn;
            //funcion para separar en filas 
            this.splitrows();
        }

        splitrows = (timeoutstep = 0) => {
            this.message("Split rows check", "timeout:", timeoutstep);
            if (this.allloaded) {
                this.setrow(this.imagelist.length);
                return;
            }

            let i = 0;
            let j = 0;
            let firstloaded=0;
            let lastloaded=0;
            let noloaded=0;
            // crear filas de imagenes que entren en el ancho maximo 
            //(ej: 2 fotos de 300 de ancho caben en 800 px, pero 3 fotos no. 
            // entonces la tercera foto pasa a la siguiente fila) 

            while (j < this.imagelist.length) {
                if (!this.imagelist[j].loaded) {
                    this.message("Image", j, "Not loaded yet");
                    noloaded++;
                } else {
                    if(noloaded==0){
                        firstloaded=j;
                    }
                    lastloaded=j;
                }
                j++;
            }

            //muestra al menos todos los cargados consecutivamente, va agregando al menos una fila visible por iteracion
            i=Math.min(firstloaded,this.maxcolumn*parseInt((timeoutstep/this.timeoutstep)/2));
            i=Math.max(lastloaded+1,i);
            i=Math.min(i,this.imagelist.length);

            j=0;
            while (j<i) {
                //muestra las fotos cargadas hasta este punto
                if (this.imagelist[j].loaded && (this.showerrors || !this.imagelist[j].error)) {
                    this.message("Show image", j);
                    this.imagelist[j].img.fadeIn();
                }
                j++;
            }

            if (i < this.imagelist.length || noloaded>0) {
                this.message("Image max calculate", i);
                if (i > this.lasti) {
                    this.lasti = i;
                    this.setrow(i);
                }
                if (this.timeout != null) {
                    clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(this.splitrows, timeoutstep + this.timeoutstep, timeoutstep + this.timeoutstep);
            } else {
                this.message("All images loaded");
                this.allloaded = true;
                this.setrow(i);
                this.setcolumns();
            }
            this.message("split rows finished",i,this.imagelist.length);
        }

        setrow = (maxi) => {
            this.message("Set rows");
            //alto del contenedor muy largo para controlar la barra de desplazamiento 
            $('.split,.loading', this.container).remove();
            let t = this;
            let i = 0;
            while (i < maxi) {
                let totalwidth = 0;
                let count = 0;
                let imagerow = [];

                //separa la lista de imagenes en fila
                while (totalwidth <= t.containerwidth && (!this.allloaded || count < this.maxcolumn) && i < maxi) {
                    $(t.imagelist[i].img).width("auto").height(this.minheight);
                    let currentwidth = $(t.imagelist[i].img).width();
                    if (currentwidth < t.minwidth) currentwidth = t.minwidth;
                    if (t.imagelist[i].error && !t.showerrors) {
                        i++;
                        continue;
                    }
                    //ajusto al ancho minimo para evitar que las fotos se vean demasiado pequeñas 
                    totalwidth += currentwidth;
                    if (totalwidth <= t.containerwidth || imagerow.length == 0) {
                        imagerow.push(t.imagelist[i].img);
                        i++;
                    }
                    count++;
                }

                //por cada fila se define el ancho que tendran las fotos para caber en el ancho del contenedor correspondiente 
                if(imagerow.length>0){
                    t.setwidth(imagerow);
                }
            }
            this.message("Set rows finished ", maxi, " images");
            if (maxi < this.imagelist.length) {
                this.container.append("<div class='loading'>loading...</div>");
            }
        }






        setwidth = (row) => {
            this.message("Set width ", row.length, " images in this row");
            //calculo del ancho optimo
            let combinedWidth = 0;
            let errorwidth=0;
            $.each(row, function() {
                if($(this).width()==0){
                    errorwidth++;
                }
                combinedWidth += $(this).width();
            });

            let diff = (this.containerwidth - this.margin * 2 * row.length) / combinedWidth;
            diff*=(1-(errorwidth/row.length));

            //si la foto es muy alta y esta sola, se ajusta para que no se desborde
            if ( ((this.maxcolumn > 1 && row.length == 1 ))  && $(row[0]).height() * 1.33 > $(row[0]).width()) {
                this.message("Image too long, resize", row[0]);
                $(row[0]).height(this.minheight * 2);
            } else {
                $.each(row, function() {
                    $(this).width( diff * $(this).width()).height("auto");
                });
            }

            //insertar salto de linea para evitar errores en caso de que una imagen falle en cargar
            var lastItem = row.pop();
            while (lastItem.parent()[0] != this.container[0]) {
                lastItem = lastItem.parent();
            }
            $('<br class="split"/>').insertAfter(lastItem);
        }
    }

    $.fn.ImageHeight = function(options) {
        // This is the easiest way to have default options.
        var settings = $.extend({
            minwidth: ImageHeight.minwidth,
            minheight: ImageHeight.minheight,
            maxrow: ImageHeight.maxrow,
            margin: ImageHeight.margin,
            showerrors: ImageHeight.showerrors // If you want to see broken images And console logs
        }, options);

        return new ImageHeight(this, settings);
    }
}(jQuery));
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

    timeoutstep = 50;
    timeout = null;

    constructor(container, params) {
        if (typeof jQuery == 'undefined') {
            throw new Error('Jquery must be defined');
        }
        if (typeof container != "string") {
            throw new Error('Container class must be defined');
        }
        this.container = $(container);
        if (this.container.length != 1) {
            throw new Error('Container object "' + container + '" not valid');
        }
        this.minwidth = params.minwidth || this.minwidth;
        this.minheight = params.minheight || this.minheight;
        this.maxrow = params.maxrow || this.maxrow;
        this.margin = params.margin || this.margin;
        this.showerrors = params.showerrors || this.showerrors;
        let t = this;

        //reset de estilos para evitar errores de calculo
        $("a", t.container).css("font-size", 0).css("padding", 0).css("margin", 0);
        $("img", t.container).css("max-width", "100%").css("padding", t.margin).hide();

        //agregar imagenes a la lista total de imagenes 
        let i = 0;
        $("img", t.container).each(function() {
            let img = {
                "img": $(this),
                "loaded": false,
                "position": i
            };
            t.imagelist.push(img);
            $(this).on('load', function() {
                img.loaded = true;
            });
            $(this).on('error', function() {
                img.loaded = true;
                img.error = true;
            });
            i++;
        });
        t.setcolumns();
        $(window).on("resize", t.setcolumns);

    }
    setcolumns = () => {
        this.containerwidth = $(this.container).width();
        // obtener ancho maximo 
        this.maxcolumn = parseInt(this.containerwidth / this.minwidth);
        // cantidad de fotos maximas en esta resolucion 
        if (this.maxcolumn > this.maxrow) this.maxcolumn = this.maxrow;
        if (this.maxcolumn < 1) this.maxcolumn = 1;


        if (this.allloaded) {
            //control para evitar recalcular innecesariamente 
            if (this.containerwidth == this.last_containerwidth && this.last_column == this.maxcolumn) {
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
        if (this.allloaded) {
            this.setrow(this.imagelist.length);
            return;
        }

        let i = 0;
        // crear filas de imagenes que entren en el ancho maximo 
        //(ej: 2 fotos de 300 de ancho caben en 800 px, pero 3 fotos no. 
        // entonces la tercera foto pasa a la siguiente fila) 

        while (i < this.imagelist.length) {
            if (!this.imagelist[i].loaded) {
                break;
            } else {
                //si muestra errores, la foto fallida sera visible
                if (!this.imagelist[i].error || this.showerrors) {
                    this.imagelist[i].img.show();
                }
            }
            i++;
        }
        if (i < this.imagelist.length) {
            if (i > this.lasti) {
                this.lasti = i;
                this.setrow(i);
            }
            if (this.timeout != null) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(this.splitrows, timeoutstep + this.timeoutstep, timeoutstep + this.timeoutstep);
        } else {
            this.allloaded = true;
            this.setrow(i);
        }


    }

    setrow = (maxi) => {
        this.container.height(1000000000);
        //alto del contenedor muy largo para controlar la barra de desplazamiento 
        $('.split,.loading', this.container).remove();
        let t = this;
        let i = 0;
        while (i < maxi) {
            let totalwidth = 0;
            let count = 0;
            let imagerow = [];

            //separa la lista de imagenes en fila
            while (totalwidth <= t.containerwidth && count < this.maxcolumn && i<maxi) {
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
            t.setwidth(imagerow);
        }
        if(maxi<this.imagelist.length){
            this.container.append("<div class='loading'>loading...</div>");
        }
        this.container.height("auto");
    }






    setwidth = (row) => {
        //calculo del ancho optimo
        let combinedWidth = 0;
        $.each(row, function() {
            combinedWidth += $(this).width();
        });

        let diff = (this.containerwidth - this.margin * 2 * row.length) / combinedWidth;

        //si la foto es muy alta y esta sola, se ajusta para que no se desborde
        if (this.maxcolumn > 1 && row.length == 1 && $(row[0]).height() * 1.33 > $(row[0]).width()) {
            $(row[0]).height(this.minheight * 2);
        } else {
            $.each(row, function() {
                $(this).width(diff * $(this).width()).height("auto");
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
class ImageHeight {
    minwidth = 300;
    minheight = 100;
    maxrow = 5;
    margin = 0;
    container = null;
    imagelist = [];
    last_containerwidth = 0;
    last_column = 0;
    containerwidth = null;
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
        this.margin = params.margin|| this.margin;
        let t = this;
        //ejecutar en cada inicio o resize solo despues de terminar la carga 
        $(document).ready(function(){
            //reset de estilos para evitar errores de calculo
            $("a", t.container).css("font-size", 0).css("padding", 0).css("margin", 0);
            $("img", t.container).css("max-width", "100%").css("padding",t.margin);

            //agregar imagenes a la lista total de imagenes 
            $("img", t.container).each(function() {
                t.imagelist.push($(this));
            });
            t.setcolumns();
            $(window).on("resize", t.setcolumns);
        });
        /*$(window).on("load", function() {
            //reset de estilos para evitar errores de calculo
            $("a", t.container).css("font-size", 0).css("padding", 0).css("margin", 0);
            $("img", t.container).css("max-width", "100%").css("padding",t.margin);

            //agregar imagenes a la lista total de imagenes 
            $("img", t.container).each(function() {
                t.imagelist.push($(this));
            });
            t.setcolumns();
            $(window).on("resize", t.setcolumns);
        });*/
    }
    setcolumns = () => {
        this.containerwidth = $(this.container).width();
        // obtener ancho maximo 
        let maxcolumn = parseInt(this.containerwidth / this.minwidth);
        // cantidad de fotos maximas en esta resolucion 
        if (maxcolumn > this.maxrow) maxcolumn = this.maxrow;
        if (maxcolumn < 1) maxcolumn = 1;
        if (maxcolumn == 1) {
            $("img", this.container).height("auto").width("100%");
            //si es solo una columna, el tamaño maximo es tamaño del contenedor-2*margenes laterales 
            return;
        }
        //control para evitar recalcular innecesariamente 
        if (this.containerwidth == this.last_containerwidth && this.last_column == maxcolumn) {
            return;
        }
        this.container.height(1000000000);
        //alto del contenedor muy largo para controlar la barra de desplazamiento 
        $("img", this.container).width("auto").height(this.minheight);
        //ajusta al minimo alto para calcular la mayor cantidad de filas posibles 
        this.last_containerwidth = this.containerwidth;
        this.last_column = maxcolumn;
        //funcion para separar en filas 
        this.splitrows(maxcolumn);
        this.container.height("auto");
    }
    splitrows = (maxcolumn) => {
        let i = 0;
        // crear filas de imagenes que entren en el ancho maximo 
        //(ej: 2 fotos de 300 de ancho caben en 800 px, pero 3 fotos no. 
        // entonces la tercera foto pasa a la siguiente fila) 
        let t=this;
        $.each(t.imagelist,function(){
            this.loaded=false;
            this.on('load',function(){
                this.loaded=true;
            });
        });
        while (i < this.imagelist.length) {
            let totalwidth = 0;
            let count = 0;
            let imagerow = [];
            //crea cada una de las filas 
            while (totalwidth <= t.containerwidth && count < maxcolumn && i < t.imagelist.length) {
                let currentwidth = $(t.imagelist[i]).width();
                console.log(t.imagelist[i].loaded);
                if (currentwidth < t.minwidth) currentwidth = t.minwidth;
                //ajusto al ancho minimo para evitar que las fotos se vean demasiado pequeñas 
                totalwidth += currentwidth;
                if (totalwidth <= t.containerwidth || imagerow.length == 0) {
                    imagerow.push(t.imagelist[i]);
                    i++;
                }
                count++;
            }
            
            //por cada fila se define el ancho que tendran las fotos para caber en el ancho del contenedor correspondiente 
            t.setwidth(imagerow);
        }
    }



    setwidth = (row) => {
        //intenta calcular el tamaño optimo, dada la precision (para evitar salirse del ancho maximo) 
        let combinedWidth = 0;
        $.each(row, function() {
            combinedWidth += $(this).width();
        });
        
        let diff = (this.containerwidth - this.margin*2 * row.length) / combinedWidth;
        $.each(row, function() {
            $(this).width(diff * $(this).width()).height("auto");
        });
    }
}

(function($) {
    class ImageHeight {
        constructor(container, params) {
            let t = this;
            t.container = container;
            if (t.container.length != 1) {
                throw new Error('Container object "' + container + '" not valid');
            }


            t.minwidth = params.minwidth;
            t.minheight = params.minheight;
            t.maxrow = params.maxrow;
            t.margin = params.margin;
            t.lazyload = params.lazyload;
            t.placeholder = params.placeholder;
            t.showerrors = params.showerrors;


            //default data
            t.imagelist = [];
            t.last_containerwidth = 0;
            t.last_column = 0;
            t.containerwidth = null;
            t.lasti = 0;
            t.lastnoloaded = 0;
            t.maxcolumn = 1;
            t.allloaded = false;

            t.timeoutstep = 50;
            t.timeout = null;

            t.time = Date.now();
            //default data


            t.message("Container", t.container);


            //reset de estilos para evitar errores de calculo
            $("a", t.container).css({
                "padding": 0,
                "font-size": 0,
                "margin": 0
            });
            //estilo basico de imagen para calcular correctamente

            $("img", t.container).css({
                "max-width": "100%",
                "margin": t.margin,
                "background": "#cccccc"
            });
            if (t.lazyload) {
                $("img", t.container).css({
                    "width": "100%",
                    "height": 10*t.minheight,
                });
                if(!t.placeholder){
                    $("img", t.container).hide();
                }

            } else {
                $("img", t.container).css({
                    "height": t.minheight
                }).hide();
            }


            //agregar imagenes a la lista total de imagenes 
            $("img", t.container).each(function() {
                let img = {
                    "img": $(this),
                    "loaded": false,
                    "error": false,
                    "width": 0
                };
                t.imagelist.push(img);
                if (!t.lazyload) {
                    t.setloaded(img);
                }else{
                    if($(this).data("src")!=undefined){
                        $(this).prop("src","data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");
                    }
                }


            });

            t.message("Image list", t.imagelist);

            if (t.imagelist.length == 0) {
                throw new Error('No valid images to show');
            }

            $(document).ready(function() {
                t.message("Start Process...");
                t.setcolumns();
                $(window).on("resize", function() {
                    t.time = Date.now();
                });
                $(window).on("load resize", function() {
                    t.message("onload resize");
                    t.setcolumns();
                });
            });


            if (t.lazyload) {
                const observerConfig = {
                    root: null,
                    rootMargin: 50*t.minheight+"px",
                    threshold: 0
                }

                t.observer = new IntersectionObserver(function(entries) {
                    Array.prototype.forEach.call(entries, function(entry) {
                        if (entry.isIntersecting) {
                            t.observer.unobserve(entry.target);
                            if ("img" == entry.target.tagName.toLowerCase()) {
                                let img = $(entry.target);
                                let src = img.data("src");
                                if (src) {
                                    img.prop("src", src);
                                    img.data("src", "");
                                }

                                const found = t.imagelist.find(function(element) {
                                    return element.img[0] == img[0];
                                });
                                if (found != undefined) {
                                    t.setloaded(found);
                                }
                            }
                        }
                    });
                }, observerConfig);

                t.imagelist.forEach(function(img) {
                    t.observer.observe(img.img[0]);
                });

            }
        }
        setloaded(img) {
            let t = this;
            $(img.img).on('load', function() {
                t.message("Image loaded", img);
                t.loadimage(img);
            }).on('error', function() {
                img.error = true;
                t.loadimage(img);
                t.message("Image load error", img);
            });
            if ($(img.img)[0].complete) {
                $(img.img).trigger('load');
            }
        }

        loadimage(img) {
            let t = this;
            img.loaded = true;
            img.width = 0;
            img.img.css({
                "margin": 0,
                "padding": t.margin,
                "background": "#fff"
            });
        }




        message(...msg) {
            let t = this;
            if (t.showerrors) {
                let time = Date.now();
                console.log((time - t.time) + " ms:", ...msg);
            }
        }



        setcolumns() {
            let t = this;
            t.message("Set Columns");
            if (!t.allloaded) {
                t.container.height(1000000000);
                t.containerwidth = $(t.container).width();
                t.container.height("auto");
            } else {
                t.containerwidth = $(t.container).width();
            }


            t.message("Container width", t.containerwidth);
            // obtener ancho maximo 
            t.maxcolumn = parseInt(t.containerwidth / t.minwidth);
            // cantidad de fotos maximas en esta resolucion 
            if (t.maxcolumn > t.maxrow) t.maxcolumn = t.maxrow;
            if (t.maxcolumn < 1) t.maxcolumn = 1;

            t.message("Max columns", t.maxcolumn);



            if (t.allloaded) {
                //control para evitar recalcular innecesariamente 
                if (t.containerwidth == t.last_containerwidth && t.maxcolumn == t.last_column) {
                    t.message("Skip, same previous position", t.imagelist);
                    return;
                }
                if (t.maxcolumn == 1) {
                    t.message("1 column, autosize");
                    if (t.last_column != t.maxcolumn) {
                        $("img", t.container).height("auto").css("width", "100%");
                    }
                    t.last_column = t.maxcolumn;
                    return;
                }
            }

            t.last_containerwidth = t.containerwidth;
            t.last_column = t.maxcolumn;
            //funcion para separar en filas 
            t.splitrows();
        }

        splitrows(timeoutstep = 0) {
            let t = this;
            if (t.lazyload) {
                timeoutstep = t.timeoutstep/2;
            }
            t.message("Split rows check", "timeout:", timeoutstep);
            if (t.allloaded) {
                t.setrow(t.imagelist.length);
                return;
            }

            let i = 0;
            let j = 0;
            let firstloaded = 0;
            let lastloaded = 0;
            let noloaded = 0;
            // crear filas de imagenes que entren en el ancho maximo 
            //(ej: 2 fotos de 300 de ancho caben en 800 px, pero 3 fotos no. 
            // entonces la tercera foto pasa a la siguiente fila) 

            while (j < t.imagelist.length) {
                if (!t.imagelist[j].loaded) {
                    t.message("Image", j, "Not loaded yet");
                    noloaded++;
                } else {
                    if (noloaded == 0) {
                        firstloaded = j;
                    }
                    lastloaded = j;
                }
                j++;
            }
            if (t.lazyload) {
                i = lastloaded + t.maxcolumn;
                if (i > t.imagelist.length) {
                    i = t.imagelist.length;
                }
            } else if (t.placeholder && firstloaded + 1 < t.imagelist.length) {
                //muestra al menos todos los cargados consecutivamente, va agregando al menos una fila visible por iteracion
                //a menos que lazyload este activado
                i = firstloaded + parseInt(timeoutstep / t.timeoutstep) * t.maxcolumn;
                i = Math.min(i, t.imagelist.length);
            } else if (!t.lazyload) {
                i = firstloaded + 1;
            }

            j = 0;
            while (j < i) {
                //muestra las fotos hasta este punto, si esta activado placeholder, show errors o la imagen esta cargada sin errores
                if (t.lazyload || t.placeholder || t.showerrors || t.imagelist[j].loaded && !t.imagelist[j].error) {
                    t.message("Show image", j);
                    t.imagelist[j].img.fadeIn("slow");
                }
                j++;
            }


            if (i < t.imagelist.length || noloaded > 0) {
                t.message("Image max calculate", i);
                //solo vuelve a cargar si hay mas filas disponibles
                if (i > t.lasti || noloaded < t.lastnoloaded) {
                    t.lasti = i;
                    t.lastnoloaded = noloaded;
                    t.setrow(i);
                }
                if (t.timeout != null) {
                    clearTimeout(t.timeout);
                }
                t.timeout = setTimeout(t.splitrows.bind(t), timeoutstep + t.timeoutstep, timeoutstep + t.timeoutstep);
            } else {
                t.message("All images loaded");
                t.allloaded = true;
                t.setrow(i);
                t.setcolumns();
            }
            t.message("split rows finished", "position ", i, "total ", t.imagelist.length);
        }

        setrow(maxi) {
            let t = this;
            t.message("Set rows");
            //alto del contenedor muy largo para controlar la barra de desplazamiento 
            $('.split,.loading', t.container).remove();
            let i = 0;

            if (t.maxcolumn == 1) {
                t.message("1 column, autosize");
                $("img", t.container).height("auto").css("width", "100%");
                return;
            } else {
                while (i < maxi) {
                    let totalwidth = 0;
                    let count = 0;
                    let imagerow = [];

                    //separa la lista de imagenes en fila
                    //while (totalwidth <= t.containerwidth && (!t.allloaded || count < t.maxcolumn) && i < maxi) {
                    while (totalwidth <= t.containerwidth && (count < t.maxcolumn) && i < maxi) {
                        if (t.imagelist[i].width == 0) {
                            $(t.imagelist[i].img).width("auto").height(t.minheight);
                            t.imagelist[i].width = $(t.imagelist[i].img).width();
                        }
                        let currentwidth = t.imagelist[i].width;

                        if (currentwidth < t.minwidth) currentwidth = t.minwidth;
                        if (t.imagelist[i].error && !t.showerrors) {
                            i++;
                            continue;
                        }
                        //ajusto al ancho minimo para evitar que las fotos se vean demasiado pequeñas 
                        totalwidth += currentwidth;
                        if (totalwidth <= t.containerwidth || imagerow.length == 0) {
                            imagerow.push(t.imagelist[i]);
                            i++;
                        }
                        count++;
                    }

                    //por cada fila se define el ancho que tendran las fotos para caber en el ancho del contenedor correspondiente 
                    if (imagerow.length > 0) {
                        t.setwidth(imagerow);
                    }
                }
            }

            t.message("Set rows finished ", maxi, " images");
            if (maxi < t.imagelist.length) {
                t.container.append("<div class='loading'>loading...</div>");
            }
        }






        setwidth(row) {
            let t = this;
            let errorcalc = 0.01; // para controlar la diferencia con firefox
            t.message("Set width ", row.length, " images in this row", row);
            //calculo del ancho optimo
            let combinedWidth = 0;
            let errorwidth = 0;
            let last_width = 0;
            $.each(row, function() {
                if (this.width == 0) {
                    errorwidth++;
                } else {
                    if (last_width == 0 || last_width > this.width) {
                        last_width = this.width;
                    }
                }
                combinedWidth += this.width;
            });

            let diff = (t.containerwidth - t.margin * 2 * row.length) / combinedWidth;
            diff *= (1 - (errorwidth / row.length)); //por si existen fotos aun no cargadas


            t.message("Proportion", diff, " missing images", errorwidth);

            //si la foto es muy alta y esta sola, se ajusta para que no se desborde
            if (t.maxcolumn > 1 && row.length == 1 && t.minheight * 1.33 > row[0].width && row[0].width != 0) {
                t.message("Image too long, resize", row[0]);
                $(row[0].img).width("auto").height(t.minheight * 2);
            } else {
                $.each(row, function() {
                    if (this.width == 0) {
                        $(this.img).width(diff * last_width - errorcalc).height(diff * t.minheight - errorcalc);
                    } else {
                        $(this.img).width(diff * this.width - errorcalc).height("auto");
                    }
                });
            }

            //insertar salto de linea para evitar errores en caso de que una imagen falle en cargar
            var lastItem = row.pop().img;
            while (lastItem.parent()[0] != t.container[0]) {
                lastItem = lastItem.parent();
            }
            $('<br class="split"/>').insertAfter(lastItem);
        }
    }

    $.fn.ImageHeight = function(options) {
        var settings = $.extend({
            minwidth: 300,
            minheight: 100,
            maxrow: 5,
            margin: 10,
            lazyload: false, //experimental, use with caution
            placeholder: false, // True If you want to see placeholders for images to be loaded, or False to wait until a line is completely loaded to show it
            showerrors: false // If you want to see broken images And console logs (images visibility overrided by placeholder)
        }, options);

        return new ImageHeight(this, settings);
    }
}(jQuery));
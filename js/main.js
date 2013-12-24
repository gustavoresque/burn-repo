

(function($) {

    $(document).ready(function() {
        
        l("ready");
        var cronos = [];
        var endAudio = document.getElementById("audio");
        var beepAudio = document.getElementById("audioBeep");
        
        
        
        if(localStorage.modo && parseInt(localStorage.modo) === Cronometro.MODE_CONT){
            $("#selectModo").children().each(function(i){
                if(i===0){
                    $(this).attr("selected", true);
                }else{
                    $(this).attr("selected", false);
                }
            });
        }else{
            $("#selectModo").children().each(function(i){
                if(i===0){
                    $(this).attr("selected", false);
                }else{
                    $(this).attr("selected", true);
                }
            });
        }
        if(localStorage.time){
            var h, m, s;
            var tempoStorage = localStorage.time.split(" ");
            h = parseInt(tempoStorage[2]);m = parseInt(tempoStorage[1]);s = parseInt(tempoStorage[0]);
            $("#thoras").val(h); $("#tmin").val(m); $("#tseg").val(s);
        }
        if(localStorage.beep){
            var h, m, s;
            var beepStorage = localStorage.beep.split(" ");
            h = parseInt(beepStorage[2]);m = parseInt(beepStorage[1]);s = parseInt(beepStorage[0]);
            $("#bhoras").val(h); $("#bmin").val(m); $("#bseg").val(s);
        }
        

        $("#btnAddClock").on("click tap", function() {
            l("addClockTAPED");
            var c = new Cronometro();
            cronos.push(c);
            var h, m, s;
            
            if(localStorage.time){
                var tempoStorage = localStorage.time.split(" ");
                h = parseInt(tempoStorage[2]);m = parseInt(tempoStorage[1]);s = parseInt(tempoStorage[0]);
                $("#thoras").val(h); $("#tmin").val(m); $("#tseg").val(s);
            }else{
                h = parseInt($("#thoras").val()); m = parseInt($("#tmin").val()); s = parseInt($("#tseg").val());
            }
            c.setTime(s, m, h);
            var display = $("<div/>", {"class": "tempo", text: maskTemp(s, m, h)});
            
            if(localStorage.beep){
                var beepStorage = localStorage.beep.split(" ");
                h = parseInt(beepStorage[2]);m = parseInt(beepStorage[1]);s = parseInt(beepStorage[0]);
                $("#bhoras").val(h); $("#bmin").val(m); $("#bseg").val(s);
            }else{
                h = parseInt($("#bhoras").val()); m = parseInt($("#bmin").val()); s = parseInt($("#bseg").val());
            }
            c.setBeep(s, m, h);
            
            
           
            c.onCount(function(s, m, h) {
                display.text(maskTemp(s, m, h));
            }).onFinish(function() {
                display.parent().addClass("animfim");
                endAudio.play();
                //$("#audio").get(0).play();
                setTimeout(function() {
                    display.text(maskTemp.apply(this, c.getCurrentTime()));
                }, 100);

            }).onBeep(function() {
                //$("#audioBeep").get(0).play();
                beepAudio.play();
            }).onCountPerc(function(perc) {
                //console.log(perc);
                display.parent().children(".progressbar").css("width", perc+"%");
            });
            $("ul#listCronometro").append(
                    $("<li/>", {"class": "cronometro"}).append(
                        display).append(
                        $("<img/>", {"class": "btnPlay", src: "img/play.png"})).append(
                        $("<img/>", {"class": "btnPause", src: "img/pause.png"})).append(
                        $("<img/>", {"class": "btnStop", src: "img/stop.png"})).append(
                        $("<div/>", {"class": "progressbar"})));
        });

        $("ul#listCronometro").on("click tap", "li.cronometro > img.btnPlay", function() {
            //$(this).parent().attr("data-state", "play");
            //$(this).parent().attr("data-timeStamp", new Date().getTime());
            var t = $(this).parent();
            var i = $("ul#listCronometro > li").index(t);
            cronos[i].play();
            t.removeClass("animfim");
        });
        $("ul#listCronometro").on("click tap", "li.cronometro > img.btnPause", function() {
            var t = $(this).parent();
            var i = $("ul#listCronometro > li").index(t);
            cronos[i].pause();
            t.removeClass("animfim");
        });
        $("ul#listCronometro").on("click tap", "li.cronometro > img.btnStop", function() {
            var t = $(this).parent();
            var i = $("ul#listCronometro > li").index(t);
            cronos[i].stop();
            t.removeClass("animfim");
            t.children("div.tempo").text(maskTemp.apply(this, cronos[i].getCurrentTime()));
            t.children(".progressbar").css("width", "0%");
        });

        $(".inputTime").on("blur keyup", function() {
            var campo = $(this);
            var valor = parseInt(campo.val());
            if (isNaN(valor) || valor < 0) {
                valor = 0;
            }
            if (valor > 99) {
                valor = Math.floor(valor / 10);
            }

            campo.val(valor);
        }).on("focus mouseup", function() {
            $(this).get(0).select();
        }).on("tap", function(e) {
            $(e.target).trigger({type: "click", target: e.target});
            $(e.target).trigger({type: "focus", target: e.target});
        });

        $("#btnConfirmSetting").on("click tap", function() {
            var h = parseInt($("#thoras").val()), m = parseInt($("#tmin").val()), s = parseInt($("#tseg").val());
            localStorage.time = s+" "+m+" "+h;
            for (var i=0;i<cronos.length;i++){
                    cronos[i].setTime(s, m, h);
            }
            h = parseInt($("#bhoras").val()), m = parseInt($("#bmin").val()), s = parseInt($("#bseg").val());
            localStorage.beep = s+" "+m+" "+h;
            for (var i=0;i<cronos.length;i++){
                    cronos[i].setBeep(s, m, h);
            }
            $("#settingsPage").slideUp("slow");
        });

        $("#btnSetting").on("click tap", function() {
            $("#settingsPage").slideDown("slow");
        });
        
        $("#selectModo").on("change", function(){
            var modo = $(this).children("option:selected").text();
            if(modo === "Contador"){
                localStorage.modo = Cronometro.MODE_CONT;
                for (var i=0;i<cronos.length;i++){
                    cronos[i].setMode(Cronometro.MODE_CONT);
                }
            }else if(modo === "Regressivo"){
                localStorage.modo = Cronometro.MODE_REGR;
                for (var i=0;i<cronos.length;i++){
                    cronos[i].setMode(Cronometro.MODE_REGR);
                }
            }
        }).on("tap", function(e) {
            $(e.target).trigger({type: "click", target: e.target});
            $(e.target).trigger({type: "focus", target: e.target});
        });

        endAudio.addEventListener("ended", function() {
            endAudio.load();
        }, false);
        beepAudio.addEventListener("ended", function() {
            beepAudio.load();
        }, false);
        
        
        //Para dispositivos móveis
        var tar, duracao;
        var todo = document.getElementById("todo");
        todo.addEventListener("touchstart", function(e){
            e.preventDefault();
            //l("touchstart");
            tar = e.target;
            duracao = new Date().getTime();
        }, false);
        todo.addEventListener("touchend", function(e){
            e.preventDefault();
            //l("touchend");
            if(tar == e.target && (new Date().getTime()) - duracao <2000){
                l("tap");
                $(e.target).trigger({type: "tap", target: e.target});
            }
        }, false);
        
//        $("body").on("touchstart", function(e){
//            e.preventDefault();
//            tar = e.target;
//            duracao = new Date().getTime();
//        }).on("touchend", function(e){
//            e.preventDefault();
//            if(tar === e.target && (new Date().getTime()) - duracao <2000){
//                $(e.target).trigger("click");
//            }
//        });
        
        
        
        /*
         setInterval(function() {
         var temp;
         $("ul#listCronometro > li.cronometro").each(function() {
         temp = new Date().getTime();
         var li = $(this);
         if (li.attr("data-state") === "play"){
         var down = temp - parseInt(li.attr("data-timeStamp"));
         down = 300000 - down;
         //down = 3000 - down;
         //console.log(down);
         var dias = Math.floor(down / 86400000);
         var horas = Math.floor((down - (dias * 86400000)) / 3600000);
         var minutos = Math.floor((down - (horas * 3600000) - (dias * 86400000)) / 60000);
         var segundos = Math.floor((down - (horas * 3600000) - (minutos * 60000) - (dias * 86400000)) / 1000);
         li.children("div.tempo").text(
         (horas < 10 ? "0" + horas : horas) +
         ":" + (minutos < 10 ? "0" + minutos : minutos) +
         ":" + (segundos < 10 ? "0" + segundos : segundos));
         if(dias === 0 && horas === 0 && minutos === 0 && segundos <= 0){
         li.attr("data-state", "stop");
         li.addClass("animfim");
         $("#audio").get(0).play();
         }
         }
         
         });
         
         }, 70); */


    });

    function maskTemp(s, m, h) { 
        return (h < 10 ? "0" + h : h) +
                ":" + (m < 10 ? "0" + m : m) +
                ":" + (s < 10 ? "0" + s : s);
    }
    
    function l(p){
        if(true){
            console.log(p);
        }
    }


})(jQuery);
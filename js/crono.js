
/**
 * Cria um objeto de Cronometro ao chamar new Cronometro
 * @type unresolved
 */

var Cronometro = (function() {

    //guarda as instâncias de cronometro criadas
    var cronometros = [];
    var interval = -1;




    function iniciarIntervalo() {
        //se o intervalo não foi iniciado.
        if (interval === -1) {
            //configura um itervalo.
            interval = setInterval(function() {
                var t = (new Date()).getTime();
                var taux = 0;
                for (var i = 0; i < cronometros.length; i++) {
                    if (cronometros[i].getState() === Cronometro.STATE_PLAY) {
                        taux = t - cronometros[i].playTime;
                        cronometros[i].increment(taux);
                        cronometros[i].playTime = t;
                    }
                }

            }, 90);
        }

    }


    function pararIntervalo() {
        clearInterval(interval);
        interval = -1;
    }

    function millisToClock(millis) {
        var horas = Math.floor(millis / 3600000);
        millis -= horas * 3600000;
        var minutos = Math.floor(millis / 60000);
        millis -= minutos * 60000;
        var segundos = Math.floor(millis / 1000);
        return [segundos, minutos, horas];
    }
    function clockToMillis(segundos, minutos, horas) {
        return (segundos * 1000) + (minutos * 60000) + (horas * 3600000);
    }

    // retorna o construtro de Cronometro.
    return (function() {
        var mode;
        if (localStorage.modo) {
            mode = parseInt(localStorage.modo);
        } else {
            mode = Cronometro.MODE_REGR;
        }

        var time = 3000;
        var state = Cronometro.STATE_STOP;
        var currentTime = 0;
        var seg = -1;
        var beepTime;
        var beep;
        if (localStorage.beep) {
            console.log(localStorage.beep);
            beepTime = clockToMillis.apply(this, localStorage.beep.split(" "));
            if (beepTime === 0) {
                beep = false;
            } else {
                beep = true;
            }
        } else {
            beepTime = 0;
            beep = false;
        }

        var oncountCallback;
        var onFinishCallback;
        var onBeepCallback;
        var oncountPercCallback;

        var cronoObj = {
            playTime: 0,
            setBeep: function(s, m, h) {
                beepTime = clockToMillis(s, m, h);
                if (beepTime === 0) {
                    beep = false;
                } else {
                    beep = true;
                }
            },
            setMode: function(m) {
                mode = m;
            },
            setTime: function(seg, min, horas) {
                time = clockToMillis(seg, min, horas);
            },
            getCurrentTime: function() {
                if (mode === Cronometro.MODE_CONT) {
                    return millisToClock(currentTime);
                } else if (mode === Cronometro.MODE_REGR) {
                    return  millisToClock(time - currentTime);
                }

            },
            getTimeMillis: function() {
                return time;
            },
            getState: function() {
                return state;
            },
            increment: function(t) {

                currentTime += t;

                var aux = Math.floor(currentTime / 1000);
                if (aux > seg) {
                    seg = aux;
                    //chama o callback para atualizar o cliente do objeto.
                    setTimeout(function() {
                        if (mode === Cronometro.MODE_REGR) {
                            //console.log(time - currentTime - 2);
                            oncountCallback.apply(this, millisToClock(time - currentTime - 2));
                        } else if (mode === Cronometro.MODE_CONT) {
                            oncountCallback.apply(this, millisToClock(currentTime));
                        }
                        oncountPercCallback(Math.round((currentTime*100)/time));
                        if (currentTime > beepTime && beep) {
                            beep = false;
                            onBeepCallback();
                        }
                    }, 5);
                }
                if (currentTime >= time) {
                    state = Cronometro.STATE_STOP;
                    currentTime = 0;
                    seg = -1;
                    if (beepTime === 0) {
                        beep = false;
                    } else {
                        beep = true;
                    }
                    setTimeout(function() {
                        onFinishCallback();
                    }, 5);
                }

                //chamar evento onCount
            },
            play: function() {
                this.playTime = (new Date()).getTime();
                state = Cronometro.STATE_PLAY;
            },
            pause: function() {
                state = Cronometro.STATE_PAUSE;
            },
            stop: function() {
                state = Cronometro.STATE_STOP;
                currentTime = 0;
                seg = -1;
                if (beepTime === 0) {
                    beep = false;
                } else {
                    beep = true;
                }
            },
            onFinish: function(f) {
                onFinishCallback = f;
                return this;
            },
            onCount: function(f) {
                oncountCallback = f;
                return this;
            },
            onCountPerc: function(f) {
                oncountPercCallback = f;
                return this;
            },
            onPause: function() {
                
            },
            onStop: function() {
                
            },
            onBeep: function(f) {
                onBeepCallback = f;
                return this;
            }
        };

        /*ao chamar o construtor o objeto de cronometro será armazenado no array
         antes de ser retornado.*/
        cronometros.push(cronoObj);
        iniciarIntervalo();
        return cronoObj;
    });
})();

Cronometro.STATE_PLAY = 0;
Cronometro.STATE_STOP = 1;
Cronometro.STATE_PAUSE = 2;
Cronometro.MODE_CONT = 3;
Cronometro.MODE_REGR = 4;


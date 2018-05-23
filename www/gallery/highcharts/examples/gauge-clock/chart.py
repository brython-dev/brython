import datetime
from browser import document, timer, window

b_highchart = window.Highcharts.Chart.new

class Now:

    def __init__(self):
        now = datetime.datetime.now()
            
        self.hours = now.hour + now.minute / 60
        self.minutes = now.minute * 12 / 60 + now.second * 12 / 3600
        self.seconds = now.second * 12 / 60

now = Now()

chart = b_highchart({
    'chart': {
        'type': 'gauge',
        'plotBackgroundColor': None,
        'plotBackgroundImage': None,
        'plotBorderWidth': 0,
        'plotShadow': False,
        'height': 200,
        'renderTo': 'container'
    },
    
    'credits': {
        'enabled': False
    },
    
    'title': {
        'text': 'The Highcharts clock'
    },
    
    'pane': {
        'background': [{
            # default background
        }, {
            # reflex for supported browsers
            'backgroundColor': {
                'radialGradient': {
                    'cx': 0.5,
                    'cy': -0.4,
                    'r': 1.9
                },
                'stops': [
                    [0.5, 'rgba(255, 255, 255, 0.2)'],
                    [0.5, 'rgba(200, 200, 200, 0.2)']
                ]
            }
        }]
    },
    
    'yAxis': {
        'labels': {
            'distance': -20
        },
        'min': 0,
        'max': 12,
        'lineWidth': 0,
        'showFirstLabel': False,
        
        'minorTickInterval': 'auto',
        'minorTickWidth': 1,
        'minorTickLength': 5,
        'minorTickPosition': 'inside',
        'minorGridLineWidth': 0,
        'minorTickColor': '#666',

        'tickInterval': 1,
        'tickWidth': 2,
        'tickPosition': 'inside',
        'tickLength': 10,
        'tickColor': '#666',
        'title': {
            'text': 'Powered by<br/>Highcharts',
            'style': {
                'color': '#BBB',
                'fontWeight': 'normal',
                'fontSize': '8px',
                'lineHeight': '10px'                
            },
            'y': 10
        }
    },
    
    'tooltip': {
        #'formatter': function () {
        #    return this.series.chart.tooltipText;
        #}
    },

    'series': [{
        'data': [{
            'id': 'hour',
            'y': now.hours,
            'dial': {
                'radius': '60%',
                'baseWidth': 4,
                'baseLength': '95%',
                'rearLength': 0
            }
        }, {
            'id': 'minute',
            'y': now.minutes,
            'dial': {
                'baseLength': '95%',
                'rearLength': 0
            }
        }, {
            'id': 'second',
            'y': now.seconds,
            'dial': {
                'radius': '100%',
                'baseWidth': 1,
                'rearLength': '20%'
            }
        }],
        'animation': False,
        'dataLabels': {
            'enabled': False
        }
    }]


})


def move():
    hour = chart.get('hour')
    minute = chart.get('minute')
    second = chart.get('second')
    now = Now()
    # run animation unless we're wrapping around from 59 to 0
    animation = False
    if now.seconds == 0:
        animation = {'easing': 'easeOutElastic'}
            
    # Cache the tooltip text
    #chart.tooltipText = 
    #    pad(Math.floor(now.hours), 2) + ':' + 
    #    pad(Math.floor(now.minutes * 5), 2) + ':' + 
    #    pad(now.seconds * 5, 2);
    
    hour.update(now.hours, True, animation)
    minute.update(now.minutes, True, animation)
    second.update(now.seconds, True, animation)

timer.set_interval(move, 1000)

"""

    /**
     * Pad numbers
     */
    function pad(number, length) {
        // Create an array of the remaining length +1 and join it with 0's
        return new Array((length || 2) + 1 - String(number).length).join(0) + number;
    }
                           
    // Move
    function (chart) {
        setInterval(function () {
            var hour = chart.get('hour'),
                minute = chart.get('minute'),
                second = chart.get('second'),
                now = getNow(),
                // run animation unless we're wrapping around from 59 to 0
                animation = now.seconds == 0 ? 
                    false : 
                    {
                        easing: 'easeOutElastic'
                    };
                    
            // Cache the tooltip text
            chart.tooltipText = 
                pad(Math.floor(now.hours), 2) + ':' + 
                pad(Math.floor(now.minutes * 5), 2) + ':' + 
                pad(now.seconds * 5, 2);
            
            hour.update(now.hours, true, animation);
            minute.update(now.minutes, true, animation);
            second.update(now.seconds, true, animation);
            
        }, 1000);
    
    });
});

// Extend jQuery with some easing (copied from jQuery UI)
$.extend($.easing, {
    easeOutElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    }
});
"""
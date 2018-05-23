from browser import window

b_highchart = window.Highcharts.Chart.new

b_highchart({
    'chart':{
        'type': 'area',
        'renderTo': 'container'
    },
    'title': {
        'text': 'Historic and Estimated Worldwide Population Growth by Region'
    },
    'subtitle': {
        'text': 'Source: Wikipedia.org'
    },
    'xAxis': {
        'categories': ['1750', '1800', '1850', '1900', '1950', '1999', '2050'],
        'tickmarkPlacement': 'on',
        'title': {
            'enabled': False
        }
    },
    'yAxis': {
        'title': {
            'text': 'Billions'
        },
        #'labels': {
        #    'formatter': function() {
        #        return this.value / 1000;
        #    }
        #}
    },
    'tooltip': {
        'shared': True,
        'valueSuffix': ' millions'
    },
    'plotOptions': {
        'area': {
            'stacking': 'normal',
            'lineColor': '#666666',
            'lineWidth': 1,
            'marker': {
                'lineWidth': 1,
                'lineColor': '#666666'
            }
        }
    },
    'series': [{
        'name': 'Asia',
        'data': [502, 635, 809, 947, 1402, 3634, 5268]
    }, {
        'name': 'Africa',
        'data': [106, 107, 111, 133, 221, 767, 1766]
    }, {
        'name': 'Europe',
        'data': [163, 203, 276, 408, 547, 729, 628]
    }, {
        'name': 'America',
        'data': [18, 31, 54, 156, 339, 818, 1201]
    }, {
        'name': 'Oceania',
        'data': [2, 2, 2, 6, 13, 30, 46]
    }]
})
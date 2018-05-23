from browser import window

b_highchart = window.Highcharts.Chart.new

b_highchart({        
    'chart': {
        'plotBackgroundColor': None,
        'plotBorderWidth': None,
        'plotShadow': False,
        'renderTo': 'container'
    },
    'title': {
        'text': 'Browser market shares at a specific website, 2014'
    },
    'tooltip': {
        'pointFormat': '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    'plotOptions': {
        'pie': {
            'allowPointSelect': True,
            'cursor': 'pointer',
            'dataLabels': {
                'enabled': True,
                'format': '<b>{point.name}</b>: {point.percentage:.1f} %',
                'style': {
                    'color': 'black'
                }
            }
        }
    },
    'series': [{
        'type': 'pie',
        'name': 'Browser share',
        'data': [
            ['Firefox',   45.0],
            ['IE',       26.8],
            {
                'name': 'Chrome',
                'y': 12.8,
                'sliced': True,
                'selected': True
            },
            ['Safari',    8.5],
            ['Opera',     6.2],
            ['Others',   0.7]
        ]
    }]
})
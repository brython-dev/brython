from browser import window

b_highchart = window.Highcharts.Chart.new

b_highchart({
    'chart': {
        'type': 'bar',
        'renderTo': 'container'
    },
    'title': {
        'text': 'Stacked bar chart'
    },
    'xAxis': {
        'categories': ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    'yAxis': {
        'min': 0,
        'title': {
            'text': 'Total fruit consumption'
        }
    },
    'legend': {
        'reversed': True
    },
    'plotOptions': {
        'series': {
            'stacking': 'normal'
        }
    },
        'series': [{
        'name': 'John',
        'data': [5, 3, 4, 7, 2]
    }, {
        'name': 'Jane',
        'data': [2, 2, 3, 2, 1]
    }, {
        'name': 'Joe',
        'data': [3, 4, 4, 2, 5]
    }]
})
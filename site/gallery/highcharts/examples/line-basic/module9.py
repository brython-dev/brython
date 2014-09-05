from browser import document
from javascript import JSConstructor
b_highcharts = JSConstructor(Highcharts.Chart)
chart1 = b_highcharts(
    {
    'chart': {
        'type': 'bar',
        'renderTo' : 'container'
    },
    'title': {
        'text': 'Fruit Consumption'
        'renderTo' : 'container'
    },
    'xAxis': {
        'categories': ['Apples', 'Bananas', 'Oranges']
        'renderTo' : 'container'
    },
    'yAxis': {
        'title': {
            'text': 'Fruit eaten'
        }
        'renderTo' : 'container'
    },
    'series': [{
        'name': 'Jane',
        'data': [1, 0, 4]
    }, {
        'name': 'John',
        'data': [5, 7, 3]
    }]
})

from browser import document, window

b_highchart = window.Highcharts.Chart.new

chart = b_highchart({
    'chart': {
        'renderTo': 'container',
        'type': 'column',
        'margin': 75,
        'options3d': {
            'enabled': True,
            'alpha': 15,
            'beta': 15,
            'depth': 50,
            'viewDistance': 25
        }
    },
    'title': {
        'text': 'Chart rotation demo'
    },
    'subtitle': {
        'text': 'Test options by dragging the sliders below'
    },
    'plotOptions': {
        'column': {
            'depth': 25
        }
    },
    'series': [{
        'data': [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
    }]
})

def showValues():
    document['R0-value'].html = chart.options.chart.options3d.alpha
    document['R1-value'].html = chart.options.chart.options3d.beta

showValues()

# activate the sliders
def change_alpha(ev):
    chart.options.chart.options3d.alpha = ev.target.value
    showValues()
    chart.redraw(False)

def change_beta(ev):
    chart.options.chart.options3d.beta = ev.target.value
    showValues()
    chart.redraw(False)

document['R0'].bind('change', change_alpha)
document['R1'].bind('change', change_beta)
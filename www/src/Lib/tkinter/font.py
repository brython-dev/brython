class Constant:

    def __init__(self, value):
        self.value = value

    def __repr__(self):
        return self.value
        
NORMAL = Constant('NORMAL')
BOLD = Constant('BOLD')
ITALIC = Constant('ITALIC')

class Font:

    def __init__(self, *, font=None, family=None, size=None, weight=NORMAL,
                 slant=NORMAL, underline=0, overstrike=0):
        if isinstance(font, tuple):
            family, size, slant = font
        else:
            family = font
        css = {}
        if family is not None:
            css['font-family'] = f'{family}'
        if size is not None:
            css['font-size'] = f'{size}px'
        css['font-weight'] = f'{weight}'
        css['font-style'] = f'{slant}'
        self.css = css
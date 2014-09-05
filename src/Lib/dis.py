def dis(src):
    return __BRYTHON__.JSObject(__BRYTHON__.py2js(src)).to_js()

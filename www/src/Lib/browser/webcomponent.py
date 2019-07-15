class WebComponent(type):

    def __new__(cls, name, bases, cl_dict):
        klass = type.__new__(cls, name, bases, cl_dict)
        __BRYTHON__.createWebComponent(klass)
        return klass
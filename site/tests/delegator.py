#---------------------------------------------
#file delegator.py
__author__ = 'carlo'
AGLOBAL = None


class Delegator:
    def __init__(self, some):
        global AGLOBAL
        AGLOBAL = self
        self.some = some
        self.delegated = Delegated(self)


class Delegated(Delegator):
    def __init__(self, delegator):
        self.some = AGLOBAL.some
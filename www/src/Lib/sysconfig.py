"""Access to Python's configuration information."""

#well emulate this module since it does with settings very close to the
#OS and metal

variables={'TANH_PRESERVES_ZERO_SIGN': 0, 'WITH_DOC_STRINGS': 0}

def get_config_var(var):
    if var in variables:
       return variables[var]

    raise NotImplementedError("sysconfig.py:get_config_var: variable '%s' does not exist" % variable)

from browser import html, document, window
import javascript


#memorize/cache?
def _get_value(other):
    if isinstance(other, LongInt):
       return other.value
    return other


class BigInt:
  def __init__(self):
      pass

  def __abs__(self):
      return LongInt(self.value.abs())

  def __add__(self, other):
      return LongInt(self.value.plus(_get_value(other)))

  def __and__(self, other):
      pass

  def __divmod__(self, other):
      _value=_get_value(other)
      return LongInt(self.value.div(_value)), LongInt(self.value.mod(_value))

  def __div__(self, other):
      return LongInt(self.value.div(_get_value(other)))

  def __eq__(self, other):
      return bool(self.value.eq(_get_value(other)))

  def __floordiv__(self, other):
      return LongInt(self.value.div(_get_value(other)).floor())

  def __ge__(self, other):
      return bool(self.value.gte(_get_value(other)))

  def __gt__(self, other):
      return bool(self.value.gt(_get_value(other)))

  def __index__(self):
      if self.value.isInt():
         return int(self.value.toNumber())

      raise TypeError("This is not an integer")

  def __le__(self, other):
      return bool(self.value.lte(_get_value(other)))

  def __lt__(self, other):
      return bool(self.value.lt(_get_value(other)))

  def __lshift__(self, shift):
      if isinstance(shift, int):
         _v=LongInt(2)**shift
         return LongInt(self.value.times(_v.value))

  def __mod__(self, other):
      return LongInt(self.value.mod(_get_value(other)))

  def __mul__(self, other):
      return LongInt(self.value.times(_get_value(other)))

  def __neg__(self, other):
      return LongInt(self.value.neg(_get_value(other)))

  def __or__(self, other):
      pass

  def __pow__(self, other):
      return LongInt(self.value.pow(_get_value(other)))

  def __rshift__(self, other):
      pass

  def __sub__(self, other):
      return LongInt(self.value.minus(_get_value(other)))
     
  def __repr__(self):
      return "%s(%s)" % (self.__name__, self.value.toString(10))

  def __str__(self):
      return "%s(%s)" % (self.__name__, self.value.toString(10))

  def __xor__(self, other):
      pass


_precision=20
def get_precision(value):
    if isinstance(value, LongInt):
       return len(str(value.value.toString(10)))
    return len(str(value))

class DecimalJS(BigInt):
  def __init__(self, value=0, base=10):
      global _precision
      _prec=get_precision(value)
      if _prec > _precision:
         _precision=_prec
         window.eval('Decimal.precision=%s' % _precision)

      self.value=javascript.JSConstructor(window.Decimal)(value, base)

class BigNumberJS(BigInt):
  def __init__(self, value=0, base=10):
      self.value=javascript.JSConstructor(window.BigNumber)(value, base)

class BigJS(BigInt):
  def __init__(self, value=0, base=10):
      self.value=javascript.JSConstructor(window.Big)(value, base)

  def __floordiv__(self, other):
      _v=LongInt(self.value.div(_get_value(other)))
      if _v >= 0:
         return LongInt(_v.value.round(0, 0))  #round down

      return LongInt(_v.value.round(0, 3))  #round up

  def __pow__(self, other):
      if isinstance(other, LongInt):
         _value=int(other.value.toString(10))
      elif isinstance(other, str):
         _value=int(other)

      return LongInt(self.value.pow(_value))


#_path = __file__[:__file__.rfind('/')]+'/'
_path = __BRYTHON__.brython_path + 'Lib/long_int1/'

#to use decimal.js library uncomment these 2 lines
#javascript.load(_path+'decimal.min.js', ['Decimal'])
#LongInt=DecimalJS

#to use bignumber.js library uncomment these 2 lines
javascript.load(_path+'bignumber.min.js', ['BigNumber'])
LongInt=BigNumberJS

#big.js does not have a "base" so only base 10 stuff works.
#to use big.js library uncomment these 2 lines
#javascript.load(_path+'big.min.js', ['Big'])
#LongInt=BigJS

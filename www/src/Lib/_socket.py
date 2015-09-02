"""Implementation module for socket operations.

See the socket module for documentation."""


AF_APPLETALK = 16

AF_DECnet = 12

AF_INET = 2

AF_INET6 = 23

AF_IPX = 6

AF_IRDA = 26

AF_SNA = 11

AF_UNSPEC = 0

AI_ADDRCONFIG = 1024

AI_ALL = 256

AI_CANONNAME = 2

AI_NUMERICHOST = 4

AI_NUMERICSERV = 8

AI_PASSIVE = 1

AI_V4MAPPED = 2048

CAPI = '<capsule object "_socket.CAPI" at 0x00BC4F38>'

EAI_AGAIN = 11002

EAI_BADFLAGS = 10022

EAI_FAIL = 11003

EAI_FAMILY = 10047

EAI_MEMORY = 8

EAI_NODATA = 11001

EAI_NONAME = 11001

EAI_SERVICE = 10109

EAI_SOCKTYPE = 10044

INADDR_ALLHOSTS_GROUP = -536870911

INADDR_ANY = 0

INADDR_BROADCAST = -1

INADDR_LOOPBACK = 2130706433

INADDR_MAX_LOCAL_GROUP = -536870657

INADDR_NONE = -1

INADDR_UNSPEC_GROUP = -536870912

IPPORT_RESERVED = 1024

IPPORT_USERRESERVED = 5000

IPPROTO_ICMP = 1

IPPROTO_IP = 0

IPPROTO_RAW = 255

IPPROTO_TCP = 6

IPPROTO_UDP = 17

IPV6_CHECKSUM = 26

IPV6_DONTFRAG = 14

IPV6_HOPLIMIT = 21

IPV6_HOPOPTS = 1

IPV6_JOIN_GROUP = 12

IPV6_LEAVE_GROUP = 13

IPV6_MULTICAST_HOPS = 10

IPV6_MULTICAST_IF = 9

IPV6_MULTICAST_LOOP = 11

IPV6_PKTINFO = 19

IPV6_RECVRTHDR = 38

IPV6_RECVTCLASS = 40

IPV6_RTHDR = 32

IPV6_TCLASS = 39

IPV6_UNICAST_HOPS = 4

IPV6_V6ONLY = 27

IP_ADD_MEMBERSHIP = 12

IP_DROP_MEMBERSHIP = 13

IP_HDRINCL = 2

IP_MULTICAST_IF = 9

IP_MULTICAST_LOOP = 11

IP_MULTICAST_TTL = 10

IP_OPTIONS = 1

IP_RECVDSTADDR = 25

IP_TOS = 3

IP_TTL = 4

MSG_BCAST = 1024

MSG_CTRUNC = 512

MSG_DONTROUTE = 4

MSG_MCAST = 2048

MSG_OOB = 1

MSG_PEEK = 2

MSG_TRUNC = 256

NI_DGRAM = 16

NI_MAXHOST = 1025

NI_MAXSERV = 32

NI_NAMEREQD = 4

NI_NOFQDN = 1

NI_NUMERICHOST = 2

NI_NUMERICSERV = 8

RCVALL_MAX = 3

RCVALL_OFF = 0

RCVALL_ON = 1

RCVALL_SOCKETLEVELONLY = 2

SHUT_RD = 0

SHUT_RDWR = 2

SHUT_WR = 1

SIO_KEEPALIVE_VALS = 2550136836

SIO_RCVALL = 2550136833

SOCK_DGRAM = 2

SOCK_RAW = 3

SOCK_RDM = 4

SOCK_SEQPACKET = 5

SOCK_STREAM = 1

SOL_IP = 0

SOL_SOCKET = 65535

SOL_TCP = 6

SOL_UDP = 17

SOMAXCONN = 2147483647

SO_ACCEPTCONN = 2

SO_BROADCAST = 32

SO_DEBUG = 1

SO_DONTROUTE = 16

SO_ERROR = 4103

SO_EXCLUSIVEADDRUSE = -5

SO_KEEPALIVE = 8

SO_LINGER = 128

SO_OOBINLINE = 256

SO_RCVBUF = 4098

SO_RCVLOWAT = 4100

SO_RCVTIMEO = 4102

SO_REUSEADDR = 4

SO_SNDBUF = 4097

SO_SNDLOWAT = 4099

SO_SNDTIMEO = 4101

SO_TYPE = 4104

SO_USELOOPBACK = 64

class SocketType:
    pass

TCP_MAXSEG = 4

TCP_NODELAY = 1

__loader__ = '<_frozen_importlib.ExtensionFileLoader object at 0x00CA2D90>'

def dup(*args,**kw):
    """dup(integer) -> integer    
    Duplicate an integer socket file descriptor.  This is like os.dup(), but for
    sockets; on some platforms os.dup() won't work for socket file descriptors."""
    pass

class error:
    pass

class gaierror:
    pass

def getaddrinfo(*args,**kw):
    """getaddrinfo(host, port [, family, socktype, proto, flags])        -> list of (family, socktype, proto, canonname, sockaddr)
    
    Resolve host and port into addrinfo struct."""
    pass

def getdefaulttimeout(*args,**kw):
    """getdefaulttimeout() -> timeout    
    Returns the default timeout in seconds (float) for new socket objects.
    A value of None indicates that new socket objects have no timeout.
    When the socket module is first imported, the default is None."""
    pass

def gethostbyaddr(*args,**kw):
    """gethostbyaddr(host) -> (name, aliaslist, addresslist)    
    Return the true host name, a list of aliases, and a list of IP addresses,
    for a host.  The host argument is a string giving a host name or IP number."""
    pass

def gethostbyname(*args,**kw):
    """gethostbyname(host) -> address    
    Return the IP address (a string of the form '255.255.255.255') for a host."""
    pass

def gethostbyname_ex(*args,**kw):
    """gethostbyname_ex(host) -> (name, aliaslist, addresslist)    
    Return the true host name, a list of aliases, and a list of IP addresses,
    for a host.  The host argument is a string giving a host name or IP number."""
    pass

def gethostname(*args,**kw):
    """gethostname() -> string    
    Return the current host name."""
    pass

def getnameinfo(*args,**kw):
    """getnameinfo(sockaddr, flags) --> (host, port)    
    Get host and port for a sockaddr."""
    pass

def getprotobyname(*args,**kw):
    """getprotobyname(name) -> integer    
    Return the protocol number for the named protocol.  (Rarely used.)"""
    pass

def getservbyname(*args,**kw):
    """getservbyname(servicename[, protocolname]) -> integer    
    Return a port number from a service name and protocol name.
    The optional protocol name, if given, should be 'tcp' or 'udp',
    otherwise any protocol will match."""
    pass

def getservbyport(*args,**kw):
    """getservbyport(port[, protocolname]) -> string    
    Return the service name from a port number and protocol name.
    The optional protocol name, if given, should be 'tcp' or 'udp',
    otherwise any protocol will match."""
    pass

has_ipv6 = True

class herror:
    pass

def htonl(*args,**kw):
    """htonl(integer) -> integer    
    Convert a 32-bit integer from host to network byte order."""
    pass

def htons(*args,**kw):
    """htons(integer) -> integer    
    Convert a 16-bit integer from host to network byte order."""
    pass

def inet_aton(*args,**kw):
    """inet_aton(string) -> bytes giving packed 32-bit IP representation    
    Convert an IP address in string format (123.45.67.89) to the 32-bit packed
    binary format used in low-level network functions."""
    pass

def inet_ntoa(*args,**kw):
    """inet_ntoa(packed_ip) -> ip_address_string    
    Convert an IP address from 32-bit packed binary format to string format"""
    pass

def ntohl(*args,**kw):
    """ntohl(integer) -> integer    
    Convert a 32-bit integer from network to host byte order."""
    pass

def ntohs(*args,**kw):
    """ntohs(integer) -> integer    
    Convert a 16-bit integer from network to host byte order."""
    pass

def setdefaulttimeout(*args,**kw):
    """setdefaulttimeout(timeout)    
    Set the default timeout in seconds (float) for new socket objects.
    A value of None indicates that new socket objects have no timeout.
    When the socket module is first imported, the default is None."""
    pass

class socket:
    def __init__(self,*args,**kw):
        pass
    def bind(self,*args,**kw):
        pass
    def close(self):
        pass

class timeout:
    pass

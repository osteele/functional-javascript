#!/usr/bin/python

import os
import cgi
import sys
import traceback
import dotparser
from encoder import JSONEncoder

print "Content-type: text/plain"
print

def getCachedString(key, fn):
    import urllib
    fname = os.path.join('cache', urllib.quote_plus(key, '') + '.json')
    if os.path.exists(fname):
        return open(fname).read()
    else:
        text = fn()
        open(fname, 'w').write(text)
        return text

def reader(filename):
    obj = dotparser.parse(open(pathname).read())
    return JSONEncoder().encode(obj)

try:
    form = cgi.FieldStorage()
    filename = form.getvalue('filename')
    pathname = os.path.join('graphviz-examples/Directed', filename)
    print getCachedString(filename, lambda: reader(filename))
except Exception, e:
    print 'Error:', e

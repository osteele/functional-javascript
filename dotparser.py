def str2pt(str):
    # >>> str2pt('1,2')
    # {x: 1, y: 2}
    x, y = str.split(',')
    return {'x': float(x), 'y': float(y)}

def addAttributes(source):    
    from tempfile import mkstemp
    
    inf = mkstemp('.dot')[1]
    f = open(inf, 'w')
    f.write(source)
    f.close()
    
    outf = mkstemp('.dot')[1]
    bindir = "/Applications/Graphviz.app/Contents/MacOS"
    import os
    if not os.path.isfile(os.path.join(bindir, 'dot')):
        bindir = "/home/osteele/bin"
    import os
    os.system("%s %s -o %s" % (bindir+"/dot", inf, outf))
    f = open(outf)
    s = f.read()
    return s

class DotParser:
    def __init__(self):
        self.graph = {}
        self.nodes = self.graph['nodes'] = {}
        self.edges = self.graph['edges'] = []
        self.nodeDefaults = {}

Types = {
    'size': 'point',
    'lp': 'point',
    'bb': 'rect',
    'width': 'number',
    'height': 'number'}

def parse(s):
    import re
    s = addAttributes(s)
    s = re.sub(r'\\\n', '', s)
    #print s
    parser = DotParser()
    # look greedy inside []
    for label, attrs in re.findall(r'([^[\n\t]+?)\s+\[((?:[^"\]]|"(?:[^"]|\\.)*?")*?)\]', s):
        h = {}
        for k, v1, v2 in re.findall(r'([^=,\s]+)=(?:"((?:[^"\\]|\\.)*?)"|([^,""]*))', attrs):
            v = v1 or v2
            if k == 'pos' and v.startswith('e'):
                arp, v = re.match(r'e,(\d+,\d+)\s+(.*)', v).groups()
                if v=='': raise 'oops'
                h['endArrow'] = str2pt(arp)
            if k == 'pos':
                v = [{'x': float(ps[0]), 'y': float(ps[1])}
                     for ps in [xx.split(',') for xx in v.split(' ')]]
            if k == 'label':
                v = re.sub(r'\\(["\\])', r'\1', v)
            if Types.get(k) == 'point':
                v = str2pt(v)
            if Types.get(k) == 'rect':
                v = [float(f) for f in v.split(',')]
            if Types.get(k) == 'number':
                v = float(v)
            h[k] = v
        if label == 'graph' or label == 'digraph':
            parser.graph.update(h)
            continue
        if label == 'node':
            del h['label']
            parser.nodeDefaults.update(h)
            continue
        match = re.match("(.*?)\s*->\s*(.*)", label)
        #print label, h, attrs
        if match:
            # edge
            h['start'], h['stop'] = match.groups()
            parser.edges += [h]
        else:
            # node
            h['pos'] = h['pos'][0]
            node = {}
            node.update(parser.nodeDefaults)
            node.update(h)
            parser.nodes[label] = node
    return parser.graph

#print parse(open('graphviz-examples/Directed/abstract.dot').read())

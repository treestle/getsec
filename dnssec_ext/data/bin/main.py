#!/usr/bin/env python
import sys, getopt, json
import getdns_wrapper

def main(argv):
    func=""
    try:
        opts, args = getopt.getopt(argv,"hv:",["validate="])
    except getopt.GetoptError:
        print 'test.py -v <inputurl>'
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print 'test.py -v <inputurl>'
            sys.exit()
        elif opt in ("-v", "--validate"):
            func = 'validate'
            url = arg
    print json.dumps(getdns_wrapper.lookup(url))

if __name__ == "__main__":
   main(sys.argv[1:])

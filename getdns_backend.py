#!/usr/bin/env python

import getdns, binascii

def getdns_version():
    return getdns.__version__

def getdns_lookup_ip(hostname):

    ctx = getdns.Context()

    extensions = { "return_both_v4_and_v6" : getdns.EXTENSION_TRUE }

    try:
        results = ctx.address(name=hostname, extensions=extensions)
    except getdns.error as e:
        print("Error on looking IP:{0}".format(e))

    status = results.status

    ipv4_list = []
    ipv6_list = []

    if status == getdns.RESPSTATUS_GOOD:
        for addr in results.just_address_answers:
            if addr["address_type"] == "IPv6":
                ipv6_list.append(addr["address_data"])
            elif addr["address_type"] == "IPv4":
                ipv4_list.append(addr["address_data"])
        return {"IPv4":ipv4_list,"IPv6":ipv6_list}
    else:
        print("{0}: getdns.address() returned error: {1}".format(hostname, status))

def getdns_dnssec_validate(hostname):

    ctx = getdns.Context()

    extensions = {
        "dnssec_return_status" : getdns.EXTENSION_TRUE,
        "return_both_v4_and_v6" : getdns.EXTENSION_TRUE
    }

    try:
        results = ctx.address(name=hostname, extensions=extensions)
    except getdns.error as e:
        print("Error on extracting DNSSEC validation:{0}".format(e))

    dnssec_result = []

    for result in results.replies_tree:
            dnssec_result.append(result.get("dnssec_status"))

    dnssec_status = {
    "DNSSEC_SECURE" : 400,
    "DNSSEC_BOGUS" : 401,
    "DNSSEC_INDETERINATE" : 402,
    "DNSSEC_INSECURE" : 403,
    }

    validate_result = dnssec_result[0]

    if validate_result == 400:
        return 2
    elif validate_result == 401:
        return 0
    elif validate_result in [402,403]:
        return 1
    else:
        return False

def getdns_tlsa_record(hostname, protocol="tcp", port=443):
    """
    qname = "_443._tcp.fedoraproject.org"

    This qname is for testing to match TLSA record, here is a dig example:
    _443._tcp.fedoraproject.org. 300 IN	TLSA	0 0 1 19400BE5B7A31FB733917700789D2F0A2471C0C9D506C0E504C06C16 D7CB17C0

    """

    qname = "_{0}._{1}.{2}".format(str(int(port)), str(protocol), str(hostname))
    qtype = getdns.RRTYPE_TLSA

    ctx = getdns.Context()

    extensions = {
        "dnssec_return_only_secure": getdns.EXTENSION_TRUE
    }

    results = ctx.general(
        name = qname,
        request_type = qtype,
        extensions = extensions
    )

    # print(dir(results))
    # print("\n")

    tlsa_record_list = []

    try:
        results.status == getdns.RESPSTATUS_GOOD
        replies_tree = results.replies_tree

        for a in replies_tree:
            for b in a.get("answer"):
                d = b.get("rdata")
                if d:
                    # print(d)
                    # print("\n")

                    cdata = d.get("certificate_association_data")
                    if cdata:
                        tlsa_record = {}
                        #putting data in dict
                        tlsa_record["certificate_usage"] = d.get("certificate_usage")
                        tlsa_record["selector"] = d.get("selector")
                        tlsa_record["matching_type"] = d.get("matching_type")
                        tlsa_record["certificate_association_data"] = binascii.b2a_hex(cdata)

                        #Put dict into list
                        tlsa_record_list.append(tlsa_record)

        return tlsa_record_list

    except getdns.error as e:
        print("Extracting TLSA record error:{0}".format(e))

def lookup(url,protocol=None,port=None):

    lookup_result={"url":url}

    #initial getdns
    ctx = getdns.Context()

    extensions = {
        "dnssec_return_status" : getdns.EXTENSION_TRUE,
        "return_both_v4_and_v6" : getdns.EXTENSION_TRUE
    }

    #excutive getdns function
    try:
        results = ctx.address(name=url, extensions=extensions)
        #extract dnssec result
        dnssec_result = []

        result_status = {
            400: 2, #DNSSEC_SECURE
            401: 0, #DNSSEC_BOGUS
            402: 1, #DNSSEC_INDETERINATE
            403: 1, #DNSSEC_INSECURE
        }

        for result in results.replies_tree:
            dnssec_result.append(result_status[result.get("dnssec_status")])

        avg_result = float(sum(dnssec_result))/(float(len(dnssec_result)) or 1.0)

        lookup_result["dnssec_status"] = avg_result

        #extract ip address

        ipv4_list = []
        ipv6_list = []

        if results.status == getdns.RESPSTATUS_GOOD:
            for addr in results.just_address_answers:
                if addr["address_type"] == "IPv6":
                    ipv6_list.append(addr["address_data"])
                elif addr["address_type"] == "IPv4":
                    ipv4_list.append(addr["address_data"])
        else:
            print("{0}: getdns.address() returned error: {1}".format(url, result.status))

        lookup_result["IPv4"] = ipv4_list
        lookup_result["IPv6"] = ipv6_list

        return lookup_result

    except getdns.error as e:
        print("Error on excutive getdns function:{0}".format(e))
        return lookup_result



def main():
    urllist = [
        "www.ey.gov.tw",
        "nctu.edu.tw",
        "gmadkat.com",
        "www.google.com",
        "gov.tw",
        "gov.nl"
    ]

    result = []

    for url in urllist:
        result.append(lookup(url))

    for node in result:
        print(node)

if __name__ == "__main__":
    print("getdns version:"+getdns_version()+"\n")
    # main()
    # print("\n")
    print(getdns_tlsa_record("fedoraproject.org", "tcp", 443))





